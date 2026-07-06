-- Migración de Seguridad y Tenant Isolation

-- 1. Función auxiliar para evitar la recursión infinita en las políticas RLS
CREATE OR REPLACE FUNCTION public.get_user_leagues()
RETURNS SETOF uuid AS $$
  SELECT league_id FROM public.league_members WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. LEAGUES
-- ==========================================
-- Solo puedes ver las ligas a las que perteneces
DROP POLICY IF EXISTS "Leagues Select" ON public.leagues;
CREATE POLICY "Leagues Select" ON public.leagues 
  FOR SELECT USING (
    created_by = auth.uid() OR id IN (SELECT public.get_user_leagues())
  );

-- ==========================================
-- 3. LEAGUE MEMBERS
-- ==========================================
-- Solo puedes ver miembros si compartís liga, o a ti mismo
DROP POLICY IF EXISTS "Members Select" ON public.league_members;
CREATE POLICY "Members Select" ON public.league_members 
  FOR SELECT USING (
    profile_id = auth.uid() OR league_id IN (SELECT public.get_user_leagues())
  );

-- ==========================================
-- 4. PUNISHMENTS
-- ==========================================
-- Solo puedes ver castigos de tus ligas
DROP POLICY IF EXISTS "Punishments Select" ON public.punishments;
CREATE POLICY "Punishments Select" ON public.punishments 
  FOR SELECT USING (
    league_id IN (SELECT public.get_user_leagues())
  );

-- ==========================================
-- 5. MATCHDAY RECORDS
-- ==========================================
-- Solo puedes ver deudas de tus ligas
DROP POLICY IF EXISTS "Records Select" ON public.matchday_records;
CREATE POLICY "Records Select" ON public.matchday_records 
  FOR SELECT USING (
    league_id IN (SELECT public.get_user_leagues())
  );

-- Actualizar: Solo el creador de la liga puede editar los registros (ej. el importe o cambiar castigo)
DROP POLICY IF EXISTS "Records Update" ON public.matchday_records;
CREATE POLICY "Records Update" ON public.matchday_records 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid())
  );

-- ==========================================
-- 6. FOOTBALL PLAYERS (Historial)
-- ==========================================
-- Solo el sistema (service_role) puede insertar/actualizar jugadores. 
-- Eliminamos los permisos a los usuarios normales.
DROP POLICY IF EXISTS "Authenticated Insert Players" ON public.football_players;
DROP POLICY IF EXISTS "Authenticated Update Players" ON public.football_players;


-- ==========================================
-- 7. RPC PARA UNIRSE A LIGA POR CÓDIGO
-- Al restringir "Leagues Select", el usuario no puede buscar ligas por código desde el frontend 
-- a menos que use una función con permisos elevados (SECURITY DEFINER).
-- ==========================================
CREATE OR REPLACE FUNCTION public.join_league_by_code(invite_code_arg text)
RETURNS uuid AS $$
DECLARE
  found_league_id uuid;
BEGIN
  -- Buscar la liga por el código
  SELECT id INTO found_league_id
  FROM public.leagues
  WHERE invite_code = invite_code_arg;
  
  -- Si no existe, lanzar error
  IF found_league_id IS NULL THEN
    RAISE EXCEPTION 'Código de liga inválido o inexistente.';
  END IF;

  -- Insertar el miembro (ignorando si ya está dentro gracias al ON CONFLICT si existiera)
  -- En su lugar comprobamos
  IF NOT EXISTS (
    SELECT 1 FROM public.league_members 
    WHERE league_id = found_league_id AND profile_id = auth.uid()
  ) THEN
    INSERT INTO public.league_members (league_id, profile_id, is_admin)
    VALUES (found_league_id, auth.uid(), false);
  END IF;

  RETURN found_league_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
