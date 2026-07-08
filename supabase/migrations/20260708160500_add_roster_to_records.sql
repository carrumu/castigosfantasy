ALTER TABLE public.matchday_records ALTER COLUMN loser_profile_id DROP NOT NULL;
ALTER TABLE public.matchday_records ADD COLUMN IF NOT EXISTS loser_roster_id UUID REFERENCES public.league_roster(id) ON DELETE CASCADE;

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
    
    -- Migrar las deudas del roster al profile real
    UPDATE public.matchday_records
    SET loser_profile_id = auth.uid(), loser_roster_id = NULL
    WHERE loser_roster_id = roster_id_arg;
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
