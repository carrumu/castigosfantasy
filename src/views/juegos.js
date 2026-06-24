/**
 * Renders the Juegos hub page.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 */
export function renderJuegos(container, callbacks) {
  let currentStreak = 0;
  try {
    const stats = JSON.parse(localStorage.getItem('CF_WORDLE_STATS') || 'null');
    if (stats && typeof stats.currentStreak === 'number') {
      currentStreak = stats.currentStreak;
    }
  } catch (_) {}

  container.innerHTML = `
    <div class="container fade-in-up">

      <!-- Header -->
      <div style="margin-bottom: 1.5rem;">
        <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Entretenimiento</span>
        <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: clamp(1.8rem, 8vw, 2.4rem); font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.15rem 0 0;">
          Juegos
        </h1>
      </div>

      <!-- Games Cards Grid -->
      <div class="tools-grid">

        <!-- Adivina el Jugador Card (Active) -->
        <button id="game-adivina-btn" class="tool-card-btn" style="position: relative; overflow: hidden; display: flex; flex-direction: column;">
          <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(222, 237, 0, 0.12); border: 1.5px solid var(--accent); color: var(--accent); font-size: 1.05rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 20px; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 0 12px rgba(222,237,0,0.25); line-height: 1; font-family: var(--font-sans); z-index: 10;">
            <span>🔥</span><span>${currentStreak}</span>
          </div>
          
          <!-- Real Mini Wordle Board HTML Preview -->
          <div style="width: 100%; height: 160px; border-bottom: 3px solid #000000; background: var(--bg-obsidian); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 1rem; box-sizing: border-box; position: relative;">
            <div style="display: grid; grid-template-rows: repeat(3, 1fr); gap: 4px;">
              <!-- Row 1: PEDRI -->
              <div style="display: grid; grid-template-columns: repeat(5, 26px); gap: 4px;">
                <div style="width: 26px; height: 26px; border: 2px solid #deed00; background: #deed00; color: #000000; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">P</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">E</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">D</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">R</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">I</div>
              </div>

              <!-- Row 2: YAMAL -->
              <div style="display: grid; grid-template-columns: repeat(5, 26px); gap: 4px;">
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">Y</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">A</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">M</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">A</div>
                <div style="width: 26px; height: 26px; border: 2px solid #000000; background: #333333; color: #aaaaaa; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">L</div>
              </div>

              <!-- Row 3: ASPAS -->
              <div style="display: grid; grid-template-columns: repeat(5, 26px); gap: 4px;">
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">A</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">S</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">P</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">A</div>
                <div style="width: 26px; height: 26px; border: 2px solid #22c55e; background: #22c55e; color: #ffffff; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px #000; border-radius: 5px;">S</div>
              </div>
            </div>
          </div>

          <div class="tool-card-inner" style="padding: 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; justify-content: space-between;">
            <div class="tool-card-text">
              <h2 class="tool-card-title" style="margin-bottom: 0.35rem;">Adivina el Jugador</h2>
              <p class="tool-card-desc">El Wordle diario de LaLiga. Adivina el jugador secreto de Primera División en 6 intentos.</p>
            </div>
            <div class="tool-card-arrow" style="align-self: flex-end;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- LaLiga Top 10 Card (Active) -->
        <button id="game-top10-btn" class="tool-card-btn" style="overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- Real Mini Top 10 Board HTML Preview -->
          <div style="width: 100%; height: 160px; border-bottom: 3px solid #000000; background: var(--bg-obsidian); display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 1rem; box-sizing: border-box; overflow: hidden; position: relative;">
            <!-- Row 1 -->
            <div style="background: var(--bg-card); border: 1.5px solid var(--primary-green); border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; font-size: 0.72rem; box-shadow: 2px 2px 0px #000; width: 100%; box-sizing: border-box;">
              <span style="font-weight: 900; color: var(--primary-green); margin-right: 4px;">1.</span>
              <img src="https://flagcdn.com/w20/ar.png" style="width: 16px; height: auto; border-radius: 2px; margin-right: 6px;" alt="AR" />
              <span style="font-weight: 800; color: var(--text-light); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">Lionel Messi</span>
            </div>
            <!-- Row 2 -->
            <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; font-size: 0.72rem; box-shadow: 2px 2px 0px #000; width: 100%; box-sizing: border-box;">
              <span style="font-weight: 900; color: var(--text-muted); margin-right: 4px;">2.</span>
              <img src="https://flagcdn.com/w20/pt.png" style="width: 16px; height: auto; border-radius: 2px; margin-right: 6px;" alt="PT" />
              <span style="font-weight: 800; color: var(--text-muted); opacity: 0.25; letter-spacing: 1px;">???????????</span>
            </div>
            <!-- Row 3 -->
            <div style="background: var(--bg-card); border: 1.5px solid var(--primary-green); border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; font-size: 0.72rem; box-shadow: 2px 2px 0px #000; width: 100%; box-sizing: border-box;">
              <span style="font-weight: 900; color: var(--primary-green); margin-right: 4px;">3.</span>
              <img src="https://flagcdn.com/w20/es.png" style="width: 16px; height: auto; border-radius: 2px; margin-right: 6px;" alt="ES" />
              <span style="font-weight: 800; color: var(--text-light); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">Telmo Zarra</span>
            </div>
            <!-- Input mock -->
            <div style="display: flex; gap: 4px; margin-top: 2px; width: 100%; box-sizing: border-box;">
              <div style="flex-grow: 1; border: 1.5px solid #000; background: var(--bg-obsidian); height: 22px; border-radius: 4px; display: flex; align-items: center; padding-left: 6px; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; box-shadow: 2px 2px 0px #000; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                Escribe aquí...
              </div>
              <div style="width: 24px; height: 22px; border: 1.5px solid #000; background: #ffe16d; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; box-shadow: 2px 2px 0px #000; flex-shrink: 0;">
                🏳️
              </div>
            </div>
          </div>

          <div class="tool-card-inner" style="padding: 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; justify-content: space-between;">
            <div class="tool-card-text">
              <h2 class="tool-card-title" style="margin-bottom: 0.35rem;">LaLiga Top 10</h2>
              <p class="tool-card-desc">¿Adivinarás el Top 10 histórico? Responde las preguntas diarias sobre goleadores, partidos y clubes.</p>
            </div>
            <div class="tool-card-arrow" style="align-self: flex-end;">
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

  container.querySelector('#game-top10-btn').addEventListener('click', () => {
    if (callbacks.onNavigate) callbacks.onNavigate('top-10');
  });
}
