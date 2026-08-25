-- Widen the temporary debug_jester_policies() helper to also cover
-- weekly_challenges and challenge_votes (checking if they share the same
-- "gated to the anchor league's members" bug as jester_*).
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
  WHERE c.relname IN ('jester_nominees', 'jester_votes', 'jester_history', 'weekly_challenges', 'challenge_votes');
$$;
