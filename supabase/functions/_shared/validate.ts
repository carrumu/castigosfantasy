// Small shared input-validation helpers for Edge Functions. Catching a
// malformed field here turns it into a clean 400 instead of an opaque 500
// from whatever Postgres/fetch call the bad value eventually reaches.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
