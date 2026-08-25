-- El Bufón y el Reto Semanal estaban pensados como funciones GLOBALES (una
-- sola votación para toda la comunidad, no por liga), pero sus políticas de
-- RLS seguían exigiendo "league_id IN get_user_leagues()" -- el mismo
-- candado que usan las tablas privadas por liga. En la práctica, solo los
-- miembros de la liga "ancla" (la primera creada en toda la base de datos,
-- que es la que bufon.js usa como contenedor) podían leer o votar; el resto
-- de usuarios se encontraba todo vacío y la app caía a modo demo.
--
-- Este arreglo abre la lectura a todo el mundo (son votaciones públicas por
-- diseño) y quita el filtro de "eres miembro de esa liga" de la escritura,
-- dejando solo la autoría (tú solo puedes votar/nominar como tú mismo) y,
-- para borrar/editar contenido ajeno, al superadmin -- ya no tiene sentido
-- "el creador de la liga ancla" como moderador de algo que es de todos.

-- ============================================================
-- jester_nominees
-- ============================================================
DROP POLICY IF EXISTS "Members Read Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Members Insert Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Strict Update Jester Nominees" ON public.jester_nominees;
DROP POLICY IF EXISTS "Strict Delete Jester Nominees" ON public.jester_nominees;

CREATE POLICY "Global Read Jester Nominees" ON public.jester_nominees
  FOR SELECT USING (true);

CREATE POLICY "Global Insert Jester Nominees" ON public.jester_nominees
  FOR INSERT WITH CHECK (nominated_by = (SELECT auth.uid()));

CREATE POLICY "Global Update Jester Nominees" ON public.jester_nominees
  FOR UPDATE USING (
    nominated_by = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

CREATE POLICY "Global Delete Jester Nominees" ON public.jester_nominees
  FOR DELETE USING (
    nominated_by = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

-- ============================================================
-- jester_votes
-- ============================================================
DROP POLICY IF EXISTS "Members Read Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Members Insert Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Strict Update Jester Votes" ON public.jester_votes;
DROP POLICY IF EXISTS "Strict Delete Jester Votes" ON public.jester_votes;

CREATE POLICY "Global Read Jester Votes" ON public.jester_votes
  FOR SELECT USING (true);

CREATE POLICY "Global Insert Jester Votes" ON public.jester_votes
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

CREATE POLICY "Global Update Jester Votes" ON public.jester_votes
  FOR UPDATE USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

CREATE POLICY "Global Delete Jester Votes" ON public.jester_votes
  FOR DELETE USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

-- ============================================================
-- jester_history (solo el sistema la escribe, vía maybeAutoCloseMatchday)
-- ============================================================
DROP POLICY IF EXISTS "Members Read Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Members Insert Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Strict Update Jester History" ON public.jester_history;
DROP POLICY IF EXISTS "Strict Delete Jester History" ON public.jester_history;

CREATE POLICY "Global Read Jester History" ON public.jester_history
  FOR SELECT USING (true);

CREATE POLICY "Global Insert Jester History" ON public.jester_history
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Global Update Jester History" ON public.jester_history
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

CREATE POLICY "Global Delete Jester History" ON public.jester_history
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

-- ============================================================
-- weekly_challenges (Reto Semanal) -- el sistema los siembra, nadie los
-- "crea" como autor, por eso el insert solo exige estar autenticado.
-- ============================================================
DROP POLICY IF EXISTS "Members Read Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Members Insert Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Strict Update Challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Strict Delete Challenges" ON public.weekly_challenges;

CREATE POLICY "Global Read Challenges" ON public.weekly_challenges
  FOR SELECT USING (true);

CREATE POLICY "Global Insert Challenges" ON public.weekly_challenges
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Global Update Challenges" ON public.weekly_challenges
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

CREATE POLICY "Global Delete Challenges" ON public.weekly_challenges
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

-- ============================================================
-- challenge_votes
-- ============================================================
DROP POLICY IF EXISTS "Members Read Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Members Insert Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Strict Update Challenge Votes" ON public.challenge_votes;
DROP POLICY IF EXISTS "Strict Delete Challenge Votes" ON public.challenge_votes;

CREATE POLICY "Global Read Challenge Votes" ON public.challenge_votes
  FOR SELECT USING (true);

CREATE POLICY "Global Insert Challenge Votes" ON public.challenge_votes
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

CREATE POLICY "Global Update Challenge Votes" ON public.challenge_votes
  FOR UPDATE USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );

CREATE POLICY "Global Delete Challenge Votes" ON public.challenge_votes
  FOR DELETE USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_superadmin = true)
  );
