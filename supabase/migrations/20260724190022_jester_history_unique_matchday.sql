-- El Bufón's voting close is moving from a manual "Cerrar Votación Global"
-- button (visible to any logged-in user, which was never supposed to be
-- exposed) to an automatic weekly close: whoever's browser loads the page
-- after the deadline performs the close. That means concurrent visitors can
-- race to close the same matchday at once — this constraint makes the
-- second insert fail instead of creating a duplicate history entry, so the
-- client code can detect the loss and skip its own cleanup/advance steps.
ALTER TABLE public.jester_history
  ADD CONSTRAINT jester_history_league_matchday_unique UNIQUE (league_id, matchday_number);
