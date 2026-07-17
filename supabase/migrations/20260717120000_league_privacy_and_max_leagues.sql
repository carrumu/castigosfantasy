-- 20260717120000_league_privacy_and_max_leagues.sql
--
-- Goal 1 (tenant isolation): make every per-league feature private to its
-- league. Until now the jester (Bufón), weekly challenges + votes, and the
-- wall-of-shame punishment events were readable/insertable by ANY authenticated
-- user (auth.role() = 'authenticated'), so anyone logged in could read or write
-- another league's data directly through the API. We scope SELECT and INSERT to
-- members of the league via public.get_user_leagues() (already SECURITY DEFINER,
-- so it does not recurse through league_members RLS). UPDATE/DELETE were already
-- restricted to the row owner or league creator in earlier migrations.
--
-- The Ruleta (punishments) and matchday history (matchday_records) already had
-- member-only SELECT, but their INSERT was still open to any authenticated user
-- (a non-member could inject punishments or forge debts), so we close those
-- INSERT holes too. The Contract (leagues.contract_text) and league_roster were
-- already fully member-scoped, so they are left untouched here.
--
-- Goal 2 (anti-abuse): cap each user at a maximum of 5 leagues (created OR
-- joined) with a BEFORE INSERT trigger on league_members. This covers both the
-- create flow and the join_league_by_code() RPC, since triggers fire regardless
-- of the caller.
--
-- This migration is idempotent: it can be run directly in the Supabase SQL
-- editor and re-applied later via `supabase db push` without error.

-- ============================================================================
-- 1. TENANT ISOLATION: scope SELECT + INSERT to league members
-- ============================================================================

-- ---- jester_nominees --------------------------------------------------------
DROP POLICY IF EXISTS "Auth Read Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Public Read Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Members Read Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Members Read Jester Nominees" ON public.jester_nominees
  FOR SELECT USING (league_id IN (SELECT public.get_user_leagues()));

DROP POLICY IF EXISTS "Authenticated Insert Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Members Insert Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Members Insert Jester Nominees" ON public.jester_nominees
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ---- jester_votes -----------------------------------------------------------
DROP POLICY IF EXISTS "Auth Read Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Public Read Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Members Read Jester Votes" ON public.jester_votes;
CREATE POLICY "Members Read Jester Votes" ON public.jester_votes
  FOR SELECT USING (league_id IN (SELECT public.get_user_leagues()));

DROP POLICY IF EXISTS "Authenticated Insert Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Members Insert Jester Votes" ON public.jester_votes;
CREATE POLICY "Members Insert Jester Votes" ON public.jester_votes
  FOR INSERT WITH CHECK (
    league_id IN (SELECT public.get_user_leagues())
    AND profile_id = (select auth.uid())
  );

-- ---- jester_history ---------------------------------------------------------
DROP POLICY IF EXISTS "Auth Read Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Public Read Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Members Read Jester History" ON public.jester_history;
CREATE POLICY "Members Read Jester History" ON public.jester_history
  FOR SELECT USING (league_id IN (SELECT public.get_user_leagues()));

DROP POLICY IF EXISTS "Auth Insert Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Members Insert Jester History" ON public.jester_history;
CREATE POLICY "Members Insert Jester History" ON public.jester_history
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ---- weekly_challenges ------------------------------------------------------
DROP POLICY IF EXISTS "Auth Select Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Members Read Challenges" ON public.weekly_challenges;
CREATE POLICY "Members Read Challenges" ON public.weekly_challenges
  FOR SELECT USING (league_id IN (SELECT public.get_user_leagues()));

DROP POLICY IF EXISTS "Auth Insert Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Members Insert Challenges" ON public.weekly_challenges;
CREATE POLICY "Members Insert Challenges" ON public.weekly_challenges
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ---- challenge_votes (no league_id; resolve league via weekly_challenges) ----
DROP POLICY IF EXISTS "Auth Select Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Members Read Challenge Votes" ON public.challenge_votes;
CREATE POLICY "Members Read Challenge Votes" ON public.challenge_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.weekly_challenges c
      WHERE c.id = challenge_id
        AND c.league_id IN (SELECT public.get_user_leagues())
    )
  );

DROP POLICY IF EXISTS "Auth Insert Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Members Insert Challenge Votes" ON public.challenge_votes;
CREATE POLICY "Members Insert Challenge Votes" ON public.challenge_votes
  FOR INSERT WITH CHECK (
    profile_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.weekly_challenges c
      WHERE c.id = challenge_id
        AND c.league_id IN (SELECT public.get_user_leagues())
    )
  );

-- ---- punishment_events (Wall of Shame) --------------------------------------
DROP POLICY IF EXISTS "Auth Select Punishment Events" ON public.punishment_events;
DROP POLICY IF EXISTS "Members Read Punishment Events" ON public.punishment_events;
CREATE POLICY "Members Read Punishment Events" ON public.punishment_events
  FOR SELECT USING (league_id IN (SELECT public.get_user_leagues()));

DROP POLICY IF EXISTS "Auth Insert Punishment Events" ON public.punishment_events;
DROP POLICY IF EXISTS "Members Insert Punishment Events" ON public.punishment_events;
CREATE POLICY "Members Insert Punishment Events" ON public.punishment_events
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ---- punishments (Ruleta) : SELECT was already member-only; close the INSERT
-- hole so a non-member can't inject roulette punishments into another league. ---
DROP POLICY IF EXISTS "Punishments Insert" ON public.punishments;
DROP POLICY IF EXISTS "Members Insert Punishments" ON public.punishments;
CREATE POLICY "Members Insert Punishments" ON public.punishments
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ---- matchday_records (debts/history) : SELECT was already member-only; close
-- the INSERT hole so a non-member can't forge debts in another league. ----------
DROP POLICY IF EXISTS "Records Insert" ON public.matchday_records;
DROP POLICY IF EXISTS "Members Insert Records" ON public.matchday_records;
CREATE POLICY "Members Insert Records" ON public.matchday_records
  FOR INSERT WITH CHECK (league_id IN (SELECT public.get_user_leagues()));

-- ============================================================================
-- 2. ANTI-ABUSE: max 5 leagues per user (created or joined)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_max_leagues_per_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT count(*) INTO current_count
  FROM public.league_members
  WHERE profile_id = NEW.profile_id;

  IF current_count >= 5 THEN
    RAISE EXCEPTION 'LEAGUE_LIMIT_REACHED: un usuario no puede pertenecer a más de 5 ligas'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_max_leagues ON public.league_members;
CREATE TRIGGER trg_enforce_max_leagues
  BEFORE INSERT ON public.league_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_leagues_per_user();
