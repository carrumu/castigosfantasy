/**
 * Bloque reutilizable "¿Cómo funciona?" para los apartados de la app.
 *
 * Explica en pocas líneas qué hace cada herramienta y cómo se usa. Mejora la
 * experiencia del usuario nuevo y hace que la web se vea completa (útil también
 * de cara a la revisión de AdSense). Devuelve una cadena HTML lista para
 * incrustar dentro del innerHTML de cada vista.
 */
export function howItWorks({ title = '¿Cómo funciona?', intro = '', steps = [], note = '' } = {}) {
  const stepsHtml = steps.length
    ? `<ol style="margin:0.75rem 0 0;padding-left:1.2rem;display:flex;flex-direction:column;gap:0.45rem;">${steps
        .map(s => `<li style="line-height:1.5;">${s}</li>`)
        .join('')}</ol>`
    : '';

  return `
    <section class="how-it-works" style="background:var(--bg-card,#1c1b1b);border:1px solid var(--border-color,#2a2a2a);border-left:4px solid var(--accent,#deed00);border-radius:10px;padding:1.1rem 1.25rem;margin:1.5rem auto;max-width:640px;text-align:left;color:var(--text-light,#efefef);font-size:0.9rem;">
      <h2 style="font-family:var(--font-display,inherit);font-weight:800;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;margin:0;color:var(--text-light,#efefef);">${title}</h2>
      ${intro ? `<p style="margin:0.5rem 0 0;line-height:1.55;color:var(--text-muted,#a9a9a0);">${intro}</p>` : ''}
      ${stepsHtml}
      ${note ? `<p style="margin:0.75rem 0 0;font-size:0.82rem;line-height:1.5;color:var(--text-muted,#a9a9a0);font-style:italic;">${note}</p>` : ''}
    </section>`;
}
