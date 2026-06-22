-- Add parent_id to support nested comments/replies
ALTER TABLE public.forum_comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE;

-- Create forum_comment_likes table
CREATE TABLE IF NOT EXISTS public.forum_comment_likes (
  comment_id uuid NOT NULL REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (comment_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.forum_comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for public.forum_comment_likes
CREATE POLICY "Public Read Comment Likes" ON public.forum_comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Comment Likes" ON public.forum_comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Authenticated Delete Own Comment Likes" ON public.forum_comment_likes FOR DELETE TO authenticated USING (auth.uid() = profile_id);
