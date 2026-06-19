-- Add Jester columns to public.leagues
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS jester_current_matchday integer NOT NULL DEFAULT 5;
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS jester_voting_start timestamp with time zone;

-- Create jester_nominees table
CREATE TABLE IF NOT EXISTS public.jester_nominees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  matchday_number integer NOT NULL,
  name text NOT NULL,
  team text NOT NULL,
  reason text NOT NULL,
  nominated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create jester_votes table
CREATE TABLE IF NOT EXISTS public.jester_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  matchday_number integer NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL REFERENCES public.jester_nominees(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (league_id, matchday_number, profile_id)
);

-- Create jester_history table
CREATE TABLE IF NOT EXISTS public.jester_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  matchday_number integer NOT NULL,
  name text NOT NULL,
  team text NOT NULL,
  reason text NOT NULL,
  raffle_winner text,
  raffle_player text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Jester tables
ALTER TABLE public.jester_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jester_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jester_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone (public/anonymous/authenticated) to read nominees, votes, and history
CREATE POLICY "Public Read Jester Nominees" ON public.jester_nominees FOR SELECT USING (true);
CREATE POLICY "Public Read Jester Votes" ON public.jester_votes FOR SELECT USING (true);
CREATE POLICY "Public Read Jester History" ON public.jester_history FOR SELECT USING (true);

-- Restrict writing to authenticated users
CREATE POLICY "Authenticated Insert Jester Nominees" ON public.jester_nominees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated Insert Jester Votes" ON public.jester_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
-- Allow all actions on history for authenticated users (so they can close matchdays and write results)
CREATE POLICY "Authenticated Manage Jester History" ON public.jester_history FOR ALL TO authenticated USING (true);

-- Allow authenticated users to delete/update jester nominees and votes (useful when clearing them upon matchday close)
CREATE POLICY "Authenticated Manage Jester Nominees" ON public.jester_nominees FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated Manage Jester Votes" ON public.jester_votes FOR ALL TO authenticated USING (true);
