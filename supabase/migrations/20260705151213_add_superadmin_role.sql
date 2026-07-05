-- Add is_superadmin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- Update RLS policies for forum_posts to allow superadmin delete
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.forum_posts;
CREATE POLICY "Users can delete their own posts or superadmin" ON public.forum_posts
  FOR DELETE
  USING (
    auth.uid() = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Update RLS policies for forum_comments to allow superadmin delete
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;
CREATE POLICY "Users can delete their own comments or superadmin" ON public.forum_comments
  FOR DELETE
  USING (
    auth.uid() = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_superadmin = true)
  );
