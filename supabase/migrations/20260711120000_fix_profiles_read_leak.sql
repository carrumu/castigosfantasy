-- 20260711120000_fix_profiles_read_leak.sql
--
-- PROBLEMA: la tabla `profiles` tenia la politica "Public Read Profiles" con
-- USING (true), lo que permitia que CUALQUIER visitante (incluso sin iniciar
-- sesion, usando la anon key que viaja en el frontend) leyera todos los
-- perfiles, filtrando display_name / email de los usuarios.
--
-- SOLUCION: restringir la lectura de perfiles a usuarios autenticados. La app
-- solo necesita datos de perfil (apodo / display_name / avatar) cuando el
-- usuario ya esta logueado (clasificaciones, autores del foro, roster, bufon,
-- etc.), asi que el cambio no rompe ningun flujo: las vistas para anonimos ya
-- devolvian vacio porque el resto de tablas son authenticated-only.

-- ============================================================
-- 1. profiles: cerrar la lectura anonima
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Profiles"        ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Read Profiles" ON public.profiles;

CREATE POLICY "Authenticated Read Profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- La politica de escritura "Users Update Own Profile" se mantiene intacta.

-- ============================================================
-- 2. Defensivo: reafirmar RLS activo en todas las tablas de la app
--    (idempotente: no hace nada donde ya esta activado)
-- ============================================================
ALTER TABLE public.leagues             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchday_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_players    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jester_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jester_nominees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jester_votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchdays_calendar  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_roster       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishment_events   ENABLE ROW LEVEL SECURITY;
