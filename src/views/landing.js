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
            const mappedMembers = mappedMembers => mappedMembers; // dummy assignment or mapping
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
                Crea tu Liga
              </button>
            </div>
          </section>

          <!-- Grid Content: Row 1 -->
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
                      <li style="background: var(--bg-obsidian); display: flex; justify-content: space-between; padding: 0.65rem 0.85rem; border: 3px solid #000000; border-left: 6px solid ${idx === 0 ? 'var(--danger)' : 'var(--accent)'};">
                        <span style="font-family: var(--font-sans); font-weight: 700; font-size: 0.8rem; color: var(--text-light);">${idx + 1}. ${escapeHTML(item.name)}</span>
                        <span style="font-family: var(--font-sans); font-weight: 800; color: ${idx === 0 ? 'var(--danger)' : 'var(--text-light)'}; font-size: 0.8rem;">${item.totalOwed.toFixed(2)}€</span>
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
                    Ver Lista Completa
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
                      Crear o Unirse a Liga
                    </button>
                  </div>
                `}
              </div>
            </article>

            <!-- Ruleta de Castigos Card -->
            <article class="brutalist-card" style="background: var(--primary-green); color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
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
                <button class="brutalist-btn brutalist-btn-secondary" style="width: auto; padding: 0.65rem 1.75rem;" id="landing-retos-btn-details">Ver Detalles</button>
              </div>
            </div>
          </article>

          <!-- Grid Content: Row 3 -->
          <div class="brutalist-grid-2">
            <!-- Juegos Card -->
            <article class="brutalist-card" id="juegos-card" style="display: flex; flex-direction: column; gap: 1rem; justify-content: space-between; cursor: pointer;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 0.5rem;">
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">Juegos</h2>
              </div>
              
              <!-- Miniature Grid of Available Games -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin: 0.5rem 0;">
                <!-- Game 1: Adivina el Jugador -->
                <div style="background: var(--bg-obsidian); border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; padding: 0.5rem; text-align: center; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px;">
                  <span class="material-symbols-outlined" style="font-size: 1.5rem; color: var(--accent); margin-bottom: 0.25rem;">sports_esports</span>
                  <span style="font-family: var(--font-sans); font-size: 0.6rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; line-height: 1.1; letter-spacing: 0.5px;">Adivina el Jugador</span>
                </div>
                <!-- Game 2: LaLiga Top 10 -->
                <div style="background: var(--bg-obsidian); border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; padding: 0.5rem; text-align: center; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px;">
                  <span class="material-symbols-outlined" style="font-size: 1.5rem; color: #ffe16d; margin-bottom: 0.25rem;">emoji_events</span>
                  <span style="font-family: var(--font-sans); font-size: 0.6rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; line-height: 1.1; letter-spacing: 0.5px;">LaLiga Top 10</span>
                </div>
                <!-- Game 3: Trivia de Castigos -->
                <div style="background: var(--bg-obsidian); border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; padding: 0.5rem; text-align: center; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px; opacity: 0.75;">
                  <span class="material-symbols-outlined" style="font-size: 1.5rem; color: var(--primary-green); margin-bottom: 0.25rem;">help</span>
                  <span style="font-family: var(--font-sans); font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; line-height: 1.1; letter-spacing: 0.5px;">Trivia de Castigos</span>
                </div>
                <!-- Game 4: Penaltis Fantasy -->
                <div style="background: var(--bg-obsidian); border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; padding: 0.5rem; text-align: center; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px; opacity: 0.75;">
                  <span class="material-symbols-outlined" style="font-size: 1.5rem; color: var(--danger); margin-bottom: 0.25rem;">sports_soccer</span>
                  <span style="font-family: var(--font-sans); font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; line-height: 1.1; letter-spacing: 0.5px;">Penaltis Fantasy</span>
                </div>
              </div>

              <button class="brutalist-btn" id="landing-juegos-btn" style="width: 100%; margin-top: auto;">
                Ver Juegos Disponibles
              </button>
            </article>

            <!-- Generador de Castigos Card -->
            <article class="brutalist-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
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

          <!-- Row 4 (Full Width): El Bufón (Only rendered if Ruleta is active, so we show all 5 modules) -->
          <article class="brutalist-card" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000000; padding-bottom: 0.75rem; margin-bottom: 0.5rem;">
              <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">El Bufón de la Corte</h2>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-light); line-height: 1.4;">
              La comunidad manda. Señala y vota al peor futbolista de LaLiga en la jornada: el que menos puntos ha dado en el fantasy, del que más se esperaba y menos ha hecho.
            </p>
            <button class="brutalist-btn brutalist-btn-secondary" id="landing-bufon-btn" style="width: auto; padding: 0.65rem 1.75rem; margin-top: 0.5rem; align-self: flex-start;">Entrar a la Corte</button>
          </article>
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

    const juegosCard = container.querySelector('#juegos-card');
    if (juegosCard) {
      juegosCard.addEventListener('click', () => {
        if (callbacks.onNavigate) callbacks.onNavigate('juegos');
      });
    }

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
        if (callbacks.onNavigate) callbacks.onNavigate('mis-ligas');
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

