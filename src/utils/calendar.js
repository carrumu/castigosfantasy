import { supabase } from '../supabase';

const API_FOOTBALL_URL = 'https://v3.football.api-sports.io';
// We read the key from environment variables (the user must add this to their .env file)
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const LALIGA_ID = 140;

/**
 * Fetches the closing time of a specific matchday (the start time of the LAST match).
 * Uses Supabase caching to prevent abusing the API-Football rate limits.
 * @param {number} matchdayNumber 
 * @param {number} seasonYear (e.g. 2024 for 24/25 season)
 * @returns {Promise<Date|null>}
 */
/**
 * Returns the matchday number that is currently "open" right now, based on
 * matchdays_calendar's real-calendar dates — the first matchday whose
 * last_match_time hasn't happened yet. Falls back to the final matchday if
 * the season has ended, or null if the table hasn't been seeded.
 * @returns {Promise<number|null>}
 */
export async function getCurrentMatchdayNumber() {
  try {
    const { data, error } = await supabase
      .from('matchdays_calendar')
      .select('matchday_number, last_match_time')
      .order('matchday_number', { ascending: true });

    if (error || !data || data.length === 0) return null;

    const now = Date.now();
    const upcoming = data.find(row => new Date(row.last_match_time).getTime() > now);
    return upcoming ? upcoming.matchday_number : data[data.length - 1].matchday_number;
  } catch (err) {
    console.error('Error resolving current matchday:', err);
    return null;
  }
}

/**
 * Número de jornada que se propone al cerrar una jornada.
 *
 * Parte del calendario real (matchdays_calendar) en vez de ir sumando 1 a la
 * última registrada, que se desviaba en cuanto había un registro de prueba o
 * un salto. Aun así nunca propone una jornada ya registrada, para no repetir.
 *
 * @param {Array<{matchday_number:number}>} records registros de la liga
 * @returns {Promise<number>}
 */
export async function getSuggestedMatchdayNumber(records = []) {
  const maxRecorded = (records || []).reduce(
    (max, r) => (r.matchday_number > max ? r.matchday_number : max),
    0
  );
  let current = null;
  try {
    current = await getCurrentMatchdayNumber();
  } catch (_) {}
  return Math.max(current || 1, maxRecorded + 1);
}

export async function getMatchdayClosingTime(matchdayNumber, seasonYear = 2024) {
  // 1. Check if we already have it cached in Supabase
  try {
    const { data: cached, error } = await supabase
      .from('matchdays_calendar')
      .select('last_match_time')
      .eq('matchday_number', matchdayNumber)
      .maybeSingle();

    if (cached && cached.last_match_time) {
      return new Date(cached.last_match_time);
    }
  } catch (err) {
    console.error('Error checking cached calendar:', err);
  }

  // 2. If not cached, and no API Key is provided, fallback to a local guess or null
  if (!API_KEY) {
    console.warn('VITE_API_FOOTBALL_KEY not found in .env. Skipping external calendar sync.');
    return null;
  }

  // 3. Fetch from API-Football
  try {
    const roundString = `Regular Season - ${matchdayNumber}`;
    const response = await fetch(`${API_FOOTBALL_URL}/fixtures?league=${LALIGA_ID}&season=${seasonYear}&round=${roundString}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      // Find the fixture with the latest start time
      let lastMatchTime = 0;
      for (const fixture of data.response) {
        const fixtureTime = new Date(fixture.fixture.date).getTime();
        if (fixtureTime > lastMatchTime) {
          lastMatchTime = fixtureTime;
        }
      }

      const closingDate = new Date(lastMatchTime);

      // Cache it in Supabase for everyone else
      await supabase
        .from('matchdays_calendar')
        .upsert({
          matchday_number: matchdayNumber,
          last_match_time: closingDate.toISOString()
        });

      return closingDate;
    }

  } catch (err) {
    console.error('Error fetching from API-Football:', err);
  }

  return null;
}
