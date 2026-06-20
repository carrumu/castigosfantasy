import { supabase, isConfigured } from '../supabase';

/**
 * Renders the Weekly Challenges view (Reto Semanal).
 * Includes interactive voting, real-time countdown, completed dares history, and a trash-talk board.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderChallenges(container, callbacks) {
  const isGuest = callbacks.isGuest;

  // Predefined Dares
  const DEFAULT_CHALLENGES = [
    { id: 1, title: "El Eterno Rival", desc: "Llevar la camiseta del máximo rival de tu equipo durante un día entero de trabajo/estudios (y subir foto de prueba).", votes: 8 },
    { id: 2, title: "El Camarero de la Liga", desc: "Pagarle un café o refresco a cada uno de los miembros de la liga la próxima vez que os veáis.", votes: 5 },
    { id: 3, title: "El Cantante de WhatsApp", desc: "Grabar un audio de WhatsApp de al menos 1 minuto cantando a capela el himno del equipo del último clasificado con la mano en el pecho.", votes: 12 }
  ];

  const DEFAULT_HISTORY = [];

  // Load challenges from local storage or set defaults
  let challenges = JSON.parse(localStorage.getItem('CF_CHALLENGES_DATA') || 'null');
  if (!challenges || challenges.some(c => c.title.includes('👕') || c.title.includes('☕') || c.title.includes('🎤'))) {
    challenges = DEFAULT_CHALLENGES;
    localStorage.setItem('CF_CHALLENGES_DATA', JSON.stringify(challenges));
  }

  // Check if the current user has already voted
  let userVotedId = localStorage.getItem('CF_USER_VOTED_CHALLENGE_ID') || null;

  let currentMatchday = 5;
  const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');

  async function loadMatchday() {
    if (activeLeagueId && isConfigured) {
      try {
        const { data: league } = await supabase
          .from('leagues')
          .select('jester_current_matchday')
          .eq('id', activeLeagueId)
          .maybeSingle();
        if (league && league.jester_current_matchday) {
          currentMatchday = league.jester_current_matchday;
        }
      } catch (_) {}
    }
  }

  function renderView() {
    const totalVotes = challenges.reduce((sum, c) => sum + c.votes, 0);

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.65rem; font-weight: 900; display: inline-flex; align-items: center; gap: 0.75rem; margin: 0;">
              <span class="gradient-text-green">Reto Semanal</span>
              <span class="brutalist-badge" style="transform: rotate(-2deg); font-size: 0.75rem; background: var(--accent); color: #000000; border-color: #000000;">JORNADA ${currentMatchday}</span>
            </h1>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Decide democráticamente qué penitencia tendrá que realizar el último de esta jornada.</p>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Votaciones -->
          <div class="card glass pitch-card" style="margin-bottom: 0;">
            <h2 class="card-title gradient-text-gold">Votación en Curso</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Elige la putada de esta semana. El perdedor tendrá que cumplir la más votada.</p>
            
            <div style="display: flex; flex-direction: column; gap: 1.25rem;" id="poll-container">
              ${challenges.map(item => {
                const percent = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
                const isThisVoted = userVotedId == item.id;
                return `
                  <div class="card" style="background: rgba(255, 255, 255, 0.02); border: 1px solid ${isThisVoted ? 'var(--primary)' : 'var(--border-color)'}; padding: 1.25rem; margin: 0; position: relative; overflow: hidden; border-radius: 12px;">
                    <!-- Background fill for visual progress bar -->
                    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${percent}%; background: rgba(var(--primary-rgb), 0.04); transition: width 0.6s ease; pointer-events: none; z-index: 1;"></div>
                    
                    <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                      <div style="flex-grow: 1;">
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: ${isThisVoted ? 'var(--primary)' : 'var(--text-light)'}; margin-bottom: 0.25rem;">
                          ${item.title}
                        </h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${item.desc}</p>
                      </div>
                      <div style="text-align: right; min-width: 80px;">
                        <span style="font-weight: 800; font-size: 1.15rem; color: var(--primary);">${percent}%</span>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem;">${item.votes} votos</div>
                      </div>
                    </div>

                    <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                      <!-- Visual progress bar slider -->
                      <div style="flex-grow: 1; height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; margin-right: 1.5rem; overflow: hidden;">
                        <div style="height: 100%; width: ${percent}%; background: ${isThisVoted ? 'var(--primary)' : 'var(--text-muted)'}; border-radius: 3px; transition: width 0.6s ease;"></div>
                      </div>
                      
                      <button class="btn-vote" data-id="${item.id}" style="
                        background: ${isThisVoted ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'};
                        color: ${isThisVoted ? '#fff' : 'var(--text-light)'};
                        border: 1px solid ${isThisVoted ? 'var(--primary)' : 'var(--border-color)'};
                        font-family: var(--font-sans);
                        font-weight: 700;
                        font-size: 0.75rem;
                        padding: 0.4rem 0.85rem;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: var(--transition-fast);
                      ">
                        ${isThisVoted ? 'Votado ✓' : 'Votar'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Columna Derecha: Timer & Historial -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Cuenta atrás -->
            <div class="card glass">
              <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 0.75rem;">Cierre de Votación</h3>
              <div style="display: flex; justify-content: space-around; text-align: center; background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: 12px; border: 1px solid var(--border-color);">
                <div>
                  <div id="days" style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">00</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Días</div>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--border-color-glow);">:</div>
                <div>
                  <div id="hours" style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">00</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Hrs</div>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--border-color-glow);">:</div>
                <div>
                  <div id="minutes" style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">00</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Min</div>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--border-color-glow);">:</div>
                <div>
                  <div id="seconds" style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">00</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Seg</div>
                </div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center;">
                Las votaciones cierran cada domingo de jornada a las 20:00h.
              </p>
            </div>

            <!-- Historial de Retos -->
            <div class="card glass">
              <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 1rem;">Historial de Penitencias</h3>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${DEFAULT_HISTORY.length === 0 
                  ? `<p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">No hay retos pasados todavía.</p>`
                  : DEFAULT_HISTORY.map(h => `
                    <div style="border-left: 2.5px solid var(--accent); padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.1); border-radius: 0 8px 8px 0; font-size: 0.8rem;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 0.15rem;">
                        <strong>Jornada ${h.matchday}</strong>
                      </div>
                      <p style="color: var(--text-muted); line-height: 1.3;">Reto: ${h.dare}</p>
                    </div>
                  `).join('')
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook Vote Buttons
    container.querySelectorAll('.btn-vote').forEach(button => {
      button.addEventListener('click', (e) => {
        if (isGuest) {
          callbacks.onNavigate('acceso');
          return;
        }
        const id = Number(e.target.dataset.id);
        
        if (userVotedId == id) {
          // Undo vote
          challenges = challenges.map(c => c.id === id ? { ...c, votes: Math.max(0, c.votes - 1) } : c);
          userVotedId = null;
          localStorage.removeItem('CF_USER_VOTED_CHALLENGE_ID');
        } else {
          // Change or make vote
          if (userVotedId) {
            // Subtract previous
            const prevId = Number(userVotedId);
            challenges = challenges.map(c => c.id === prevId ? { ...c, votes: Math.max(0, c.votes - 1) } : c);
          }
          // Add new
          challenges = challenges.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c);
          userVotedId = id;
          localStorage.setItem('CF_USER_VOTED_CHALLENGE_ID', id);
        }

        localStorage.setItem('CF_CHALLENGES_DATA', JSON.stringify(challenges));
        callbacks.showToast('Voto registrado con éxito', 'success');
        renderView();
      });
    });

    // Hook Pique Form removed

    // Initialize Countdown Timer
    startCountdown();
  }

  // Ticking countdown timer to next Sunday 20:00
  function startCountdown() {
    const dVal = container.querySelector('#days');
    const hVal = container.querySelector('#hours');
    const mVal = container.querySelector('#minutes');
    const sVal = container.querySelector('#seconds');
    
    if (!dVal) return;

    const updateTimer = () => {
      const now = new Date();
      const nextSunday = new Date();
      // Sunday is 0. Find days until next Sunday.
      const dayOffset = (7 - now.getDay()) % 7;
      nextSunday.setDate(now.getDate() + dayOffset);
      nextSunday.setHours(20, 0, 0, 0);

      // If Sunday after 20:00, target next Sunday
      if (now.getDay() === 0 && now.getHours() >= 20) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diff = nextSunday.getTime() - now.getTime();
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      dVal.innerText = d.toString().padStart(2, '0');
      hVal.innerText = h.toString().padStart(2, '0');
      mVal.innerText = m.toString().padStart(2, '0');
      sVal.innerText = s.toString().padStart(2, '0');
    };

    updateTimer();
    const interval = setInterval(() => {
      if (!container.querySelector('#days')) {
        clearInterval(interval);
        return;
      }
      updateTimer();
    }, 1000);
  }

  loadMatchday().then(() => {
    renderView();
  });
}
