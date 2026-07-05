-- Fix public reads in forum
DROP POLICY IF EXISTS "Public Read Comment Likes" ON public.forum_comment_likes;
CREATE POLICY "Auth Read Comment Likes" ON public.forum_comment_likes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Likes" ON public.forum_post_likes;
CREATE POLICY "Auth Read Likes" ON public.forum_post_likes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Posts" ON public.forum_posts;
CREATE POLICY "Auth Read Posts" ON public.forum_posts FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Comments" ON public.forum_comments;
CREATE POLICY "Auth Read Comments" ON public.forum_comments FOR SELECT USING (auth.role() = 'authenticated');

-- Table public.forum_post_reactions was dropped in a previous migration, no need to update its policies.

-- Fix public reads in jester
DROP POLICY IF EXISTS "Public Read Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Auth Read Jester Nominees" ON public.jester_nominees FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Jester Votes" ON public.jester_votes;
CREATE POLICY "Auth Read Jester Votes" ON public.jester_votes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Jester History" ON public.jester_history;
CREATE POLICY "Auth Read Jester History" ON public.jester_history FOR SELECT USING (auth.role() = 'authenticated');

-- Fix FOR ALL policies
DROP POLICY IF EXISTS "Authenticated Manage Jester History" ON public.jester_history;
CREATE POLICY "Auth Update Jester History" ON public.jester_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Jester History" ON public.jester_history FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Insert Jester History" ON public.jester_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Manage Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Auth Update Jester Nominees" ON public.jester_nominees FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Jester Nominees" ON public.jester_nominees FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Manage Jester Votes" ON public.jester_votes;
CREATE POLICY "Auth Update Jester Votes" ON public.jester_votes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Jester Votes" ON public.jester_votes FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Challenges" ON public.weekly_challenges;
CREATE POLICY "Auth Select Challenges" ON public.weekly_challenges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Insert Challenges" ON public.weekly_challenges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Challenges" ON public.weekly_challenges FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Challenges" ON public.weekly_challenges FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Votes" ON public.challenge_votes;
CREATE POLICY "Auth Select Challenge Votes" ON public.challenge_votes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Insert Challenge Votes" ON public.challenge_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Challenge Votes" ON public.challenge_votes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Challenge Votes" ON public.challenge_votes FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Punishment Events" ON public.punishment_events;
CREATE POLICY "Auth Select Punishment Events" ON public.punishment_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Insert Punishment Events" ON public.punishment_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Punishment Events" ON public.punishment_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Punishment Events" ON public.punishment_events FOR DELETE USING (auth.role() = 'authenticated');
