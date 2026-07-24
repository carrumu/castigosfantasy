-- Pins the daily answer for the shared minigames (Wordle-style "Adivina el
-- Jugador" and "LaLiga Top 10") so every player gets the exact same puzzle
-- for a given calendar day, regardless of when they load the page or
-- whether the underlying football_players data has since drifted.
--
-- Whoever loads the game first that day computes the answer client-side and
-- inserts it; everyone after just reads the stored row. The primary key on
-- (game, game_date) makes a same-day race safe (the loser's insert fails,
-- falls back to re-reading the winner's row). No UPDATE/DELETE policy: once
-- a day's answer is set, it's immutable.
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  game text NOT NULL,
  game_date date NOT NULL,
  daily_number integer NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (game, game_date)
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to daily_challenges"
ON public.daily_challenges FOR SELECT
USING (true);

CREATE POLICY "Allow public insert of daily_challenges"
ON public.daily_challenges FOR INSERT
WITH CHECK (true);
