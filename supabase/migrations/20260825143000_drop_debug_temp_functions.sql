-- Cleanup: drop the temporary introspection helpers used to diagnose why
-- El Bufón / Reto Semanal weren't actually global
-- (20260825130000, 20260825130500, 20260825141000, 20260825141500).
DROP FUNCTION IF EXISTS public.debug_jester_policies();
DROP FUNCTION IF EXISTS public.debug_leagues_columns();
