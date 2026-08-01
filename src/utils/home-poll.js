/**
 * Encuesta de la portada. Vota cualquiera, sin cuenta.
 *
 * Los porcentajes son REALES: salen de `home_poll_results`, que cuenta los
 * votos de verdad. Mientras haya pocos, se enseña el número absoluto junto al
 * porcentaje ("3 votos") para que nadie lea un 66% como si fuera una muestra
 * grande. Inventar cifras aquí sería lo fácil y lo que arruina la credibilidad
 * el día que alguien pregunta.
 *
 * Si la base de datos no responde, el widget se retira en silencio en vez de
 * enseñar datos a medias.
 */

import { supabase, isConfigured } from '../supabase';
import { escapeHTML } from './security.js';

const POLL_ID = 'excusa-bote';
const VOTED_KEY = `CF_POLL_${POLL_ID}`;

const QUESTION = '¿Cuál es la peor excusa de tu liga para no pagar el bote?';

const OPTIONS = [
  { id: 'bizum', label: 'Ahora te hago un Bizum' },
  { id: 'suelto', label: 'No llevo suelto encima' },
  { id: 'lesionados', label: 'Es que tenía a medio equipo lesionado' },
  { id: 'final', label: 'Lo pago todo junto al final' }
];

function votoPrevio() {
  try {
    return localStorage.getItem(VOTED_KEY);
  } catch (err) {
    return null;
  }
}

export function pollMarkup() {
  return `
    <section class="landing-tier" id="encuesta-home" hidden>
      <div class="tier-header">
        <h2 class="tier-title">La pregunta del vestuario</h2>
        <span class="tier-sub">Vota sin registrarte y mira qué contesta el resto</span>
      </div>
      <div class="poll-box">
        <p class="poll-question">${escapeHTML(QUESTION)}</p>
        <div class="poll-options" id="poll-options"></div>
        <p class="poll-total" id="poll-total"></p>
      </div>
    </section>`;
}

export async function wirePoll(root) {
  const section = root.querySelector('#encuesta-home');
  const list = root.querySelector('#poll-options');
  const totalEl = root.querySelector('#poll-total');
  if (!section || !list || !isConfigured || !supabase) return;

  let results = {};
  let myVote = votoPrevio();

  async function cargarResultados() {
    const { data, error } = await supabase.rpc('home_poll_results', { p_poll_id: POLL_ID });
    if (error) throw error;
    results = Object.fromEntries((data || []).map(r => [r.option_id, Number(r.votes)]));
  }

  function pintar() {
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const revelado = !!myVote;

    list.innerHTML = OPTIONS.map(o => {
      const votos = results[o.id] || 0;
      const pct = total > 0 ? Math.round((votos / total) * 100) : 0;
      const mio = myVote === o.id;
      return `
        <button type="button" class="poll-option ${revelado ? 'is-revealed' : ''} ${mio ? 'is-mine' : ''}"
                data-option="${o.id}" ${revelado ? 'disabled' : ''}>
          <span class="poll-bar" style="width:${revelado ? pct : 0}%"></span>
          <span class="poll-option-text">
            <span class="poll-option-label">${escapeHTML(o.label)}</span>
            ${revelado ? `<span class="poll-option-num">${pct}% · ${votos} ${votos === 1 ? 'voto' : 'votos'}</span>` : ''}
          </span>
        </button>`;
    }).join('');

    if (revelado) {
      totalEl.textContent = total === 1
        ? 'Solo 1 voto por ahora. Eres de los primeros.'
        : `${total} votos hasta ahora.`;
    } else {
      totalEl.textContent = 'Elige una y verás los resultados.';
    }

    if (!revelado) {
      list.querySelectorAll('.poll-option').forEach(btn => {
        btn.addEventListener('click', () => votar(btn.dataset.option));
      });
    }
  }

  async function votar(optionId) {
    if (myVote) return;
    // Se pinta antes de confirmar: la respuesta es instantánea y, si el insert
    // falla, se revierte. Vale más eso que un botón congelado medio segundo.
    myVote = optionId;
    results[optionId] = (results[optionId] || 0) + 1;
    pintar();

    try {
      localStorage.setItem(VOTED_KEY, optionId);
    } catch (err) { /* incógnito: podrá votar otra vez, no es grave */ }

    const { error } = await supabase
      .from('home_poll_votes')
      .insert({ poll_id: POLL_ID, option_id: optionId });

    if (error) {
      console.error('No se pudo registrar el voto:', error);
      return;
    }
    try {
      await cargarResultados();
      pintar();
    } catch (err) { /* el recuento local ya es suficientemente bueno */ }
  }

  try {
    await cargarResultados();
  } catch (err) {
    // Sin resultados fiables no se enseña la encuesta: mejor nada que humo.
    console.warn('Encuesta de la home no disponible:', err);
    return;
  }

  section.hidden = false;
  pintar();
}
