-- Add biwenger_user_name to public.league_members
ALTER TABLE public.league_members 
ADD COLUMN IF NOT EXISTS biwenger_user_name text;
