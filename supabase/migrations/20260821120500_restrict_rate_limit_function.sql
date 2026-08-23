-- Postgres grants EXECUTE on a new function to PUBLIC by default, which
-- would let any anon/authenticated client call check_rate_limit directly
-- via PostgREST (e.g. to poison another user's counter). Only the Edge
-- Functions' service-role client should ever call this.
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int) TO service_role;
