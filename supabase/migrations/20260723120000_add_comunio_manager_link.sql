-- Adds per-member Comunio manager linking, mirroring biwenger_user_name on
-- league_members. Comunio exposes a stable numeric manager id (unlike
-- Biwenger's name-based matching), so we store the id as source of truth
-- plus the display name denormalized to avoid an extra edge-function call
-- whenever the UI needs to show "vinculado como X".

ALTER TABLE public.league_members
  ADD COLUMN IF NOT EXISTS comunio_manager_id integer,
  ADD COLUMN IF NOT EXISTS comunio_manager_name text;
