CREATE TABLE IF NOT EXISTS public.league_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.league_roster ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view league roster" ON public.league_roster
FOR SELECT USING (
  league_id IN (
    SELECT league_id FROM public.league_members WHERE profile_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.get_league_roster_by_code(invite_code_arg text)
RETURNS TABLE (id UUID, name TEXT, is_claimed BOOLEAN) AS $$
DECLARE
  found_league_id uuid;
BEGIN
  SELECT l.id INTO found_league_id FROM public.leagues l WHERE l.invite_code = invite_code_arg;
  IF found_league_id IS NULL THEN
    RAISE EXCEPTION 'Código de liga inválido o inexistente.';
  END IF;

  RETURN QUERY 
  SELECT r.id, r.name, (r.claimed_by IS NOT NULL) AS is_claimed
  FROM public.league_roster r
  WHERE r.league_id = found_league_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.join_league_by_code(invite_code_arg text, roster_id_arg uuid DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  found_league_id uuid;
BEGIN
  SELECT l.id INTO found_league_id
  FROM public.leagues l
  WHERE l.invite_code = invite_code_arg;
  
  IF found_league_id IS NULL THEN
    RAISE EXCEPTION 'Código de liga inválido o inexistente.';
  END IF;

  IF roster_id_arg IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.league_roster WHERE id = roster_id_arg AND league_id = found_league_id AND claimed_by IS NULL) THEN
      RAISE EXCEPTION 'La plaza seleccionada no existe o ya ha sido ocupada.';
    END IF;

    UPDATE public.league_roster 
    SET claimed_by = auth.uid() 
    WHERE id = roster_id_arg;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.league_members 
    WHERE league_id = found_league_id AND profile_id = auth.uid()
  ) THEN
    INSERT INTO public.league_members (league_id, profile_id, is_admin)
    VALUES (found_league_id, auth.uid(), false);
  END IF;

  RETURN found_league_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
