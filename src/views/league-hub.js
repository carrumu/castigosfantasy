import { supabase } from '../supabase';
import { openLeagueSettings } from '../utils/league-options';

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
    callbacks.onNavigate('acceso');
    return;
  }

  const leagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  const leagueName = localStorage.getItem('CF_ACTIVE_LEAGUE_NAME') || 'Mi Liga';

  if (!leagueId) {
    callbacks.showToast('Selecciona una liga primero', 'info');
    callbacks.onNavigate('mis-ligas');
    return;
  }

  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 800px;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Liga Activa</span>
          <h1 class="gradient-text-green" style="font-size: 2.2rem; font-weight: 900; margin-top: 0.25rem; margin-bottom: 0;">
            ${leagueName}
          </h1>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button id="btn-league-settings-hub" class="btn-select-league is-active" style="width: auto; padding: 0.65rem 1.25rem; font-weight: 900; display: flex; align-items: center; gap: 0.4rem;">
            Opciones Liga
          </button>
          <button id="btn-back-to-selector" class="btn-select-league" style="width: auto; padding: 0.65rem 1.25rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Mis Ligas
          </button>
        </div>
      </div>

      <!-- Hub Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 1rem;">

        <!-- Card Lista de Morosos -->
        <div id="card-go-dashboard" class="hub-card debt-card">
          <div>
            <span class="hub-card-badge classification">Clasificación</span>
            <h2 class="card-title gradient-text-gold" style="font-size: 1.5rem; font-weight: 900; margin-top: 0.5rem; margin-bottom: 0.75rem; font-family: var(--font-display);">Lista de Morosos</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Ver el ranking acumulado de la jornada, las deudas de los jugadores y registrar el farolillo rojo de la última jornada.
            </p>
          </div>
          <button class="btn-select-league is-active" style="pointer-events: none; width: 100%;">Entrar a la Lista</button>
        </div>

        <!-- Card Ruleta de Castigos -->
        <div id="card-go-roulette" class="hub-card">
          <div>
            <span class="hub-card-badge roulette">Azar & Castigos</span>
            <h2 class="card-title" style="font-size: 1.5rem; font-weight: 900; margin-top: 0.5rem; margin-bottom: 0.75rem; color: var(--primary); font-family: var(--font-display);">Ruleta de Castigos</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Girar la ruleta para asignar castigos aleatorios a los perdedores y gestionar la lista oficial de retos de tu comunidad.
            </p>
          </div>
          <button class="btn-select-league" style="pointer-events: none; width: 100%;">Ir a la Ruleta</button>
        </div>

        <!-- Card El Bufón de la Jornada -->
        <div id="card-go-bufon" class="hub-card">
          <div>
            <span class="hub-card-badge bufon">Votación Semanal</span>
            <h2 class="card-title gradient-text-gold" style="font-size: 1.5rem; font-weight: 900; margin-top: 0.5rem; margin-bottom: 0.75rem; font-family: var(--font-display);">El Bufón</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Nominar y votar al futbolista de la jornada con peor actuación en tu liga y participar en el sorteo de la camiseta réplica.
            </p>
          </div>
          <button class="btn-select-league is-active" style="pointer-events: none; width: 100%;">Votar Bufón</button>
        </div>
      </div>
    </div>
  `;

  // Attach Navigation Listeners
  const cardDash = container.querySelector('#card-go-dashboard');
  const cardRoulette = container.querySelector('#card-go-roulette');
  const cardBufon = container.querySelector('#card-go-bufon');

  if (cardDash) {
    cardDash.addEventListener('click', () => {
      callbacks.onNavigate('muro');
    });
  }

  if (cardRoulette) {
    cardRoulette.addEventListener('click', () => {
      callbacks.onNavigate('ruleta');
    });
  }

  if (cardBufon) {
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

  // Opciones Liga button
  const settingsBtn = container.querySelector('#btn-league-settings-hub');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      openLeagueSettings(leagueId, callbacks);
    });
  }
}
