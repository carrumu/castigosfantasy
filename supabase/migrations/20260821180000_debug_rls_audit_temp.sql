-- TEMPORARY audit helper — read-only introspection of RLS status + policies
-- across every table in public. Dropped by the very next migration once
-- I've read the results; not meant to stay in the schema long-term.
CREATE OR REPLACE FUNCTION public.debug_rls_audit()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(jsonb_build_object(
    'table', c.relname,
    'rls_enabled', c.relrowsecurity,
    'policies', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'name', p.polname,
        'cmd', p.polcmd,
        'roles', (SELECT array_agg(r::regrole::text) FROM unnest(p.polroles) r),
        'using', pg_get_expr(p.polqual, p.polrelid),
        'check', pg_get_expr(p.polwithcheck, p.polrelid)
      ))
      FROM pg_policy p WHERE p.polrelid = c.oid
    ), '[]'::jsonb)
  ) ORDER BY c.relname)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r';
$$;

GRANT EXECUTE ON FUNCTION public.debug_rls_audit() TO anon;
