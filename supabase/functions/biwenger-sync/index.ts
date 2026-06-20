import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request with explicit 200 OK status
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, leagueId } = await req.json();

    if (!email || !password || !leagueId) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, password, leagueId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Attempting login for user: ${email} via biwenger.as.com`);

    // 1. Authenticate with Biwenger
    const loginRes = await fetch("https://biwenger.as.com/api/v2/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://biwenger.as.com",
        "Referer": "https://biwenger.as.com/"
      },
      body: JSON.stringify({ email, password })
    });

    if (loginRes.status !== 200) {
      const errText = await loginRes.text();
      let errMsg = `Biwenger login failed (Status ${loginRes.status})`;
      try {
        const errJSON = JSON.parse(errText);
        errMsg = errJSON.message || errMsg;
      } catch (_) {}
      return new Response(JSON.stringify({ error: errMsg }), {
        status: loginRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    if (!token) {
      return new Response(JSON.stringify({ error: "No token returned from Biwenger" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Login successful. Fetching user leagues to resolve internal ID for: ${leagueId}`);

    // 2. Fetch user's account info to list their leagues
    const accountRes = await fetch("https://biwenger.as.com/api/v2/account", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Version": "h3g456hj",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://biwenger.as.com",
        "Referer": "https://biwenger.as.com/"
      }
    });

    if (accountRes.status !== 200) {
      return new Response(JSON.stringify({ error: `Failed to fetch account info (Status ${accountRes.status})` }), {
        status: accountRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountData = await accountRes.json();
    const leagues = accountData.data?.leagues || [];

    if (leagues.length === 0) {
      return new Response(JSON.stringify({ error: "The authenticated user is not a member of any league in Biwenger." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve the internal numeric league ID and user's league-specific ID
    let targetLeagueId = leagues[0].id; // Default to first league
    let targetUserId = leagues[0].user?.id; // Default to first league's user ID
    const inputClean = leagueId.trim().toLowerCase();

    // Find by ID match or by Name (case-insensitive)
    const foundLeague = leagues.find(l => 
      l.id.toString() === inputClean || 
      l.name.toLowerCase() === inputClean
    );

    if (foundLeague) {
      targetLeagueId = foundLeague.id;
      targetUserId = foundLeague.user?.id;
      console.log(`Resolved league "${leagueId}" to internal ID: ${targetLeagueId} and user ID: ${targetUserId} ("${foundLeague.name}")`);
    } else {
      console.log(`Could not find specific match for leagueId "${leagueId}". Defaulting to first league: "${leagues[0].name}" (ID: ${targetLeagueId}, User: ${targetUserId})`);
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Could not retrieve user ID for the specified league in Biwenger." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching standings for resolved league ID: ${targetLeagueId} and User ID: ${targetUserId}`);

    // 3. Fetch league standings and users
    const leagueRes = await fetch(`https://biwenger.as.com/api/v2/league?fields=standings,users`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Version": "h3g456hj",
        "X-League": targetLeagueId.toString(),
        "X-User": targetUserId.toString(),
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://biwenger.as.com",
        "Referer": "https://biwenger.as.com/"
      }
    });

    if (leagueRes.status !== 200) {
      const errText = await leagueRes.text();
      let errMsg = `Failed to fetch league data (Status ${leagueRes.status})`;
      try {
        const errJSON = JSON.parse(errText);
        errMsg = errJSON.message || errMsg;
      } catch (_) {}
      return new Response(JSON.stringify({ error: errMsg }), {
        status: leagueRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leagueData = await leagueRes.json();

    return new Response(JSON.stringify(leagueData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in biwenger-sync Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
