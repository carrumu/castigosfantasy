-- 1. Profiles (delete profile if auth.users is deleted)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Leagues (set created_by to null if user is deleted)
ALTER TABLE public.leagues 
  DROP CONSTRAINT IF EXISTS leagues_created_by_fkey;
ALTER TABLE public.leagues 
  ADD CONSTRAINT leagues_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. League Members (cascade when league or profile is deleted)
ALTER TABLE public.league_members 
  DROP CONSTRAINT IF EXISTS league_members_league_id_fkey,
  DROP CONSTRAINT IF EXISTS league_members_profile_id_fkey;
ALTER TABLE public.league_members 
  ADD CONSTRAINT league_members_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  ADD CONSTRAINT league_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Punishments (cascade when league is deleted)
ALTER TABLE public.punishments 
  DROP CONSTRAINT IF EXISTS punishments_league_id_fkey;
ALTER TABLE public.punishments 
  ADD CONSTRAINT punishments_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE;

-- 5. Matchday Records (cascade when league or profile is deleted, set punishment to null if deleted)
ALTER TABLE public.matchday_records 
  DROP CONSTRAINT IF EXISTS matchday_records_league_id_fkey,
  DROP CONSTRAINT IF EXISTS matchday_records_loser_profile_id_fkey,
  DROP CONSTRAINT IF EXISTS matchday_records_punishment_id_fkey;
ALTER TABLE public.matchday_records 
  ADD CONSTRAINT matchday_records_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  ADD CONSTRAINT matchday_records_loser_profile_id_fkey FOREIGN KEY (loser_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT matchday_records_punishment_id_fkey FOREIGN KEY (punishment_id) REFERENCES public.punishments(id) ON DELETE SET NULL;

-- 6. Jester Nominees (cascade when league is deleted, set nominated_by to null if profile is deleted)
ALTER TABLE public.jester_nominees 
  DROP CONSTRAINT IF EXISTS jester_nominees_league_id_fkey,
  DROP CONSTRAINT IF EXISTS jester_nominees_nominated_by_fkey;
ALTER TABLE public.jester_nominees 
  ADD CONSTRAINT jester_nominees_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  ADD CONSTRAINT jester_nominees_nominated_by_fkey FOREIGN KEY (nominated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 7. Jester Votes (cascade when league, profile or nominee is deleted)
ALTER TABLE public.jester_votes 
  DROP CONSTRAINT IF EXISTS jester_votes_league_id_fkey,
  DROP CONSTRAINT IF EXISTS jester_votes_profile_id_fkey,
  DROP CONSTRAINT IF EXISTS jester_votes_nominee_id_fkey;
ALTER TABLE public.jester_votes 
  ADD CONSTRAINT jester_votes_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  ADD CONSTRAINT jester_votes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT jester_votes_nominee_id_fkey FOREIGN KEY (nominee_id) REFERENCES public.jester_nominees(id) ON DELETE CASCADE;

-- 8. Jester History (cascade when league is deleted)
ALTER TABLE public.jester_history 
  DROP CONSTRAINT IF EXISTS jester_history_league_id_fkey;
ALTER TABLE public.jester_history 
  ADD CONSTRAINT jester_history_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE;
