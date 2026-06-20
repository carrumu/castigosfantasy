import { supabase, isConfigured } from '../supabase';

/**
 * Renders the "El Bufón" (Matchday's Worst Player) screen.
 * Allows members to nominate and vote for the worst performer of the matchday in their leagues.
 * Guests and users without leagues see a global read-only board.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate
 * @param {Function} callbacks.showToast 
 */
export function renderBufon(container, callbacks) {
  const isGuest = callbacks.isGuest;
  
  let forceDemoMode = false;
  let nominees = [];
  let history = [];
  let currentMatchday = 5;
  let userVotedId = null;
  let votingStartTime = null;
  let userNickname = "Tú";
  let activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  if (activeLeagueId === 'null' || activeLeagueId === 'undefined') {
    activeLeagueId = null;
  }
  let currentLeagueName = localStorage.getItem('CF_ACTIVE_LEAGUE_NAME') || '';
  if (currentLeagueName === 'null' || currentLeagueName === 'undefined') {
    currentLeagueName = '';
  }

  const DEFAULT_DEMO_NOMINEES = [
    { id: 'd-nom-1', name: "Robert Lewandowski", team: "FC Barcelona", reason: "Falló tres mano a mano claros contra el portero y falló un penalti en el minuto 90.", votes: 14, nominated_by: "d-member-1" },
    { id: 'd-nom-2', name: "Vinicius Jr.", team: "Real Madrid", reason: "Vio una tarjeta amarilla por protestar en el minuto 5 y luego fue expulsado por doble amarilla tras una simulación en el área.", votes: 18, nominated_by: "d-member-2" },
    { id: 'd-nom-3', name: "Frenkie de Jong", team: "FC Barcelona", reason: "Marcó un autogol espectacular al intentar despejar de cabeza de espaldas a su portería.", votes: 6, nominated_by: "d-member-3" }
  ];

  const DEFAULT_DEMO_HISTORY = [
    { matchday: 4, name: "Iago Aspas", team: "Celta de Vigo", reason: "Falló dos penaltis en la misma jornada y falló un gol sin portero.", raffleWinner: "Invitado (Liga Demo)", rafflePlayer: "Iago Aspas" },
    { matchday: 3, name: "Antoine Griezmann", team: "Atlético de Madrid", reason: "Fue sustituido al descanso tras perder 15 balones y dar un pase de gol al rival.", raffleWinner: "Invitado (Liga Demo)", rafflePlayer: "Antoine Griezmann" },
    { matchday: 2, name: "Alexander Sørloth", team: "Atlético de Madrid", reason: "Remató al palo tres veces seguidas estando a un metro de la línea de gol.", raffleWinner: "Invitado (Liga Demo)", rafflePlayer: "Alexander Sørloth" }
  ];

  function loadDemoData() {
    forceDemoMode = true;
    currentLeagueName = "Liga Demo Local";
    currentMatchday = 5;
    votingStartTime = new Date(Date.now() - 3600 * 4 * 1000).toISOString();

    let demoNominees = JSON.parse(localStorage.getItem('CF_DEMO_JESTER_NOMINEES') || 'null');
    if (!demoNominees) {
      demoNominees = DEFAULT_DEMO_NOMINEES;
      localStorage.setItem('CF_DEMO_JESTER_NOMINEES', JSON.stringify(demoNominees));
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
    activeTab = 'league';
    renderLeagueView();
  }
  
  // Tab state: 'league' or 'global'. If guest or no league, always show 'global'.
  let activeTab = (isGuest || !activeLeagueId) ? 'global' : 'league';

  async function ensureActiveLeague() {
    if (!activeLeagueId && !isGuest) {
      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const { data: memberList } = await supabase
            .from('league_members')
            .select(`
              leagues (
                id,
                name
              )
            `)
            .eq('profile_id', currentUser.id)
            .limit(1);

          if (memberList && memberList.length > 0 && memberList[0].leagues) {
            activeLeagueId = memberList[0].leagues.id;
            currentLeagueName = memberList[0].leagues.name;
            localStorage.setItem('CF_ACTIVE_LEAGUE_ID', activeLeagueId);
            localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', currentLeagueName);
            // Default to league tab now that they have an active league
            activeTab = 'league';
          }
        }
      } catch (err) {
        console.error("Error ensuring active league:", err);
      }
    }
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
      await ensureActiveLeague();

      if (activeTab === 'global') {
        await loadGlobalData();
      } else {
        await loadLeagueData();
      }
    } catch (err) {
      console.error("Error al inicializar la base de datos de El Bufón, activando modo Demo:", err);
      forceDemoMode = true;
      loadDemoData();
    }
  }

  async function loadGlobalData() {
    try {
      // 1. Fetch all nominees and join with league name
      const { data: nomineesData, error: nomineesErr } = await supabase
        .from('jester_nominees')
        .select(`
          id,
          league_id,
          matchday_number,
          name,
          team,
          reason,
          leagues (
            name
          )
        `);

      if (nomineesErr) throw nomineesErr;

      // 2. Fetch all votes to count
      const { data: votesData, error: votesErr } = await supabase
        .from('jester_votes')
        .select('nominee_id, league_id');

      if (votesErr) throw votesErr;

      // Calculate votes per nominee and total votes per league
      const votesMap = {};
      const leagueTotalVotes = {};

      nomineesData.forEach(n => {
        votesMap[n.id] = 0;
        if (!leagueTotalVotes[n.league_id]) {
          leagueTotalVotes[n.league_id] = 0;
        }
      });

      votesData.forEach(v => {
        if (votesMap[v.nominee_id] !== undefined) {
          votesMap[v.nominee_id]++;
        }
        if (leagueTotalVotes[v.league_id] !== undefined) {
          leagueTotalVotes[v.league_id]++;
        }
      });

      // Group nominees by league
      const leaguesGrouped = {};
      nomineesData.forEach(n => {
        const lId = n.league_id;
        const lName = n.leagues?.name || "Liga de CastigoFantasy";
        if (!leaguesGrouped[lId]) {
          leaguesGrouped[lId] = {
            id: lId,
            name: lName,
            matchday: n.matchday_number,
            nominees: [],
            totalVotes: leagueTotalVotes[lId] || 0
          };
        }
        leaguesGrouped[lId].nominees.push({
          id: n.id,
          name: n.name,
          team: n.team,
          reason: n.reason,
          votes: votesMap[n.id] || 0
        });
      });

      // 3. Fetch global history
      const { data: historyData, error: historyErr } = await supabase
        .from('jester_history')
        .select(`
          matchday_number,
          name,
          team,
          reason,
          raffle_winner,
          raffle_player,
          leagues (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      if (historyErr) throw historyErr;

      const globalHistory = historyData.map(h => ({
        matchday: h.matchday_number,
        name: h.name,
        team: h.team,
        reason: h.reason,
        raffleWinner: h.raffle_winner,
        rafflePlayer: h.raffle_player,
        leagueName: h.leagues?.name || "Liga de CastigoFantasy"
      }));

      // Get user nickname for UI references
      if (!isGuest) {
        try {
          const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
          if (currentUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('apodo, display_name')
              .eq('id', currentUser.id)
              .maybeSingle();
            userNickname = profile?.apodo || profile?.display_name || currentUser.email.split('@')[0];
          }
        } catch {}
      }

      renderGlobalView(leaguesGrouped, globalHistory);
    } catch (err) {
      console.error("Error loading global data, falling back to Demo Mode:", err);
      forceDemoMode = true;
      loadDemoData();
    }
  }

  async function loadLeagueData() {
    if (!activeLeagueId) {
      activeTab = 'global';
      await loadGlobalData();
      return;
    }

    try {
      // 1. Load active league details (current jester matchday & voting start)
      const { data: league, error: leagueErr } = await supabase
        .from('leagues')
        .select('name, jester_current_matchday, jester_voting_start')
        .eq('id', activeLeagueId)
        .single();
      
      if (leagueErr) throw leagueErr;
      
      currentLeagueName = league.name;
      currentMatchday = league.jester_current_matchday || 5;
      votingStartTime = league.jester_voting_start;

      // 2. Load nominees for the current matchday
      const { data: nomineesData, error: nomineesErr } = await supabase
        .from('jester_nominees')
        .select('*')
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);
      
      if (nomineesErr) throw nomineesErr;
      
      // 3. Load votes for these nominees in this matchday
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
        nominated_by: n.nominated_by
      }));

      // 4. Load history
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

      // 5. Get current user's vote and display name if logged in
      if (!isGuest) {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          // Get user nickname (apodo or display_name or email prefix)
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

  async function drawRaffleWinner(winnerNominee) {
    try {
      // Get all voters for this matchday
      const { data: voters, error } = await supabase
        .from('jester_votes')
        .select(`
          profile_id,
          profiles (
            display_name,
            apodo
          )
        `)
        .eq('league_id', activeLeagueId)
        .eq('matchday_number', currentMatchday);

      if (error) throw error;

      if (!voters || voters.length === 0) {
        // Fallback: draw from league members
        const { data: members, error: memErr } = await supabase
          .from('league_members')
          .select(`
            profile_id,
            profiles (
              display_name,
              apodo
            )
          `)
          .eq('league_id', activeLeagueId);
        
        if (memErr) throw memErr;
        if (!members || members.length === 0) return null;

        const luckyMember = members[Math.floor(Math.random() * members.length)];
        const name = luckyMember.profiles?.apodo || luckyMember.profiles?.display_name || "Mánager de la Liga";
        return {
          manager: `${name} (${currentLeagueName})`,
          player: winnerNominee.name
        };
      }

      const luckyVoter = voters[Math.floor(Math.random() * voters.length)];
      const name = luckyVoter.profiles?.apodo || luckyVoter.profiles?.display_name || "Mánager de la Liga";
      return {
        manager: `${name} (${currentLeagueName})`,
        player: winnerNominee.name
      };
    } catch (err) {
      console.error("Error drawing raffle winner:", err);
      return null;
    }
  }

  async function handleNominate(name, team, reason) {
    if (!isConfigured || forceDemoMode) {
      if (nominees.length >= 6) {
        callbacks.showToast("Máximo 6 nominados permitidos por jornada", "error");
        return;
      }
      const newNom = {
        id: 'd-nom-' + Date.now(),
        name,
        team,
        reason,
        votes: 0,
        nominated_by: 'd-member-guest'
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

    if (nominees.length >= 6) {
      callbacks.showToast("Máximo 6 nominados permitidos por jornada para mantener el orden", "error");
      return;
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

    // Tab Header HTML
    const tabsHtml = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <button id="tab-league-btn" class="tab-btn" style="
          background: rgba(var(--accent-rgb), 0.08);
          color: var(--accent);
          border: none;
          border-bottom: 2px solid var(--accent);
          padding: 0.5rem 1rem;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: var(--font-sans);
        ">
          🏆 Mi Liga (${escapeHTML(currentLeagueName)})
        </button>
        <button id="tab-global-btn" class="tab-btn" style="
          background: transparent;
          color: var(--text-muted);
          border: none;
          padding: 0.5rem 1rem;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: var(--font-sans);
        ">
          🌐 Vista Global (Todas las Ligas)
        </button>
      </div>
    `;

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="gradient-text-gold" style="font-size: 1.65rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
              El Bufón de la Jornada
            </h1>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Votación democrática al futbolista de LaLiga con la actuación más cómica o desastrosa en la <strong>Jornada ${currentMatchday}</strong> (${escapeHTML(currentLeagueName)}).
            </p>
          </div>
          ${!isGuest ? `
            <div>
              <button id="close-matchday-btn" class="btn-primary btn-danger" style="font-size: 0.8rem; padding: 0.5rem 1rem; font-weight: 700;">
                Cerrar Jornada y Guardar
              </button>
            </div>
          ` : ''}
        </div>

        ${tabsHtml}

        <!-- Sorteo de camiseta oculto de momento -->

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Votación Activa & Formulario -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Votación -->
            <div class="card glass">
              <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span>Candidatos de la Jornada</span>
                <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">${totalVotes} votos totales</span>
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
                  ${nominees.map(n => {
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
                            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${escapeHTML(n.reason)}</p>
                          </div>
                          <div style="text-align: right; min-width: 80px;">
                            <span style="font-weight: 800; font-size: 1.2rem; color: var(--accent);">${percent}%</span>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem;">${n.votes} votos</div>
                          </div>
                        </div>

                        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                          <!-- Bar track visual slider -->
                          <div style="flex-grow: 1; height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; margin-right: 1.5rem; overflow: hidden;">
                            <div style="height: 100%; width: ${percent}%; background: ${isVoted ? 'var(--accent)' : 'var(--text-muted)'}; border-radius: 3px; transition: width 0.6s ease;"></div>
                          </div>

                          <button class="btn-vote-bufon" ${isBtnDisabled && !isVoted ? 'disabled' : ''} data-id="${n.id}" style="
                            background: ${isVoted ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)'};
                            color: ${isVoted ? '#fff' : 'var(--text-light)'};
                            border: 1px solid ${isVoted ? 'var(--accent)' : 'var(--border-color)'};
                            font-family: var(--font-sans);
                            font-weight: 800;
                            font-size: 0.75rem;
                            padding: 0.4rem 0.85rem;
                            border-radius: 6px;
                            cursor: ${isBtnDisabled && !isVoted ? 'not-allowed' : 'pointer'};
                            transition: var(--transition-fast);
                            opacity: ${isBtnDisabled && !isVoted ? '0.4' : '1'};
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

            <!-- Formulario Nominar -->
            <div class="card glass">
              <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 0.25rem;">Nominar un Candidato</h3>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                ¿Algún futbolista la ha liado en la jornada? Añádelo al escarnio público.
              </p>

              <form id="nominate-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="nom-name" style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block; color: var(--text-muted);">Nombre del Futbolista</label>
                    <input type="text" id="nom-name" class="input-field" placeholder="Ej: Amallah" required />
                  </div>
                  <div class="form-group">
                    <label for="nom-team" style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block; color: var(--text-muted);">Equipo de LaLiga</label>
                    <input type="text" id="nom-team" class="input-field" placeholder="Ej: Real Valladolid" required />
                  </div>
                </div>

                <div class="form-group">
                  <label for="nom-reason" style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block; color: var(--text-muted);">Razón de la nominación</label>
                  <textarea id="nom-reason" class="input-field" rows="2" placeholder="Ej: Marcó gol en propia y vio la tarjeta roja directa en 20 minutos..." style="resize: none; font-family: var(--font-sans);" required></textarea>
                </div>

                <button type="submit" class="btn-primary" style="font-weight: 700; width: 100%; padding: 0.75rem;">
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
              Bufones coronados oficialmente por tu liga en las jornadas anteriores de esta temporada.
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
                      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.35; font-style: italic; margin-bottom: 0.5rem;">
                        "${escapeHTML(h.reason)}"
                      </p>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Attach Jester specific event listeners
    attachLeagueEvents();
  }

  function renderGlobalView(leaguesGrouped, globalHistory) {
    // Generate tabs header HTML
    let tabsHtml = '';
    if (!isGuest && activeLeagueId) {
      tabsHtml = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <button id="tab-league-btn" class="tab-btn" style="
            background: transparent;
            color: var(--text-muted);
            border: none;
            padding: 0.5rem 1rem;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.85rem;
            font-family: var(--font-sans);
          ">
            🏆 Mi Liga (${escapeHTML(currentLeagueName)})
          </button>
          <button id="tab-global-btn" class="tab-btn" style="
            background: rgba(var(--accent-rgb), 0.08);
            color: var(--accent);
            border: none;
            border-bottom: 2px solid var(--accent);
            padding: 0.5rem 1rem;
            font-weight: 800;
            cursor: pointer;
            font-size: 0.85rem;
            font-family: var(--font-sans);
          ">
            🌐 Vista Global (Todas las Ligas)
          </button>
        </div>
      `;
    }

    // Sidebar prompt card based on user state
    let actionCardHtml = '';
    if (isGuest) {
      actionCardHtml = `
        <div class="card glass" style="text-align: center; padding: 1.5rem; border: 1.2px dashed var(--border-color-glow);">
          <span style="font-size: 1.8rem; display: block; margin-bottom: 0.5rem;">🎭</span>
          <h3 class="gradient-text-gold" style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem;">¿Quieres votar o nominar?</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
            La nominación y votación se realiza de manera privada dentro de cada liga fantasy. ¡Únete o crea la tuya!
          </p>
          <button id="go-to-login-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.55rem 1rem; font-weight: 700; width: 100%;">
            Iniciar Sesión / Registrarse
          </button>
        </div>
      `;
    } else if (!activeLeagueId) {
      actionCardHtml = `
        <div class="card glass" style="text-align: center; padding: 1.5rem; border: 1.2px dashed var(--border-color-glow);">
          <span style="font-size: 1.8rem; display: block; margin-bottom: 0.5rem;">🏆</span>
          <h3 class="gradient-text-gold" style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem;">Selecciona una Liga</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
            Para nominar y votar necesitas seleccionar tu liga activa o unirte a una nueva comunidad.
          </p>
          <button id="go-to-leagues-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.55rem 1rem; font-weight: 700; width: 100%;">
            Ir a Mis Ligas
          </button>
        </div>
      `;
    } else {
      actionCardHtml = `
        <div class="card glass" style="text-align: center; padding: 1.5rem; border: 1.2px solid rgba(var(--primary-rgb), 0.2);">
          <span style="font-size: 1.8rem; display: block; margin-bottom: 0.5rem;">⚡</span>
          <h3 class="gradient-text-green" style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem;">Estás en Modo Vista Global</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
            Para nominar futbolistas o emitir tu voto de esta jornada, cambia a la pestaña de tu liga.
          </p>
          <button id="switch-to-league-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.55rem 1rem; font-weight: 700; width: 100%;">
            Ir a Mi Liga
          </button>
        </div>
      `;
    }

    // Build the leagues nominees list HTML
    let nomineesListHtml = '';
    const leagueKeys = Object.keys(leaguesGrouped);
    if (leagueKeys.length === 0) {
      nomineesListHtml = `
        <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted); background: rgba(0,0,0,0.1); border-radius: 12px; border: 1px dashed var(--border-color);">
          <p style="font-size: 0.9rem;">No hay nominados activos en ninguna liga en este momento.</p>
          <p style="font-size: 0.75rem; margin-top: 0.25rem;">Las votaciones se abrirán conforme los mánagers comiencen a nominar en sus respectivas comunidades.</p>
        </div>
      `;
    } else {
      nomineesListHtml = `
        <div style="display: flex; flex-direction: column; gap: 1.75rem;">
          ${leagueKeys.map(key => {
            const leagueObj = leaguesGrouped[key];
            return `
              <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                  <h3 class="gradient-text-green" style="font-size: 1.05rem; font-weight: 800;">
                    🏆 Liga: ${escapeHTML(leagueObj.name)}
                  </h3>
                  <span style="font-size: 0.75rem; background: rgba(var(--accent-rgb), 0.08); border: 1px solid rgba(var(--accent-rgb), 0.2); padding: 0.15rem 0.5rem; border-radius: 4px; color: var(--accent); font-weight: 700;">
                    Jornada ${leagueObj.matchday}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  ${leagueObj.nominees.map(n => {
                    const percent = leagueObj.totalVotes > 0 ? Math.round((n.votes / leagueObj.totalVotes) * 100) : 0;
                    return `
                      <div class="card" style="
                        background: rgba(0,0,0,0.15); 
                        border: 1px solid var(--border-color); 
                        padding: 1rem; 
                        margin: 0; 
                        position: relative; 
                        overflow: hidden; 
                        border-radius: 10px;
                      ">
                        <!-- Progress bar background fill -->
                        <div style="
                          position: absolute; 
                          left: 0; 
                          top: 0; 
                          bottom: 0; 
                          width: ${percent}%; 
                          background: rgba(var(--primary-rgb), 0.03); 
                          transition: width 0.6s ease; 
                          pointer-events: none; 
                          z-index: 1;
                        "></div>

                        <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                          <div style="flex-grow: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                              <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-light);">
                                ${escapeHTML(n.name)}
                              </h4>
                              <span style="font-size: 0.65rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 0.1rem 0.35rem; border-radius: 4px; color: var(--text-muted); font-weight: 600;">
                                ${escapeHTML(n.team)}
                              </span>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">${escapeHTML(n.reason)}</p>
                          </div>
                          <div style="text-align: right; min-width: 70px;">
                            <span style="font-weight: 800; font-size: 1.1rem; color: var(--primary);">${percent}%</span>
                            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem;">${n.votes} votos</div>
                          </div>
                        </div>

                        <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                          <!-- Bar track visual slider -->
                          <div style="flex-grow: 1; height: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; margin-right: 1.5rem; overflow: hidden;">
                            <div style="height: 100%; width: ${percent}%; background: var(--text-muted); border-radius: 3px; transition: width 0.6s ease;"></div>
                          </div>

                          <button class="btn-global-vote-dummy" style="
                            background: rgba(255, 255, 255, 0.02);
                            color: var(--text-muted);
                            border: 1px solid var(--border-color);
                            font-family: var(--font-sans);
                            font-weight: 700;
                            font-size: 0.7rem;
                            padding: 0.35rem 0.75rem;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: var(--transition-fast);
                          ">
                            Votar
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Build history HTML
    let historyHtml = '';
    if (globalHistory.length === 0) {
      historyHtml = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p style="font-size: 0.85rem;">Ningún bufón coronado en el sistema todavía.</p>
        </div>
      `;
    } else {
      historyHtml = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${globalHistory.map(h => {
            return `
              <div style="
                border: 1px solid var(--border-color);
                background: rgba(0,0,0,0.15);
                border-left: 3px solid var(--primary);
                border-radius: 0 10px 10px 0;
                padding: 0.85rem 1rem;
                font-size: 0.85rem;
                margin-bottom: 0.25rem;
              ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; flex-wrap: wrap; gap: 0.5rem;">
                  <strong style="color: var(--primary);">Jornada ${h.matchday}</strong>
                  <span style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">
                    Liga: ${escapeHTML(h.leagueName)}
                  </span>
                </div>
                <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--text-light);">
                  ${escapeHTML(h.name)} <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">(${escapeHTML(h.team)})</span>
                </h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.35; font-style: italic; margin-bottom: 0.5rem;">
                  "${escapeHTML(h.reason)}"
                </p>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 1.5rem;">
          <h1 class="gradient-text-gold" style="font-size: 1.65rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
            El Bufón de la Corte 🌐
          </h1>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Vista Global: Mira las nominaciones activas y los bufones coronados en todas las ligas. Para votar, entra en tu liga correspondiente.
          </p>
        </div>

        ${tabsHtml}

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Nominados por Ligas -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="card glass">
              <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 1.25rem;">
                Nominaciones Activas en la Plataforma
              </h2>
              ${nomineesListHtml}
            </div>
          </div>

          <!-- Columna Derecha: Prompts e Historial -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Prompt de Votación -->
            ${actionCardHtml}

            <!-- Salón de la Vergüenza Global -->
            <div class="card glass">
              <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 1.25rem;">
                Salón de la Vergüenza Global
              </h2>
              ${historyHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Global specific event listeners
    attachGlobalEvents();
  }

  function attachLeagueEvents() {
    // Hook Tab buttons
    const tabGlobalBtn = container.querySelector('#tab-global-btn');
    if (tabGlobalBtn) {
      tabGlobalBtn.addEventListener('click', () => {
        activeTab = 'global';
        loadData();
      });
    }

    // Hook Vote buttons
    container.querySelectorAll('.btn-vote-bufon').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        handleVote(id);
      });
    });

    // Hook Nominar Form
    const nominateForm = container.querySelector('#nominate-form');
    if (nominateForm) {
      nominateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nominateForm.querySelector('#nom-name').value.trim();
        const team = nominateForm.querySelector('#nom-team').value.trim();
        const reason = nominateForm.querySelector('#nom-reason').value.trim();
        if (!name || !team || !reason) return;
        
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
        if (confirm(`¿Estás seguro de que quieres cerrar la Jornada ${currentMatchday}? Esto registrará al bufón ganador en el histórico y limpiará las nominaciones para la Jornada ${currentMatchday + 1}.`)) {
          closeMatchday();
        }
      });
    }
  }

  function attachGlobalEvents() {
    // Hook Tab buttons
    const tabLeagueBtn = container.querySelector('#tab-league-btn');
    if (tabLeagueBtn) {
      tabLeagueBtn.addEventListener('click', () => {
        activeTab = 'league';
        loadData();
      });
    }

    const loginBtn = container.querySelector('#go-to-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', () => callbacks.onNavigate('acceso'));

    const leaguesBtn = container.querySelector('#go-to-leagues-btn');
    if (leaguesBtn) leaguesBtn.addEventListener('click', () => callbacks.onNavigate('mis-ligas'));

    const switchToLeagueBtn = container.querySelector('#switch-to-league-btn');
    if (switchToLeagueBtn) {
      switchToLeagueBtn.addEventListener('click', () => {
        activeTab = 'league';
        loadData();
      });
    }

    // Dummy Vote Buttons Hook - show toast and redirect to login/leagues
    container.querySelectorAll('.btn-global-vote-dummy').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGuest) {
          callbacks.showToast('Inicia sesión y selecciona tu liga para poder votar', 'warning');
          callbacks.onNavigate('acceso');
        } else {
          callbacks.showToast('Selecciona tu liga activa en la sección "Mis Ligas" para poder votar', 'warning');
          callbacks.onNavigate('mis-ligas');
        }
      });
    });
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
}
