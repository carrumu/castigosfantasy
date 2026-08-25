-- TEMPORARY: inspect live RLS policies on weekly_challenges to debug a
-- report that the 3 seeded challenges change daily even though the jornada
-- number stays the same. Dropped by the next migration once read.
CREATE OR REPLACE FUNCTION public.debug_weekly_challenges_policies()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(jsonb_build_object(
    'name', p.polname,
    'cmd', p.polcmd,
    'roles', (SELECT array_agg(r::regrole::text) FROM unnest(p.polroles) r),
    'using', pg_get_expr(p.polqual, p.polrelid),
    'check', pg_get_expr(p.polwithcheck, p.polrelid)
  ))
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  WHERE c.relname = 'weekly_challenges';
$$;

GRANT EXECUTE ON FUNCTION public.debug_weekly_challenges_policies() TO anon;
