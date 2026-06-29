-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  matchday_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create challenge_votes table
CREATE TABLE IF NOT EXISTS public.challenge_votes (
  challenge_id uuid NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (challenge_id, profile_id)
);

-- Create punishment_events table (Wall of Shame audit log)
CREATE TABLE IF NOT EXISTS public.punishment_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  punishment_name text NOT NULL,
  status text NOT NULL, -- 'aceptado' or 'rechazado'
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on new tables
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishment_events ENABLE ROW LEVEL SECURITY;

-- Permissive RLS policies for authenticated users
CREATE POLICY "Authenticated Challenges" ON public.weekly_challenges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Votes" ON public.challenge_votes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Punishment Events" ON public.punishment_events FOR ALL USING (auth.role() = 'authenticated');
