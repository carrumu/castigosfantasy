-- Limpia football_players, importada de golpe el 6 de julio (sin script de
-- scraping en este repo, fue una carga manual de una sola vez).
--
-- 1. El nombre trae el valor de mercado pegado detras ("Gabri Veiga
--    25,00 mill. €" en vez de "Gabri Veiga"), afectando al 48% de las filas
--    (las que tienen un valor real). Se recorta usando el propio valor de
--    market_value como sufijo a quitar -- es exacto, no una regex generica.
--
-- 2. La tabla tiene 62 "clubes" distintos para solo ~34 equipos reales:
--    variantes duplicadas del mismo club (RC Deportivo de La Coruña / A
--    Coruña / Coruña; Real Zaragoza / Real Zaragoza CD; etc.) y clubes que
--    no son del universo de LaLiga que ya usa el resto de la app (Xerez CD,
--    Hércules CF, CD Numancia...). Sin este arreglo, "El Duelo" o el Top 10
--    dinamico podian enseñar a un jugador de una categoria inferior como si
--    fuera "de LaLiga". La lista de 34 equipos es la misma que ya usa
--    src/views/top10.js (LALIGA_TEAMS_CLEAN), para no inventar un criterio
--    nuevo.

-- --- 1. Nombre con el valor pegado ---
UPDATE public.football_players
SET name = trim(substring(name from 1 for length(name) - length(market_value)))
WHERE market_value IS NOT NULL
  AND market_value <> '-'
  AND name LIKE '%' || market_value;

-- --- 2a. Fusiona variantes del mismo club en el nombre canonico ---
UPDATE public.football_players SET club = 'RC Deportivo de La Coruña' WHERE club IN ('RC Deportivo A Coruña', 'RC Deportivo Coruña');
UPDATE public.football_players SET club = 'Real Zaragoza' WHERE club = 'Real Zaragoza CD';
UPDATE public.football_players SET club = 'Real Valladolid CF' WHERE club = 'Real Valladolid Deportivo';
UPDATE public.football_players SET club = 'FC Barcelona' WHERE club = 'CF Barcelona';
UPDATE public.football_players SET club = 'RCD Espanyol' WHERE club = 'RCD Español';
UPDATE public.football_players SET club = 'Real Oviedo' WHERE club = 'Real Oviedo CF';
UPDATE public.football_players SET club = 'Rayo Vallecano' WHERE club = 'AD Rayo Vallecano';
UPDATE public.football_players SET club = 'UD Almería' WHERE club = 'AD Almería';
UPDATE public.football_players SET club = 'Real Racing Club de Santander' WHERE club = 'Real Racing Club';

-- --- 2b. Fuera los jugadores de clubes ajenos al universo de LaLiga ---
DELETE FROM public.football_players
WHERE club IS NULL OR club NOT IN (
  'Real Madrid CF','FC Barcelona','Atlético de Madrid','Athletic Club','Real Sociedad',
  'Real Betis Balompié','Sevilla FC','Valencia CF','Villarreal CF','Getafe CF',
  'CA Osasuna','Rayo Vallecano','Girona FC','RC Celta de Vigo','RCD Mallorca',
  'Deportivo Alavés','UD Las Palmas','CD Leganés','Real Valladolid CF','RCD Espanyol',
  'Real Zaragoza','Real Racing Club de Santander','Málaga CF','Elche CF',
  'RC Deportivo de La Coruña','Real Sporting de Gijón','Granada CF','Levante UD',
  'Cádiz CF','UD Almería','SD Eibar','CD Tenerife','Real Oviedo','SD Huesca'
);
