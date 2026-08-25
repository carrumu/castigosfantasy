-- Root cause behind El Bufón / Reto Semanal never really being "global":
-- both resolved their shared league_id container by querying `leagues`
-- ordered by created_at, but `leagues` SELECT RLS is
-- "created_by = auth.uid() OR id IN get_user_leagues()" -- member-only.
-- Every user's "oldest league I can see" query silently resolved to a
-- DIFFERENT row (whichever league THEY happen to belong to first), so each
-- user was actually looking at their own isolated pool while the UI called
-- it "global". Opening up RLS on jester_*/weekly_challenges/challenge_votes
-- (previous migration) fixed reading/writing those tables, but not this
-- underlying anchor-resolution problem.
--
-- Fix: one dedicated system league that nobody is a member of and nobody
-- created (created_by NULL), used purely as the FK target these tables
-- need, plus a SECURITY DEFINER function that hands back its fixed id to
-- literally anyone -- it doesn't query `leagues` at all, so it isn't
-- subject to that table's membership-gated RLS.
INSERT INTO public.leagues (id, name, invite_code, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Comunidad Global',
  'SYSTEM-GLOBAL-ANCHOR',
  NULL
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_global_content_league_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT '00000000-0000-0000-0000-000000000001'::uuid;
$$;

GRANT EXECUTE ON FUNCTION public.get_global_content_league_id() TO anon, authenticated;
