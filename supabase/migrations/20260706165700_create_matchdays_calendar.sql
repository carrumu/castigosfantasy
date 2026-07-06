-- Create matchdays_calendar table to cache API responses
CREATE TABLE IF NOT EXISTS public.matchdays_calendar (
    matchday_number integer PRIMARY KEY,
    last_match_time timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matchdays_calendar ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Allow public read access to matchdays_calendar"
ON public.matchdays_calendar FOR SELECT
USING (true);

-- Allow authenticated users to insert/update (since the frontend fetches and caches)
CREATE POLICY "Allow authenticated users to insert matchdays_calendar"
ON public.matchdays_calendar FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update matchdays_calendar"
ON public.matchdays_calendar FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
