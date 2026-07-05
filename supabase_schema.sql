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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

-- Políticas para Leagues: Todos pueden leer y crear, pero SOLO el creador puede editar o borrar
CREATE POLICY "Leagues Select" ON public.leagues FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leagues Insert" ON public.leagues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leagues Update" ON public.leagues FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Leagues Delete" ON public.leagues FOR DELETE USING (created_by = auth.uid());

-- Políticas para Members: Leer/Insertar autenticados. Actualizar/Borrar: el propio usuario o el creador de la liga
CREATE POLICY "Members Select" ON public.league_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Members Insert" ON public.league_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Members Update" ON public.league_members FOR UPDATE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Members Delete" ON public.league_members FOR DELETE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Políticas para Punishments: Leer/Insertar autenticados. Actualizar libre para la app por ahora. Borrar: solo creador de la liga
CREATE POLICY "Punishments Select" ON public.punishments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Punishments Insert" ON public.punishments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Punishments Update" ON public.punishments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Punishments Delete" ON public.punishments FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Políticas para Records: Leer/Insertar autenticados. Actualizar libre. Borrar: solo creador de la liga
CREATE POLICY "Records Select" ON public.matchday_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Records Insert" ON public.matchday_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Records Update" ON public.matchday_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Records Delete" ON public.matchday_records FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));


-- 6. Jugadores de Fútbol Reales (football_players)
CREATE TABLE IF NOT EXISTS public.football_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tm_id text UNIQUE,
  name text NOT NULL,
  position text,
  club text,
  market_value text,
  photo_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.football_players ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para los jugadores
CREATE POLICY "Public Read Players" ON public.football_players FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Players" ON public.football_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update Players" ON public.football_players FOR UPDATE USING (auth.role() = 'authenticated');
