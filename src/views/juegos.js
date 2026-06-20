/**
 * Renders the Juegos hub page.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 */
export function renderJuegos(container, callbacks) {
  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 800px;">

      <!-- Header -->
      <div style="margin-bottom: 2.5rem;">
        <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Entretenimiento</span>
        <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: clamp(1.8rem, 8vw, 2.4rem); font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.15rem 0 0.6rem;">
          Juegos Interactivos
        </h1>
        <p style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500; max-width: 500px; line-height: 1.4;">
          Elige un juego para divertirte, competir con tu liga o pasar el rato mientras esperas la próxima jornada de fútbol.
        </p>
      </div>

      <!-- Games Cards Grid -->
      <div class="tools-grid">

        <!-- Adivina el Jugador Card (Active) -->
        <button id="game-adivina-btn" class="tool-card-btn">
          <div class="tool-card-inner">
            <div class="tool-card-icon-wrap" style="background: var(--accent); color: #000;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="12" x2="10" y2="12"></line>
                <line x1="8" y1="10" x2="8" y2="14"></line>
                <line x1="15" y1="13" x2="15.01" y2="13"></line>
                <line x1="18" y1="11" x2="18.01" y2="11"></line>
                <rect x="2" y="6" width="20" height="12" rx="3"></rect>
              </svg>
            </div>
            <div class="tool-card-text">
              <h2 class="tool-card-title">Adivina el Jugador</h2>
              <p class="tool-card-desc">El Wordle diario de LaLiga. Adivina el jugador secreto de Primera División en 6 intentos.</p>
            </div>
            <div class="tool-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- Trivia Card (Coming Soon) -->
        <button class="tool-card-btn" style="opacity: 0.55; cursor: not-allowed; position: relative;">
          <div style="position: absolute; top: 1rem; right: 1rem; background: var(--bg-item-light); border: 1.5px solid var(--border-color); color: var(--text-muted); font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
            Próximamente
          </div>
          <div class="tool-card-inner">
            <div class="tool-card-icon-wrap" style="background: #2a2a2a; color: var(--text-muted);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="tool-card-text">
              <h2 class="tool-card-title" style="color: var(--text-muted);">Trivias de Castigos</h2>
              <p class="tool-card-desc">Demuestra quién sabe más sobre tu liga y responde trivias rápidas de fútbol.</p>
            </div>
            <div class="tool-card-arrow" style="opacity: 0.3;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- Penaltis Card (Coming Soon) -->
        <button class="tool-card-btn" style="opacity: 0.55; cursor: not-allowed; position: relative;">
          <div style="position: absolute; top: 1rem; right: 1rem; background: var(--bg-item-light); border: 1.5px solid var(--border-color); color: var(--text-muted); font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
            Próximamente
          </div>
          <div class="tool-card-inner">
            <div class="tool-card-icon-wrap" style="background: #2a2a2a; color: var(--text-muted);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div class="tool-card-text">
              <h2 class="tool-card-title" style="color: var(--text-muted);">Penaltis Fantasy</h2>
              <p class="tool-card-desc">Un mini-juego de reflejos rápidos para definir los empates o resolver castigos.</p>
            </div>
            <div class="tool-card-arrow" style="opacity: 0.3;">
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

  container.querySelector('#game-adivina-btn').addEventListener('click', () => {
    if (callbacks.onNavigate) callbacks.onNavigate('adivina-jugador');
  });
}
