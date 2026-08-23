// @ts-nocheck
// Logs into Comunio (modern api.comunio.es) server-side and returns the league
// standings. Auth-gated + credentials read from league_secrets (never sent by
// the client). Heavily logged so the response shapes can be confirmed from the
// function logs on the first real test, then the normalization tightened.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { isValidUUID } from "../_shared/validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const COMUNIO_API = "https://api.comunio.es";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

    // --- Authorize the caller as a member of this league ---
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData?.user) return json({ error: "No autorizado: se requiere una sesion valida." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const allowed = await checkRateLimit(admin, `comunio-sync:${userData.user.id}`, 5, 60);
    if (!allowed) return rateLimitResponse(corsHeaders);

    const { data: membership } = await admin
      .from("league_members").select("profile_id")
      .eq("league_id", appLeagueId).eq("profile_id", userData.user.id).maybeSingle();
    if (!membership) return json({ error: "No autorizado: no eres miembro de esta liga." }, 403);

    // --- Load Comunio credentials server-side ---
    const [{ data: secret }, { data: league }] = await Promise.all([
      admin.from("league_secrets").select("comunio_email, comunio_password").eq("league_id", appLeagueId).maybeSingle(),
      admin.from("leagues").select("comunio_community_id").eq("id", appLeagueId).maybeSingle(),
    ]);
    const username = secret?.comunio_email;
    const password = secret?.comunio_password;
    let communityId = league?.comunio_community_id || null;
    if (!username || !password) {
      return json({ error: "Las credenciales de Comunio no estan configuradas para esta liga." }, 400);
    }

    const jsonHeaders = { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": UA, "Origin": "https://www.comunio.es", "Referer": "https://www.comunio.es/" };

    // --- 1. Login ---
    const loginRes = await fetch(`${COMUNIO_API}/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username, password }),
    });
    const loginText = await loginRes.text();
    let loginData: any = {};
    try { loginData = JSON.parse(loginText); } catch (_) {}
    console.log(`[comunio] login status=${loginRes.status} keys=${Object.keys(loginData || {}).join(",")}`);

    if (loginRes.status !== 200) {
      const msg = loginData?.error_description || loginData?.message || `Login failed (${loginRes.status})`;
      return json({ error: `Comunio: ${msg}` }, loginRes.status === 400 ? 401 : loginRes.status);
    }

    const token = loginData.access_token || loginData.token || loginData.accessToken;
    if (!token) {
      console.log(`[comunio] no token in login response: ${loginText.slice(0, 300)}`);
      return json({ error: "Comunio no devolvio token de acceso.", _debug: loginData }, 502);
    }
    const authHeaders = { ...jsonHeaders, "Authorization": `Bearer ${token}` };

    // --- 2. Autodetectar la comunidad ---
    // GET / (raíz) con el token devuelve { user:{id}, community:{id,name}, _links }.
    // Ese es el "bootstrap" real de la API moderna (el antiguo /users/me no vale:
    // pide un userid que el login no entrega). Si el usuario configuró un ID de
    // comunidad a mano (varias comunidades), ese tiene prioridad.
    // El bootstrap se pide SIEMPRE, aunque ya tengamos la comunidad: es la
    // única forma de saber qué mánager es el dueño de las credenciales, y con
    // eso la UI puede vincular sola al admin sin preguntarle nada.
    let meId: string | null = null;
    {
      const rootRes = await fetch(`${COMUNIO_API}/`, { headers: authHeaders });
      const rootJson = await rootRes.json().catch(() => ({}));
      meId = rootJson?.user?.id != null ? String(rootJson.user.id) : null;
      if (!communityId) {
        communityId = rootJson?.community?.id ? String(rootJson.community.id) : null;
      }
      console.log(`[comunio] bootstrap GET / status=${rootRes.status} community=${communityId} me=${meId}`);
      if (!communityId) {
        return json({ error: "No hemos podido detectar tu comunidad de Comunio. Asegúrate de estar dentro de una comunidad en Comunio, o añade el ID de comunidad en Ajustes.", _debug: rootJson }, 502);
      }
    }

    // --- 3. Community info (name) + members + standings ---
    const [commRes, memRes, stRes] = await Promise.all([
      fetch(`${COMUNIO_API}/communities/${communityId}`, { headers: authHeaders }),
      fetch(`${COMUNIO_API}/communities/${communityId}/members`, { headers: authHeaders }),
      fetch(`${COMUNIO_API}/communities/${communityId}/standings`, { headers: authHeaders }),
    ]);

    const commJson = await commRes.json().catch(() => ({}));
    const memJson = await memRes.json().catch(() => ({}));
    const stText = await stRes.text();
    let standingsRaw: any = null;
    try { standingsRaw = stText ? JSON.parse(stText) : null; } catch (_) { standingsRaw = null; }

    // Forma real de /communities/{id}/members: { members:[{ id, loginName,
    // firstName, isLeader }] }. Con ?online la clave es "users"; soportamos ambas.
    const memberList = memJson?.members || memJson?.users || [];
    const members = memberList.map((m: any) => ({
      id: m.id,
      login: m.loginName || m.login,
      name: m.firstName || m.loginName || m.login || "Mánager",
      leader: !!(m.isLeader ?? m.leader),
      // Dueño de las credenciales guardadas para esta liga.
      isMe: meId != null && String(m.id) === meId,
    }));

    // Standings hold the points once the season has started; empty in preseason.
    const standingsArr = Array.isArray(standingsRaw?.items) ? standingsRaw.items
      : Array.isArray(standingsRaw?.standings) ? standingsRaw.standings
      : Array.isArray(standingsRaw) ? standingsRaw : [];
    const seasonStarted = standingsArr.length > 0;

    // Normaliza cada fila a {id, name, points, position}. La forma exacta de
    // una fila de /standings no se habia visto con datos reales (la preseason
    // la deja vacia) -- se prueban varias claves plausibles, y si no aparece
    // un numero de puntos en ninguna se deja `points: null` en vez de un 0
    // que parezca un dato real cuando no lo es. El nombre sale de `members`
    // (ya confirmado) cuando el id casa; si no, se cae a lo que traiga la fila.
    const standings = standingsArr.map((row: any) => {
      const rowId = row.id ?? row.userId ?? row.user_id ?? row.managerId ?? row.manager?.id ?? null;
      const pointsRaw = row.points ?? row.score ?? row.totalPoints ?? row.total_points ?? null;
      const positionRaw = row.position ?? row.rank ?? row.place ?? null;
      const member = rowId != null ? members.find((m: any) => String(m.id) === String(rowId)) : null;
      return {
        id: rowId,
        name: member?.name || row.name || row.managerName || "Mánager",
        points: typeof pointsRaw === "number" ? pointsRaw : null,
        position: typeof positionRaw === "number" ? positionRaw : null,
      };
    });

    // --- 4. Jornadas terminadas (calendario publico, sin credenciales) ---
    // /matchdays no necesita login: es el calendario de Comunio, igual para
    // todo el mundo. Da lo que Biwenger no expone aqui todavia: cuando una
    // jornada ha cerrado de verdad. Lo que NO da son puntos por jornada (solo
    // el acumulado en /standings), asi que esto sirve para avisar "ha
    // terminado la Jornada X", no para adivinar solo quien quedo ultimo.
    //
    // Una misma matchdayKey puede tener varias entradas (p.ej. una alineacion
    // aplazada de un partido de esa jornada, type "matchday_shifted"). Solo
    // se cuenta como terminada si TODAS sus entradas lo estan -- mejor tarde
    // que anunciar cerrada una jornada con un partido aun pendiente.
    let finishedMatchdays: { key: string; timestamp: string }[] = [];
    try {
      const mdRes = await fetch(`${COMUNIO_API}/matchdays`, { headers: jsonHeaders });
      const mdJson = await mdRes.json().catch(() => []);
      const byKey = new Map<string, { allFinished: boolean; latestTimestamp: string }>();
      for (const md of Array.isArray(mdJson) ? mdJson : []) {
        const key = String(md.matchdayKey);
        const prev = byKey.get(key);
        const allFinished = (prev?.allFinished ?? true) && !!md.finished;
        const latestTimestamp = prev && prev.latestTimestamp > md.timestamp ? prev.latestTimestamp : md.timestamp;
        byKey.set(key, { allFinished, latestTimestamp });
      }
      finishedMatchdays = Array.from(byKey.entries())
        .filter(([, v]) => v.allFinished)
        .map(([key, v]) => ({ key, timestamp: v.latestTimestamp }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      console.log(`[comunio] matchdays finished=${finishedMatchdays.length}`);
    } catch (e) {
      console.log(`[comunio] no se pudo leer /matchdays: ${e instanceof Error ? e.message : String(e)}`);
    }

    console.log(`[comunio] community=${communityId} members=${members.length} standings=${standings.length}`);

    return json({
      ok: true,
      community: { id: communityId, name: commJson?.name || "Comunio" },
      members,
      standings,
      seasonStarted,
      finishedMatchdays,
      standingsRaw: seasonStarted ? undefined : standingsRaw, // keep raw only when unexpected
    }, 200);
  } catch (e) {
    console.error("comunio-sync error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
