-- Rate limiting for the Edge Functions (biwenger/comunio/mister-sync,
-- link-preview, send-admin-notification). Each of those calls an external
-- service (or sends an email) on our server's behalf, so an authenticated
-- user hammering the endpoint burns real quota / risks our server IP
-- getting blocked by Biwenger/Comunio/Mister, not just wasting our own
-- resources.
--
-- Table is a plain fixed-window counter keyed by "<function>:<user id>".
-- No RLS policies are defined on purpose: only the SECURITY DEFINER
-- function below (and the service-role client the Edge Functions already
-- use) can touch it — regular clients get nothing, not even SELECT.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text NOT NULL PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomically bumps (or resets, once the window has elapsed) the counter for
-- `p_key` and reports whether this request is still within `p_limit` for a
-- `p_window_seconds`-second window. Single upsert statement, so concurrent
-- requests from the same caller can't race each other past the limit.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.rate_limits (key, count, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        THEN 1
      ELSE public.rate_limits.count + 1
    END,
    window_start = CASE
      WHEN public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        THEN now()
      ELSE public.rate_limits.window_start
    END
  RETURNING count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;
