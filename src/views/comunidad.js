/**
 * Renders the "Comunidad" (Community hub) screen.
 * Allows users to choose between the Jester (El Bufón) and the upcoming Forum (Foro).
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate
 */
export function renderComunidad(container, callbacks) {
  container.innerHTML = `
    <div class="comunidad-container fade-in-up" style="padding: 1.5rem 1.25rem;">
      <!-- Hero Header -->
      <div style="margin-bottom: 2.5rem; text-align: center;">
        <h1 class="gradient-text-gold" style="font-size: 2.2rem; font-weight: 900; font-family: var(--font-display); text-transform: uppercase; margin-bottom: 0.5rem; text-shadow: 2px 2px 0px #000000;">
          Comunidad
        </h1>
        <p style="font-size: 0.95rem; color: var(--text-muted); max-width: 500px; margin: 0 auto; line-height: 1.4;">
          El punto de encuentro de los mánagers de CastigosFantasy. Selecciona la sección a la que deseas acceder.
        </p>
      </div>

      <!-- Options Grid -->
      <div class="brutalist-grid-2" style="max-width: 900px; margin: 0 auto; gap: 2rem;">
        
        <!-- Foro Card -->
        <article class="brutalist-card concrete-bg" id="comunidad-foro-card" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; min-height: 260px; position: relative;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">Foro de Mánagers</h2>
              <span class="material-symbols-outlined" style="font-size: 2rem;">forum</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-light); line-height: 1.5; margin-bottom: 1.5rem;">
              Debates, estrategias de fichajes, quejas sobre arbitraje y compra-venta de jugadores con el resto de la comunidad.
            </p>
          </div>
          <button class="brutalist-btn" style="margin-top: auto; pointer-events: none; width: 100%;">
            Entrar al Foro <span class="material-symbols-outlined" style="font-size: 1.2rem;">chevron_right</span>
          </button>
        </article>

        <!-- El Bufón Card (Active) -->
        <article class="brutalist-card concrete-bg" id="comunidad-bufon-card" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; min-height: 260px; position: relative;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">El Bufón de la Corte</h2>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-light); line-height: 1.5; margin-bottom: 1.5rem;">
              Vota por el peor futbolista de LaLiga en la jornada: el que menos puntos ha dado en el fantasy, del que más se esperaba y menos ha hecho.
            </p>
          </div>
          <button class="brutalist-btn" style="margin-top: auto; pointer-events: none; width: 100%;">
            Entrar a la Corte <span class="material-symbols-outlined" style="font-size: 1.2rem;">chevron_right</span>
          </button>
        </article>

      </div>
    </div>
  `;

  // Attach event listeners
  const bufonCard = container.querySelector('#comunidad-bufon-card');
  if (bufonCard) {
    bufonCard.addEventListener('click', () => {
      if (callbacks.onNavigate) {
        callbacks.onNavigate('bufon');
      }
    });
  }

  const foroCard = container.querySelector('#comunidad-foro-card');
  if (foroCard) {
    foroCard.addEventListener('click', () => {
      if (callbacks.onNavigate) {
        callbacks.onNavigate('foro');
      }
    });
  }
}
