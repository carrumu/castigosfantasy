// Shared CORS allowlist for every Edge Function. Only the real app (prod +
// local dev) gets its Origin echoed back in Access-Control-Allow-Origin; any
// other Origin is left out of the response, so the browser blocks the read.
// Non-browser callers (curl, server-to-server) aren't affected by CORS at
// all — this only stops OTHER WEBSITES from calling these functions from a
// visitor's browser using their session.
const ALLOWED_ORIGINS = [
  "https://castigosfantasy.com",
  "http://localhost:3000",
];

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // Tells caches/CDNs the response varies by Origin, so one origin's
    // cached response is never served back to a different origin.
    "Vary": "Origin",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}
