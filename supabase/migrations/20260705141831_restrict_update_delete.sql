-- Re-restrict UPDATE and DELETE for jester tables
DROP POLICY IF EXISTS "Auth Update Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Auth Delete Jester History" ON public.jester_history;
CREATE POLICY "Strict Update Jester History" ON public.jester_history FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Jester History" ON public.jester_history FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

DROP POLICY IF EXISTS "Auth Update Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Auth Delete Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Strict Update Jester Nominees" ON public.jester_nominees FOR UPDATE USING (nominated_by = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Jester Nominees" ON public.jester_nominees FOR DELETE USING (nominated_by = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

DROP POLICY IF EXISTS "Auth Update Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Auth Delete Jester Votes" ON public.jester_votes;
CREATE POLICY "Strict Update Jester Votes" ON public.jester_votes FOR UPDATE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Jester Votes" ON public.jester_votes FOR DELETE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Re-restrict UPDATE and DELETE for challenges tables
DROP POLICY IF EXISTS "Auth Update Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Auth Delete Challenges" ON public.weekly_challenges;
CREATE POLICY "Strict Update Challenges" ON public.weekly_challenges FOR UPDATE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Challenges" ON public.weekly_challenges FOR DELETE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

DROP POLICY IF EXISTS "Auth Update Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Auth Delete Challenge Votes" ON public.challenge_votes;
CREATE POLICY "Strict Update Challenge Votes" ON public.challenge_votes FOR UPDATE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.weekly_challenges c JOIN public.leagues l ON l.id = c.league_id WHERE c.id = challenge_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Challenge Votes" ON public.challenge_votes FOR DELETE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.weekly_challenges c JOIN public.leagues l ON l.id = c.league_id WHERE c.id = challenge_id AND l.created_by = auth.uid()));

-- Re-restrict UPDATE and DELETE for punishment events
DROP POLICY IF EXISTS "Auth Update Punishment Events" ON public.punishment_events;
DROP POLICY IF EXISTS "Auth Delete Punishment Events" ON public.punishment_events;
CREATE POLICY "Strict Update Punishment Events" ON public.punishment_events FOR UPDATE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Strict Delete Punishment Events" ON public.punishment_events FOR DELETE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Re-restrict UPDATE for Punishments and Records from the first migration
DROP POLICY IF EXISTS "Punishments Update" ON public.punishments;
CREATE POLICY "Strict Punishments Update" ON public.punishments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

DROP POLICY IF EXISTS "Records Update" ON public.matchday_records;
CREATE POLICY "Strict Records Update" ON public.matchday_records FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
