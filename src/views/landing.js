import { supabase, isConfigured } from '../supabase';

/**
 * Renders the stunning, modern Landing/Home Page.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 */
export function renderLanding(container, callbacks) {
  let currentUser = null;
  let leagues = [];
  let activeLeagueId = null;
  let activeLeagueName = '';
  let leaderboard = [];

  const isGuest = localStorage.getItem('CF_GUEST_MODE') === 'true';

  async function loadData() {
    if (isGuest || !isConfigured) {
      renderView();
      return;
    }

    try {
      const session = supabase.auth.session ? supabase.auth.session() : null;
      currentUser = session?.user || (await supabase.auth.getUser()).data.user;

      if (currentUser) {
        // Fetch memberships with league names
        const { data: memberships } = await supabase
          .from('league_members')
          .select(`
            league_id,
            leagues (
              name
            )
          `)
          .eq('profile_id', currentUser.id);

        if (memberships && memberships.length > 0) {
          leagues = memberships.map(m => ({
            id: m.league_id,
            name: m.leagues?.name || 'Mi Liga'
          }));

          activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
          const hasActive = leagues.some(l => l.id === activeLeagueId);
          if (!activeLeagueId || !hasActive) {
            activeLeagueId = leagues[0].id;
            localStorage.setItem('CF_ACTIVE_LEAGUE_ID', activeLeagueId);
            localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', leagues[0].name);
          }
          const activeLeague = leagues.find(l => l.id === activeLeagueId);
          activeLeagueName = activeLeague ? activeLeague.name : 'Mi Liga';

          // Fetch members for active league
          const { data: membersList } = await supabase
            .from('league_members')
            .select(`
              profile_id,
              profiles (
                apodo,
                display_name
              )
            `)
            .eq('league_id', activeLeagueId);

          // Fetch records for active league
          const { data: recordsList } = await supabase
            .from('matchday_records')
            .select('loser_profile_id, amount_owed')
            .eq('league_id', activeLeagueId);

          if (membersList) {
            const mappedList = membersList.map(m => ({
              profile_id: m.profile_id,
              display_name: m.profiles?.apodo || m.profiles?.display_name || 'Desconocido'
            }));

            leaderboard = mappedList.map(m => {
              const userRecords = (recordsList || []).filter(r => r.loser_profile_id === m.profile_id);
              const totalOwed = userRecords.reduce((sum, r) => sum + Number(r.amount_owed), 0);
              return {
                name: m.display_name,
                totalOwed
              };
            });

            // Sort by debt desc and slice to top 3
            leaderboard.sort((a, b) => b.totalOwed - a.totalOwed);
            leaderboard = leaderboard.slice(0, 3);
          }
        }
      }
    } catch (err) {
      console.error('Error loading landing page dynamic data:', err);
    }

    renderView();
  }

  function renderView() {
    const hasLeagues = currentUser && leagues.length > 0;

    // Render HTML structure matching the Stitch design
    container.innerHTML = `
      <div class="landing-layout-brutalist fade-in-up">
        <!-- Contenido principal -->
        <main class="brutalist-main">
          <!-- Hero Intro -->
          <section class="brutalist-hero">
            <h1 class="brutalist-hero-title">Hablar es gratis. Quedar último no.</h1>
            <p class="brutalist-hero-subtitle">
              Sigue la jornada, vota al bufón y descubre quién debe pasar por caja esta semana.
            </p>
            <div style="margin-top: 1.5rem;">
              <button id="hero-create-league-btn" style="
                font-family: var(--font-display);
                font-weight: 900;
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: -0.5px;
                background: var(--accent);
                color: #000000;
                border: 3px solid #000000;
                padding: 0.75rem 2rem;
                cursor: pointer;
                box-shadow: 5px 5px 0px 0px #000000;
                transition: transform 0.1s ease, box-shadow 0.1s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
              "
              onmouseover="this.style.transform='translate(-2px,-2px)'; this.style.boxShadow='7px 7px 0px 0px #000000';"
              onmouseout="this.style.transform=''; this.style.boxShadow='5px 5px 0px 0px #000000';"
              onmousedown="this.style.transform='translate(3px,3px)'; this.style.boxShadow='0px 0px 0px #000000';"
              onmouseup="this.style.transform='translate(-2px,-2px)'; this.style.boxShadow='7px 7px 0px 0px #000000';"
              >
                ${hasLeagues ? `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                    <line x1="3" y1="12" x2="15" y2="12"></line>
                  </svg>
                  Inspeccionar Liga
                ` : `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                  Firmar el Contrato
                `}
              </button>
            </div>
          </section>

          <!-- ===== NIVEL 2: Esta jornada ===== -->
          <section class="landing-tier">
            <div class="tier-header">
              <h2 class="tier-title">Esta jornada</h2>
              <span class="tier-sub">Lo que está en juego ahora mismo</span>
            </div>

          <div class="brutalist-grid-2">
            <!-- Lista de Morosos Card -->
            <article class="brutalist-card concrete-bg" id="morosos-card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="margin-bottom: 1.5rem;">
                  <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">Lista de Morosos</h2>
                </div>
                ${hasLeagues ? `
                  <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem; font-weight: bold;">
                    Liga Activa: ${escapeHTML(activeLeagueName)}
                  </p>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0; margin-bottom: 1rem;">
                    ${leaderboard.length === 0 ? `
                      <li style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem 0;">No hay deudas registradas.</li>
                    ` : leaderboard.map((item, idx) => `
                      <li style="background: var(--bg-obsidian); display: flex; justify-content: space-between; padding: 0.65rem 0.85rem; border: 3px solid #000000;">
                        <span style="font-family: var(--font-sans); font-weight: 700; font-size: 0.8rem; color: var(--text-light);">${idx + 1}. ${escapeHTML(item.name)}</span>
                        <span style="font-family: var(--font-sans); font-weight: 800; color: ${item.totalOwed === 0 ? '#30d158' : (idx === 0 || item.totalOwed >= 20 ? '#ff453a' : '#ffd60a')}; font-size: 0.8rem; text-shadow: 0 0 10px ${item.totalOwed === 0 ? 'rgba(48,209,88,0.2)' : (idx === 0 || item.totalOwed >= 20 ? 'rgba(255,69,58,0.2)' : 'rgba(255,214,10,0.2)')};">${item.totalOwed.toFixed(2)}€</span>
                      </li>
                    `).join('')}
                  </ul>
                ` : `
                  <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                    Sigue el saldo del bote común, las deudas de cada jornada y el historial de castigos de tu liga.
                  </p>
                `}
              </div>
              
              <div>
                ${hasLeagues ? `
                  <button class="brutalist-btn" id="btn-go-morosos" style="width: 100%; margin-top: auto; margin-bottom: 0.75rem;">
                    Exponer a los Morosos
                  </button>
                  ${leagues.length > 1 ? `
                    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; margin-top: 0.75rem;">
                      <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem; font-weight: 700; text-transform: uppercase;">Cambiar de Liga:</span>
                      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${leagues.map(l => {
                          if (l.id === activeLeagueId) return '';
                          return `
                            <button class="btn-switch-league-landing" data-id="${l.id}" data-name="${l.name}" style="
                              background: rgba(255,255,255,0.03);
                              color: var(--text-light);
                              border: 1px solid var(--border-color);
                              font-size: 0.7rem;
                              padding: 0.3rem 0.6rem;
                              border-radius: 4px;
                              cursor: pointer;
                              font-weight: 600;
                              transition: var(--transition-fast);
                            ">${escapeHTML(l.name)}</button>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  ` : ''}
                ` : `
                  <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem;">
                    <button class="brutalist-btn" id="landing-join-league-btn" style="font-size: 0.8rem; width: 100%;">
                      Firmar Contrato de Liga
                    </button>
                  </div>
                `}
              </div>
            </article>

            <!-- El Bufón de la Corte Card -->
            <article class="brutalist-card concrete-bg" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 1rem;">
                  <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase; margin: 0;">El Bufón de la Corte</h2>
                  <span class="brutalist-badge" style="background: rgba(222,237,0,0.12); color: var(--accent); border-color: rgba(222,237,0,0.3);">Vota</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-light); opacity: 0.85; line-height: 1.45; margin-bottom: 1.25rem;">
                  Señala al peor futbolista de la jornada. Quien dé menos puntos en el fantasy paga las consecuencias.
                </p>
              </div>
              <button class="brutalist-btn" id="landing-bufon-btn" style="width: 100%;">
                Juzgar a un Jugador
              </button>
            </article>
          </div>

          <!-- Grid Content: Row 2 (Full Width) -->
          <article class="brutalist-card" style="display: flex; flex-direction: column; gap: 1.5rem; position: relative; overflow: visible;">
            <div style="position: absolute; top: -12px; right: -12px; z-index: 10;">
              <span class="brutalist-badge" style="transform: rotate(4deg);">NUEVO</span>
            </div>
            <div style="max-width: 85%;">
              <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.75rem; line-height: 1;">El Reto de la Semana</h2>
              <p style="font-size: 1.05rem; color: var(--text-light); line-height: 1.5; border-left: 6px solid var(--primary-green); padding-left: 1rem; margin-bottom: 1.5rem;">
                Vota por los tres castigos exclusivos de esta semana.
              </p>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="brutalist-btn" style="width: auto; padding: 0.65rem 1.75rem;" id="landing-retos-btn-accept">Votar</button>
                <button class="brutalist-btn brutalist-btn-secondary" style="width: auto; padding: 0.65rem 1.75rem;" id="landing-retos-btn-details">Leer el Acta</button>
              </div>
            </div>
          </article>

          </section>

          <!-- ===== NIVEL 3: Herramientas y juegos ===== -->
          <section class="landing-tier">
            <div class="tier-header">
              <h2 class="tier-title">Herramientas y juegos</h2>
              <span class="tier-sub">Para amenizar la espera</span>
            </div>

            <div class="landing-tools-grid">
              <!-- Ruleta de Sentencias -->
              <button class="tool-card-btn" id="landing-ruleta-btn">
                <div class="tool-card-inner">
                  <div class="tool-card-icon-wrap" style="background: var(--danger);">
                    <span class="material-symbols-outlined" style="font-size: 1.9rem; color: #ffffff;">casino</span>
                  </div>
                  <div class="tool-card-text">
                    <h3 class="tool-card-title">Ruleta de Sentencias</h3>
                    <p class="tool-card-desc">Gira y acepta tu condena.</p>
                  </div>
                  <span class="material-symbols-outlined tool-card-arrow">arrow_forward</span>
                </div>
              </button>

              <!-- Generador de Castigos -->
              <button class="tool-card-btn" id="landing-generador-btn">
                <div class="tool-card-inner">
                  <div class="tool-card-icon-wrap" style="background: var(--accent);">
                    <span class="material-symbols-outlined" style="font-size: 1.9rem; color: #000000;">bolt</span>
                  </div>
                  <div class="tool-card-text">
                    <h3 class="tool-card-title">Generador de Castigos</h3>
                    <p class="tool-card-desc">Inteligencia artificial del dolor.</p>
                  </div>
                  <span class="material-symbols-outlined tool-card-arrow">arrow_forward</span>
                </div>
              </button>

              <!-- Juegos -->
              <button class="tool-card-btn" id="landing-juegos-btn">
                <div class="tool-card-inner">
                  <div class="tool-card-icon-wrap" style="background: var(--primary-green);">
                    <span class="material-symbols-outlined" style="font-size: 1.9rem; color: #000000;">sports_esports</span>
                  </div>
                  <div class="tool-card-text">
                    <h3 class="tool-card-title">Juegos</h3>
                    <p class="tool-card-desc">Adivina el jugador, Top 10 y más.</p>
                  </div>
                  <span class="material-symbols-outlined tool-card-arrow">arrow_forward</span>
                </div>
              </button>

              <!-- Muro de la Vergüenza -->
              <button class="tool-card-btn" id="landing-muro-btn">
                <div class="tool-card-inner">
                  <div class="tool-card-icon-wrap" style="background: #ffffff;">
                    <span class="material-symbols-outlined" style="font-size: 1.9rem; color: #000000;">photo_camera</span>
                  </div>
                  <div class="tool-card-text">
                    <h3 class="tool-card-title">Muro de la Vergüenza</h3>
                    <p class="tool-card-desc">Sube la prueba de tus castigos.</p>
                  </div>
                  <span class="material-symbols-outlined tool-card-arrow">arrow_forward</span>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>
    `;

    // Attach Event Listeners to buttons and navigation elements
    const btnGoMorosos = container.querySelector('#btn-go-morosos');
    if (btnGoMorosos) {
      btnGoMorosos.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
          if (leagues.length > 0) {
            callbacks.onNavigate('muro');
          } else {
            callbacks.onNavigate('mis-ligas');
          }
        } else {
          callbacks.onNavigate('acceso');
        }
      });
    }

    const joinLeagueBtn = container.querySelector('#landing-join-league-btn');
    if (joinLeagueBtn) {
      joinLeagueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onNavigate('mis-ligas');
      });
    }

    const switchBtns = container.querySelectorAll('.btn-switch-league-landing');
    switchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', id);
        localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', name);
        callbacks.showToast(`Cambiado a la liga: ${name}`, 'success');
        loadData();
      });
    });

    const juegosBtn = container.querySelector('#landing-juegos-btn');
    if (juegosBtn) {
      juegosBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (callbacks.onNavigate) callbacks.onNavigate('juegos');
      });
    }

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

    const muroBtn = container.querySelector('#landing-muro-btn');
    if (muroBtn) {
      muroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (callbacks.onNavigate) callbacks.onNavigate('muro-verguenza');
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

    const heroCreateBtn = container.querySelector('#hero-create-league-btn');
    if (heroCreateBtn) {
      heroCreateBtn.addEventListener('click', () => {
        if (callbacks.onNavigate) {
          if (hasLeagues) {
            callbacks.onNavigate('menu-liga');
          } else {
            callbacks.onNavigate('mis-ligas');
          }
        }
      });
    }
  }

  loadData();
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

