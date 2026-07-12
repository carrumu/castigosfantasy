-- 20260712140000_add_comunio_sync.sql
--
-- Adds Comunio sync alongside Biwenger. Credentials live in league_secrets
-- (admin/creator-only RLS, same as Biwenger); the non-sensitive community id
-- lives on leagues. sync_source can now also be 'comunio'.

ALTER TABLE public.league_secrets ADD COLUMN IF NOT EXISTS comunio_email    text;
ALTER TABLE public.league_secrets ADD COLUMN IF NOT EXISTS comunio_password text;

ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS comunio_community_id text;
