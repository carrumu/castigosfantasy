CREATE OR REPLACE FUNCTION public.debug_leagues_columns()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(jsonb_build_object(
    'column', column_name,
    'nullable', is_nullable,
    'default', column_default,
    'type', data_type
  ) ORDER BY ordinal_position)
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'leagues';
$$;

GRANT EXECUTE ON FUNCTION public.debug_leagues_columns() TO anon;
