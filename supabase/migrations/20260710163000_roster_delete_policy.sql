-- Allow league admins to delete unclaimed roster slots for their league.
-- Mirrors the existing "Admins can insert league roster" policy so admins can
-- prune pre-registered players that will never claim their slot.
CREATE POLICY "Admins can delete league roster" ON public.league_roster
FOR DELETE USING (
  league_id IN (
    SELECT league_id FROM public.league_members
    WHERE profile_id = auth.uid() AND is_admin = true
  )
);
