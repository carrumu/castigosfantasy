-- Dos piezas para la home de invitados, que hasta ahora era estática.
--
-- 1) home_poll_votes: la encuesta de la portada. Vota cualquiera, sin cuenta,
--    porque la home es justo el sitio donde el visitante todavía no la tiene.
--    Los votos crudos NO se pueden leer: solo se expone el recuento agregado
--    por la función de abajo, así nadie puede enumerar la actividad ajena.
--
-- 2) punishment_generations: cuenta cada castigo que saca el generador o la
--    ruleta, incluidos los de visitantes sin cuenta. `punishment_events` no
--    servía para esto: solo registra castigos de usuarios logueados y con liga,
--    así que se dejaba fuera justo lo que más se usa, la home. Guardar qué
--    castigo salió permite además saber cuáles gustan y cuáles sobran.
--
-- 3) public_home_stats(): cifras reales para la portada. Hacen falta porque
--    `profiles` solo lo lee un usuario autenticado, así que un visitante no
--    puede contar usuarios por sí mismo. La función es SECURITY DEFINER y
--    devuelve únicamente totales — ningún dato personal sale de aquí.

CREATE TABLE IF NOT EXISTS public.home_poll_votes (
  id bigserial PRIMARY KEY,
  poll_id text NOT NULL,
  option_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Acota qué se puede insertar: sin esto la tabla es un buzón abierto donde
-- cualquiera mete el texto que quiera.
ALTER TABLE public.home_poll_votes
  DROP CONSTRAINT IF EXISTS home_poll_votes_shape;
ALTER TABLE public.home_poll_votes
  ADD CONSTRAINT home_poll_votes_shape CHECK (
    length(poll_id) BETWEEN 1 AND 40
    AND length(option_id) BETWEEN 1 AND 40
    AND poll_id ~ '^[a-z0-9_-]+$'
    AND option_id ~ '^[a-z0-9_-]+$'
  );

CREATE INDEX IF NOT EXISTS home_poll_votes_poll_option_idx
  ON public.home_poll_votes (poll_id, option_id);

ALTER TABLE public.home_poll_votes ENABLE ROW LEVEL SECURITY;

-- Solo INSERT. Sin política de SELECT, UPDATE ni DELETE: los votos entran y
-- salen exclusivamente agregados por home_poll_results().
DROP POLICY IF EXISTS "Anyone can vote in home polls" ON public.home_poll_votes;
CREATE POLICY "Anyone can vote in home polls"
ON public.home_poll_votes FOR INSERT
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.home_poll_results(p_poll_id text)
RETURNS TABLE (option_id text, votes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT v.option_id, count(*)::bigint AS votes
  FROM public.home_poll_votes v
  WHERE v.poll_id = p_poll_id
  GROUP BY v.option_id
  ORDER BY votes DESC;
$$;

GRANT EXECUTE ON FUNCTION public.home_poll_results(text) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.punishment_generations (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  punishment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Lista cerrada de orígenes: si mañana alguien mete un `source` inventado, el
-- contador deja de significar lo que dice la etiqueta de la portada.
ALTER TABLE public.punishment_generations
  DROP CONSTRAINT IF EXISTS punishment_generations_source_check;
ALTER TABLE public.punishment_generations
  ADD CONSTRAINT punishment_generations_source_check CHECK (
    source IN ('home-demo', 'generador', 'ruleta')
    AND (punishment_id IS NULL OR length(punishment_id) <= 60)
  );

CREATE INDEX IF NOT EXISTS punishment_generations_punishment_idx
  ON public.punishment_generations (punishment_id);

ALTER TABLE public.punishment_generations ENABLE ROW LEVEL SECURITY;

-- Igual que la encuesta: entra todo el mundo, no lee nadie. El total sale
-- únicamente agregado por public_home_stats().
DROP POLICY IF EXISTS "Anyone can log a punishment generation" ON public.punishment_generations;
CREATE POLICY "Anyone can log a punishment generation"
ON public.punishment_generations FOR INSERT
WITH CHECK (true);

-- Cifras de portada. Solo totales agregados; se añaden campos nuevos aquí
-- según haya actividad que enseñar (jornadas, castigos cumplidos...).
CREATE OR REPLACE FUNCTION public.public_home_stats()
RETURNS TABLE (
  usuarios bigint,
  ligas bigint,
  castigos_asignados bigint,
  castigos_generados bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles)::bigint,
    (SELECT count(*) FROM public.leagues)::bigint,
    (SELECT count(*) FROM public.matchday_records
      WHERE punishment_id IS NOT NULL)::bigint,
    (SELECT count(*) FROM public.punishment_generations)::bigint;
$$;

GRANT EXECUTE ON FUNCTION public.public_home_stats() TO anon, authenticated;
