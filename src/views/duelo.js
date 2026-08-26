import { LALIGA_TOPICS_DB } from '../utils/topics-db.js';
import { escapeHTML } from '../utils/security.js';

const STATS_KEY = 'CF_DUELO_STATS';
const REVEAL_MS = 1600;

/**
 * Pulls the ranking metric out of an `info` string, e.g. "474 goles (FC Barcelona)" -> 474.
 * Dots/commas are thousand separators in this dataset ("57.619 espectadores").
 */
function parseNum(info) {
  if (!info) return null;
  const m = String(info).match(/\d[\d.,]*/);
  if (!m) return null;
  const n = parseInt(m[0].replace(/[.,]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

/** "474 goles (FC Barcelona)" -> "goles" */
function unitOf(info) {
  const m = String(info || '').match(/\d[\d.,]*\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)/);
  return m ? m[1].toLowerCase() : 'puntos';
}

/**
 * Only topics that are genuine descending numeric rankings can produce a fair duel.
 * Requiring the parsed numbers to descend with the rank also proves we parsed the
 * metric the list is actually ordered by, so lists ("Ganadores del Balón de Oro")
 * and compound stats ("2 ligas / 3 copas") are dropped. Returns null if `t` doesn't
 * qualify.
 */
function toRankingTopic(t) {
  const answers = t.answers || [];
  if (answers.length < 4) return null;

  // Dynamic topics (e.g. market-value rankings) carry a precomputed numeric
  // `value` per answer, which is more reliable than re-parsing `info` text.
  const values = answers.map(a => (typeof a.value === 'number' ? a.value : parseNum(a.info)));
  if (values.some(v => v === null || v === undefined)) return null;
  if (!values.every((v, i) => i === 0 || values[i - 1] >= v)) return null;
  if (new Set(values).size < 4) return null;

  return {
    title: t.title,
    badge: t.badgeTitle || 'RANKING',
    unit: t.unit || unitOf(answers[0].info),
    entries: answers.map((a, i) => ({
      name: a.name,
      info: a.info,
      value: values[i]
    }))
  };
}

/**
 * Builds the ranking topic set, filtered down to genuine numeric rankings.
 * Deduplicates by the actual set of names in each topic — not just by
 * title — since the bundled dataset has some topics repeated under
 * slightly different titles/badges with identical content.
 *
 * Deliberately static-only: this used to also mix in live market-value
 * rankings (same source "LaLiga Top 10" uses), but football_players is a
 * one-off manual import with no refresh process behind it (see the
 * 20260824210000 migration) — good enough for "top N right now" lists
 * where staleness barely shows, but a duel states a number as fact and
 * asking "¿más o menos?" about a market value from weeks ago, mid transfer
 * window, risks being flat wrong.
 */
function buildTopics() {
  const out = [];
  const seenSignatures = new Set();

  const addIfNew = (t) => {
    const ranking = toRankingTopic(t);
    if (!ranking) return;
    const signature = ranking.entries.map(e => e.name).sort().join('|');
    if (seenSignatures.has(signature)) return;
    seenSignatures.add(signature);
    out.push(ranking);
  };

  LALIGA_TOPICS_DB.forEach(addIfNew);

  return out;
}

function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY) || 'null');
    if (s && typeof s.best === 'number') return s;
  } catch (_) { /* ignore corrupt stats */ }
  return { best: 0, played: 0 };
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (_) { /* storage full or blocked */ }
}

const randIdx = (n) => Math.floor(Math.random() * n);
const fmt = (n) => n.toLocaleString('es-ES');

/** Fisher-Yates in-place shuffle. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Renders "El Duelo": guess whether the hidden contender ranks above or below
 * the revealed one within the same ranking.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 */
export async function renderDuelo(container, callbacks) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; width: 100%;">
      <div class="loader" style="border: 4px solid rgba(255,255,255,0.1); border-left-color: var(--primary-green); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Cargando categorías...</p>
    </div>
  `;

  const topics = buildTopics();
  let stats = loadStats();

  let streak = 0;
  let topic = null;
  let used = new Set();
  let reference = null;
  let challenger = null;

  // Shuffled deck of topic indices so every category comes up (mixed) before
  // any repeats — a fresh category each round.
  let topicDeck = [];
  let lastTopicIndex = -1;

  function nextTopicIndex() {
    if (topicDeck.length === 0) {
      topicDeck = shuffle(topics.map((_, i) => i));
      // Avoid repeating the same category across the reshuffle seam.
      if (topics.length > 1 && topicDeck[0] === lastTopicIndex) {
        topicDeck.push(topicDeck.shift());
      }
    }
    lastTopicIndex = topicDeck.shift();
    return lastTopicIndex;
  }

  let phase = 'question'; // 'question' | 'reveal' | 'gameover'
  let lastCorrect = false;
  let newCategory = false;
  let newRecord = false;
  let locked = false;
  let revealTimeout = null;

  if (topics.length === 0) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 3rem 1rem;">
        <h1 class="gradient-text-green" style="font-family: var(--font-display); font-weight: 900;">El Duelo</h1>
        <p style="color: var(--text-muted);">No hay rankings disponibles para jugar ahora mismo.</p>
      </div>
    `;
    return;
  }

  /** Picks an unused entry whose value differs from the reference (so MÁS/MENOS is unambiguous). */
  function pickChallenger() {
    const candidates = [];
    topic.entries.forEach((e, i) => {
      if (!used.has(i) && e.value !== reference.value) candidates.push(i);
    });
    if (candidates.length === 0) return null;
    const i = candidates[randIdx(candidates.length)];
    used.add(i);
    return topic.entries[i];
  }

  function startTopic() {
    topic = topics[nextTopicIndex()];

    used = new Set();
    const i = randIdx(topic.entries.length);
    reference = topic.entries[i];
    used.add(i);
    challenger = pickChallenger();

    // Degenerate topic (all values equal to the reference) — try another one.
    if (!challenger) startTopic();
  }

  function advance() {
    // A fresh category every round: pick a new topic with a new pair.
    startTopic();
    newCategory = false;
  }

  function endGame() {
    phase = 'gameover';
    stats.played += 1;
    saveStats(stats);
    render();
  }

  function answer(choice) {
    if (locked || phase !== 'question') return;
    locked = true;

    const challengerIsHigher = challenger.value > reference.value;
    lastCorrect = (choice === 'mas') === challengerIsHigher;

    phase = 'reveal';
    render();

    revealTimeout = setTimeout(() => {
      revealTimeout = null;
      if (lastCorrect) {
        streak += 1;
        // Persist the record as soon as it grows, so leaving mid-run never loses it.
        if (streak > stats.best) {
          stats.best = streak;
          newRecord = true;
          saveStats(stats);
        }
        advance();
        phase = 'question';
        locked = false;
        render();
      } else {
        endGame();
      }
    }, REVEAL_MS);
  }

  function restart() {
    streak = 0;
    phase = 'question';
    lastCorrect = false;
    newCategory = false;
    newRecord = false;
    locked = false;
    topic = null;
    startTopic();
    render();
  }

  // --- Rendering -----------------------------------------------------------

  function contenderCard(entry, { revealed, highlight }) {
    const borderColor = highlight === 'correct' ? '#22c55e'
      : highlight === 'wrong' ? 'var(--danger)'
      : 'rgba(255,255,255,0.18)';
    const glow = highlight === 'correct' ? '0 0 18px rgba(34,197,94,0.35)'
      : highlight === 'wrong' ? '0 0 18px rgba(211,0,23,0.35)'
      : 'none';

    return `
      <div style="
        background: var(--bg-card);
        border: 2.5px solid ${borderColor};
        border-radius: 12px;
        padding: 1.1rem 1rem;
        text-align: center;
        box-shadow: ${glow};
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      ">
        <div style="font-family: var(--font-display); font-weight: 900; font-size: 1.05rem; color: var(--text-light); line-height: 1.15; margin-bottom: 0.5rem;">
          ${escapeHTML(entry.name)}
        </div>
        <div style="font-weight: 900; font-size: ${revealed ? '1.5rem' : '1.35rem'}; color: ${revealed ? 'var(--accent)' : 'var(--text-muted)'}; line-height: 1;">
          ${revealed ? fmt(entry.value) : '???'}
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 0.2rem;">
          ${escapeHTML(topic.unit)}
        </div>
      </div>
    `;
  }

  function questionMarkup() {
    const revealing = phase === 'reveal';
    const challengerIsHigher = challenger.value > reference.value;

    return `
      ${newCategory && !revealing ? `
        <div style="text-align: center; margin-bottom: 0.85rem;">
          <span style="background: rgba(222,237,0,0.12); border: 1.5px solid var(--accent); color: var(--accent); font-size: 0.68rem; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
            Nueva categoría
          </span>
        </div>
      ` : ''}

      <div style="text-align: center; margin-bottom: 1.1rem;">
        <div style="font-size: 0.68rem; font-weight: 800; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase;">Categoría</div>
        <div style="font-family: var(--font-display); font-weight: 900; font-size: 0.95rem; color: var(--text-light); text-transform: uppercase; line-height: 1.2; margin-top: 0.2rem;">
          ${escapeHTML(topic.badge)}
        </div>
      </div>

      <div style="display: grid; gap: 0.6rem;">
        ${contenderCard(reference, { revealed: true, highlight: null })}

        <div style="text-align: center; font-family: var(--font-display); font-weight: 900; color: var(--text-muted); font-size: 0.9rem; letter-spacing: 2px;">VS</div>

        ${contenderCard(challenger, {
          revealed: revealing,
          highlight: revealing ? (lastCorrect ? 'correct' : 'wrong') : null
        })}
      </div>

      ${revealing ? `
        <div style="text-align: center; margin-top: 1.1rem; font-family: var(--font-display); font-weight: 900; font-size: 1.15rem; color: ${lastCorrect ? '#22c55e' : 'var(--danger)'};">
          ${lastCorrect ? '¡CORRECTO!' : '¡FALLASTE!'}
        </div>
      ` : `
        <p style="text-align: center; margin: 1.1rem 0 0.9rem; font-size: 0.9rem; color: var(--text-light); line-height: 1.4;">
          ¿<strong>${escapeHTML(challenger.name)}</strong> tiene más o menos
          <strong>${escapeHTML(topic.unit)}</strong> que <strong>${escapeHTML(reference.name)}</strong>?
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
          <button id="btn-mas" class="duelo-answer" style="
            background: var(--accent); color: #000; border: 2.5px solid #000;
            border-radius: 10px; padding: 1rem 0.5rem; font-family: var(--font-display);
            font-weight: 900; font-size: 1.05rem; text-transform: uppercase; cursor: pointer;
            box-shadow: 3px 3px 0 #000;
          ">Más ↑</button>
          <button id="btn-menos" class="duelo-answer" style="
            background: var(--bg-card-hover); color: var(--text-light); border: 2.5px solid #000;
            border-radius: 10px; padding: 1rem 0.5rem; font-family: var(--font-display);
            font-weight: 900; font-size: 1.05rem; text-transform: uppercase; cursor: pointer;
            box-shadow: 3px 3px 0 #000;
          ">Menos ↓</button>
        </div>
      `}
    `;
  }

  function gameOverMarkup() {
    const isRecord = newRecord;
    return `
      <div style="text-align: center; padding: 0.5rem 0 0;">
        <h2 style="font-family: var(--font-display); font-weight: 900; font-size: 1.4rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 0.35rem;">
          ${isRecord ? '¡Nuevo récord!' : 'Fin del duelo'}
        </h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
          <strong style="color: var(--accent);">${escapeHTML(challenger.name)}</strong> tenía
          <strong style="color: var(--accent);">${fmt(challenger.value)}</strong> ${escapeHTML(topic.unit)},
          frente a los <strong>${fmt(reference.value)}</strong> de ${escapeHTML(reference.name)}.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="background: var(--bg-card); border: 2px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 0.85rem;">
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent); line-height: 1;">${streak}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 800; margin-top: 0.25rem;">Racha</div>
          </div>
          <div style="background: var(--bg-card); border: 2px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 0.85rem;">
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-light); line-height: 1;">${stats.best}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 800; margin-top: 0.25rem;">Récord</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <button id="btn-restart" style="
            background: var(--accent); color: #000; border: 2.5px solid #000; border-radius: 10px;
            padding: 0.9rem; font-family: var(--font-display); font-weight: 900; font-size: 1rem;
            text-transform: uppercase; cursor: pointer; box-shadow: 3px 3px 0 #000;
          ">Jugar otra vez</button>
          <button id="btn-back-juegos" style="
            background: transparent; color: var(--text-muted); border: 1.5px solid var(--border-color);
            border-radius: 10px; padding: 0.7rem; font-weight: 700; font-size: 0.85rem; cursor: pointer;
          ">Volver a Juegos</button>
        </div>
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="container fade-in-up" style="max-width: 520px; padding: 0.75rem 0.85rem 1.5rem; display: flex; flex-direction: column;">

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1.1rem;">
          <div>
            <span style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Minijuego</span>
            <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.1rem 0 0;">
              El Duelo
            </h1>
          </div>
          <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
            <div style="background: rgba(222,237,0,0.1); border: 1.5px solid var(--accent); border-radius: 10px; padding: 0.35rem 0.6rem; text-align: center; min-width: 52px;">
              <div style="font-size: 1.1rem; font-weight: 900; color: var(--accent); line-height: 1;">${streak}</div>
              <div style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Racha</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.35rem 0.6rem; text-align: center; min-width: 52px;">
              <div style="font-size: 1.1rem; font-weight: 900; color: var(--text-light); line-height: 1;">${stats.best}</div>
              <div style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Récord</div>
            </div>
          </div>
        </div>

        ${phase === 'gameover' ? gameOverMarkup() : questionMarkup()}
      </div>
    `;

    if (phase === 'question') {
      container.querySelector('#btn-mas')?.addEventListener('click', () => answer('mas'));
      container.querySelector('#btn-menos')?.addEventListener('click', () => answer('menos'));
    }

    if (phase === 'gameover') {
      container.querySelector('#btn-restart')?.addEventListener('click', restart);
      container.querySelector('#btn-back-juegos')?.addEventListener('click', () => {
        if (callbacks.onNavigate) callbacks.onNavigate('juegos');
      });
    }
  }

  startTopic();
  render();

  // Custom cleanup when view gets destroyed/unmounted (prevent the reveal
  // timeout from firing render() on a detached container after navigating away)
  const observer = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      if (revealTimeout) {
        clearTimeout(revealTimeout);
        revealTimeout = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
