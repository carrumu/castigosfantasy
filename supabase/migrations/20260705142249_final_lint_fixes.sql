-- 1. Fix Function Search Path Mutable for check_daily_post_limit
CREATE OR REPLACE FUNCTION public.check_daily_post_limit()
RETURNS trigger AS $$
DECLARE
  post_count integer;
BEGIN
  SELECT COUNT(*)
  INTO post_count
  FROM public.forum_posts
  WHERE profile_id = NEW.profile_id
    AND created_at >= timezone('utc'::text, date_trunc('day', now()));

  IF post_count >= 10 THEN
    RAISE EXCEPTION 'Has alcanzado el limite diario de 10 publicaciones.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Revoke execute from PUBLIC and authenticated for handle_new_user()
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- 3. Fix "RLS Policy Always True" for jester_nominees
DROP POLICY IF EXISTS "Authenticated Insert Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Strict Insert Jester Nominees" ON public.jester_nominees FOR INSERT TO authenticated WITH CHECK (nominated_by = auth.uid());
