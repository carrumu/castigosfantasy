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
