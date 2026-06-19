import { supabase } from '../supabase';

/**
 * Renders the Menu / Hub screen for an active league.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderLeagueHub(container, callbacks) {
  const isGuest = callbacks.isGuest;

  if (isGuest) {
    callbacks.showToast('Debes iniciar sesión para acceder a esta sección', 'warning');
    callbacks.onNavigate('acceso');
    return;
  }

  const leagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  const leagueName = localStorage.getItem('CF_ACTIVE_LEAGUE_NAME') || 'Mi Liga';
  const leagueFeatures = localStorage.getItem('CF_CURRENT_LEAGUE_FEATURES') || 'both';

  if (!leagueId) {
    callbacks.showToast('Selecciona una liga primero', 'info');
    callbacks.onNavigate('mis-ligas');
    return;
  }

  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 800px;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Liga Activa</span>
          <h1 class="gradient-text-green" style="font-size: 2.2rem; font-weight: 900; margin-top: 0.25rem;">
            🏆 ${leagueName}
          </h1>
        </div>
        <button id="btn-back-to-selector" class="btn-secondary" style="width: auto; padding: 0.65rem 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Mis Ligas
        </button>
      </div>

      <!-- Hub Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
        <!-- Card Muro de la Vergüenza -->
        <div id="card-go-dashboard" class="card glass" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; border-radius: 16px; border: 1.5px solid var(--border-color); padding: 2rem 1.5rem; transition: all var(--transition-fast);">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">💀</div>
            <h2 class="card-title gradient-text-gold" style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.75rem;">Muro de la Vergüenza</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Ver el ranking acumulado de la jornada, las deudas de los jugadores y registrar el farolillo rojo de la última jornada.
            </p>
          </div>
          <button class="btn-primary" style="pointer-events: none; font-weight: 700; width: 100%;">Entrar al Muro</button>
        </div>

        <!-- Card Ruleta de Castigos -->
        <div id="card-go-roulette" class="card glass ${leagueFeatures === 'money' ? 'disabled-card' : ''}" style="
          cursor: ${leagueFeatures === 'money' ? 'not-allowed' : 'pointer'};
          opacity: ${leagueFeatures === 'money' ? '0.5' : '1'};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 16px;
          border: 1.5px solid ${leagueFeatures === 'money' ? 'var(--border-color)' : 'var(--border-color-glow)'};
          padding: 2rem 1.5rem;
          transition: all var(--transition-fast);
        ">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">🎯</div>
            <h2 class="card-title" style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.75rem; color: var(--primary);">Ruleta de Castigos</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              ${leagueFeatures === 'money' 
                ? 'Desactivado. La ruleta de castigos no está activa en la configuración actual de esta liga.' 
                : 'Girar la ruleta para asignar castigos aleatorios a los perdedores y gestionar la lista oficial de retos de tu comunidad.'}
            </p>
          </div>
          <button class="btn-secondary" style="
            pointer-events: none;
            font-weight: 700;
            width: 100%;
            border-color: ${leagueFeatures === 'money' ? 'var(--border-color)' : 'var(--primary)'};
            color: ${leagueFeatures === 'money' ? 'var(--text-muted)' : 'var(--text-light)'};
          ">
            ${leagueFeatures === 'money' ? 'No disponible' : 'Ir a la Ruleta'}
          </button>
        </div>

        <!-- Card El Bufón de la Jornada -->
        <div id="card-go-bufon" class="card glass" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; border-radius: 16px; border: 1.5px solid var(--border-color); padding: 2rem 1.5rem; transition: all var(--transition-fast);">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">🎭</div>
            <h2 class="card-title gradient-text-gold" style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.75rem;">El Bufón</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Nominar y votar al futbolista de la jornada con peor actuación en tu liga y participar en el sorteo de la camiseta réplica.
            </p>
          </div>
          <button class="btn-primary" style="pointer-events: none; font-weight: 700; width: 100%;">Votar Bufón</button>
        </div>
      </div>
    </div>
  `;

  // Attach card hover styling manually to avoid bloating stylesheet
  const cardDash = container.querySelector('#card-go-dashboard');
  const cardRoulette = container.querySelector('#card-go-roulette');
  const cardBufon = container.querySelector('#card-go-bufon');

  if (cardDash) {
    cardDash.addEventListener('mouseenter', () => {
      cardDash.style.transform = 'translateY(-4px)';
      cardDash.style.borderColor = 'var(--accent)';
      cardDash.style.boxShadow = '0 8px 30px rgba(var(--accent-rgb), 0.15)';
    });
    cardDash.addEventListener('mouseleave', () => {
      cardDash.style.transform = 'translateY(0)';
      cardDash.style.borderColor = 'var(--border-color)';
      cardDash.style.boxShadow = 'none';
    });
    cardDash.addEventListener('click', () => {
      callbacks.onNavigate('muro');
    });
  }

  if (cardRoulette && leagueFeatures !== 'money') {
    cardRoulette.addEventListener('mouseenter', () => {
      cardRoulette.style.transform = 'translateY(-4px)';
      cardRoulette.style.borderColor = 'var(--primary)';
      cardRoulette.style.boxShadow = '0 8px 30px rgba(var(--primary-rgb), 0.15)';
    });
    cardRoulette.addEventListener('mouseleave', () => {
      cardRoulette.style.transform = 'translateY(0)';
      cardRoulette.style.borderColor = 'var(--border-color-glow)';
      cardRoulette.style.boxShadow = 'none';
    });
    cardRoulette.addEventListener('click', () => {
      callbacks.onNavigate('ruleta');
    });
  }

  if (cardBufon) {
    cardBufon.addEventListener('mouseenter', () => {
      cardBufon.style.transform = 'translateY(-4px)';
      cardBufon.style.borderColor = 'var(--accent)';
      cardBufon.style.boxShadow = '0 8px 30px rgba(var(--accent-rgb), 0.15)';
    });
    cardBufon.addEventListener('mouseleave', () => {
      cardBufon.style.transform = 'translateY(0)';
      cardBufon.style.borderColor = 'var(--border-color)';
      cardBufon.style.boxShadow = 'none';
    });
    cardBufon.addEventListener('click', () => {
      callbacks.onNavigate('bufon');
    });
  }

  // Back selector button
  const backBtn = container.querySelector('#btn-back-to-selector');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      callbacks.onNavigate('mis-ligas');
    });
  }
}
