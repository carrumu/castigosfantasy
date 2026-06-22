-- 1. Tabla de Publicaciones Globales (forum_posts)
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general', -- 'general', 'fichajes', 'alineaciones', 'llantos'
  title text,
  content varchar(280) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Comentarios (forum_comments)
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Reacciones (forum_post_reactions)
CREATE TABLE IF NOT EXISTS public.forum_post_reactions (
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL, -- 'fire', 'laugh', 'cry', 'poop', 'money'
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (post_id, profile_id, reaction_type)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas para public.forum_posts
CREATE POLICY "Public Read Posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Authenticated Delete Own Posts" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Políticas para public.forum_comments
CREATE POLICY "Public Read Comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Authenticated Delete Own Comments" ON public.forum_comments FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Políticas para public.forum_post_reactions
CREATE POLICY "Public Read Reactions" ON public.forum_post_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Reactions" ON public.forum_post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Authenticated Delete Own Reactions" ON public.forum_post_reactions FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Trigger de límite diario (10 publicaciones)
CREATE OR REPLACE FUNCTION public.check_daily_post_limit()
RETURNS trigger AS $$
DECLARE
  post_count integer;
BEGIN
  -- Contar publicaciones creadas por el usuario en el día de hoy UTC
  SELECT COUNT(*)
  INTO post_count
  FROM public.forum_posts
  WHERE profile_id = NEW.profile_id
    AND created_at >= timezone('utc'::text, date_trunc('day', now()));

  IF post_count >= 10 THEN
    RAISE EXCEPTION 'Has alcanzado el limite diario de 10 publicaciones.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER enforce_daily_post_limit
  BEFORE INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_daily_post_limit();
