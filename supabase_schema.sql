-- 1. Tabla de Perfiles (profiles) sincronizada con auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  apodo text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Trigger para crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, apodo, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'apodo', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla de Ligas (leagues)
CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  features text NOT NULL DEFAULT 'both',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Miembros de las Ligas (league_members)
CREATE TABLE IF NOT EXISTS public.league_members (
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false,
  PRIMARY KEY (league_id, profile_id)
);

-- 4. Castigos de la Ruleta (punishments)
CREATE TABLE IF NOT EXISTS public.punishments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Registro de Jornadas (matchday_records)
CREATE TABLE IF NOT EXISTS public.matchday_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  matchday_number integer NOT NULL,
  amount_owed numeric(10,2) NOT NULL DEFAULT 0.00,
  loser_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  punishment_id uuid REFERENCES public.punishments(id) ON DELETE SET NULL,
  trash_talk_phrase text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla del Muro de la Comunidad (feed_posts)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  nickname text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  league text,
  platform text NOT NULL,
  url text NOT NULL,
  description text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Comentarios del Feed (feed_comments)
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Likes del Feed (feed_likes)
CREATE TABLE IF NOT EXISTS public.feed_likes (
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, profile_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchday_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS Permisivas (Acceso público de lectura, escritura autenticada)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated Leagues" ON public.leagues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Members" ON public.league_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Punishments" ON public.punishments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Records" ON public.matchday_records FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Feed Posts Read" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Feed Posts Write" ON public.feed_posts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Feed Comments Read" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Feed Comments Write" ON public.feed_comments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Feed Likes Read" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Feed Likes Write" ON public.feed_likes FOR ALL USING (auth.role() = 'authenticated');

-- 9. Trigger para enviar notificación al administrador por cada registro usando pg_net
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_user()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'from', 'CastigoFantasy <noreply@castigosfantasy.com>',
    'to', 'castigosfantasy2005@gmail.com',
    'subject', 'Nuevo Registro de Entrenador',
    'html', '<h3>¡Nuevo registro en CastigoFantasy!</h3>' ||
            '<p>Se ha registrado un nuevo entrenador en la plataforma:</p>' ||
            '<ul>' ||
            '  <li><strong>Nombre:</strong> ' || COALESCE(new.display_name, 'Sin nombre') || '</li>' ||
            '  <li><strong>Apodo:</strong> ' || COALESCE(new.apodo, 'Sin apodo') || '</li>' ||
            '  <li><strong>Fecha/Hora:</strong> ' || timezone('utc'::text, now()) || ' (UTC)</li>' ||
            '</ul>'
  );

  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer re_ZyCbKVQh_63jwXgxNQN4ETo4oXLAQwBks"}'::jsonb,
    body := payload
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_user();
