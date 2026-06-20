-- Drop features column from public.leagues
ALTER TABLE public.leagues DROP COLUMN IF EXISTS features;
