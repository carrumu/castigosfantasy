-- 20260711123000_move_biwenger_credentials_to_secrets.sql
--
-- PROBLEMA: `biwenger_email` y `biwenger_password` vivian en la tabla `leagues`,
-- cuya politica de lectura es "cualquier autenticado". Es decir, un usuario
-- logueado podia leer las credenciales de Biwenger de OTRAS ligas.
--
-- SOLUCION: mover las credenciales a una tabla aparte `league_secrets` que NO es
-- legible por miembros normales (solo por el admin/creador de la propia liga).
-- La edge function `biwenger-sync` las leera server-side con la service role
-- (que se salta el RLS), asi que la sincronizacion disparada por cualquier
-- miembro sigue funcionando, pero la contrasena ya nunca viaja al cliente de
-- otros usuarios ni es legible via la anon key.
--
-- ORDEN DE DESPLIEGUE (importante): aplicar esta migracion junto con el deploy
-- de la edge function y del frontend nuevos; esta migracion ELIMINA las columnas
-- viejas de `leagues`, por lo que el codigo antiguo dejaria de sincronizar.

-- ============================================================
-- 1. Tabla de secretos por liga
-- ============================================================
CREATE TABLE IF NOT EXISTS public.league_secrets (
  league_id uuid PRIMARY KEY REFERENCES public.leagues(id) ON DELETE CASCADE,
  biwenger_email text,
  biwenger_password text,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 2. Copiar las credenciales existentes desde leagues
-- ============================================================
INSERT INTO public.league_secrets (league_id, biwenger_email, biwenger_password)
SELECT id, biwenger_email, biwenger_password
FROM public.leagues
WHERE biwenger_email IS NOT NULL OR biwenger_password IS NOT NULL
ON CONFLICT (league_id) DO UPDATE
  SET biwenger_email    = EXCLUDED.biwenger_email,
      biwenger_password = EXCLUDED.biwenger_password,
      updated_at        = timezone('utc'::text, now());

-- ============================================================
-- 3. RLS: solo el admin/creador de la liga puede ver o tocar sus secretos.
--    Los miembros normales NO tienen ninguna politica -> acceso denegado.
--    La edge function usa la service role, que ignora el RLS.
-- ============================================================
ALTER TABLE public.league_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read own league secrets"   ON public.league_secrets;
DROP POLICY IF EXISTS "Admins insert own league secrets" ON public.league_secrets;
DROP POLICY IF EXISTS "Admins update own league secrets" ON public.league_secrets;
DROP POLICY IF EXISTS "Admins delete own league secrets" ON public.league_secrets;

-- Helper de autorizacion: creador de la liga O miembro marcado como admin.
CREATE POLICY "Admins read own league secrets"
  ON public.league_secrets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.leagues l
            WHERE l.id = league_secrets.league_id AND l.created_by = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM public.league_members m
               WHERE m.league_id = league_secrets.league_id
                 AND m.profile_id = (select auth.uid())
                 AND m.is_admin = true)
  );

CREATE POLICY "Admins insert own league secrets"
  ON public.league_secrets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.leagues l
            WHERE l.id = league_secrets.league_id AND l.created_by = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM public.league_members m
               WHERE m.league_id = league_secrets.league_id
                 AND m.profile_id = (select auth.uid())
                 AND m.is_admin = true)
  );

CREATE POLICY "Admins update own league secrets"
  ON public.league_secrets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.leagues l
            WHERE l.id = league_secrets.league_id AND l.created_by = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM public.league_members m
               WHERE m.league_id = league_secrets.league_id
                 AND m.profile_id = (select auth.uid())
                 AND m.is_admin = true)
  );

CREATE POLICY "Admins delete own league secrets"
  ON public.league_secrets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.leagues l
            WHERE l.id = league_secrets.league_id AND l.created_by = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM public.league_members m
               WHERE m.league_id = league_secrets.league_id
                 AND m.profile_id = (select auth.uid())
                 AND m.is_admin = true)
  );

-- ============================================================
-- 4. Eliminar las columnas sensibles de leagues (cierra la fuga).
--    `biwenger_league_id` y `sync_source` NO son sensibles y se quedan.
-- ============================================================
ALTER TABLE public.leagues DROP COLUMN IF EXISTS biwenger_email;
ALTER TABLE public.leagues DROP COLUMN IF EXISTS biwenger_password;
