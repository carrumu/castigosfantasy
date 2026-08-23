// Shared rate-limit check for Edge Functions. Backed by the `rate_limits`
// table + `check_rate_limit` Postgres function (see the matching
// migration) — a DB-backed fixed window, not in-memory, so it holds up
// across cold starts and multiple concurrent function instances.
//
// `admin` must be a client created with the service-role key: the function
// is SECURITY DEFINER so it doesn't strictly need that, but every caller
// here already has an admin client on hand for other privileged reads.
export async function checkRateLimit(
  admin: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> },
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  // Fail OPEN on an infra error (missing migration, DB hiccup) rather than
  // taking the whole endpoint down — this is a defense-in-depth layer, not
  // the only thing standing between the app and abuse.
  if (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return true;
  }
  return data === true;
}

export function rateLimitResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Demasiadas peticiones. Espera un momento e inténtalo de nuevo." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
