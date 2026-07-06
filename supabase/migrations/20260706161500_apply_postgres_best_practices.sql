-- 20260706161500_apply_postgres_best_practices.sql

-- ==========================================
-- 1. FOREIGN KEY INDEXES (BEST PRACTICES)
-- ==========================================

CREATE INDEX IF NOT EXISTS leagues_created_by_idx ON public.leagues (created_by);
CREATE INDEX IF NOT EXISTS league_members_profile_id_idx ON public.league_members (profile_id);
CREATE INDEX IF NOT EXISTS punishments_league_id_idx ON public.punishments (league_id);
CREATE INDEX IF NOT EXISTS matchday_records_league_id_idx ON public.matchday_records (league_id);
CREATE INDEX IF NOT EXISTS matchday_records_loser_profile_id_idx ON public.matchday_records (loser_profile_id);
CREATE INDEX IF NOT EXISTS matchday_records_punishment_id_idx ON public.matchday_records (punishment_id);
CREATE INDEX IF NOT EXISTS jester_history_league_id_idx ON public.jester_history (league_id);
CREATE INDEX IF NOT EXISTS jester_nominees_league_id_idx ON public.jester_nominees (league_id);
CREATE INDEX IF NOT EXISTS jester_nominees_nominated_by_idx ON public.jester_nominees (nominated_by);
CREATE INDEX IF NOT EXISTS jester_votes_league_id_idx ON public.jester_votes (league_id);
CREATE INDEX IF NOT EXISTS jester_votes_profile_id_idx ON public.jester_votes (profile_id);
CREATE INDEX IF NOT EXISTS jester_votes_nominee_id_idx ON public.jester_votes (nominee_id);
CREATE INDEX IF NOT EXISTS forum_posts_profile_id_idx ON public.forum_posts (profile_id);
CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments (post_id);
CREATE INDEX IF NOT EXISTS forum_comments_profile_id_idx ON public.forum_comments (profile_id);
CREATE INDEX IF NOT EXISTS forum_comments_parent_id_idx ON public.forum_comments (parent_id);
CREATE INDEX IF NOT EXISTS forum_post_likes_post_id_idx ON public.forum_post_likes (post_id);
CREATE INDEX IF NOT EXISTS forum_post_likes_profile_id_idx ON public.forum_post_likes (profile_id);
CREATE INDEX IF NOT EXISTS forum_comment_likes_comment_id_idx ON public.forum_comment_likes (comment_id);
CREATE INDEX IF NOT EXISTS forum_comment_likes_profile_id_idx ON public.forum_comment_likes (profile_id);
CREATE INDEX IF NOT EXISTS weekly_challenges_league_id_idx ON public.weekly_challenges (league_id);
CREATE INDEX IF NOT EXISTS weekly_challenges_created_by_idx ON public.weekly_challenges (created_by);
CREATE INDEX IF NOT EXISTS challenge_votes_challenge_id_idx ON public.challenge_votes (challenge_id);
CREATE INDEX IF NOT EXISTS challenge_votes_profile_id_idx ON public.challenge_votes (profile_id);
CREATE INDEX IF NOT EXISTS punishment_events_league_id_idx ON public.punishment_events (league_id);
CREATE INDEX IF NOT EXISTS punishment_events_profile_id_idx ON public.punishment_events (profile_id);


-- ==========================================
-- 2. RLS OPTIMIZATION: CACHING AUTH.UID()
-- ==========================================

-- Re-create profiles policies
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Re-create leagues policies
DROP POLICY IF EXISTS "Leagues Update" ON public.leagues;
DROP POLICY IF EXISTS "Leagues Delete" ON public.leagues;
CREATE POLICY "Leagues Update" ON public.leagues FOR UPDATE USING (created_by = (select auth.uid()));
CREATE POLICY "Leagues Delete" ON public.leagues FOR DELETE USING (created_by = (select auth.uid()));

-- Re-create league_members policies
DROP POLICY IF EXISTS "Members Update" ON public.league_members;
DROP POLICY IF EXISTS "Members Delete" ON public.league_members;
CREATE POLICY "Members Update" ON public.league_members FOR UPDATE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Members Delete" ON public.league_members FOR DELETE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create punishments policies
DROP POLICY IF EXISTS "Strict Punishments Update" ON public.punishments;
DROP POLICY IF EXISTS "Punishments Delete" ON public.punishments;
CREATE POLICY "Strict Punishments Update" ON public.punishments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Punishments Delete" ON public.punishments FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create matchday_records policies
DROP POLICY IF EXISTS "Strict Records Update" ON public.matchday_records;
DROP POLICY IF EXISTS "Records Delete" ON public.matchday_records;
CREATE POLICY "Strict Records Update" ON public.matchday_records FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Records Delete" ON public.matchday_records FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create forum_posts policies
DROP POLICY IF EXISTS "Authenticated Insert Posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated Update Own Posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts or superadmin" ON public.forum_posts;
CREATE POLICY "Authenticated Insert Posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Authenticated Update Own Posts" ON public.forum_posts FOR UPDATE TO authenticated USING ((select auth.uid()) = profile_id);
CREATE POLICY "Users can delete their own posts or superadmin" ON public.forum_posts FOR DELETE USING (
    (select auth.uid()) = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_superadmin = true)
);

-- Re-create forum_comments policies
DROP POLICY IF EXISTS "Authenticated Insert Comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Authenticated Update Own Comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments or superadmin" ON public.forum_comments;
CREATE POLICY "Authenticated Insert Comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Authenticated Update Own Comments" ON public.forum_comments FOR UPDATE TO authenticated USING ((select auth.uid()) = profile_id);
CREATE POLICY "Users can delete their own comments or superadmin" ON public.forum_comments FOR DELETE USING (
    (select auth.uid()) = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_superadmin = true)
);

-- Re-create forum_post_likes policies
DROP POLICY IF EXISTS "Authenticated Insert Likes" ON public.forum_post_likes;
DROP POLICY IF EXISTS "Authenticated Delete Own Likes" ON public.forum_post_likes;
CREATE POLICY "Authenticated Insert Likes" ON public.forum_post_likes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Authenticated Delete Own Likes" ON public.forum_post_likes FOR DELETE TO authenticated USING ((select auth.uid()) = profile_id);

-- Re-create forum_comment_likes policies
DROP POLICY IF EXISTS "Authenticated Insert Comment Likes" ON public.forum_comment_likes;
DROP POLICY IF EXISTS "Authenticated Delete Own Comment Likes" ON public.forum_comment_likes;
CREATE POLICY "Authenticated Insert Comment Likes" ON public.forum_comment_likes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Authenticated Delete Own Comment Likes" ON public.forum_comment_likes FOR DELETE TO authenticated USING ((select auth.uid()) = profile_id);

-- Re-create jester_history policies
DROP POLICY IF EXISTS "Strict Update Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Strict Delete Jester History" ON public.jester_history;
CREATE POLICY "Strict Update Jester History" ON public.jester_history FOR UPDATE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Jester History" ON public.jester_history FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create jester_nominees policies
DROP POLICY IF EXISTS "Strict Insert Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Strict Update Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Strict Delete Jester Nominees" ON public.jester_nominees;
CREATE POLICY "Strict Insert Jester Nominees" ON public.jester_nominees FOR INSERT TO authenticated WITH CHECK (nominated_by = (select auth.uid()));
CREATE POLICY "Strict Update Jester Nominees" ON public.jester_nominees FOR UPDATE USING (nominated_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Jester Nominees" ON public.jester_nominees FOR DELETE USING (nominated_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create jester_votes policies
DROP POLICY IF EXISTS "Strict Update Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Strict Delete Jester Votes" ON public.jester_votes;
CREATE POLICY "Strict Update Jester Votes" ON public.jester_votes FOR UPDATE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Jester Votes" ON public.jester_votes FOR DELETE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create weekly_challenges policies
DROP POLICY IF EXISTS "Strict Update Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Strict Delete Challenges" ON public.weekly_challenges;
CREATE POLICY "Strict Update Challenges" ON public.weekly_challenges FOR UPDATE USING (created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Challenges" ON public.weekly_challenges FOR DELETE USING (created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create challenge_votes policies
DROP POLICY IF EXISTS "Strict Update Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Strict Delete Challenge Votes" ON public.challenge_votes;
CREATE POLICY "Strict Update Challenge Votes" ON public.challenge_votes FOR UPDATE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.weekly_challenges c JOIN public.leagues l ON l.id = c.league_id WHERE c.id = challenge_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Challenge Votes" ON public.challenge_votes FOR DELETE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.weekly_challenges c JOIN public.leagues l ON l.id = c.league_id WHERE c.id = challenge_id AND l.created_by = (select auth.uid())));

-- Re-create punishment_events policies
DROP POLICY IF EXISTS "Strict Update Punishment Events" ON public.punishment_events;
DROP POLICY IF EXISTS "Strict Delete Punishment Events" ON public.punishment_events;
CREATE POLICY "Strict Update Punishment Events" ON public.punishment_events FOR UPDATE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));
CREATE POLICY "Strict Delete Punishment Events" ON public.punishment_events FOR DELETE USING (profile_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = (select auth.uid())));

-- Re-create functions to cache auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_leagues()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT league_id FROM public.league_members WHERE profile_id = (select auth.uid());
END;
$$;
