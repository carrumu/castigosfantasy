import { setupAutocomplete } from '../utils/autocomplete';
import { LALIGA_PLAYERS_DB } from '../utils/players-db';
import { escapeHTML } from '../utils/security';
import { SITE_URL } from '../utils/site';

/**
 * "El Once del Día" — juego diario.
 *
 * Cada día se sortea (de forma determinista por fecha, igual para todos) un
 * equipo, y el jugador tiene que nombrar a los jugadores de su plantilla. El
 * resultado se guarda por día y se puede compartir en el grupo, como el Top 10.
 * Usa solo datos de jugador + equipo (los fiables de players-db).
 */

const STORAGE_KEY = 'CF_ONCE11_DAILY_STATE';

function normalizeStr(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/g, 'o').replace(/Ø/g, 'O').toLowerCase().trim();
}

// Fecha de juego (YYYY-MM-DD) con reset a las 08:00 hora de España, igual que el Top 10.
function getGameDateString(date = new Date()) {
  const spainTimeStr = date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
  const spainDate = new Date(spainTimeStr);
  spainDate.setHours(spainDate.getHours() - 8);
  const yyyy = spainDate.getFullYear();
  const mm = String(spainDate.getMonth() + 1).padStart(2, '0');
  const dd = String(spainDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function renderOnce11(container, callbacks = {}) {
  const { onNavigate, showToast } = callbacks;

  // 1) Agrupar jugadores por equipo; quedarnos con equipos con plantilla suficiente.
  const byTeam = {};
  for (const p of LALIGA_PLAYERS_DB) {
    const t = (p.team || '').trim();
    if (!t || t === 'Desconocido' || t.includes('/')) continue;
    (byTeam[t] = byTeam[t] || []).push(p);
  }
  const teams = Object.keys(byTeam).filter(t => byTeam[t].length >= 20).sort();

  if (teams.length === 0) {
    container.innerHTML = `<div class="container" style="padding:2rem;text-align:center;color:var(--text-muted);">No hay datos de plantillas disponibles ahora mismo.</div>`;
    return;
  }

  // 2) Día y equipo del día (deterministas por fecha).
  const gameDateStr = getGameDateString();
  const gameDate = new Date(gameDateStr + 'T00:00:00Z');
  const epoch = new Date(Date.UTC(2026, 0, 1));
  const diffDays = Math.floor((gameDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  const dailyNumber = diffDays + 1;
  const teamName = teams[Math.abs(diffDays) % teams.length];
  const squad = byTeam[teamName].slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const total = squad.length;

  // 3) Estado persistente por día.
  let guessed = new Set();
  let finished = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.date === gameDateStr && saved.team === teamName) {
      guessed = new Set(saved.guessed || []);
      finished = !!saved.finished;
    }
  } catch (_) {}
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: gameDateStr, team: teamName, guessed: [...guessed], finished }));
    } catch (_) {}
  };

  // 4) Utilidades de emparejamiento.
  const matchesPlayer = (p, q) => {
    if (normalizeStr(p.name) === q) return true;
    const keys = p.searchKeys && p.searchKeys.length ? p.searchKeys : [p.name];
    return keys.some(k => normalizeStr(k) === q);
  };
  const findAnywhere = (q) => LALIGA_PLAYERS_DB.find(p => matchesPlayer(p, q)) || null;

  // 5) Shell.
  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 640px; margin: 0 auto; padding-bottom: 3rem;">
      <a id="once-back" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Volver a Juegos
      </a>

      <div style="text-align:center;margin-bottom:1.25rem;">
        <span style="font-family:var(--font-mono,monospace);font-size:0.75rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">El Once del Día · #${dailyNumber}</span>
        <h1 class="gradient-text-green" style="font-family:var(--font-display);font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:-1px;line-height:1.05;margin:0.35rem 0 0.4rem;">${escapeHTML(teamName)}</h1>
        <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.4;margin:0;">Nombra a los jugadores de la plantilla. ¿Llegas al once?</p>
      </div>

      <div id="once-progress" style="margin-bottom:1rem;"></div>
      <div id="once-input-area"></div>
      <div id="once-feedback" style="min-height:1.3rem;text-align:center;font-size:0.85rem;font-weight:700;margin:0.5rem 0 0.75rem;"></div>
      <div id="once-list"></div>
      <div id="once-actions" style="margin-top:1.5rem;"></div>
    </div>
  `;

  const els = {
    back: container.querySelector('#once-back'),
    progress: container.querySelector('#once-progress'),
    inputArea: container.querySelector('#once-input-area'),
    feedback: container.querySelector('#once-feedback'),
    list: container.querySelector('#once-list'),
    actions: container.querySelector('#once-actions')
  };

  els.back.addEventListener('click', () => onNavigate && onNavigate('juegos'));

  function setFeedback(msg, kind) {
    const color = kind === 'ok' ? 'var(--primary-green,#22c55e)' : kind === 'error' ? 'var(--danger,#ef4444)' : kind === 'warn' ? 'var(--accent-gold,#deed00)' : 'var(--text-muted)';
    els.feedback.style.color = color;
    els.feedback.textContent = msg || '';
  }

  function renderProgress() {
    const pct = Math.round((guessed.size / total) * 100);
    const milestone = !finished && guessed.size >= 11 ? ` · <span style="color:var(--accent);">¡ya tienes tu once!</span>` : '';
    els.progress.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.35rem;font-weight:800;">
        <span style="font-family:var(--font-display);text-transform:uppercase;font-size:0.85rem;color:var(--text-light);">${guessed.size} / ${total} jugadores${milestone}</span>
        <span style="font-size:0.8rem;color:var(--text-muted);">${pct}%</span>
      </div>
      <div style="height:10px;background:var(--bg-item-light,#2a2a2a);border:2px solid #000;border-radius:6px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:var(--accent);transition:width 0.25s ease;"></div>
      </div>`;
  }

  function renderInput() {
    if (finished) {
      els.inputArea.innerHTML = `
        <div style="text-align:center;background:var(--bg-card);border:3px solid #000;box-shadow:5px 5px 0 #000;border-radius:8px;padding:1rem;">
          <div style="font-family:var(--font-display);font-weight:900;text-transform:uppercase;font-size:1.1rem;color:var(--text-light);">${guessed.size === total ? '¡Plantilla completa!' : 'Partida terminada'}</div>
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem;">Nombraste ${guessed.size} de ${total}. Vuelve mañana con otro equipo.</div>
        </div>`;
      return;
    }
    els.inputArea.innerHTML = `
      <div class="once-input-wrap" style="position:relative;width:100%;box-sizing:border-box;">
        <input id="once-input" class="input-field" type="text" autocomplete="off" placeholder="Escribe un jugador y pulsa Enter..."
          style="width:100%;box-sizing:border-box;background:var(--bg-input,#1c1b1b);border:3px solid #000;box-shadow:4px 4px 0 #000;border-radius:6px;padding:0.75rem 0.9rem;color:var(--text-light);font-family:var(--font-sans);font-weight:700;font-size:0.95rem;" />
      </div>`;

    const inputEl = els.inputArea.querySelector('#once-input');
    setupAutocomplete(inputEl, (selected) => handleGuess(selected.name));
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGuess(inputEl.value);
      }
    });
    inputEl.focus();
  }

  function renderList() {
    if (finished) {
      // Reveal completo: aciertos resaltados, fallados en gris.
      const items = squad.map(p => {
        const got = guessed.has(p.name);
        return `<li style="list-style:none;padding:0.4rem 0.6rem;border-radius:6px;font-size:0.85rem;font-weight:700;background:${got ? 'rgba(222,237,0,0.12)' : 'rgba(255,255,255,0.02)'};border:1px solid ${got ? 'rgba(222,237,0,0.5)' : 'var(--border-color)'};color:${got ? 'var(--text-light)' : 'var(--text-muted)'};">
          ${got ? '' : '<span style="opacity:0.6;">·</span> '}${escapeHTML(p.name)}
        </li>`;
      }).join('');
      els.list.innerHTML = `
        <div style="font-family:var(--font-display);text-transform:uppercase;font-size:0.8rem;font-weight:800;color:var(--text-muted);letter-spacing:1px;margin:0 0 0.6rem;">Plantilla del ${escapeHTML(teamName)}</div>
        <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.4rem;margin:0;padding:0;">${items}</ul>`;
      return;
    }
    // En juego: chips de los aciertos, en orden alfabético.
    const got = squad.filter(p => guessed.has(p.name));
    if (got.length === 0) {
      els.list.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;padding:1rem 0;">Empieza a escribir nombres. Los aciertos irán apareciendo aquí.</p>`;
      return;
    }
    const chips = got.map(p => `<span style="display:inline-block;padding:0.4rem 0.7rem;background:rgba(222,237,0,0.12);border:1.5px solid rgba(222,237,0,0.5);border-radius:20px;font-size:0.85rem;font-weight:700;color:var(--text-light);">${escapeHTML(p.name)}</span>`).join('');
    els.list.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;justify-content:center;">${chips}</div>`;
  }

  function renderActions() {
    if (finished) {
      els.actions.innerHTML = `
        <button id="once-share" class="brutalist-btn" style="width:100%;padding:0.85rem;font-family:var(--font-display);font-weight:900;text-transform:uppercase;background:var(--accent);color:#000;border:3px solid #000;box-shadow:4px 4px 0 #000;cursor:pointer;">Compartir resultado</button>`;
      els.actions.querySelector('#once-share').addEventListener('click', share);
    } else {
      els.actions.innerHTML = `
        <button id="once-surrender" style="width:100%;padding:0.7rem;font-family:var(--font-display);font-weight:800;text-transform:uppercase;background:transparent;color:var(--text-muted);border:2px solid var(--border-color);border-radius:6px;cursor:pointer;">Rendirse y ver la plantilla</button>`;
      els.actions.querySelector('#once-surrender').addEventListener('click', () => {
        if (!confirm('¿Seguro? Se revelará la plantilla completa y termina la partida de hoy.')) return;
        finished = true;
        save();
        updateUI();
      });
    }
  }

  function updateUI() {
    renderProgress();
    renderInput();
    renderList();
    renderActions();
  }

  function handleGuess(rawText) {
    const q = normalizeStr(rawText);
    if (!q) return;
    const inSquad = squad.find(p => matchesPlayer(p, q));
    if (inSquad) {
      if (guessed.has(inSquad.name)) {
        setFeedback(`Ya tenías a ${inSquad.name}.`, 'warn');
      } else {
        guessed.add(inSquad.name);
        if (guessed.size >= total) finished = true;
        save();
        setFeedback(`¡Bien! ${inSquad.name}.`, 'ok');
        updateUI();
      }
      return;
    }
    const elsewhere = findAnywhere(q);
    if (elsewhere) {
      setFeedback(`${elsewhere.name} juega en ${elsewhere.team || 'otro equipo'}, no en el ${teamName}.`, 'error');
    } else {
      setFeedback(`No conocemos a "${rawText.trim()}". Prueba con el apellido.`, 'warn');
    }
  }

  async function share() {
    const filled = total > 0 ? Math.round((guessed.size / total) * 10) : 0;
    const bar = '🟩'.repeat(filled) + '⬜'.repeat(Math.max(0, 10 - filled));
    const text = `El Once del Día #${dailyNumber} — ${teamName}\n${bar}\nNombré ${guessed.size}/${total} jugadores.\n${SITE_URL}/juegos`;
    try {
      if (navigator.share) { await navigator.share({ text }); return; }
    } catch (_) { /* usuario canceló o no soportado */ }
    try {
      await navigator.clipboard.writeText(text);
      showToast && showToast('Resultado copiado. ¡Pégalo en el grupo!', 'success');
    } catch (_) {
      showToast && showToast('No se pudo copiar el resultado', 'error');
    }
  }

  updateUI();
}
