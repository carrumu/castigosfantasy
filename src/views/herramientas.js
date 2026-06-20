/**
 * Renders the Herramientas hub page.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 */
export function renderHerramientas(container, callbacks) {
  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 800px;">

      <!-- Header -->
      <div style="margin-bottom: 2.5rem;">
        <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Caja de utilidades</span>
        <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.15rem 0 0.6rem;">
          Herramientas
        </h1>
        <p style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500; max-width: 500px; line-height: 1.4;">
          Elige la herramienta que necesitas: gira la ruleta del castigo o genera nuevas sentencias para tu liga.
        </p>
      </div>

      <!-- Tool Cards Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">

        <!-- Ruleta Card -->
        <button id="tool-ruleta-btn" class="tool-card-btn">
          <div class="tool-card-inner">
            <div class="tool-card-icon-wrap" style="background: var(--accent); color: #000;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v20"></path>
                <path d="M2 12h20"></path>
                <path d="M4.93 4.93l14.14 14.14"></path>
                <path d="M19.07 4.93L4.93 19.07"></path>
              </svg>
            </div>
            <div class="tool-card-text">
              <h2 class="tool-card-title">Ruleta de Sentencias</h2>
              <p class="tool-card-desc">Gira la rueda del destino y que la suerte decida el castigo de la semana.</p>
            </div>
            <div class="tool-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- Generador Card -->
        <button id="tool-generador-btn" class="tool-card-btn">
          <div class="tool-card-inner">
            <div class="tool-card-icon-wrap" style="background: var(--danger); color: #fff;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"></path>
              </svg>
            </div>
            <div class="tool-card-text">
              <h2 class="tool-card-title">Generador de Castigos</h2>
              <p class="tool-card-desc">Crea castigos épicos con IA para que nadie quiera quedar último nunca más.</p>
            </div>
            <div class="tool-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

      </div>
    </div>
  `;

  container.querySelector('#tool-ruleta-btn').addEventListener('click', () => {
    if (callbacks.onNavigate) callbacks.onNavigate('ruleta');
  });

  container.querySelector('#tool-generador-btn').addEventListener('click', () => {
    if (callbacks.onNavigate) callbacks.onNavigate('generador');
  });
}
