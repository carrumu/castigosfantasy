-- 20260712120000_create_link_previews_cache.sql
--
-- Cache of Open Graph metadata for URLs shared in the forum, so we don't
-- re-scrape the same link every time a post is viewed. Only the edge function
-- (service role) reads/writes this table; RLS is enabled with no policies, so
-- it is inaccessible to anon/authenticated clients directly.

CREATE TABLE IF NOT EXISTS public.link_previews (
  url         text PRIMARY KEY,
  title       text,
  description text,
  image       text,
  site_name   text,
  fetched_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.link_previews ENABLE ROW LEVEL SECURITY;
-- (no policies on purpose: service role only)
