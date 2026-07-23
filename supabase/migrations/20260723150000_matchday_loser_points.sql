-- Records the loser's points for the matchday, computed today at jornada-
-- close time (dashboard.js's pending.colistaPts) but never persisted. Needed
-- for "Modo Jornada Express" to show "@Carlos hizo 18 puntos (Último)" after
-- the fact instead of only during the live close-jornada flow. Only
-- populated for Biwenger leagues (manual leagues have no points concept).
ALTER TABLE public.matchday_records ADD COLUMN IF NOT EXISTS loser_points integer;
