/**
 * Renders the "El Bufón" (Matchday's Worst Player) screen.
 * Allows members to nominate and vote for the worst performer of the matchday.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.showToast 
 */
export function renderBufon(container, callbacks) {
  const isGuest = callbacks.isGuest;
  
  // Default Initial Data
  const DEFAULT_NOMINEES = [
    { id: 1, name: "Amallah", team: "Real Valladolid", reason: "Expulsado en el minuto 15 por doble amarilla y cometió un penalti flagrante.", votes: 4 },
    { id: 2, name: "Lejeune", team: "Rayo Vallecano", reason: "Marcó un gol en propia puerta de cabeza intentando despejar un córner.", votes: 8 },
    { id: 3, name: "Marcão", team: "Sevilla FC", reason: "Expulsado a los 3 minutos de entrar al campo tras cometer una falta innecesaria.", votes: 3 }
  ];

  const DEFAULT_HISTORY = [
    { matchday: 4, name: "Abdel Abqar", team: "Deportivo Alavés", reason: "Le pidió la camiseta a Mbappé en el descanso del partido cuando iban perdiendo 2-0 y fue sustituido por mal rendimiento." },
    { matchday: 3, name: "Gerard Gumbau", team: "Rayo Vallecano", reason: "Dio un pase hacia atrás sin mirar que acabó regalando el gol de la victoria al equipo contrario en el minuto 92." }
  ];

  // Load state from local storage or set defaults
  let nominees = JSON.parse(localStorage.getItem('CF_BUFON_NOMINEES') || 'null');
  if (!nominees) {
    nominees = DEFAULT_NOMINEES;
    localStorage.setItem('CF_BUFON_NOMINEES', JSON.stringify(nominees));
  }

  let history = JSON.parse(localStorage.getItem('CF_BUFON_HISTORY') || 'null');
  if (!history) {
    history = DEFAULT_HISTORY;
    localStorage.setItem('CF_BUFON_HISTORY', JSON.stringify(history));
  }

  let currentMatchday = Number(localStorage.getItem('CF_BUFON_CURRENT_MATCHDAY') || '5');
  let userVotedId = localStorage.getItem(`CF_BUFON_VOTED_MATCHDAY_${currentMatchday}`) || null;

  // Read active username
  let userNickname = "Tú";
  const storedUser = localStorage.getItem('sb-giieisavasjbijnvpsnw-auth-token');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const email = parsed?.user?.email || "";
      if (email) userNickname = email.split('@')[0];
    } catch {}
  }

  function saveState() {
    localStorage.setItem('CF_BUFON_NOMINEES', JSON.stringify(nominees));
    localStorage.setItem('CF_BUFON_HISTORY', JSON.stringify(history));
    localStorage.setItem('CF_BUFON_CURRENT_MATCHDAY', currentMatchday.toString());
  }

  function handleVote(nomineeId) {
    if (userVotedId) {
      callbacks.showToast("Ya has votado en esta jornada", "warning");
      return;
    }
    nominees = nominees.map(n => n.id === nomineeId ? { ...n, votes: n.votes + 1 } : n);
    userVotedId = nomineeId;
    localStorage.setItem(`CF_BUFON_VOTED_MATCHDAY_${currentMatchday}`, nomineeId.toString());
    localStorage.setItem('CF_USER_VOTED_BUFON_ID', nomineeId.toString());

    saveState();
    callbacks.showToast("¡Voto registrado! Participando en el sorteo de la camiseta.", "success");
    renderView();
  }

  function drawRaffleWinner(winnerNominee) {
    const activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID') || 'DEMO-ASTURES';
    const activeDemoName = localStorage.getItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`) || "Liga Demo Astures";
    
    const GLOBAL_USERS = [
      { name: "Paco G.", league: activeDemoName },
      { name: "Álvaro M.", league: activeDemoName },
      { name: "Santi K.", league: activeDemoName },
      { name: "Luis T.", league: activeDemoName },
      { name: "Marta R.", league: "Liga Super Mánagers" },
      { name: "Carlos P.", league: "Liga de los Vagos" },
      { name: "Dani F.", league: "Liga La Pachanga" },
      { name: "Sofía L.", league: "Liga Elite" },
      { name: "Javi N.", league: "Liga Fantasy Sur" },
      { name: "Andrés B.", league: "Liga Los Viciados" },
      { name: "Elena H.", league: "Liga Primera División" }
    ];

    const participants = [...GLOBAL_USERS];
    
    // If user voted, add them to the page-wide raffle participants pool
    if (userVotedId) {
      participants.push({ name: userNickname, league: activeDemoName });
    }

    if (participants.length === 0) return null;
    
    const luckyWinner = participants[Math.floor(Math.random() * participants.length)];
    return {
      manager: `${luckyWinner.name} (${luckyWinner.league})`,
      player: winnerNominee.name
    };
  }

  function handleNominate(name, team, reason) {
    if (nominees.length >= 6) {
      callbacks.showToast("Máximo 6 nominados permitidos por jornada para mantener el orden", "error");
      return;
    }

    const newNominee = {
      id: Date.now(),
      name,
      team,
      reason,
      votes: 0
    };

    nominees.push(newNominee);
    
    if (!localStorage.getItem('CF_BUFON_VOTING_START_TIME')) {
      localStorage.setItem('CF_BUFON_VOTING_START_TIME', new Date().toISOString());
    }

    saveState();
    callbacks.showToast("Nominado añadido a la jornada", "success");
    renderView();
  }

  function closeMatchday() {
    if (nominees.length === 0) {
      callbacks.showToast("No hay nominados en esta jornada para cerrar", "error");
      return;
    }

    // Find nominee with the highest votes
    let winner = nominees[0];
    nominees.forEach(n => {
      if (n.votes > winner.votes) {
        winner = n;
      }
    });

    const luckyVoter = drawRaffleWinner(winner);

    // Add winner to history
    history.unshift({
      matchday: currentMatchday,
      name: winner.name,
      team: winner.team,
      reason: winner.reason,
      raffleWinner: luckyVoter ? luckyVoter.manager : null,
      rafflePlayer: luckyVoter ? luckyVoter.player : null
    });

    // Reset for next matchday
    localStorage.removeItem(`CF_BUFON_VOTED_MATCHDAY_${currentMatchday}`);
    localStorage.removeItem('CF_USER_VOTED_BUFON_ID');
    localStorage.removeItem('CF_BUFON_VOTING_START_TIME');
    currentMatchday += 1;
    nominees = [];
    userVotedId = null;
    
    saveState();
    const isUserWinner = luckyVoter && (luckyVoter.manager.includes('Tú') || (userNickname !== 'Tú' && luckyVoter.manager.includes(userNickname)));
    if (isUserWinner) {
      callbacks.showToast(`¡Jornada cerrada! Has ganado el sorteo de la camiseta réplica de ${luckyVoter.player}`, "success");
    } else {
      callbacks.showToast(`Jornada cerrada. ¡El bufón de la jornada es ${winner.name}!`, "success");
    }
    renderView();
  }

  function renderView() {
    const totalVotes = nominees.reduce((sum, n) => sum + n.votes, 0);

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="gradient-text-gold" style="font-size: 1.65rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
              El Bufón de la Jornada
            </h1>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Votación democrática al futbolista de LaLiga con la actuación más cómica o desastrosa en la <strong>Jornada ${currentMatchday}</strong>.
            </p>
          </div>
          <div>
            <button id="close-matchday-btn" class="btn-primary btn-danger" style="font-size: 0.8rem; padding: 0.5rem 1rem; font-weight: 700;">
              Cerrar Jornada y Guardar
            </button>
          </div>
        </div>

        <!-- Banner del Sorteo de Camiseta -->
        <div class="card glass shadow-lg" style="
          background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.08) 100%);
          border: 1px solid rgba(var(--accent-rgb), 0.25);
          box-shadow: 0 4px 20px rgba(var(--accent-rgb), 0.1);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        ">
          <div style="flex-grow: 1; min-width: 250px;">
            <h3 class="gradient-text-gold" style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
              Sorteo Semanal de Camiseta Réplica
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-light); line-height: 1.45;">
              ¡Vota por el Bufón de la jornada y participa automáticamente! Sorteamos una camiseta réplica a la semana entre todos los mánagers de España que registren su voto. El ganador se anunciará al cerrar la jornada.
            </p>
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border: 1.2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.6rem 1rem;
            text-align: center;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          ">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.15rem;">Premio de la Semana</span>
            <span style="font-size: 1.05rem; color: var(--accent); font-weight: 800; display: block;">Camiseta Oficial LaLiga</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); display: block; font-style: italic;">(Réplica Autorizada)</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Votación Activa & Formulario -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Votación -->
            <div class="card glass">
              <h2 class="card-title gradient-text-gold" style="font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span>Candidatos de la Jornada</span>
                <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">${totalVotes} votos totales</span>
              </h2>

              <!-- Countdown & Raffle Info Banner -->
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
                <div style="color: var(--text-muted); line-height: 1.35; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.35rem; margin-top: 0.15rem;">
                  <strong>Sorteo Semanal:</strong> Al votar, participas automáticamente en el sorteo de una <strong>camiseta réplica</strong> del futbolista al que votes. ¡Sorteamos una camiseta a la semana!
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
                                ${n.name}
                              </h4>
                              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 0.15rem 0.4rem; border-radius: 4px; color: var(--text-muted); font-weight: 600;">
                                ${n.team}
                              </span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${n.reason}</p>
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
                  const hasRaffle = h.raffleWinner && h.rafflePlayer;
                  const isUserWinner = hasRaffle && (h.raffleWinner.includes('Tú') || (userNickname !== 'Tú' && h.raffleWinner.includes(userNickname)));
                  return `
                    <div style="
                      border: 1px solid var(--border-color);
                      background: ${isUserWinner ? 'rgba(var(--accent-rgb), 0.05)' : 'rgba(0,0,0,0.15)'};
                      border-left: 3px solid ${isUserWinner ? 'var(--accent)' : 'var(--primary)'};
                      border-radius: 0 10px 10px 0;
                      padding: 0.85rem 1rem;
                      font-size: 0.85rem;
                      margin-bottom: 0.75rem;
                    ">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <strong style="color: ${isUserWinner ? 'var(--accent)' : 'var(--primary)'};">Jornada ${h.matchday}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">
                          ${h.team}
                        </span>
                      </div>
                      <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--text-light);">
                        ${h.name}
                      </h4>
                      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.35; font-style: italic; margin-bottom: 0.5rem;">
                        "${h.reason}"
                      </p>
                      ${hasRaffle ? `
                        <div style="
                          border-top: 1px solid rgba(255,255,255,0.05);
                          padding-top: 0.5rem;
                          margin-top: 0.5rem;
                          font-size: 0.75rem;
                          color: ${isUserWinner ? 'var(--text-light)' : 'var(--text-muted)'};
                          display: flex;
                          align-items: center;
                          gap: 0.35rem;
                        ">
                          <strong>Sorteo Camiseta:</strong> 
                          <span style="color: ${isUserWinner ? 'var(--accent)' : 'var(--text-light)'}; font-weight: 700;">
                            @${escapeHTML(h.raffleWinner)}
                          </span> 
                          <span>(Réplica de ${escapeHTML(h.rafflePlayer)})</span>
                        </div>
                        ${isUserWinner ? `
                          <div style="
                            background: rgba(var(--accent-rgb), 0.1);
                            border: 1px solid rgba(var(--accent-rgb), 0.2);
                            border-radius: 4px;
                            padding: 0.35rem 0.5rem;
                            margin-top: 0.4rem;
                            font-size: 0.7rem;
                            color: var(--text-light);
                            font-weight: 600;
                            text-align: center;
                          ">
                            ¡Has ganado! Nos pondremos en contacto para el envío.
                          </div>
                        ` : ''}
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Hook Vote buttons
    container.querySelectorAll('.btn-vote-bufon').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGuest) {
          callbacks.showToast('Inicia sesión para votar por el Bufón de la jornada', 'warning');
          callbacks.onNavigate('acceso');
          return;
        }
        const id = Number(btn.dataset.id);
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
        if (confirm(`¿Estás seguro de que quieres cerrar la Jornada ${currentMatchday}? Esto registrará al bufón ganador en el histórico y limpiará las nominaciones para la Jornada ${currentMatchday + 1}.`)) {
          closeMatchday();
        }
      });
    }
  }

  // Helper to compute countdown remaining time text
  function getRemainingTimeText() {
    const votingStartTime = localStorage.getItem('CF_BUFON_VOTING_START_TIME') || null;
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
    const votingStartTime = localStorage.getItem('CF_BUFON_VOTING_START_TIME') || null;
    if (!votingStartTime) return 24 * 3600 * 1000;
    const start = new Date(votingStartTime).getTime();
    const end = start + (24 * 3600 * 1000);
    return end - Date.now();
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

  renderView();
}
