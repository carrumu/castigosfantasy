/**
 * Simulador del bote de la liga.
 *
 * OJO con la fórmula: el bote NO lo paga toda la liga cada jornada. Pagan los
 * últimos, y cuántos exactamente lo decide cada grupo. Multiplicar por el
 * número de jugadores daba cifras infladas que cualquiera que haya llevado una
 * liga detecta al instante, y una calculadora en la que no te puedes fiar del
 * número hace más daño que no tenerla.
 *
 * bote = multa × pagadores por jornada × 38 jornadas de Liga.
 *
 * Sin base de datos y sin cuenta: se calcula entero en el navegador.
 */

import { shareOnWhatsApp, shareButton } from './whatsapp-share.js';

const JORNADAS = 38; // Temporada completa de LaLiga.

const DEFAULTS = { multa: 5, pagadores: 1 };

// Qué se puede hacer con el bote al final de temporada. Sirve para que la cifra
// deje de ser abstracta: nadie visualiza 380 €, todos visualizan la cena.
const PREMIOS = [
  { min: 1200, texto: 'un fin de semana fuera con la liga entera' },
  { min: 700, texto: 'una cena de las buenas, con marisco y sin mirar la carta' },
  { min: 350, texto: 'una cena de fin de temporada en condiciones' },
  { min: 150, texto: 'una comida del grupo con sobremesa larga' },
  { min: 60, texto: 'una ronda larga de cañas para todos' },
  { min: 0, texto: 'unas cañas de cierre de temporada' }
];

function premioPara(total) {
  return (PREMIOS.find(p => total >= p.min) || PREMIOS[PREMIOS.length - 1]).texto;
}

const euros = (n) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const conComa = (n) => n.toString().replace('.', ',');

// El control es numérico pero nadie piensa en "3 pagadores": piensa en "los
// tres últimos". La etiqueta traduce el número a como se habla en el grupo.
function etiquetaPagadores(n) {
  return n === 1 ? 'Solo el último' : `Los ${n} últimos`;
}

export function boteSimuladorMarkup() {
  const { multa, pagadores } = DEFAULTS;
  return `
    <section class="landing-tier" id="simulador-bote">
      <div class="tier-header">
        <h2 class="tier-title">¿Cuánto bote acabaríais juntando?</h2>
        <span class="tier-sub">Lo que sueltan los últimos, jornada tras jornada</span>
      </div>

      <div class="bs-box">
        <div class="bs-controls">
          <label class="bs-field" for="bs-multa">
            <span class="bs-label">Multa del colista por jornada</span>
            <span class="bs-value" id="bs-multa-val">${conComa(multa)} €</span>
            <input type="range" id="bs-multa" class="bs-range"
                   min="0.5" max="25" step="0.5" value="${multa}"
                   aria-describedby="bs-multa-val" />
          </label>

          <label class="bs-field" for="bs-pagadores">
            <span class="bs-label">¿Cuántos pagan cada jornada?</span>
            <span class="bs-value" id="bs-pagadores-val">${etiquetaPagadores(pagadores)}</span>
            <input type="range" id="bs-pagadores" class="bs-range"
                   min="1" max="6" step="1" value="${pagadores}"
                   aria-describedby="bs-pagadores-val" />
          </label>
        </div>

        <div class="bs-result" aria-live="polite">
          <span class="bs-result-eyebrow">Bote al final de temporada</span>
          <strong class="bs-total" id="bs-total">0 €</strong>
          <p class="bs-premio" id="bs-premio"></p>
          <p class="bs-formula" id="bs-formula"></p>
        </div>

        <div class="bs-actions">
          ${shareButton('Enseñárselo al grupo')}
        </div>
      </div>
    </section>`;
}

export function wireBoteSimulador(root) {
  const multaEl = root.querySelector('#bs-multa');
  const multaVal = root.querySelector('#bs-multa-val');
  const pagadoresEl = root.querySelector('#bs-pagadores');
  const pagadoresVal = root.querySelector('#bs-pagadores-val');
  const totalEl = root.querySelector('#bs-total');
  const premioEl = root.querySelector('#bs-premio');
  const formulaEl = root.querySelector('#bs-formula');
  if (!multaEl || !pagadoresEl) return;

  let total = 0;

  function recalcular() {
    const multa = Number(multaEl.value);
    const pagadores = Number(pagadoresEl.value);
    total = multa * pagadores * JORNADAS;

    multaVal.textContent = `${conComa(multa)} €`;
    pagadoresVal.textContent = etiquetaPagadores(pagadores);
    totalEl.textContent = `${euros(total)} €`;
    premioEl.textContent = `Os daría para ${premioPara(total)}.`;
    formulaEl.textContent = pagadores === 1
      ? `${conComa(multa)} € que suelta el colista × ${JORNADAS} jornadas de Liga.`
      : `${conComa(multa)} € × ${pagadores} que pagan × ${JORNADAS} jornadas de Liga.`;
  }

  multaEl.addEventListener('input', recalcular);
  pagadoresEl.addEventListener('input', recalcular);
  recalcular();

  root.querySelector('#simulador-bote [data-share]')?.addEventListener('click', () => {
    const pagadores = Number(pagadoresEl.value);
    // Singular o plural según cuántos paguen: "el último suelta" / "los 3
    // últimos sueltan ... cada uno".
    const quien = pagadores === 1
      ? `el último de cada jornada suelta ${conComa(Number(multaEl.value))} €`
      : `los ${pagadores} últimos de cada jornada sueltan ${conComa(Number(multaEl.value))} € cada uno`;
    shareOnWhatsApp(
      `💰 He echado cuentas de nuestro bote.\n\n` +
      `Si ${quien}, terminamos la temporada con *${euros(total)} €*.\n\n` +
      `Nos daría para ${premioPara(total)}. Yo lo veo, ¿lo montamos?`
    );
  });
}
