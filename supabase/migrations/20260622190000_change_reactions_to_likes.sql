-- Drop old reactions table
DROP TABLE IF EXISTS public.forum_post_reactions;

-- Create forum_post_likes table
CREATE TABLE IF NOT EXISTS public.forum_post_likes (
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (post_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for public.forum_post_likes
CREATE POLICY "Public Read Likes" ON public.forum_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Likes" ON public.forum_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Authenticated Delete Own Likes" ON public.forum_post_likes FOR DELETE TO authenticated USING (auth.uid() = profile_id);
