-- El Bufón: a manager can currently submit unlimited candidates in the same
-- matchday — only voting was ever limited to one per manager per round
-- (see jester_votes' UNIQUE (league_id, matchday_number, profile_id)).
-- This applies the same one-per-matchday rule to nominations.

-- A UNIQUE constraint can't be added over data that already violates it, so
-- first collapse any existing duplicate nominations from the same manager
-- in the same league/matchday down to the earliest one. Deleting the
-- duplicates cascades to any votes cast on them (jester_votes.nominee_id
-- REFERENCES ... ON DELETE CASCADE); votes on the surviving nomination are
-- untouched.
DELETE FROM public.jester_nominees a
USING public.jester_nominees b
WHERE a.nominated_by IS NOT NULL
  AND a.nominated_by = b.nominated_by
  AND a.league_id = b.league_id
  AND a.matchday_number = b.matchday_number
  AND (a.created_at, a.id) > (b.created_at, b.id);

ALTER TABLE public.jester_nominees
  ADD CONSTRAINT jester_nominees_one_per_matchday
  UNIQUE (league_id, matchday_number, nominated_by);
