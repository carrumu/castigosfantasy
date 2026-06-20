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


-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchday_records ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS Permisivas (Acceso público de lectura, escritura autenticada)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated Leagues" ON public.leagues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Members" ON public.league_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Punishments" ON public.punishments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Records" ON public.matchday_records FOR ALL USING (auth.role() = 'authenticated');




