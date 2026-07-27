import { escapeHTML } from '../utils/security';
import { SITE_URL } from '../utils/site';
import { HISTORIC_ELEVENS, FORMATIONS } from '../utils/historic-elevens';

/**
 * "El Once del Día" — adivina el 11 titular de un equipo-hito histórico
 * (el Madrid de los 100 puntos, la Liga del Atleti, el milagro del Leicester...)
 * colocado sobre la pizarra por posiciones. Un equipo distinto cada día
 * (determinista por fecha, igual para todos, reset a las 08:00 hora España).
 */

const STORAGE_KEY = 'CF_ONCE11_DAILY_STATE';

function normalizeStr(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/g, 'o').replace(/Ø/g, 'O').toLowerCase().trim();
}

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

  if (!HISTORIC_ELEVENS.length) {
    container.innerHTML = `<div class="container" style="padding:2rem;text-align:center;color:var(--text-muted);">No hay onces disponibles.</div>`;
    return;
  }

  // Día y equipo del día (deterministas por fecha).
  const gameDateStr = getGameDateString();
  const gameDate = new Date(gameDateStr + 'T00:00:00Z');
  const epoch = new Date(Date.UTC(2026, 0, 1));
  const diffDays = Math.floor((gameDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  const dailyNumber = diffDays + 1;
  const entry = HISTORIC_ELEVENS[Math.abs(diffDays) % HISTORIC_ELEVENS.length];
  const slots = FORMATIONS[entry.formation] || FORMATIONS['4-3-3'];
  const total = entry.players.length;

  // Estado persistente por día.
  let guessed = new Set(); // nombres exactos (player.name) acertados
  let finished = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.date === gameDateStr && saved.id === entry.id) {
      guessed = new Set(saved.guessed || []);
      finished = !!saved.finished;
    }
  } catch (_) {}
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: gameDateStr, id: entry.id, guessed: [...guessed], finished })); } catch (_) {}
  };

  const matches = (pl, q) => pl.keys.some(k => normalizeStr(k) === q) || normalizeStr(pl.name) === q || normalizeStr(pl.short) === q;

  // Shell.
  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 560px; margin: 0 auto; padding-bottom: 3rem;">
      <a id="once-back" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Volver a Juegos
      </a>

      <div style="text-align:center;margin-bottom:1rem;">
        <span style="font-family:var(--font-mono,monospace);font-size:0.72rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">El Once del Día · #${dailyNumber}</span>
        <h1 class="gradient-text-green" style="font-family:var(--font-display);font-size:1.7rem;font-weight:900;text-transform:uppercase;letter-spacing:-1px;line-height:1.05;margin:0.35rem 0 0.2rem;">${escapeHTML(entry.team)}</h1>
        <div style="color:var(--accent);font-weight:800;font-size:0.9rem;">${escapeHTML(entry.season)} · ${escapeHTML(entry.milestone)}</div>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0.3rem 0 0;">Adivina su 11 titular. Escribe apellidos y colócalos en el campo.</p>
      </div>

      <div id="once-progress" style="margin-bottom:0.75rem;"></div>

      <div id="once-pitch" style="position:relative;width:100%;padding-bottom:132%;background:linear-gradient(180deg,#0c2a1a 0%,#0a1f14 100%);border:3px solid #000;box-shadow:6px 6px 0 #000;border-radius:10px;overflow:hidden;">
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.12);"></div>
        <div style="position:absolute;top:50%;left:50%;width:96px;height:96px;border:1px solid rgba(255,255,255,0.12);border-radius:50%;transform:translate(-50%,-50%);"></div>
        <div id="once-slots"></div>
      </div>

      <div id="once-input-area" style="margin-top:1rem;"></div>
      <div id="once-feedback" style="min-height:1.3rem;text-align:center;font-size:0.85rem;font-weight:700;margin:0.5rem 0 0.25rem;"></div>
      <div id="once-actions" style="margin-top:1rem;"></div>
    </div>
  `;

  const els = {
    back: container.querySelector('#once-back'),
    progress: container.querySelector('#once-progress'),
    slots: container.querySelector('#once-slots'),
    inputArea: container.querySelector('#once-input-area'),
    feedback: container.querySelector('#once-feedback'),
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
    els.progress.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.3rem;font-weight:800;">
        <span style="font-family:var(--font-display);text-transform:uppercase;font-size:0.9rem;color:var(--text-light);">${guessed.size} / ${total} titulares</span>
        <span style="font-size:0.8rem;color:var(--text-muted);">${pct}%</span>
      </div>
      <div style="height:9px;background:var(--bg-item-light,#2a2a2a);border:2px solid #000;border-radius:6px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:var(--accent);transition:width 0.25s ease;"></div>
      </div>`;
  }

  function renderSlots() {
    els.slots.innerHTML = entry.players.map((pl, i) => {
      const slot = slots[i] || { pos: '?', x: 50, y: 50 };
      const got = guessed.has(pl.name);
      const reveal = finished && !got;
      const label = got ? pl.short : (reveal ? pl.short : slot.pos);
      const bg = got ? 'var(--accent)' : reveal ? 'rgba(211,0,23,0.85)' : 'rgba(0,0,0,0.45)';
      const color = got ? '#000' : '#fff';
      const border = got ? '#000' : reveal ? '#000' : 'rgba(222,237,0,0.6)';
      return `
        <div style="position:absolute;left:${slot.x}%;top:${slot.y}%;transform:translate(-50%,-50%);z-index:2;width:22.5%;">
          <div title="${escapeHTML(got || reveal ? pl.name : slot.pos)}" style="width:100%;box-sizing:border-box;padding:0.35rem 0.15rem;text-align:center;background:${bg};border:2px solid ${border};border-radius:8px;color:${color};font-weight:800;font-size:0.66rem;line-height:1.1;box-shadow:2px 2px 0 rgba(0,0,0,0.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(label)}</div>
        </div>`;
    }).join('');
  }

  function renderInput() {
    if (finished) {
      els.inputArea.innerHTML = `
        <div style="text-align:center;background:var(--bg-card);border:3px solid #000;box-shadow:4px 4px 0 #000;border-radius:8px;padding:0.9rem;">
          <div style="font-family:var(--font-display);font-weight:900;text-transform:uppercase;font-size:1.05rem;color:var(--text-light);">${guessed.size === total ? '¡Once completo!' : 'Partida terminada'}</div>
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem;">Acertaste ${guessed.size} de ${total}. Vuelve mañana con otro equipo mítico.</div>
        </div>`;
      return;
    }
    els.inputArea.innerHTML = `
      <form id="once-form" style="display:flex;gap:0.5rem;">
        <input id="once-input" type="text" autocomplete="off" placeholder="Escribe un apellido y pulsa Enter..."
          style="flex:1;min-width:0;box-sizing:border-box;background:var(--bg-input,#1c1b1b);border:3px solid #000;box-shadow:3px 3px 0 #000;border-radius:6px;padding:0.7rem 0.85rem;color:var(--text-light);font-family:var(--font-sans);font-weight:700;font-size:0.95rem;" />
        <button type="submit" style="flex-shrink:0;padding:0 1.1rem;font-family:var(--font-display);font-weight:900;text-transform:uppercase;background:var(--accent);color:#000;border:3px solid #000;box-shadow:3px 3px 0 #000;border-radius:6px;cursor:pointer;">OK</button>
      </form>`;
    const form = els.inputArea.querySelector('#once-form');
    const input = els.inputArea.querySelector('#once-input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGuess(input.value);
      input.value = '';
      input.focus();
    });
    input.focus();
  }

  function renderActions() {
    if (finished) {
      els.actions.innerHTML = `<button id="once-share" style="width:100%;padding:0.85rem;font-family:var(--font-display);font-weight:900;text-transform:uppercase;background:var(--accent);color:#000;border:3px solid #000;box-shadow:4px 4px 0 #000;cursor:pointer;">Compartir resultado</button>`;
      els.actions.querySelector('#once-share').addEventListener('click', share);
    } else {
      els.actions.innerHTML = `<button id="once-surrender" style="width:100%;padding:0.7rem;font-family:var(--font-display);font-weight:800;text-transform:uppercase;background:transparent;color:var(--text-muted);border:2px solid var(--border-color);border-radius:6px;cursor:pointer;">Rendirse y ver el once</button>`;
      els.actions.querySelector('#once-surrender').addEventListener('click', () => {
        if (!confirm('¿Seguro? Se revelará el once completo y termina la partida de hoy.')) return;
        finished = true; save(); updateUI();
      });
    }
  }

  function updateUI() {
    renderProgress();
    renderSlots();
    renderInput();
    renderActions();
  }

  function handleGuess(rawText) {
    const q = normalizeStr(rawText);
    if (!q) return;
    const hit = entry.players.find(pl => matches(pl, q));
    if (hit) {
      if (guessed.has(hit.name)) {
        setFeedback(`Ya tenías a ${hit.short}.`, 'warn');
      } else {
        guessed.add(hit.name);
        if (guessed.size >= total) finished = true;
        save();
        setFeedback(`¡Bien! ${hit.name}.`, 'ok');
        updateUI();
      }
    } else {
      setFeedback(`"${rawText.trim()}" no está en este once.`, 'error');
    }
  }

  async function share() {
    const filled = total > 0 ? Math.round((guessed.size / total) * 11) : 0;
    const bar = '🟩'.repeat(filled) + '⬜'.repeat(Math.max(0, 11 - filled));
    const text = `El Once del Día #${dailyNumber} — ${entry.team} (${entry.season})\n${bar}\nAcerté ${guessed.size}/${total} del ${entry.milestone}.\n${SITE_URL}/juegos`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (_) {}
    try {
      await navigator.clipboard.writeText(text);
      showToast && showToast('Resultado copiado. ¡Pégalo en el grupo!', 'success');
    } catch (_) {
      showToast && showToast('No se pudo copiar el resultado', 'error');
    }
  }

  updateUI();
}
