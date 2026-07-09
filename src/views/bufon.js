import { supabase, isConfigured } from '../supabase';
import { setupAutocomplete } from '../utils/autocomplete';
import { LALIGA_PLAYERS_DB } from '../utils/players-db';

/**
 * Renders the "El Bufón" (Matchday's Worst Player) screen.
 * Allows members to nominate and vote for the worst performer of the matchday globally.
 * Guests and users see a global board.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate
 * @param {Function} callbacks.showToast 
 */
export function renderBufon(container, callbacks) {
  const isGuest = callbacks.isGuest;
  
  let nominateAutocompleteCleanup = null;
  let forceDemoMode = false;
  let nominees = [];
  let history = [];
  let currentMatchday = 5;
  let userVotedId = null;
  let votingStartTime = null;
  let userNickname = "Tú";
  let activeLeagueId = null;
  let currentLeagueName = 'Global';

  const DEFAULT_DEMO_NOMINEES = [];
  const DEFAULT_DEMO_HISTORY = [];

  function loadDemoData() {
    forceDemoMode = true;
    currentLeagueName = "Liga Demo Global";
    currentMatchday = 5;
    votingStartTime = new Date(Date.now() - 3600 * 4 * 1000).toISOString();

    let demoNominees = JSON.parse(localStorage.getItem('CF_DEMO_JESTER_NOMINEES') || 'null');
    // Si contiene los falsos antiguos, limpiarlos
    if (!demoNominees || demoNominees.some(n => n.name.includes("Yamal") || n.name.includes("Cucurella"))) {
      demoNominees = DEFAULT_DEMO_NOMINEES;
      localStorage.setItem('CF_DEMO_JESTER_NOMINEES', JSON.stringify(demoNominees));
      localStorage.removeItem('CF_DEMO_JESTER_USER_VOTE');
    }
    nominees = demoNominees;

    let demoHistory = JSON.parse(localStorage.getItem('CF_DEMO_JESTER_HISTORY') || 'null');
    if (!demoHistory) {
      demoHistory = DEFAULT_DEMO_HISTORY;
      localStorage.setItem('CF_DEMO_JESTER_HISTORY', JSON.stringify(demoHistory));
    }
    history = demoHistory;

    userVotedId = localStorage.getItem('CF_DEMO_JESTER_USER_VOTE');
    userNickname = "Invitado";
    renderLeagueView();
  }

  // Helper to compute countdown remaining time text
  function getRemainingTimeText() {
    if (!votingStartTime) return "24 horas (pendiente de inicio)";
    const start = new Date(votingStartTime).getTime();
    const end = start + (24 * 3600 * 1000);
    const diff = end - Date.now();
    if (diff <= 0) {
      return "Votación finalizada (cierre pendiente)";
    }
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `Tiempo restante: ${hrs}h ${mins}m`;
  }

  // Helper to get time value
  function getRemainingTime() {
    if (!votingStartTime) return 24 * 3600 * 1000;
    const start = new Date(votingStartTime).getTime();
    const end = start + (24 * 3600 * 1000);
    return end - Date.now();
  }

  async function loadData() {
    container.innerHTML = `
      <div class="container" style="display: flex; justify-content: center; align-items: center; padding: 3rem 0;">
        <span class="spinner" style="width: 40px; height: 40px;"></span>
      </div>
    `;

    if (!isConfigured || forceDemoMode) {
      loadDemoData();
      return;
    }

    try {
      if (!isGuest) {
        // 1. Resolve a single global league container in the database (ordered by created_at)
        const { data: leagues, error: leagueErr } = await supabase
          .from('leagues')
          .select('id, name, jester_current_matchday, jester_voting_start')
          .order('created_at', { ascending: true })
          .limit(1);

        if (leagueErr) throw leagueErr;

        if (!leagues || leagues.length === 0) {
          forceDemoMode = true;
          loadDemoData();
          return;
        }

        activeLeagueId = leagues[0].id;
        currentLeagueName = leagues[0].name;
        currentMatchday = leagues[0].jester_current_matchday || 5;
        votingStartTime = leagues[0].jester_voting_start;
      } else {
        const { data: histData } = await supabase
          .from('jester_history')
          .select('league_id, matchday_number')
          .order('matchday_number', { ascending: false })
          .limit(1);
        
        const { data: nomData } = await supabase
          .from('jester_nominees')
          .select('league_id, matchday_number, created_at')
          .order('created_at', { ascending: true });

        if (nomData && nomData.length > 0) {
          activeLeagueId = nomData[0].league_id;
          currentMatchday = nomData[0].matchday_number;
          votingStartTime = nomData[0].created_at; 
        } else if (histData && histData.length > 0) {
          activeLeagueId = histData[0].league_id;
          currentMatchday = histData[0].matchday_number + 1;
          votingStartTime = null;
        } else {
          forceDemoMode = true;
          loadDemoData();
          return;
        }
        currentLeagueName = 'Global';
      }

      // 2. Load nominees, votes, history for this global league container
      await loadLeagueData();
    } catch (err) {
      console.error("Error al inicializar la base de datos de El Bufón, activando modo Demo:", err);
      forceDemoMode = true;
      loadDemoData();
    }
  }

  async function loadLeagueData() {
    if (!activeLeagueId) {
      forceDemoMode = true;
      loadDemoData();
      return;
    }

    try {
      // 1. Load nominees for the current matchday
      const { data: nomineesData, error: nomineesErr } = await supabase
        .from('jester_nominees')
        .select('*')
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);
      
      if (nomineesErr) throw nomineesErr;
      
      // 2. Load votes for these nominees in this matchday
      const { data: votesData, error: votesErr } = await supabase
        .from('jester_votes')
        .select('*')
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);
      
      if (votesErr) throw votesErr;

      // Map votes to nominees count
      const votesMap = {};
      nomineesData.forEach(n => {
        votesMap[n.id] = 0;
      });
      votesData.forEach(v => {
        if (votesMap[v.nominee_id] !== undefined) {
          votesMap[v.nominee_id]++;
        }
      });

      nominees = nomineesData.map(n => ({
        id: n.id,
        name: n.name,
        team: n.team,
        reason: n.reason,
        votes: votesMap[n.id] || 0,
        nominated_by: n.nominated_by,
        created_at: n.created_at
      }));

      // 3. Load history
      const { data: historyData, error: historyErr } = await supabase
        .from('jester_history')
        .select('*')
        .eq('league_id', activeLeagueId)
        .order('matchday_number', { ascending: false });
      
      if (historyErr) throw historyErr;

      history = historyData.map(h => ({
        matchday: h.matchday_number,
        name: h.name,
        team: h.team,
        reason: h.reason,
        raffleWinner: h.raffle_winner,
        rafflePlayer: h.raffle_player
      }));

      // 4. Get current user's vote and display name if logged in
      if (!isGuest) {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('apodo, display_name')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          userNickname = profile?.apodo || profile?.display_name || currentUser.email.split('@')[0];

          // Check if user voted
          const userVote = votesData.find(v => v.profile_id === currentUser.id);
          userVotedId = userVote ? userVote.nominee_id : null;
        }
      }

      renderLeagueView();
    } catch (err) {
      console.error("Error loading league data, falling back to Demo Mode:", err);
      forceDemoMode = true;
      loadDemoData();
    }
  }

  async function handleVote(nomineeId) {
    if (!isConfigured || forceDemoMode) {
      if (userVotedId) {
        callbacks.showToast("Ya has votado en esta jornada", "warning");
        return;
      }
      userVotedId = nomineeId;
      localStorage.setItem('CF_DEMO_JESTER_USER_VOTE', nomineeId);
      nominees = nominees.map(n => n.id === nomineeId ? { ...n, votes: n.votes + 1 } : n);
      localStorage.setItem('CF_DEMO_JESTER_NOMINEES', JSON.stringify(nominees));
      callbacks.showToast("¡Voto registrado en modo Demo!", "success");
      renderLeagueView();
      return;
    }

    if (isGuest) {
      callbacks.onNavigate('acceso');
      return;
    }

    if (userVotedId) {
      callbacks.showToast("Ya has votado en esta jornada", "warning");
      return;
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase
        .from('jester_votes')
        .insert({
          league_id: activeLeagueId,
          matchday_number: currentMatchday,
          profile_id: currentUser.id,
          nominee_id: nomineeId
        });

      if (error) {
        if (error.code === '23505') {
          callbacks.showToast("Ya has votado en esta jornada", "warning");
        } else {
          throw error;
        }
      } else {
        callbacks.showToast("¡Voto registrado con éxito!", "success");
      }

      await loadData();
    } catch (err) {
      console.error("Error al registrar voto:", err);
      callbacks.showToast("Error al registrar el voto", "error");
    }
  }

  async function handleNominate(name, team, reason) {
    const existing = nominees.find(n => n.name.toLowerCase() === name.toLowerCase());

    if (!isConfigured || forceDemoMode) {
      if (existing) {
        return handleVote(existing.id);
      }
      const newNom = {
        id: 'd-nom-' + Date.now(),
        name,
        team,
        reason,
        votes: 0,
        nominated_by: 'd-member-guest',
        created_at: new Date().toISOString()
      };
      nominees.push(newNom);
      localStorage.setItem('CF_DEMO_JESTER_NOMINEES', JSON.stringify(nominees));
      callbacks.showToast("Nominado añadido en modo Demo", "success");
      renderLeagueView();
      return;
    }

    if (isGuest) {
      callbacks.onNavigate('acceso');
      return;
    }

    if (existing) {
      callbacks.showToast("El jugador ya está nominado. Registrando tu voto...", "info");
      return handleVote(existing.id);
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

      // 1. Insert nominee
      const { error: nomErr } = await supabase
        .from('jester_nominees')
        .insert({
          league_id: activeLeagueId,
          matchday_number: currentMatchday,
          name: name,
          team: team,
          reason: reason,
          nominated_by: currentUser.id
        });

      if (nomErr) throw nomErr;

      // 2. If it's the first nominee of the matchday, update voting start time in leagues table
      if (nominees.length === 0 && !votingStartTime) {
        const start = new Date().toISOString();
        const { error: leagueErr } = await supabase
          .from('leagues')
          .update({ jester_voting_start: start })
          .eq('id', activeLeagueId);
        
        if (leagueErr) {
          console.warn("Could not update voting start time:", leagueErr);
        }
      }

      callbacks.showToast("Nominado añadido a la jornada", "success");
      await loadData();
    } catch (err) {
      console.error("Error al nominar:", err);
      callbacks.showToast("Error al añadir nominado", "error");
    }
  }

  async function closeMatchday() {
    if (!isConfigured || forceDemoMode) {
      if (nominees.length === 0) {
        callbacks.showToast("No hay nominados en esta jornada para cerrar", "error");
        return;
      }
      let winner = nominees[0];
      nominees.forEach(n => {
        if (n.votes > winner.votes) {
          winner = n;
        }
      });
      const newHistory = {
        matchday: currentMatchday,
        name: winner.name,
        team: winner.team,
        reason: winner.reason,
        raffleWinner: "Invitado (Liga Demo)",
        rafflePlayer: winner.name
      };
      history.unshift(newHistory);
      localStorage.setItem('CF_DEMO_JESTER_HISTORY', JSON.stringify(history));
      nominees = [];
      localStorage.setItem('CF_DEMO_JESTER_NOMINEES', JSON.stringify(nominees));
      userVotedId = null;
      localStorage.removeItem('CF_DEMO_JESTER_USER_VOTE');
      callbacks.showToast(`¡Jornada demo cerrada! El bufón de la jornada es ${winner.name}`, "success");
      loadDemoData();
      return;
    }

    if (nominees.length === 0) {
      callbacks.showToast("No hay nominados en esta jornada para cerrar", "error");
      return;
    }

    try {
      // Find nominee with the highest votes
      let winner = nominees[0];
      nominees.forEach(n => {
        if (n.votes > winner.votes) {
          winner = n;
        }
      });

      // 1. Add winner to history
      const { error: histErr } = await supabase
        .from('jester_history')
        .insert({
          league_id: activeLeagueId,
          matchday_number: currentMatchday,
          name: winner.name,
          team: winner.team,
          reason: winner.reason,
          raffle_winner: null,
          raffle_player: null
        });

      if (histErr) throw histErr;

      // 2. Delete nominees for this matchday (which cascades to votes)
      const { error: delErr } = await supabase
        .from('jester_nominees')
        .delete()
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);
      
      if (delErr) throw delErr;

      // 3. Reset voting start time and increment matchday in leagues table
      const nextMatchday = currentMatchday + 1;
      const { error: leagueErr } = await supabase
        .from('leagues')
        .update({
          jester_current_matchday: nextMatchday,
          jester_voting_start: null
        })
        .eq('id', activeLeagueId);

      if (leagueErr) throw leagueErr;

      callbacks.showToast(`Jornada cerrada. ¡El bufón de la jornada es ${winner.name}!`, "success");

      await loadData();
    } catch (err) {
      console.error("Error closing matchday:", err);
      callbacks.showToast("Error al cerrar la jornada", "error");
    }
  }

  function renderLeagueView() {
    const totalVotes = nominees.reduce((sum, n) => sum + n.votes, 0);

    container.innerHTML = `
      <div style="position: relative; width: 100%; min-height: 80vh;">
        ${isGuest ? `
          <div style="position: absolute; inset: 0; z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding-top: 2rem;">
            <div id="bufon-auth-container" style="position: sticky; top: 4rem; width: 100%; max-width: 380px;">
              <div style="text-align: center; padding: 2rem;"><span class="spinner"></span></div>
            </div>
          </div>
        ` : ''}
        <div class="container" style="${isGuest ? 'filter: blur(8px); opacity: 0.55; pointer-events: none; user-select: none;' : ''}">
        <!-- Header -->
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="gradient-text-gold" style="font-size: 1.65rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
              El Bufón de la Corte
            </h1>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Votación global al futbolista de LaLiga con la actuación más cómica o desastrosa en la <strong>Jornada ${currentMatchday}</strong>.
            </p>
          </div>
          ${!isGuest ? `
            <div>
              <button id="close-matchday-btn" class="btn-primary btn-danger" style="font-size: 0.8rem; padding: 0.55rem 1.1rem; font-weight: 700; border: 2.5px solid #000; box-shadow: 2px 2px 0px #000; border-radius: 6px;">
                Cerrar Votación Global
              </button>
            </div>
          ` : ''}
        </div>

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Votación Activa & Formulario -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Votación -->
            <div class="card glass">
              <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span>Candidatos de la Jornada</span>
              </h2>

              <!-- Countdown Banner -->
              <div style="
                background: rgba(var(--primary-rgb), 0.06);
                border: 1px solid rgba(var(--primary-rgb), 0.15);
                border-radius: 8px;
                padding: 0.75rem 1rem;
                margin-bottom: 1.25rem;
                font-size: 0.8rem;
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
              ">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                  <span style="font-weight: 700; color: var(--text-light); display: flex; align-items: center; gap: 0.35rem;">
                    ${getRemainingTimeText()}
                  </span>
                  <span style="color: var(--accent); font-weight: 700; font-size: 0.75rem; background: rgba(var(--accent-rgb), 0.08); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(var(--accent-rgb), 0.15);">
                    1 voto por mánager
                  </span>
                </div>
              </div>

              ${nominees.length === 0 ? `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <p style="font-size: 0.9rem;">No hay nominados registrados en esta jornada todavía.</p>
                  <p style="font-size: 0.75rem; margin-top: 0.25rem;">Rellena el formulario de abajo para empezar las votaciones.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 1.15rem;">
                  ${[...nominees].sort((a, b) => {
                    if (b.votes !== a.votes) return b.votes - a.votes;
                    const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return tB - tA;
                  }).slice(0, 3).map(n => {
                    const percent = totalVotes > 0 ? Math.round((n.votes / totalVotes) * 100) : 0;
                    const isVoted = userVotedId == n.id;
                    const isVotingClosed = getRemainingTime() <= 0;
                    const isBtnDisabled = isVotingClosed || userVotedId !== null;
                    return `
                      <div class="card" style="
                        background: rgba(255, 255, 255, 0.01); 
                        border: 1px solid ${isVoted ? 'var(--accent)' : 'var(--border-color)'}; 
                        padding: 1.25rem; 
                        margin: 0; 
                        position: relative; 
                        overflow: hidden; 
                        border-radius: 12px;
                      ">
                        <!-- Progress bar background fill -->
                        <div style="
                          position: absolute; 
                          left: 0; 
                          top: 0; 
                          bottom: 0; 
                          width: ${percent}%; 
                          background: rgba(var(--accent-rgb), 0.04); 
                          transition: width 0.6s ease; 
                          pointer-events: none; 
                          z-index: 1;
                        "></div>

                        <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                          <div style="flex-grow: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                              <h4 style="font-size: 1.1rem; font-weight: 800; color: ${isVoted ? 'var(--accent)' : 'var(--text-light)'};">
                                ${escapeHTML(n.name)}
                              </h4>
                              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 0.15rem 0.4rem; border-radius: 4px; color: var(--text-muted); font-weight: 600;">
                                ${escapeHTML(n.team)}
                              </span>
                            </div>
                          </div>
                          <div style="text-align: right; min-width: 80px;">
                            <span style="font-weight: 800; font-size: 1.2rem; color: var(--accent);">${percent}%</span>
                          </div>
                        </div>

                        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                          <!-- Bar track visual slider -->
                          <div style="flex-grow: 1; height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; margin-right: 1.5rem; overflow: hidden;">
                            <div style="height: 100%; width: ${percent}%; background: ${isVoted ? 'var(--accent)' : 'var(--text-muted)'}; border-radius: 3px; transition: width 0.6s ease;"></div>
                          </div>

                          <button class="btn-vote-bufon brutalist-btn" ${isBtnDisabled ? 'disabled' : ''} data-id="${n.id}" style="
                            background: ${isVoted ? 'var(--accent) !important; background-image: none !important; color: #000 !important;' : 'rgba(255, 255, 255, 0.05)'};
                            font-family: var(--font-sans);
                            font-weight: 800;
                            font-size: 0.75rem;
                            padding: 0.4rem 0.85rem;
                            width: auto;
                            border: 2px solid #000;
                            box-shadow: 2px 2px 0px #000;
                            cursor: ${isBtnDisabled ? 'not-allowed' : 'pointer'};
                            transition: var(--transition-fast);
                            opacity: ${(isBtnDisabled && !isVoted) ? '0.4' : '1'};
                          ">
                            ${isVoted ? 'Votado ✓' : (isVotingClosed ? 'Cerrado' : 'Votar')}
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

              <div class="card glass">
                <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 0.25rem;">Nominar un Candidato</h3>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                  ¿Algún futbolista la ha liado en la jornada? Añádelo al escarnio público global.
                </p>

                <form id="nominate-form" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="form-group">
                    <label for="nom-name" style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block; color: var(--text-muted);">Nombre del Futbolista</label>
                    <input type="text" id="nom-name" class="input-field" required autocomplete="off" placeholder="Ej: Vinicius Jr." />
                  </div>
                  <input type="hidden" id="nom-team" />

                  <button type="submit" class="btn-primary" style="font-weight: 700; width: 100%; padding: 0.75rem;" ${isGuest ? 'disabled' : ''}>
                    Añadir Candidato a Votación
                  </button>
                </form>
              </div>
          </div>

          <!-- Columna Derecha: Histórico (Hall of Shame) -->
          <div class="card glass">
            <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              Salón de la Vergüenza
            </h2>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Past bufones coronados oficialmente en las jornadas anteriores de esta temporada.
            </p>

            ${history.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="font-size: 0.85rem;">Ningún bufón coronado todavía. ¡La liga está limpia!</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${history.map(h => {
                  return `
                    <div style="
                      border: 1px solid var(--border-color);
                      background: rgba(0,0,0,0.15);
                      border-left: 3px solid var(--primary);
                      border-radius: 0 10px 10px 0;
                      padding: 0.85rem 1rem;
                      font-size: 0.85rem;
                      margin-bottom: 0.75rem;
                    ">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <strong style="color: var(--primary);">Jornada ${h.matchday}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">
                          ${escapeHTML(h.team)}
                        </span>
                      </div>
                      <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--text-light);">
                        ${escapeHTML(h.name)}
                      </h4>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
        </div>
      </div>
    `;

    // Attach event listeners
    attachLeagueEvents();
  }

  function attachLeagueEvents() {
    // Hook Vote buttons
    container.querySelectorAll('.btn-vote-bufon').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGuest) {
          callbacks.showToast('Debes iniciar sesión para votar', 'warning');
          callbacks.onNavigate('acceso');
          return;
        }
        const id = btn.dataset.id;
        handleVote(id);
      });
    });

    // Hook Nominate Form
    const nominateForm = container.querySelector('#nominate-form');
    if (nominateForm) {
      const nameInput = nominateForm.querySelector('#nom-name');
      const teamInput = nominateForm.querySelector('#nom-team');

      if (nominateAutocompleteCleanup) {
        nominateAutocompleteCleanup();
        nominateAutocompleteCleanup = null;
      }

      if (nameInput) {
        const validTeams = [
          'Deportivo Alavés', 'Getafe CF', 'Real Betis', 'Valencia CF', 'Sevilla FC', 
          'Celta de Vigo', 'Real Sociedad', 'CA Osasuna', 'Rayo Vallecano', 'Villarreal CF', 
          'Real Madrid', 'FC Barcelona', 'RCD Espanyol', 'Athletic Club', 'Atlético de Madrid',
          'Girona', 'RCD Mallorca', 'UD Las Palmas', 'CD Leganés', 'Real Valladolid'
        ];
        const currentLaLigaPlayers = LALIGA_PLAYERS_DB.filter(p => 
          validTeams.includes(p.team) && (!p.country || p.country === '')
        );

        nominateAutocompleteCleanup = setupAutocomplete(nameInput, (player) => {
          if (teamInput) {
            teamInput.value = player.team;
          }
        }, currentLaLigaPlayers);
      }

      nominateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const team = teamInput ? teamInput.value.trim() : 'Desconocido';
        const reason = "Sin razón adicional";
        if (!name) return;
        
        handleNominate(name, team, reason);
      });
    }

    // Hook Close Matchday button
    const closeBtn = container.querySelector('#close-matchday-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (isGuest) {
          callbacks.showToast('Inicia sesión para cerrar la jornada', 'warning');
          callbacks.onNavigate('acceso');
          return;
        }
        if (confirm(`¿Estás seguro de que quieres cerrar la Jornada ${currentMatchday}? Esto registrará al bufón ganador en el histórico global y limpiará las nominaciones para la Jornada ${currentMatchday + 1}.`)) {
          closeMatchday();
        }
      });
    }

    // Mount auth view if guest
    const authContainer = container.querySelector('#bufon-auth-container');
    if (authContainer) {
      import('./auth').then(({ renderAuth }) => {
        renderAuth(authContainer, {
          onAuthSuccess: () => {
            callbacks.showToast('Sesión iniciada correctamente', 'success');
            callbacks.onNavigate('bufon');
          },
          showToast: callbacks.showToast
        });

        // Remove the 80vh min-height from the injected auth container so it fits in the column
        setTimeout(() => {
          const innerCont = authContainer.querySelector('.container');
          if (innerCont) {
            innerCont.style.minHeight = 'auto';
            innerCont.style.padding = '0';
          }
          const pitchCard = authContainer.querySelector('.pitch-card');
          if (pitchCard) {
            pitchCard.style.boxShadow = 'none';
            pitchCard.style.border = '1.2px dashed var(--border-color-glow)';
            pitchCard.style.padding = '1.5rem 1rem';
          }
        }, 50);
      }).catch(err => {
        console.error('Error loading auth view:', err);
        authContainer.innerHTML = '<div class="card glass" style="text-align:center; padding:1.5rem;">Error al cargar acceso. <button class="btn-primary" onclick="window.location.reload()">Recargar</button></div>';
      });
    }
  }

  // Simple escaping function to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Load and display everything
  loadData();

  // Custom cleanup when view gets destroyed/unmounted (prevent autocomplete memory leaks)
  const observer = new MutationObserver((mutations) => {
    if (!document.body.contains(container)) {
      if (nominateAutocompleteCleanup) {
        nominateAutocompleteCleanup();
        nominateAutocompleteCleanup = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
