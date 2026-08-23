// @ts-nocheck
// Fetches Open Graph / meta tags for a URL server-side (browsers can't, CORS).
// Auth-gated (logged-in users only), SSRF-guarded, size/time limited, cached.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Block obvious internal / private hostnames to limit SSRF.
function isBlockedHost(host: string): boolean {
  host = host.toLowerCase();
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;                 // link-local / cloud metadata
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;  // 172.16.0.0/12
  return false;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/").replace(/&nbsp;/g, " ");
}

function extractMeta(html: string, baseUrl: string) {
  const pick = (keys: string[]): string => {
    for (const k of keys) {
      const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i");
      const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, "i");
      const m = html.match(re1) || html.match(re2);
      if (m && m[1]) return decodeEntities(m[1].trim());
    }
    return "";
  };

  let title = pick(["og:title", "twitter:title"]);
  if (!title) {
    const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (t) title = decodeEntities(t[1].trim());
  }
  const description = pick(["og:description", "twitter:description", "description"]);
  let image = pick(["og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"]);
  const siteName = pick(["og:site_name"]);

  if (image && !/^https?:\/\//i.test(image)) {
    try { image = new URL(image, baseUrl).href; } catch (_) { image = ""; }
  }
  return { title, description, image, siteName };
}

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") return json({ error: "Missing url" }, 400);

    let u: URL;
    try { u = new URL(url); } catch (_) { return json({ error: "Invalid url" }, 400); }
    if (u.protocol !== "http:" && u.protocol !== "https:") return json({ error: "Bad protocol" }, 400);
    if (isBlockedHost(u.hostname)) return json({ error: "Blocked host" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Server not configured" }, 500);

    // Auth: require a logged-in user (limits abuse of the fetcher).
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData } = await authClient.auth.getUser(jwt);
    if (!userData?.user) return json({ error: "No autorizado" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Cache hit (refresh after 7 days)
    const { data: cached } = await admin.from("link_previews").select("*").eq("url", url).maybeSingle();
    if (cached) {
      const ageMs = Date.now() - new Date(cached.fetched_at).getTime();
      if (ageMs < 7 * 24 * 60 * 60 * 1000) {
        return json({ url, title: cached.title, description: cached.description, image: cached.image, siteName: cached.site_name });
      }
    }

    // Fetch with timeout
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CastigosFantasyBot/1.0; +https://castigosfantasy.com)",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: ctrl.signal,
      });
    } catch (_) {
      clearTimeout(timer);
      return json({ url, title: "", description: "", image: "", siteName: u.hostname });
    }
    clearTimeout(timer);

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("xml")) {
      try { await res.body?.cancel(); } catch (_) {}
      return json({ url, title: "", description: "", image: "", siteName: u.hostname });
    }

    // Read up to ~200KB or until </head>
    let html = "";
    let received = 0;
    const decoder = new TextDecoder();
    const reader = res.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        html += decoder.decode(value, { stream: true });
        if (received > 200_000 || /<\/head>/i.test(html)) { try { await reader.cancel(); } catch (_) {} break; }
      }
    }

    const meta = extractMeta(html, url);

    // Cache (fire and forget)
    admin.from("link_previews").upsert({
      url, title: meta.title, description: meta.description,
      image: meta.image, site_name: meta.siteName,
      fetched_at: new Date().toISOString(),
    }).then(() => {}, () => {});

    return json({ url, ...meta });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
