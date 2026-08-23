-- Deduplicacion de jornadas de Mister cerradas automaticamente, mismo
-- patron que comunio_matchday_key (20260823190000_add_comunio_matchday_key.sql)
-- y biwenger_round_id.
ALTER TABLE public.matchday_records
ADD COLUMN IF NOT EXISTS mister_matchday_key text;
