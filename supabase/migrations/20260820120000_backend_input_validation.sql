-- Server-side validation to back up what the frontend already enforces (or,
-- in a few cases, only ever pretended to enforce). RLS controls WHO can
-- write a row; these constraints control WHAT they're allowed to write,
-- since none of this was previously checked below the client.

-- Fixed-value columns the frontend only ever writes from a closed set, but
-- that were plain `text` with no CHECK — any authenticated user could set
-- punishment_events.status to anything via a direct API call, and it drives
-- Muro de la Vergüenza's accepted/rejected display logic.
ALTER TABLE public.punishment_events
  ADD CONSTRAINT punishment_events_status_check
  CHECK (status IN ('aceptado', 'rechazado'));

-- NOTE: forum_post_reactions was defined in an early migration but the table
-- doesn't actually exist in production (that part of the feature was never
-- shipped) — confirmed by db push failing on it, so it's skipped here.

-- Length caps matching (or, where the frontend had none, introducing) a
-- sane limit — prevents unbounded text from one member bloating a shared
-- table or breaking layout for the whole league.
ALTER TABLE public.forum_comments
  ADD CONSTRAINT forum_comments_content_length_check
  CHECK (char_length(content) <= 500);

ALTER TABLE public.forum_posts
  ADD CONSTRAINT forum_posts_title_length_check
  CHECK (title IS NULL OR char_length(title) <= 120);

ALTER TABLE public.jester_nominees
  ADD CONSTRAINT jester_nominees_name_length_check
  CHECK (char_length(name) <= 80),
  ADD CONSTRAINT jester_nominees_team_length_check
  CHECK (char_length(team) <= 80),
  ADD CONSTRAINT jester_nominees_reason_length_check
  CHECK (char_length(reason) <= 300);

ALTER TABLE public.weekly_challenges
  ADD CONSTRAINT weekly_challenges_title_length_check
  CHECK (char_length(title) <= 120),
  ADD CONSTRAINT weekly_challenges_description_length_check
  CHECK (char_length(description) <= 500);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_apodo_length_check
  CHECK (apodo IS NULL OR char_length(apodo) <= 40),
  ADD CONSTRAINT profiles_display_name_length_check
  CHECK (display_name IS NULL OR char_length(display_name) <= 80);

ALTER TABLE public.leagues
  ADD CONSTRAINT leagues_name_length_check
  CHECK (char_length(name) <= 80);

ALTER TABLE public.punishments
  ADD CONSTRAINT punishments_name_length_check
  CHECK (char_length(name) <= 120),
  ADD CONSTRAINT punishments_description_length_check
  CHECK (description IS NULL OR char_length(description) <= 500);
