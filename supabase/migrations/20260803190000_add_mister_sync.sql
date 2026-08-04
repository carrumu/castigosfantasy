-- Añade la sincronización con Mister (mister.mundodeportivo.com), junto a
-- Biwenger y Comunio. Mismo patrón: las credenciales viven en league_secrets
-- (RLS de admin/creador) y lo que no es sensible se queda en leagues.
-- `sync_source` acepta ahora también 'mister' (es text libre, sin CHECK).
--
-- Particularidades de Mister frente a las otras dos:
--
-- 1. NO existe identificador de liga en su API. `POST /standings` devuelve la
--    liga que el usuario tenga activa en su sesión, y no hay endpoint que
--    liste sus ligas ni que permita cambiarla. Por eso se guarda el NOMBRE de
--    la liga detectada (`mister_league_name`) en vez de un id: sirve para
--    enseñárselo al usuario y que confirme que estamos leyendo la correcta.
--
-- 2. El manager sí tiene id numérico estable, expuesto en la clasificación
--    como `users/<id>/<slug>`. Se vincula por ese id y nunca por el nombre,
--    que el usuario puede cambiar a mitad de temporada.

ALTER TABLE public.league_secrets ADD COLUMN IF NOT EXISTS mister_email    text;
ALTER TABLE public.league_secrets ADD COLUMN IF NOT EXISTS mister_password text;

ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS mister_league_name text;

ALTER TABLE public.league_members
  ADD COLUMN IF NOT EXISTS mister_manager_id text,
  ADD COLUMN IF NOT EXISTS mister_manager_name text;
