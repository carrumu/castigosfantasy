-- TEMPORARY: inspect live RLS policies on the jester_* tables to check
-- whether El Bufón's "global anchor league" design actually works for
-- users who are not members of that anchor league. Dropped once read.
CREATE OR REPLACE FUNCTION public.debug_jester_policies()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(jsonb_build_object(
    'table', c.relname,
    'name', p.polname,
    'cmd', p.polcmd,
    'roles', (SELECT array_agg(r::regrole::text) FROM unnest(p.polroles) r),
    'using', pg_get_expr(p.polqual, p.polrelid),
    'check', pg_get_expr(p.polwithcheck, p.polrelid)
  ) ORDER BY c.relname, p.polcmd)
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  WHERE c.relname IN ('jester_nominees', 'jester_votes', 'jester_history');
$$;

GRANT EXECUTE ON FUNCTION public.debug_jester_policies() TO anon;
