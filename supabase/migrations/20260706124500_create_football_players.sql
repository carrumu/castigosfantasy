CREATE TABLE IF NOT EXISTS public.football_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tm_id text UNIQUE,
  name text NOT NULL,
  position text,
  club text,
  market_value text,
  photo_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.football_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Players" ON public.football_players FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Players" ON public.football_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update Players" ON public.football_players FOR UPDATE USING (auth.role() = 'authenticated');
