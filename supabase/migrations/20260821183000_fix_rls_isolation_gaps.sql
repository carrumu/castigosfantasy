-- RLS audit findings: two policies that should scope writes to "your own
-- data" only actually let an authenticated user affect someone else's row,
-- as long as they bypass the app UI and call the REST API directly.

-- ----------------------------------------------------------------------------
-- 1. league_members: "Members Insert" only checked auth.role() = 'authenticated'
-- — nothing tied the inserted row to the caller. A direct API call could:
--   (a) add a league_members row for ANY profile_id (add someone to a league
--       without their consent), and
--   (b) set is_admin = true for a league you never created or were invited
--       to (instant admin of any league whose id you know).
-- join_league_by_code() is SECURITY DEFINER and always inserts auth.uid()
-- with is_admin = false, so it's unaffected by tightening the direct-insert
-- policy — this only closes the API bypass.
DROP POLICY IF EXISTS "Members Insert" ON public.league_members;
CREATE POLICY "Members Insert" ON public.league_members
  FOR INSERT WITH CHECK (
    profile_id = (SELECT auth.uid())
    AND (
      is_admin = false
      OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (SELECT auth.uid()))
    )
  );

-- ----------------------------------------------------------------------------
-- 2. jester_nominees: two INSERT policies coexisted from different migrations
-- — "Members Insert Jester Nominees" (league membership only) and "Strict
-- Insert Jester Nominees" (nominated_by = self only). Postgres OR's multiple
-- permissive policies for the same command together, so satisfying EITHER
-- one was enough: a league member could insert a nominee with nominated_by
-- set to any other real profile id, impersonating a teammate's nomination
-- and burning their one-per-matchday slot (see the UNIQUE constraint added
-- in 20260816201326_jester_one_nomination_per_matchday.sql).
DROP POLICY IF EXISTS "Members Insert Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Strict Insert Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Members Insert Jester Nominees" ON public.jester_nominees
  FOR INSERT WITH CHECK (
    league_id IN (SELECT public.get_user_leagues())
    AND nominated_by = (SELECT auth.uid())
  );
