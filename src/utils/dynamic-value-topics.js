import { supabase } from '../supabase';

/**
 * football_players.market_value viene en formato español de Transfermarkt:
 * "80,00 mill. €" (millones, coma decimal) o "700 mil €" (miles). Antes se
 * decidía la unidad mirando si el texto contenía la letra "m" -- pero "mil"
 * también la tiene, así que un jugador de "700 mil €" (700.000) se leía
 * como 700 millones, mil veces su valor real, y colaba a jugadores baratos
 * como si fueran los más valiosos de la liga. Ahora se busca la palabra
 * completa: "mill" para millones, "mil" como palabra suelta para miles.
 */
export function parseMarketValue(valStr) {
  if (!valStr || valStr === '-') return 0;
  const cleaned = valStr.replace('€', '').trim();
  const num = parseFloat(cleaned.replace(',', '.'));
  if (!Number.isFinite(num)) return 0;
  if (/mill/i.test(cleaned)) return num * 1000000;
  if (/\bmil\b/i.test(cleaned)) return num * 1000;
  return num;
}

/**
 * football_players tiene 7773 filas, pero PostgREST corta cualquier
 * select() sin paginar en 1000 -- un simple .select('*') se quedaba con
 * las primeras 1000 (en el orden que sea, no por valor), así que jugadores
 * reales como Cubarsí o Varane ni llegaban a cargarse, y el "top 10 más
 * valioso" salía de ese trozo incompleto en vez de la tabla entera. Se pide
 * en páginas de 1000 hasta agotar la tabla. Compartida para que
 * minigame.js (el secreto diario del Wordle también sale de esta tabla) no
 * duplique el mismo fallo por su cuenta.
 */
export async function fetchAllFootballPlayers(columns = '*') {
  const pageSize = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('football_players')
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function normalizeStr(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ø/g, "o").replace(/Ø/g, "O").toLowerCase().trim();
}

/**
 * Builds ranking topics from live market-value data in the football_players
 * table (overall, by position, by top club) — the same source "LaLiga Top
 * 10" uses. Shared so other games (e.g. El Duelo) can draw on real,
 * up-to-date rankings instead of only the static bundled topic set.
 * @returns {Promise<{topics: Array, players: Array}>} topics in the
 *   {title, badgeTitle, answers} shape and the full sorted player list
 *   (empty arrays on failure)
 */
export async function buildMarketValueTopics() {
  try {
    const data = await fetchAllFootballPlayers();
    if (!data || data.length === 0) return { topics: [], players: [] };

    const parsedData = data.map(p => ({
      ...p,
      valNum: parseMarketValue(p.market_value)
    }));
    parsedData.sort((a, b) => b.valNum - a.valNum);

    const realMadrid = parsedData.filter(p => p.club && p.club.includes('Real Madrid'));
    const barcelona = parsedData.filter(p => p.club && p.club.includes('Barcelona'));
    const atleti = parsedData.filter(p => p.club && (p.club.includes('Atlético') || p.club.includes('Atletico')));
    const betis = parsedData.filter(p => p.club && p.club.includes('Betis'));

    const delanteros = parsedData.filter(p => p.position && (p.position.toLowerCase().includes('delantero') || p.position.toLowerCase().includes('extremo')));
    const medios = parsedData.filter(p => p.position && p.position.toLowerCase().includes('medio'));
    const defensas = parsedData.filter(p => p.position && (p.position.toLowerCase().includes('defensa') || p.position.toLowerCase().includes('lateral') || p.position.toLowerCase().includes('central')));
    const porteros = parsedData.filter(p => p.position && p.position.toLowerCase().includes('portero'));

    const createDynamicTopic = (title, badge, list) => {
      if (list.length < 10) return null;
      return {
        title,
        badgeTitle: badge,
        // Explicit unit + numeric value so consumers (e.g. El Duelo) don't have
        // to re-parse "€150.00m"-style strings out of `info` — that format
        // trips up a generic "digits then unit word" parser (no space before
        // "m", and the decimal point looks like a thousands separator).
        unit: 'de valor de mercado',
        answers: list.slice(0, 10).map(p => ({
          name: p.name,
          info: `${p.club} - ${p.market_value}`,
          value: p.valNum,
          flag: "🇪🇸",
          matches: [normalizeStr(p.name)]
        }))
      };
    };

    const topics = [
      createDynamicTopic('Jugadores Más Valiosos de LaLiga', 'MÁS VALIOSOS', parsedData),
      createDynamicTopic('Delanteros Más Valiosos', 'DELANTEROS VALIOSOS', delanteros),
      createDynamicTopic('Centrocampistas Más Valiosos', 'MEDIOS VALIOSOS', medios),
      createDynamicTopic('Defensas Más Valiosos', 'DEFENSAS VALIOSOS', defensas),
      createDynamicTopic('Porteros Más Valiosos', 'PORTEROS VALIOSOS', porteros),
      createDynamicTopic('Jugadores Más Valiosos del Real Madrid', 'MÁS VALIOSOS R.MADRID', realMadrid),
      createDynamicTopic('Jugadores Más Valiosos del FC Barcelona', 'MÁS VALIOSOS BARÇA', barcelona),
      createDynamicTopic('Jugadores Más Valiosos del Atlético', 'MÁS VALIOSOS ATLETI', atleti),
      createDynamicTopic('Jugadores Más Valiosos del Real Betis', 'MÁS VALIOSOS BETIS', betis),
    ].filter(t => t !== null);

    return { topics, players: parsedData };
  } catch (err) {
    console.error("Error building market-value topics:", err);
    return { topics: [], players: [] };
  }
}
