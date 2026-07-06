-- Rate limit function for forum posts and comments
CREATE OR REPLACE FUNCTION public.check_forum_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_post_time timestamp with time zone;
  last_comment_time timestamp with time zone;
BEGIN
  -- Verificar último post del usuario (tabla de posts)
  SELECT created_at INTO last_post_time
  FROM public.forum_posts
  WHERE profile_id = NEW.profile_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_post_time IS NOT NULL AND (now() - last_post_time) < interval '10 seconds' THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED';
  END IF;

  -- Verificar último comentario del usuario (tabla de comentarios)
  SELECT created_at INTO last_comment_time
  FROM public.forum_comments
  WHERE profile_id = NEW.profile_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_comment_time IS NOT NULL AND (now() - last_comment_time) < interval '10 seconds' THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to forum_posts
DROP TRIGGER IF EXISTS enforce_rate_limit_posts ON public.forum_posts;
CREATE TRIGGER enforce_rate_limit_posts
BEFORE INSERT ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.check_forum_rate_limit();

-- Apply trigger to forum_comments
DROP TRIGGER IF EXISTS enforce_rate_limit_comments ON public.forum_comments;
CREATE TRIGGER enforce_rate_limit_comments
BEFORE INSERT ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.check_forum_rate_limit();
