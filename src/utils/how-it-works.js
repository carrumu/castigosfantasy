/**
 * Bloque reutilizable "¿Cómo funciona?" para los apartados de la app.
 *
 * Va PLEGADO por defecto: solo se ve un botón discreto de información, y el
 * usuario lo despliega si le hace falta. Así no estorba a quien ya conoce la
 * herramienta, pero la explicación sigue estando ahí (y en el HTML, que para
 * buscadores y para la revisión de AdSense cuenta igual).
 *
 * Usa <details>/<summary> nativo: sin JavaScript, así que funciona también con
 * una Content-Security-Policy estricta.
 *
 * Devuelve una cadena HTML lista para incrustar en el innerHTML de cada vista.
 */
export function howItWorks({ title = '¿Cómo funciona?', intro = '', steps = [], note = '' } = {}) {
  const stepsHtml = steps.length
    ? `<ol style="margin:0.75rem 0 0;padding-left:1.2rem;display:flex;flex-direction:column;gap:0.45rem;">${steps
        .map(s => `<li style="line-height:1.5;">${s}</li>`)
        .join('')}</ol>`
    : '';

  return `
    <details class="how-it-works">
      <summary class="how-it-works-toggle">
        <svg class="how-it-works-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5"></circle>
          <line x1="12" y1="16.5" x2="12" y2="11"></line>
          <line x1="12" y1="7.5" x2="12.01" y2="7.5"></line>
        </svg>
        <span>${title}</span>
        <svg class="how-it-works-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div class="how-it-works-body">
        ${intro ? `<p style="margin:0;line-height:1.55;color:var(--text-muted,#a9a9a0);">${intro}</p>` : ''}
        ${stepsHtml}
        ${note ? `<p style="margin:0.75rem 0 0;font-size:0.82rem;line-height:1.5;color:var(--text-muted,#a9a9a0);font-style:italic;">${note}</p>` : ''}
      </div>
    </details>`;
}
