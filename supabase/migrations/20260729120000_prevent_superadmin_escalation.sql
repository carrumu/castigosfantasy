-- ============================================================
-- SEGURIDAD: impedir la escalada de privilegios a superadmin.
--
-- Problema: la politica "Users Update Own Profile" permite a cada usuario
-- actualizar su propia fila de profiles. RLS en Postgres es a nivel de FILA,
-- no de COLUMNA, asi que cualquier usuario autenticado podia hacer
--     update profiles set is_superadmin = true where id = <su propio id>
-- y concederse el rol. Ser superadmin permite BORRAR cualquier post y
-- cualquier comentario del foro (ver politicas de forum_posts/forum_comments),
-- por lo que un usuario malicioso podia vaciar el foro entero.
--
-- Solucion: un trigger BEFORE UPDATE que bloquea el cambio de is_superadmin
-- salvo que quien lo hace ya sea superadmin. Se permite cuando no hay usuario
-- autenticado (auth.uid() nulo), es decir desde la service role o el panel de
-- Supabase, para que la administracion legitima siga siendo posible.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_superadmin_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_superadmin IS DISTINCT FROM OLD.is_superadmin THEN
    -- auth.uid() nulo = service role / panel de Supabase -> se permite.
    IF auth.uid() IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.profiles p
         WHERE p.id = auth.uid() AND p.is_superadmin = true
       )
    THEN
      RAISE EXCEPTION 'FORBIDDEN: no puedes modificar is_superadmin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_superadmin_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_superadmin_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_superadmin_escalation();
