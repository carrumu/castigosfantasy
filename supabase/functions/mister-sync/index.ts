// @ts-nocheck
// Sincroniza la clasificación de Mister (mister.mundodeportivo.com) desde el
// servidor y la devuelve normalizada. Igual que comunio-sync: solo pueden
// llamarlo miembros de la liga, y las credenciales se leen de league_secrets,
// nunca viajan desde el cliente.
//
// Mister tiene tres particularidades que explican casi todo el código:
//
// 1. LOGIN EN DOS SALTOS. `/api2/auth/email` devuelve un JWT que caduca a los
//    5 MINUTOS y que no sirve para llamar a nada. Hay que canjearlo en
//    `/api2/auth/external/exchange-token` (el nombre engaña: vale para el
//    login por email) y ese canje es el que entrega las cookies de sesión.
//
// 2. LA CLASIFICACIÓN ES HTML, no JSON. Se parsea con expresiones regulares
//    porque aquí no hay DOM y el HTML sale de una plantilla muy regular.
//
// 3. NO HAY IDENTIFICADOR DE LIGA. `/standings` devuelve la liga activa de la
//    sesión. No se puede elegir. Por eso se devuelve también el nombre de la
//    liga detectada, para que la UI pida confirmación al usuario.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { isValidUUID } from "../_shared/validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";
import { fetchFinishedMatchdays } from "../_shared/laligaCalendar.ts";

const MISTER = "https://mister.mundodeportivo.com";
const UA = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36";
const BASE_HEADERS = { "accept": "*/*", "user-agent": UA, "origin": MISTER, "referer": `${MISTER}/` };

/** Quita etiquetas y normaliza espacios. */
function limpia(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

/**
 * La respuesta de /standings trae DOS listas: la clasificación general y la de
 * la última jornada. La segunda es la que decide quién paga.
 */
function parseStandings(html: string) {
  const bloques = html.split(/class="player-list player-list--primary"/).slice(1);
  return bloques.map((bloque) => {
    const filas: any[] = [];
    for (const m of bloque.matchAll(/<div class="player-row">([\s\S]*?)<\/li>/g)) {
      const fila = m[1];
      const enlace = fila.match(/href="users\/(\d+)\/([^"]*)"/);
      if (!enlace) continue;
      const pos = fila.match(/<div class="position">\s*([\d.]+)\s*<\/div>/);
      const nombre = fila.match(/<div class="name[^"]*">([\s\S]*?)<\/div>/);
      const puntos = fila.match(/<div class="points">\s*([-\d.,]+)/);
      filas.push({
        id: enlace[1],
        slug: enlace[2],
        position: pos ? parseInt(pos[1], 10) : null,
        name: nombre ? limpia(nombre[1]) : null,
        points: puntos ? parseInt(puntos[1].replace(/[.,]/g, ""), 10) : null,
        isMe: /class="name\s+myself"/.test(fila),
      });
    }
    return filas;
  });
}

/** Nombre de la liga activa; sale del partial del feed. */
function parseLeagueName(html: string): string | null {
  const m = html.match(/class="feed-top-community">[\s\S]{0,200}?<span>\s*([^<]{2,80}?)\s*<\/span>/);
  return m ? limpia(m[1]) : null;
}

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { appLeagueId } = await req.json();
    if (!isValidUUID(appLeagueId)) return json({ error: "Missing or invalid field: appLeagueId must be a UUID" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Server not configured" }, 500);

    // --- Solo miembros de la liga ---
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData?.user) return json({ error: "No autorizado: se requiere una sesion valida." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const allowed = await checkRateLimit(admin, `mister-sync:${userData.user.id}`, 5, 60);
    if (!allowed) return rateLimitResponse(corsHeaders);

    const { data: membership } = await admin
      .from("league_members").select("profile_id")
      .eq("league_id", appLeagueId).eq("profile_id", userData.user.id).maybeSingle();
    if (!membership) return json({ error: "No autorizado: no eres miembro de esta liga." }, 403);

    // --- Credenciales, siempre del servidor ---
    const { data: secret } = await admin
      .from("league_secrets").select("mister_email, mister_password")
      .eq("league_id", appLeagueId).maybeSingle();
    const email = secret?.mister_email;
    const password = secret?.mister_password;
    if (!email || !password) {
      return json({ error: "Las credenciales de Mister no estan configuradas para esta liga." }, 400);
    }

    // --- 1. ¿Esta cuenta admite email y contraseña? ---
    // Mister deja registrarse con Google, y esas cuentas no tienen contraseña.
    // Preguntarlo antes permite dar un mensaje util en vez de un fallo opaco.
    try {
      const amRes = await fetch(`${MISTER}/api2/users/auth-methods?email=${encodeURIComponent(email)}`, { headers: BASE_HEADERS });
      const am = await amRes.json();
      const metodos: string[] = am?.supportedAuthMethods || [];
      if (metodos.length && !metodos.includes("email")) {
        return json({
          error: `Esa cuenta de Mister entra con ${metodos.join(" o ")}, no con contraseña. Para sincronizar hace falta una cuenta de Mister creada con email y contraseña.`,
        }, 400);
      }
    } catch (_) { /* si falla, se intenta el login igual */ }

    // --- 2. Login: devuelve un JWT de 5 minutos, de un solo uso ---
    const loginRes = await fetch(`${MISTER}/api2/auth/email`, {
      method: "POST",
      headers: { ...BASE_HEADERS, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginJson = await loginRes.json().catch(() => ({}));
    console.log(`[mister] login status=${loginRes.status} keys=${Object.keys(loginJson || {}).join(",")}`);

    if (loginRes.status !== 200 || !loginJson?.token) {
      return json({ error: "Mister ha rechazado el email o la contraseña." }, 401);
    }
    if (loginJson.requires_verification) {
      return json({ error: "Esa cuenta de Mister aun no ha verificado su correo. Confirmalo y vuelve a intentarlo." }, 400);
    }

    // --- 3. Canje del JWT por cookies de sesion ---
    const exchangeRes = await fetch(`${MISTER}/api2/auth/external/exchange-token`, {
      method: "POST",
      headers: { ...BASE_HEADERS, "content-type": "application/json" },
      body: JSON.stringify({ token: loginJson.token }),
    });
    const setCookies = exchangeRes.headers.getSetCookie?.() || [];
    const cookieJar: Record<string, string> = {};
    for (const c of setCookies) {
      const par = c.split(";")[0];
      const i = par.indexOf("=");
      if (i > 0) cookieJar[par.slice(0, i).trim()] = par.slice(i + 1).trim();
    }
    const cookie = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
    console.log(`[mister] exchange status=${exchangeRes.status} cookies=${Object.keys(cookieJar).join(",")}`);

    if (exchangeRes.status !== 200 || !cookie) {
      return json({ error: "Mister no ha devuelto una sesion valida tras el login." }, 502);
    }

    // --- 4. Clasificacion y nombre de la liga ---
    // `partial-request: true` es obligatorio: sin el, Mister responde 200 con
    // el cascaron del SPA en vez de los datos, sin dar ningun error.
    const partialHeaders = {
      ...BASE_HEADERS,
      cookie,
      "x-requested-with": "XMLHttpRequest",
      "partial-request": "true",
    };

    const [stRes, feedRes] = await Promise.all([
      fetch(`${MISTER}/standings`, { method: "POST", headers: partialHeaders }),
      fetch(`${MISTER}/feed`, { method: "POST", headers: partialHeaders }),
    ]);
    const stHtml = await stRes.text();
    const feedHtml = await feedRes.text();

    const listas = parseStandings(stHtml);
    const general = listas[0] || [];
    const jornada = listas[1] || [];
    console.log(`[mister] standings status=${stRes.status} general=${general.length} jornada=${jornada.length}`);

    if (!general.length) {
      return json({
        error: "Hemos entrado en Mister pero no hemos podido leer la clasificacion. Asegurate de que esa cuenta esta dentro de una liga.",
      }, 502);
    }

    const leagueName = parseLeagueName(feedHtml);

    // Se guarda el nombre detectado para que la UI pueda enseñar de qué liga de
    // Mister se está tirando sin volver a llamar aquí. Best-effort: si falla,
    // la sincronización sigue siendo válida.
    if (leagueName) {
      const { error: upErr } = await admin
        .from("leagues").update({ mister_league_name: leagueName }).eq("id", appLeagueId);
      if (upErr) console.log(`[mister] no se pudo guardar el nombre de liga: ${upErr.message}`);
    }

    // La temporada no ha empezado si nadie ha puntuado todavia.
    const seasonStarted = general.some((m: any) => (m.points ?? 0) !== 0);

    // Calendario de LaLiga (ver _shared/laligaCalendar.ts): Mister no expone
    // en publico que jornada ha cerrado, asi que se usa el mismo calendario
    // real que ya sirve para Comunio -- es la misma liga de fútbol española,
    // el calendario no depende de la plataforma de fantasy.
    const finishedMatchdays = await fetchFinishedMatchdays();

    return json({
      ok: true,
      league: { name: leagueName || "Tu liga de Mister" },
      // Se devuelven las dos: la general para vincular miembros, la de jornada
      // para saber quien ha quedado ultimo esta semana.
      members: general.map((m: any) => ({ id: m.id, name: m.name, slug: m.slug, isMe: m.isMe })),
      standings: general,
      matchdayStandings: jornada,
      seasonStarted,
      finishedMatchdays,
    }, 200);
  } catch (e) {
    console.error("mister-sync error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
