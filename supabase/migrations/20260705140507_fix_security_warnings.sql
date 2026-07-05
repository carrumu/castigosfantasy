-- Fix function SECURITY DEFINER search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, apodo, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'apodo', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Authenticated Leagues" ON public.leagues;
DROP POLICY IF EXISTS "Authenticated Members" ON public.league_members;
DROP POLICY IF EXISTS "Authenticated Punishments" ON public.punishments;
DROP POLICY IF EXISTS "Authenticated Records" ON public.matchday_records;

-- Leagues policies
CREATE POLICY "Leagues Select" ON public.leagues FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leagues Insert" ON public.leagues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leagues Update" ON public.leagues FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Leagues Delete" ON public.leagues FOR DELETE USING (created_by = auth.uid());

-- Members policies
CREATE POLICY "Members Select" ON public.league_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Members Insert" ON public.league_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Members Update" ON public.league_members FOR UPDATE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
CREATE POLICY "Members Delete" ON public.league_members FOR DELETE USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Punishments policies
CREATE POLICY "Punishments Select" ON public.punishments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Punishments Insert" ON public.punishments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Punishments Update" ON public.punishments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Punishments Delete" ON public.punishments FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));

-- Records policies
CREATE POLICY "Records Select" ON public.matchday_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Records Insert" ON public.matchday_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Records Update" ON public.matchday_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Records Delete" ON public.matchday_records FOR DELETE USING (EXISTS (SELECT 1 FROM public.leagues l WHERE l.id = league_id AND l.created_by = auth.uid()));
