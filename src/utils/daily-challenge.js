import { supabase } from '../supabase';

/**
 * Resolves the shared payload for a daily minigame (Wordle-style "Adivina el
 * Jugador", "LaLiga Top 10"), persisting it to Supabase the first time it's
 * computed so every player gets the exact same puzzle for that calendar day
 * — regardless of when they load the page or whether the underlying player
 * data has since drifted. `computeFn` is only invoked as a fallback: for the
 * very first request of the day (to seed the row) and if Supabase is
 * unreachable (so the game still works standalone, just not shared).
 * @param {string} game - stable key, e.g. 'wordle' or 'top10'
 * @param {string} gameDateStr - YYYY-MM-DD, already resolved to the game's own reset timezone
 * @param {number} dailyNumber
 * @param {() => any} computeFn - returns (optionally as a Promise) the
 *   JSON-serializable payload to use/store. Only invoked when there's no
 *   existing row for the day, so an expensive computeFn (e.g. one that
 *   queries other tables first) never runs on the common "already pinned"
 *   path.
 */
export async function resolveDailyChallenge(game, gameDateStr, dailyNumber, computeFn) {
  try {
    const { data: existing } = await supabase
      .from('daily_challenges')
      .select('payload')
      .eq('game', game)
      .eq('game_date', gameDateStr)
      .maybeSingle();

    if (existing) return existing.payload;

    const computed = await computeFn();

    const { data: inserted, error: insertErr } = await supabase
      .from('daily_challenges')
      .insert({ game, game_date: gameDateStr, daily_number: dailyNumber, payload: computed })
      .select('payload')
      .single();

    if (!insertErr && inserted) return inserted.payload;

    // Someone else's insert won the race for the same date (or ours was
    // rejected) — read back whichever payload actually landed.
    const { data: reread } = await supabase
      .from('daily_challenges')
      .select('payload')
      .eq('game', game)
      .eq('game_date', gameDateStr)
      .maybeSingle();

    return reread ? reread.payload : computed;
  } catch (err) {
    console.error(`Error resolving daily challenge for "${game}", using local fallback:`, err);
    return computeFn();
  }
}
