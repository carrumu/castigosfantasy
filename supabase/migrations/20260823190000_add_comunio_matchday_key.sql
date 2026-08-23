-- Deduplicacion de jornadas de Comunio cerradas automaticamente, igual que
-- biwenger_round_id (20260620220000_add_biwenger_round_id.sql). Se guarda
-- como texto porque asi es como lo expone la API de Comunio (matchdayKey).
ALTER TABLE public.matchday_records
ADD COLUMN IF NOT EXISTS comunio_matchday_key text;
