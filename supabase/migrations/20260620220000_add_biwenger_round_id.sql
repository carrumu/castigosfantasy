-- Add biwenger_round_id to matchday_records for deduplication of auto-detected rounds
ALTER TABLE public.matchday_records
ADD COLUMN IF NOT EXISTS biwenger_round_id integer;
