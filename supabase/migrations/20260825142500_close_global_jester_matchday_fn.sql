-- El cierre automático de una jornada del Bufón (maybeAutoCloseMatchday en
-- bufon.js) lo dispara el navegador de cualquier visitante que cargue la
-- página tras el cierre de plazo, no un admin. Con las nominaciones ahora
-- globales y las políticas de borrado restringidas a "solo lo tuyo", ese
-- visitante ya no puede borrar los nominados de otros usuarios de esa
-- jornada -- se quedaban a medio limpiar.
--
-- Se mueve el cierre entero a una función SECURITY DEFINER: calcula el
-- ganador de verdad a partir de los votos reales en el servidor (no se fía
-- de lo que mande el cliente), corona y borra todos los nominados de la
-- jornada de una vez, atómicamente.
CREATE OR REPLACE FUNCTION public.close_global_jester_matchday(p_matchday integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_league_id uuid := public.get_global_content_league_id();
  v_winner record;
BEGIN
  IF (SELECT auth.role()) <> 'authenticated' THEN
    RAISE EXCEPTION 'FORBIDDEN: se requiere sesion';
  END IF;

  -- Nada que coronar: no hace falta más, la siguiente nominación abrirá una
  -- jornada nueva por sí sola.
  IF NOT EXISTS (
    SELECT 1 FROM public.jester_nominees
    WHERE league_id = v_league_id AND matchday_number = p_matchday
  ) THEN
    RETURN;
  END IF;

  SELECT n.name, n.team, n.reason
  INTO v_winner
  FROM public.jester_nominees n
  LEFT JOIN public.jester_votes v ON v.nominee_id = n.id
  WHERE n.league_id = v_league_id AND n.matchday_number = p_matchday
  GROUP BY n.id, n.name, n.team, n.reason
  ORDER BY count(v.id) DESC, n.created_at ASC
  LIMIT 1;

  -- Choque de unicidad (league_id, matchday_number) si otro visitante ya
  -- cerró esta misma jornada un instante antes: no pasa nada, se ignora.
  INSERT INTO public.jester_history (league_id, matchday_number, name, team, reason, raffle_winner, raffle_player)
  VALUES (v_league_id, p_matchday, v_winner.name, v_winner.team, v_winner.reason, NULL, NULL)
  ON CONFLICT (league_id, matchday_number) DO NOTHING;

  DELETE FROM public.jester_nominees
  WHERE league_id = v_league_id AND matchday_number = p_matchday;
END;
$$;

GRANT EXECUTE ON FUNCTION public.close_global_jester_matchday(integer) TO authenticated;
