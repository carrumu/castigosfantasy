// @ts-nocheck
// Logs into Comunio (modern api.comunio.es) server-side and returns the league
// standings. Auth-gated + credentials read from league_secrets (never sent by
// the client). Heavily logged so the response shapes can be confirmed from the
// function logs on the first real test, then the normalization tightened.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const COMUNIO_API = "https://api.comunio.es";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { appLeagueId } = await req.json();
    if (!appLeagueId) return json({ error: "Missing required field: appLeagueId" }, 400);

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

    // --- 2. Resolve community id if not configured ---
    if (!communityId) {
      const meRes = await fetch(`${COMUNIO_API}/users/me`, { headers: authHeaders });
      const meText = await meRes.text();
      let me: any = {};
      try { me = JSON.parse(meText); } catch (_) {}
      console.log(`[comunio] users/me status=${meRes.status} body=${meText.slice(0, 500)}`);
      // Try common shapes for the community list
      const communities = me?.communities || me?.data?.communities || me?.user?.communities || [];
      if (Array.isArray(communities) && communities.length > 0) {
        communityId = String(communities[0].id ?? communities[0].communityId ?? communities[0]);
      } else if (me?.community?.id) {
        communityId = String(me.community.id);
      }
      if (!communityId) {
        return json({ error: "No se pudo resolver la comunidad de Comunio. Revisa el ID en Ajustes.", _debug: me }, 502);
      }
    }

    // --- 3. Standings ---
    const standRes = await fetch(`${COMUNIO_API}/communities/${communityId}/standings`, { headers: authHeaders });
    const standText = await standRes.text();
    let standings: any = {};
    try { standings = JSON.parse(standText); } catch (_) {}
    console.log(`[comunio] standings status=${standRes.status} community=${communityId} body=${standText.slice(0, 800)}`);

    if (standRes.status !== 200) {
      return json({ error: `Comunio: no se pudieron leer las clasificaciones (${standRes.status}).`, _debug: standings }, standRes.status);
    }

    // Return the raw standings for now; normalization is tightened once the real
    // shape is confirmed from the logs above.
    return json({ ok: true, communityId, data: standings }, 200);
  } catch (e) {
    console.error("comunio-sync error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
