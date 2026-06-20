/**
 * Renders the stunning, modern Landing/Home Page.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 */
export function renderLanding(container, callbacks) {
  // Check active features from localStorage (same as main.js)
  const activeFeatures = localStorage.getItem('CF_CURRENT_LEAGUE_FEATURES') || 'both';
  const showRuleta = activeFeatures !== 'money';

  // Render HTML structure matching the Stitch design
  container.innerHTML = `
    <div class="landing-layout-brutalist fade-in-up">
      <!-- Columna izquierda: PUBLICIDAD -->
      <aside class="brutalist-aside">
        <div class="ad-card-left">
          <div class="ad-label">PUB<br/>LICI<br/>DAD</div>
        </div>
        <div class="ad-card-sponsor">
          <span class="material-symbols-outlined" style="font-size: 3.5rem; margin-bottom: 0.75rem; color: #000000;">sports_football</span>
          <p style="font-family: var(--font-sans); font-weight: 800; font-size: 0.9rem; text-transform: uppercase;">Patrocinador Oficial del Sufrimiento</p>
        </div>
      </aside>

      <!-- Columna central: CONTENIDO PRINCIPAL -->
      <main class="brutalist-main">
        <!-- Hero Intro -->
        <section class="brutalist-hero">
          <h1 class="brutalist-hero-title">Hablar es gratis. Quedar último no.</h1>
          <p class="brutalist-hero-subtitle">
            Sigue la jornada, vota al bufón y descubre quién debe pasar por caja esta semana.
          </p>
        </section>

        <!-- Grid Content: Row 1 -->
        <div class="brutalist-grid-2">
          <!-- Lista de Morosos Card -->
          <article class="brutalist-card concrete-bg cursor-pointer" data-view-id="muro">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <span class="material-symbols-outlined" style="font-size: 2rem; color: var(--accent);">gavel</span>
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">Lista de Morosos</h2>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-light); margin-bottom: 1.5rem;">Los últimos sentenciados que no lograron escapar del destino.</p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0;">
              <li style="background: var(--bg-obsidian); display: flex; justify-content: space-between; padding: 0.75rem 1rem; border: 3px solid #000000; border-left: 6px solid var(--danger);">
                <span style="font-family: var(--font-sans); font-weight: 700; font-size: 0.8rem; color: var(--text-light);">PERDEDOR #142</span>
                <span style="font-family: var(--font-sans); font-weight: 800; color: var(--danger); font-size: 0.8rem; text-transform: uppercase;">DEPILACIÓN</span>
              </li>
              <li style="background: var(--bg-obsidian); display: flex; justify-content: space-between; padding: 0.75rem 1rem; border: 3px solid #000000; border-left: 6px solid var(--danger);">
                <span style="font-family: var(--font-sans); font-weight: 700; font-size: 0.8rem; color: var(--text-light);">PERDEDOR #141</span>
                <span style="font-family: var(--font-sans); font-weight: 800; color: var(--danger); font-size: 0.8rem; text-transform: uppercase;">TATUAJE FALSO</span>
              </li>
            </ul>
          </article>

          ${showRuleta ? `
            <!-- Ruleta de Castigos Card -->
            <article class="brutalist-card cursor-pointer" data-view-id="ruleta" style="background: var(--primary-green); color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1.5rem; line-height: 1;">Ruleta de Sentencias</h2>
              
              <!-- Mock Wheel Graphic -->
              <div style="width: 120px; height: 120px; border-radius: 50%; border: 6px solid #000000; margin-bottom: 1.5rem; position: relative; overflow: hidden; background: #ffffff; box-shadow: inset 0px 0px 10px rgba(0,0,0,0.5);">
                <div style="position: absolute; inset: 0; background: var(--danger); clip-path: polygon(50% 50%, 100% 0, 100% 100%);"></div>
                <div style="position: absolute; inset: 0; background: #ffe16d; clip-path: polygon(50% 50%, 0 100%, 0 0);"></div>
                <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 4px; height: 20px; background: #000000; z-index: 20;"></div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10;">
                  <span style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 900; color: #000000; opacity: 0.25;">?</span>
                </div>
              </div>

              <button class="brutalist-btn brutalist-btn-black" id="landing-ruleta-btn">GIRAR</button>
            </article>
          ` : `
            <!-- El Bufón de la Corte Card (Takes Ruleta's spot if disabled) -->
            <article class="brutalist-card cursor-pointer" data-view-id="bufon" style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 0.5rem;">
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">El Bufón de la Corte</h2>
                <span class="material-symbols-outlined" style="color: var(--accent); font-size: 2rem;">theater_comedy</span>
              </div>
              <p style="font-size: 0.95rem; color: var(--text-light); margin-bottom: 1.5rem; line-height: 1.4;">
                La comunidad manda. Propón castigos graciosos para tus amigos, vota las ideas y condena al peor jugador.
              </p>
              <button class="brutalist-btn" id="landing-bufon-btn" style="margin-top: auto;">Proponer Castigo</button>
            </article>
          `}
        </div>

        <!-- Grid Content: Row 2 (Full Width) -->
        <article class="brutalist-card cursor-pointer" data-view-id="retos" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
            <span class="brutalist-badge">NUEVO</span>
          </div>
          <div style="max-width: 85%;">
            <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.75rem; line-height: 1;">El Reto de la Semana</h2>
            <p style="font-size: 1.05rem; color: var(--text-light); line-height: 1.5; border-left: 6px solid var(--primary-green); padding-left: 1rem; margin-bottom: 1.5rem;">
              Sobrevive a la "Semana Infernal" sin usar a tu mariscal de campo titular. Si pierdes, te enfrentas al castigo supremo.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="brutalist-btn" style="width: auto; padding: 0.65rem 1.75rem;" id="landing-retos-btn-accept">Aceptar Reto</button>
              <button class="brutalist-btn brutalist-btn-secondary" style="width: auto; padding: 0.65rem 1.75rem;" id="landing-retos-btn-details">Ver Detalles</button>
            </div>
          </div>
        </article>

        <!-- Grid Content: Row 3 -->
        <div class="brutalist-grid-2">
          <!-- Adivina el Jugador Card -->
          <article class="brutalist-card cursor-pointer" data-view-id="minijuego" style="display: flex; flex-direction: column; gap: 1rem; justify-content: space-between;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 0.5rem;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">Adivina el Jugador</h2>
              <span class="material-symbols-outlined" style="color: var(--accent); font-size: 2rem;">psychology</span>
            </div>
            
            <!-- Mock Wordle Grid -->
            <div>
              <div class="wordle-row-mock">
                <div class="wordle-cell-mock">P</div>
                <div class="wordle-cell-mock correct">A</div>
                <div class="wordle-cell-mock">T</div>
                <div class="wordle-cell-mock">O</div>
                <div class="wordle-cell-mock">S</div>
              </div>
              <div class="wordle-row-mock">
                <div class="wordle-cell-mock"></div>
                <div class="wordle-cell-mock"></div>
                <div class="wordle-cell-mock"></div>
                <div class="wordle-cell-mock"></div>
                <div class="wordle-cell-mock"></div>
              </div>
            </div>

            <!-- Mock Keyboard -->
            <div>
              <div class="keyboard-row-mock">
                <span class="keyboard-key-mock">Q</span>
                <span class="keyboard-key-mock">W</span>
                <span class="keyboard-key-mock active">E</span>
                <span class="keyboard-key-mock">R</span>
                <span class="keyboard-key-mock">T</span>
                <span class="keyboard-key-mock">Y</span>
                <span class="keyboard-key-mock">U</span>
                <span class="keyboard-key-mock">I</span>
              </div>
            </div>
          </article>

          <!-- Generador de Castigos Card -->
          <article class="brutalist-card cursor-pointer" data-view-id="generador" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
            <div>
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.25rem;">Generador de Castigos</h2>
              <span style="font-family: var(--font-sans); font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Inteligencia Artificial del Dolor</span>
            </div>

            <div style="background: var(--bg-obsidian); border: 3px dashed #474832; padding: 1.25rem; text-align: center; min-height: 90px; display: flex; align-items: center; justify-content: center; margin: 0.5rem 0;">
              <p style="font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700; color: var(--primary-green);">"PASAR EL DÍA DISFRAZADO DE POLLO..."</p>
            </div>

            <button class="brutalist-btn" id="landing-generador-btn">
              Generar Castigo <span class="material-symbols-outlined" style="font-size: 1.2rem;">bolt</span>
            </button>
          </article>
        </div>

        ${showRuleta ? `
          <!-- Row 4 (Full Width): El Bufón (Only rendered if Ruleta is active, so we show all 5 modules) -->
          <article class="brutalist-card cursor-pointer" data-view-id="bufon" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 0.5rem;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">El Bufón de la Corte</h2>
              <span class="material-symbols-outlined" style="color: var(--accent); font-size: 2rem;">theater_comedy</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-light); line-height: 1.4;">
              La comunidad manda. Propón castigos graciosos y originales para tus amigos, vota las ideas del grupo y condena al peor jugador de la jornada.
            </p>
            <button class="brutalist-btn brutalist-btn-secondary" id="landing-bufon-btn" style="width: auto; padding: 0.65rem 1.75rem; margin-top: 0.5rem; align-self: flex-start;">Proponer Castigo</button>
          </article>
        ` : ''}
      </main>

      <!-- Columna derecha: PUBLICIDAD / ADVERTENCIAS -->
      <aside class="brutalist-aside">
        <div class="ad-card-warning">
          <span class="material-symbols-outlined" style="font-size: 3.5rem; margin-bottom: 0.75rem; color: #ffffff;">warning</span>
          <h3 style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; line-height: 1.1;">Advertencia</h3>
          <p style="font-size: 0.85rem; opacity: 0.9; line-height: 1.4;">El contenido de esta liga puede causar pérdida permanente de dignidad.</p>
        </div>
        <div class="ad-card-left" style="flex: 1;">
          <div class="ad-label" style="transform: rotate(5deg);">ESPACIO<br/>DISPO<br/>NIBLE</div>
        </div>
      </aside>
    </div>
  `;

  // Attach Event Listeners to cards
  const cardElements = container.querySelectorAll('.brutalist-card');
  cardElements.forEach(card => {
    card.addEventListener('click', () => {
      const viewId = card.dataset.viewId;
      if (callbacks.onNavigate) {
        callbacks.onNavigate(viewId);
      }
    });
  });

  // Attach Event Listeners to inner buttons with stopPropagation
  const ruletaBtn = container.querySelector('#landing-ruleta-btn');
  if (ruletaBtn) {
    ruletaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks.onNavigate) callbacks.onNavigate('ruleta');
    });
  }

  const bufonBtn = container.querySelector('#landing-bufon-btn');
  if (bufonBtn) {
    bufonBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks.onNavigate) callbacks.onNavigate('bufon');
    });
  }

  const retosAcceptBtn = container.querySelector('#landing-retos-btn-accept');
  if (retosAcceptBtn) {
    retosAcceptBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks.onNavigate) callbacks.onNavigate('retos');
    });
  }

  const retosDetailsBtn = container.querySelector('#landing-retos-btn-details');
  if (retosDetailsBtn) {
    retosDetailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks.onNavigate) callbacks.onNavigate('retos');
    });
  }

  const generadorBtn = container.querySelector('#landing-generador-btn');
  if (generadorBtn) {
    generadorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks.onNavigate) callbacks.onNavigate('generador');
    });
  }
}

