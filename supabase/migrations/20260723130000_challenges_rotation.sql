-- Weekly challenges rotation fix:
-- 1. Seeds matchdays_calendar with a full season of weekly-cadence dates
--    (same cadence as scripts/seed_calendar.js) so getMatchdayClosingTime()
--    and the new getCurrentMatchdayNumber() have real dates to work with,
--    without depending on the unconfigured API-Football integration.
-- 2. Enforces one challenge vote per (league, matchday) per profile, since
--    the existing PK on challenge_votes only prevents voting twice on the
--    exact same challenge, not voting on several different ones in a week.

INSERT INTO public.matchdays_calendar (matchday_number, last_match_time)
SELECT
  n,
  '2026-08-17T21:00:00Z'::timestamptz + ((n - 1) * interval '7 days')
FROM generate_series(1, 38) AS n
ON CONFLICT (matchday_number) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_one_challenge_vote_per_matchday()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_league_id uuid;
  v_matchday integer;
  v_existing integer;
BEGIN
  SELECT league_id, matchday_number INTO v_league_id, v_matchday
  FROM public.weekly_challenges
  WHERE id = NEW.challenge_id;

  SELECT count(*) INTO v_existing
  FROM public.challenge_votes cv
  JOIN public.weekly_challenges wc ON wc.id = cv.challenge_id
  WHERE cv.profile_id = NEW.profile_id
    AND wc.league_id = v_league_id
    AND wc.matchday_number = v_matchday;

  IF v_existing > 0 THEN
    RAISE EXCEPTION 'CHALLENGE_VOTE_LIMIT_REACHED: ya has votado un reto esta jornada'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_one_challenge_vote_per_matchday ON public.challenge_votes;
CREATE TRIGGER trg_one_challenge_vote_per_matchday
  BEFORE INSERT ON public.challenge_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_one_challenge_vote_per_matchday();
