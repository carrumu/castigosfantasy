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
  const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');

  let challenges = [];
  let userVotedId = null;
  let currentMatchday = 5;
  let isLoading = true;

  async function loadMatchday() {
    if (activeLeagueId && isConfigured && !isGuest) {
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

  async function loadData() {
    isLoading = true;
    renderView();

    if (isGuest || !activeLeagueId || !isConfigured) {
      // Local Guest fallback mode
      const defaultDares = [
        { id: 'guest-1', title: "El Eterno Rival", desc: "Llevar la camiseta del máximo rival de tu equipo durante un día entero de trabajo/estudios (y subir foto de prueba).", votes: 8 },
        { id: 'guest-2', title: "El Camarero de la Liga", desc: "Pagarle un café o refresco a cada uno de los miembros de la liga la próxima vez que os veáis.", votes: 5 },
        { id: 'guest-3', title: "El Cantante de WhatsApp", desc: "Grabar un audio de WhatsApp de al menos 1 minuto cantando a capela el himno del equipo del último clasificado con la mano en el pecho.", votes: 12 }
      ];
      challenges = defaultDares;
      userVotedId = localStorage.getItem('CF_USER_VOTED_CHALLENGE_ID') || null;
      isLoading = false;
      renderView();
      return;
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

      // 1. Fetch challenges from Supabase for this matchday
      let { data: remoteChallenges, error: chalErr } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);

      if (chalErr) throw chalErr;

      // Seed default challenges if empty in Supabase database
      if (!remoteChallenges || remoteChallenges.length === 0) {
        const seedDares = [
          { title: "El Eterno Rival", description: "Llevar la camiseta del máximo rival de tu equipo durante un día entero de trabajo/estudios (y subir foto de prueba)." },
          { title: "El Camarero de la Liga", description: "Pagarle un café o refresco a cada uno de los miembros de la liga la próxima vez que os veáis." },
          { title: "El Cantante de WhatsApp", description: "Grabar un audio de WhatsApp de al menos 1 minuto cantando a capela el himno del equipo del último clasificado con la mano en el pecho." }
        ];
        
        const insertList = seedDares.map(d => ({
          league_id: activeLeagueId,
          matchday_number: currentMatchday,
          title: d.title,
          description: d.description
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from('weekly_challenges')
          .insert(insertList)
          .select();

        if (!insertErr && inserted) {
          remoteChallenges = inserted;
        }
      }

      challenges = remoteChallenges || [];

      // 2. Fetch all votes for these challenges
      if (challenges.length > 0) {
        const challengeIds = challenges.map(c => c.id);
        const { data: votesList, error: votesErr } = await supabase
          .from('challenge_votes')
          .select('challenge_id, profile_id')
          .in('challenge_id', challengeIds);

        if (!votesErr && votesList) {
          // Count votes per challenge
          challenges = challenges.map(c => {
            const count = votesList.filter(v => v.challenge_id === c.id).length;
            return {
              id: c.id,
              title: c.title,
              desc: c.description,
              votes: count
            };
          });

          // Check if current user voted
          if (currentUser) {
            const myVote = votesList.find(v => v.profile_id === currentUser.id);
            userVotedId = myVote ? myVote.challenge_id : null;
          }
        } else {
          challenges = challenges.map(c => ({ id: c.id, title: c.title, desc: c.description, votes: 0 }));
          userVotedId = null;
        }
      }
    } catch (e) {
      console.error('Error fetching challenges from Supabase:', e);
    } finally {
      isLoading = false;
      renderView();
    }
  }

  async function castVote(challengeId) {
    if (isGuest || !isConfigured) {
      // Local Guest mode voting toggle
      if (userVotedId == challengeId) {
        userVotedId = null;
        localStorage.removeItem('CF_USER_VOTED_CHALLENGE_ID');
      } else {
        userVotedId = challengeId;
        localStorage.setItem('CF_USER_VOTED_CHALLENGE_ID', challengeId);
      }
      callbacks.showToast('Voto local registrado', 'success');
      loadData();
      return;
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      if (userVotedId == challengeId) {
        // Undo vote
        await supabase
          .from('challenge_votes')
          .delete()
          .eq('challenge_id', challengeId)
          .eq('profile_id', currentUser.id);
        
        userVotedId = null;
      } else {
        // Change vote (delete previous)
        if (userVotedId) {
          await supabase
            .from('challenge_votes')
            .delete()
            .eq('challenge_id', userVotedId)
            .eq('profile_id', currentUser.id);
        }

        // Insert new vote
        await supabase
          .from('challenge_votes')
          .insert({
            challenge_id: challengeId,
            profile_id: currentUser.id
          });
        
        userVotedId = challengeId;
      }
      callbacks.showToast('Voto registrado con éxito', 'success');
    } catch (e) {
      console.error('Error casting challenge vote:', e);
      callbacks.showToast('Error al registrar tu voto', 'error');
    } finally {
      loadData();
    }
  }

  function renderView() {
    if (isLoading) {
      container.innerHTML = `
        <div class="container fade-in-up" style="max-width: 500px; margin: 0 auto; text-align: center; padding: 4rem 1rem;">
          <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 3rem 2rem;">
            <div class="loading-spinner" style="border: 4px solid rgba(255,255,255,0.1); border-left-color: var(--accent); border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
            <h2 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.75rem;">
              Cargando Votos
            </h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin: 0;">
              Obteniendo los retos semanales y recuento de votos en tiempo real de Supabase...
            </p>
          </div>
        </div>
      `;
      return;
    }

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
                    <!-- Background fill for progress bar -->
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
                      <!-- Progress bar slider -->
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

            <!-- Historial de Retos (Predefined fallback) -->
            <div class="card glass">
              <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 1rem;">Historial de Penitencias</h3>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">No hay retos pasados todavía.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook Vote Buttons
    container.querySelectorAll('.btn-vote').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        castVote(id);
      });
    });

    startCountdown();
  }

  function startCountdown() {
    const dVal = container.querySelector('#days');
    const hVal = container.querySelector('#hours');
    const mVal = container.querySelector('#minutes');
    const sVal = container.querySelector('#seconds');
    
    if (!dVal) return;

    const updateTimer = () => {
      const now = new Date();
      const nextSunday = new Date();
      const dayOffset = (7 - now.getDay()) % 7;
      nextSunday.setDate(now.getDate() + dayOffset);
      nextSunday.setHours(20, 0, 0, 0);

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
    loadData();
  });
}
