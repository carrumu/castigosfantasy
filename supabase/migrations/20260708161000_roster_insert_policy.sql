CREATE POLICY "Admins can insert league roster" ON public.league_roster
FOR INSERT WITH CHECK (
  league_id IN (
    SELECT league_id FROM public.league_members WHERE profile_id = auth.uid() AND is_admin = true
  )
);
