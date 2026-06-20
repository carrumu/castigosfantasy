-- Add Biwenger synchronization columns to public.leagues
ALTER TABLE public.leagues 
ADD COLUMN IF NOT EXISTS sync_source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS biwenger_email text,
ADD COLUMN IF NOT EXISTS biwenger_password text,
ADD COLUMN IF NOT EXISTS biwenger_league_id text;
