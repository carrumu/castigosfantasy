/**
 * Ruleta de Sentencias jugable en la home, sin cuenta.
 *
 * No es una maqueta: saca castigos del mismo catálogo que usa el Generador
 * dentro de la app, así que lo que ve el visitante aquí es exactamente lo que
 * se va a encontrar dentro. Es el primer momento en que la web hace algo por él
 * en vez de pedirle el email.
 *
 * El resultado se puede mandar al grupo de WhatsApp: ahí es donde vive la liga
 * y de donde vuelven los demás.
 */

import { PUNISHMENT_IDEAS } from './punishments-catalog.js';
import { escapeHTML } from './security.js';
import { shareOnWhatsApp, shareButton } from './whatsapp-share.js';
import { logPunishmentGeneration } from './punishment-counter.js';

const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Duración total del sorteo. Suficiente para que se sienta un sorteo y no un
// simple cambio de texto, y corta para que apetezca repetirlo.
const SPIN_MS = REDUCED_MOTION ? 0 : 1600;

function intensityDots(level) {
  return Array.from({ length: 3 }, (_, i) =>
    `<span class="rd-flame ${i < level ? 'is-on' : ''}" aria-hidden="true">${i < level ? '🔥' : '·'}</span>`
  ).join('');
}

const INTENSITY_LABEL = { 1: 'Suave', 2: 'Se nota', 3: 'Sin piedad' };

export function ruletaDemoMarkup() {
  return `
    <section class="landing-tier" id="ruleta-demo">
      <div class="tier-header">
        <h2 class="tier-title">Prueba la Ruleta de Sentencias</h2>
        <span class="tier-sub">Sin cuenta, sin email, ahora mismo</span>
      </div>

      <div class="rd-box">
        <div class="rd-stage" id="rd-stage" aria-live="polite">
          <p class="rd-idle">Dale al botón y mira qué le espera al colista de tu liga.</p>
        </div>

        <button type="button" class="rd-spin" id="rd-spin">
          <span class="rd-spin-icon material-symbols-outlined" aria-hidden="true">casino</span>
          <span class="rd-spin-label">Girar la ruleta</span>
        </button>

        <div class="rd-actions" id="rd-actions" hidden>
          ${shareButton('Mandarlo al grupo')}
          <button type="button" class="rd-again" id="rd-again">Otra sentencia</button>
        </div>

        <p class="rd-count" id="rd-count" hidden></p>
      </div>
    </section>`;
}

/**
 * @param {HTMLElement} root Contenedor donde ya se pintó `ruletaDemoMarkup()`.
 * @param {Function} onNavigate Router de la app, para el CTA final.
 */
export function wireRuletaDemo(root, onNavigate) {
  const stage = root.querySelector('#rd-stage');
  const spinBtn = root.querySelector('#rd-spin');
  const actions = root.querySelector('#rd-actions');
  const againBtn = root.querySelector('#rd-again');
  const countEl = root.querySelector('#rd-count');
  if (!stage || !spinBtn) return;

  let spins = 0;
  let spinning = false;
  let current = null;

  function renderResult(p) {
    stage.innerHTML = `
      <article class="rd-card">
        <div class="rd-card-top">
          <span class="rd-cat">${escapeHTML(p.categoryLabel)}</span>
          <span class="rd-intensity" title="Intensidad: ${INTENSITY_LABEL[p.intensity]}">
            ${intensityDots(p.intensity)}
            <span class="rd-intensity-label">${INTENSITY_LABEL[p.intensity]}</span>
          </span>
        </div>
        <h3 class="rd-name">${escapeHTML(p.name)}</h3>
        <p class="rd-desc">${escapeHTML(p.description)}</p>
      </article>`;
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.classList.add('is-spinning');
    actions.hidden = true;

    const final = PUNISHMENT_IDEAS[Math.floor(Math.random() * PUNISHMENT_IDEAS.length)];

    const finish = () => {
      current = final;
      spins += 1;
      logPunishmentGeneration('home-demo', final.id);
      renderResult(final);
      spinning = false;
      spinBtn.disabled = false;
      spinBtn.classList.remove('is-spinning');
      spinBtn.querySelector('.rd-spin-label').textContent = 'Girar otra vez';
      actions.hidden = false;
      countEl.hidden = false;
      countEl.textContent = spins === 1
        ? 'Una sentencia. En tu liga esto quedaría anotado en el Muro.'
        : `${spins} sentencias sorteadas. Con liga creada, cada una queda registrada con su culpable.`;
    };

    if (REDUCED_MOTION) {
      finish();
      return;
    }

    // Barajado visual: acelera y frena, como una ruleta de verdad.
    const start = performance.now();
    let last = 0;
    const tick = (now) => {
      const elapsed = now - start;
      if (elapsed >= SPIN_MS) {
        finish();
        return;
      }
      // El intervalo entre cambios crece con el tiempo -> sensación de frenada.
      const gap = 45 + (elapsed / SPIN_MS) ** 3 * 260;
      if (now - last >= gap) {
        last = now;
        const peek = PUNISHMENT_IDEAS[Math.floor(Math.random() * PUNISHMENT_IDEAS.length)];
        stage.innerHTML = `<p class="rd-rolling">${escapeHTML(peek.name)}</p>`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  spinBtn.addEventListener('click', spin);
  againBtn?.addEventListener('click', spin);

  root.querySelector('#rd-actions [data-share]')?.addEventListener('click', () => {
    if (!current) return;
    shareOnWhatsApp(
      `🎲 Acabo de girar la Ruleta de Sentencias y me ha salido esto:\n\n` +
      `*${current.name}*\n${current.description}\n\n` +
      `Yo se lo aplicaba al último de la próxima jornada. ¿Lo hacemos oficial?`
    );
  });
}
