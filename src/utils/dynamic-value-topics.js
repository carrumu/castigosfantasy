import { supabase } from '../supabase';

function parseMarketValue(valStr) {
  if (!valStr || valStr === '-') return 0;
  let numStr = valStr.replace('€', '').replace('m', '').replace('k', '').trim();
  let num = parseFloat(numStr);
  if (valStr.includes('m')) return num * 1000000;
  if (valStr.includes('k')) return num * 1000;
  return num;
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
    const { data, error } = await supabase.from('football_players').select('*');
    if (error || !data || data.length === 0) return { topics: [], players: [] };

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
