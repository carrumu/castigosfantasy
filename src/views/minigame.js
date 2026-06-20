/**
 * Renders the Wordle-style Guess the Player mini-game.
 * Only active First Division players from Spanish LaLiga EA Sports.
 * Strictly one synchronized game per day for all users.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.showToast 
 */
export function renderMinigame(container, callbacks) {
  // List of active LaLiga players (lengths between 3 and 10 letters for optimal mobile display)
  const LALIGA_PLAYERS = [
    "ASPAS",
    "BELLINGHAM",
    "GRIEZMANN",
    "PEDRI",
    "GAVI",
    "VINICIUS",
    "VALVERDE",
    "KOKE",
    "MAFFEO",
    "MURIQI",
    "ISCO",
    "RAPHINHA",
    "KOUNDE",
    "MODRIC",
    "SORLOTH",
    "CHIMY",
    "SANCET",
    "GURUZETA",
    "OYARZABAL",
    "ZUBIMENDI",
    "CARVAJAL",
    "OBLAK",
    "DEPAUL",
    "KIRIAN",
    "LEJEUNE",
    "ISI",
    "YAMAL",
    "GUTIERREZ",
    "RUDIGER",
    "CAMAVINGA",
    "TCHOUAMENI",
    "BRAHIM",
    "KUBO",
    "MENDY",
    "MILITAO",
    "FORNALS",
    "OCAMPOS",
    "INAKI",
    "NICO",
    "UNAI",
    "VIVIAN",
    "GIMENEZ",
    "BARRIOS",
    "LLORENTE",
    "CORREA",
    "HERRERA",
    "BALDE",
    "PEPULU",
    "SOW",
    "TSYGANKOV",
    "RADOJA",
    "DARDER",
    "GAYA"
  ];

  // Helper: Get Date String (YYYY-MM-DD)
  const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  };

  // Helper: Get days difference between two date strings (YYYY-MM-DD)
  const getDaysDiff = (dateStr1, dateStr2) => {
    if (!dateStr1 || !dateStr2) return 999;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Get Daily Player from date seed
  const getDailyPlayer = () => {
    const epoch = new Date(2026, 0, 1).getTime(); // Reference point: Jan 1, 2026
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - epoch) / (1000 * 60 * 60 * 24));
    const index = Math.abs(diffDays) % LALIGA_PLAYERS.length;
    return {
      name: LALIGA_PLAYERS[index],
      number: diffDays + 1
    };
  };

  // State
  let secretPlayer = "";
  let guesses = [];
  let currentGuess = "";
  let gameStatus = "IN_PROGRESS"; // "IN_PROGRESS", "WON", "LOST"
  let dailyNumber = 0;

  // Initialize Daily Game State
  function initGame() {
    const todayStr = getDateString();
    const savedState = JSON.parse(localStorage.getItem('CF_WORDLE_DAILY_STATE') || 'null');
    const dailyInfo = getDailyPlayer();
    secretPlayer = dailyInfo.name;
    dailyNumber = dailyInfo.number;

    // Calculate and verify streak cooldown (grace period of 2 days: difference <= 3)
    const lastWonStr = localStorage.getItem('CF_WORDLE_LAST_WON_DATE');
    const daysSinceLastWin = getDaysDiff(todayStr, lastWonStr);
    const stats = getStats();
    if (daysSinceLastWin > 3 && stats.currentStreak > 0) {
      stats.currentStreak = 0;
      localStorage.setItem('CF_WORDLE_STATS', JSON.stringify(stats));
    }

    if (savedState && savedState.date === todayStr && savedState.secretPlayer === secretPlayer) {
      guesses = savedState.guesses || [];
      gameStatus = savedState.status || "IN_PROGRESS";
      currentGuess = "";
    } else {
      guesses = [];
      gameStatus = "IN_PROGRESS";
      currentGuess = "";
      saveDailyState();
    }
  }

  function saveDailyState() {
    const todayStr = getDateString();
    localStorage.setItem('CF_WORDLE_DAILY_STATE', JSON.stringify({
      date: todayStr,
      secretPlayer,
      guesses,
      status: gameStatus
    }));
  }

  // Get Stats Object
  function getStats() {
    const defaultStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    };
    return JSON.parse(localStorage.getItem('CF_WORDLE_STATS') || JSON.stringify(defaultStats));
  }

  // Save Stats
  function updateStats(won, attemptCount) {
    const todayStr = getDateString();
    const lastRecordedDaily = localStorage.getItem('CF_WORDLE_LAST_RECORDED_DAILY');
    if (lastRecordedDaily === todayStr) return;

    const stats = getStats();
    stats.gamesPlayed += 1;
    
    if (won) {
      stats.gamesWon += 1;
      const lastWonStr = localStorage.getItem('CF_WORDLE_LAST_WON_DATE');
      const daysSinceLastWin = getDaysDiff(todayStr, lastWonStr);

      if (lastWonStr === todayStr) {
        // Already won today, do nothing to streak
      } else if (daysSinceLastWin <= 3) {
        // Streak continues (yesterday, 2 days ago, or 3 days ago)
        stats.currentStreak += 1;
      } else {
        // Streak resets to 1 (new start or broken cooldown)
        stats.currentStreak = 1;
      }

      if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
      }
      stats.guesses[attemptCount] = (stats.guesses[attemptCount] || 0) + 1;
      
      localStorage.setItem('CF_WORDLE_LAST_WON_DATE', todayStr);
    } else {
      // If they play and lose, streak resets to 0
      stats.currentStreak = 0;
    }

    localStorage.setItem('CF_WORDLE_STATS', JSON.stringify(stats));
    localStorage.setItem('CF_WORDLE_LAST_RECORDED_DAILY', todayStr);
  }

  // Wordle Matching Algorithm
  function checkGuess(guess, secret) {
    const result = Array(secret.length).fill('absent'); // 'correct', 'present', 'absent'
    const secretLetters = secret.split('');
    const guessLetters = guess.split('');
    
    const secretMatched = Array(secret.length).fill(false);
    const guessMatched = Array(guess.length).fill(false);
    
    // Pass 1: Greens (Correct position)
    for (let i = 0; i < secret.length; i++) {
      if (guessLetters[i] === secretLetters[i]) {
        result[i] = 'correct';
        secretMatched[i] = true;
        guessMatched[i] = true;
      }
    }
    
    // Pass 2: Yellows (Present elsewhere)
    for (let i = 0; i < guess.length; i++) {
      if (guessMatched[i]) continue;
      for (let j = 0; j < secret.length; j++) {
        if (!secretMatched[j] && guessLetters[i] === secretLetters[j]) {
          result[i] = 'present';
          secretMatched[j] = true;
          break;
        }
      }
    }
    
    return result;
  }

  // Get Letter Keys State from Guesses
  function getKeyboardLetterStates() {
    const states = {}; // { 'A': 'correct', 'B': 'present', 'C': 'absent' }
    guesses.forEach(g => {
      const evaluation = checkGuess(g, secretPlayer);
      for (let i = 0; i < g.length; i++) {
        const char = g[i];
        const state = evaluation[i];
        
        if (!states[char]) {
          states[char] = state;
        } else if (states[char] === 'absent' && (state === 'present' || state === 'correct')) {
          states[char] = state;
        } else if (states[char] === 'present' && state === 'correct') {
          states[char] = state;
        }
      }
    });
    return states;
  }

  // Generate shareable grid text
  function getShareText() {
    let text = `CastigoFantasy Wordle #Día${dailyNumber} (${gameStatus === 'WON' ? guesses.length : 'X'}/6)\n\n`;
    guesses.forEach(g => {
      const evaluation = checkGuess(g, secretPlayer);
      const rowEmojis = evaluation.map(state => {
        if (state === 'correct') return '🟩';
        if (state === 'present') return '🟨';
        return '⬛';
      }).join('');
      text += rowEmojis + '\n';
    });
    text += `\nJuega aquí: ${window.location.origin}`;
    return text;
  }

  function handleKeyPress(key) {
    if (gameStatus !== 'IN_PROGRESS') return;

    key = key.toUpperCase();

    if (key === 'ENTER') {
      if (currentGuess.length < secretPlayer.length) {
        callbacks.showToast(`El nombre debe tener ${secretPlayer.length} letras`, 'info');
        shakeActiveRow();
        return;
      }
      
      // Submit guess
      guesses.push(currentGuess);
      const latestIndex = guesses.length - 1;
      currentGuess = "";

      // Animate flip for the newly submitted row
      setTimeout(() => {
        animateFlip(latestIndex);
      }, 50);

      // Check win/loss conditions
      if (guesses[latestIndex] === secretPlayer) {
        gameStatus = "WON";
        updateStats(true, guesses.length);
        saveDailyState();
        setTimeout(() => {
          showStatsModal(true);
        }, 1800);
      } else if (guesses.length >= 6) {
        gameStatus = "LOST";
        updateStats(false, 6);
        saveDailyState();
        setTimeout(() => {
          showStatsModal(false);
        }, 1800);
      } else {
        saveDailyState();
        // Render updates
        setTimeout(() => {
          renderView();
        }, 1500);
      }
    } else if (key === 'BACKSPACE' || key === 'BACK') {
      currentGuess = currentGuess.slice(0, -1);
      updateActiveRowHTML();
    } else if (/^[A-ZÑ]$/.test(key)) {
      if (currentGuess.length < secretPlayer.length) {
        currentGuess += key;
        updateActiveRowHTML();
      }
    }
  }

  // Animation: shake the current row if input length is too short
  function shakeActiveRow() {
    const activeRow = container.querySelector('.wordle-row.active');
    if (activeRow) {
      activeRow.classList.add('shake');
      activeRow.addEventListener('animationend', () => {
        activeRow.classList.remove('shake');
      }, { once: true });
    }
  }

  // Animation: Flip letters in 3D sequentially
  function animateFlip(rowIndex) {
    const rowEl = container.querySelector(`.wordle-row[data-row-index="${rowIndex}"]`);
    if (!rowEl) return;
    
    const cells = rowEl.querySelectorAll('.wordle-cell');
    const evaluation = checkGuess(guesses[rowIndex], secretPlayer);
    
    cells.forEach((cell, i) => {
      setTimeout(() => {
        cell.classList.add('flip');
        
        // At mid-flip (250ms), change the color background
        setTimeout(() => {
          cell.classList.remove('empty');
          cell.classList.add(evaluation[i]);
        }, 250);
      }, i * 200);
    });

    // Re-render whole keyboard states after the last flip finishes
    setTimeout(() => {
      renderView();
    }, cells.length * 200 + 400);
  }

  // Update active row characters in real-time
  function updateActiveRowHTML() {
    const activeRow = container.querySelector('.wordle-row.active');
    if (!activeRow) return;

    const cells = activeRow.querySelectorAll('.wordle-cell');
    cells.forEach((cell, i) => {
      if (i < currentGuess.length) {
        cell.innerText = currentGuess[i];
        cell.classList.add('pop');
        cell.classList.remove('empty');
      } else {
        cell.innerText = "";
        cell.classList.remove('pop');
        cell.classList.add('empty');
      }
    });
  }

  function handleShareClick() {
    const shareText = getShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          callbacks.showToast('¡Resultado copiado al portapapeles!', 'success');
        })
        .catch(() => {
          fallbackShare(shareText);
        });
    } else {
      fallbackShare(shareText);
    }
  }

  function fallbackShare(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      callbacks.showToast('¡Resultado copiado al portapapeles!', 'success');
    } catch (err) {
      callbacks.showToast('Error al copiar el resultado', 'error');
    }
    document.body.removeChild(textArea);
  }

  function showStatsModal(won) {
    const stats = getStats();
    const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    
    // Find max guess count for simple graph scaling
    const maxGuessCount = Math.max(...Object.values(stats.guesses), 1);

    // Create Modal Element
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-content glass" style="max-width: 450px; text-align: center; border: 1px solid var(--border-color-glow);">
        <h2 class="gradient-text-green" style="font-size: 1.6rem; margin-bottom: 0.5rem; font-weight: 800;">
          ${won ? '¡Has acertado!' : 'Fin de la partida'}
        </h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          El jugador secreto era: <strong style="color: var(--accent); font-size: 1.1rem; letter-spacing: 1px;">${secretPlayer}</strong>
        </p>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color);">
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-light);">${stats.gamesPlayed}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Jugadas</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-light);">${winRate}%</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Victorias</div>
          </div>
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-light);">
              ${stats.currentStreak}
            </div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Racha Act.</div>
            ${stats.currentStreak > 0 ? (() => {
              let gradStart = '#b91c1c', gradEnd = '#facc15', fireGlow = 'rgba(249, 115, 22, 0.6)';
              if (stats.currentStreak >= 5 && stats.currentStreak <= 20) {
                gradStart = '#6d28d9'; gradEnd = '#ec4899'; fireGlow = 'rgba(168, 85, 247, 0.6)';
              } else if (stats.currentStreak > 20) {
                gradStart = '#047857'; gradEnd = '#a3e635'; fireGlow = 'rgba(34, 197, 94, 0.6)';
              }
              return `
                <div class="streak-fire" style="
                  position: absolute;
                  top: -8px;
                  right: 4px;
                  width: 16px;
                  height: 16px;
                  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)) drop-shadow(0 0 3px ${fireGlow});
                ">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="modalFireGrad-${stats.currentStreak}" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="${gradStart}" />
                        <stop offset="100%" stop-color="${gradEnd}" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#modalFireGrad-${stats.currentStreak})" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                  </svg>
                </div>
              `;
            })() : ''}
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-light);">${stats.maxStreak}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Racha Máx.</div>
          </div>
        </div>

        <!-- Guess Distribution Graph -->
        <div style="text-align: left; margin-bottom: 1.5rem; font-size: 0.8rem;">
          <h4 style="margin-bottom: 0.75rem; color: var(--text-light); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Distribución de Intentos</h4>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${[1, 2, 3, 4, 5, 6].map(num => {
              const count = stats.guesses[num] || 0;
              const percent = Math.max(8, Math.round((count / maxGuessCount) * 100));
              const isCurrentAttempt = gameStatus === 'WON' && guesses.length === num;
              return `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="width: 10px; font-weight: 600; color: var(--text-muted);">${num}</span>
                  <div style="flex-grow: 1; background: rgba(255,255,255,0.03); height: 18px; border-radius: 4px; overflow: hidden; position: relative;">
                    <div style="
                      width: ${percent}%; 
                      background: ${isCurrentAttempt ? 'var(--primary)' : '#4b5563'}; 
                      height: 100%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: flex-end; 
                      padding-right: 0.35rem;
                      transition: width 0.8s ease-out;
                    ">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #fff;">${count}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button id="modal-share-btn" class="btn-primary" style="flex-grow: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>Compartir Resultado</span>
          </button>
          <button id="modal-close-btn" class="btn-secondary" style="padding: 0.75rem 1.25rem;">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#modal-share-btn').addEventListener('click', handleShareClick);
    modal.querySelector('#modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });
  }

  function renderView() {
    const letterStates = getKeyboardLetterStates();
    const stats = getStats();
    const currentStreak = stats.currentStreak || 0;
    
    // Header section with action buttons for Mode Toggle
    container.innerHTML = `
      <div class="container" style="max-width: 600px; padding-top: 0.5rem; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header Info -->
        <div style="width: 100%; text-align: center; margin-bottom: 1rem; position: relative;">
          <h1 class="gradient-text-green" style="font-size: 1.6rem; font-weight: 900; margin-bottom: 0.5rem;">
            Adivina el Jugador
          </h1>
          ${currentStreak > 0 ? (() => {
            let gradStart = '#b91c1c', gradEnd = '#facc15', fireGlow = 'rgba(249, 115, 22, 0.6)';
            if (currentStreak >= 5 && currentStreak <= 20) {
              gradStart = '#6d28d9'; gradEnd = '#ec4899'; fireGlow = 'rgba(168, 85, 247, 0.6)';
            } else if (currentStreak > 20) {
              gradStart = '#047857'; gradEnd = '#a3e635'; fireGlow = 'rgba(34, 197, 94, 0.6)';
            }
            return `
              <div class="streak-badge-container" style="margin-bottom: 0.85rem; position: relative; display: inline-block;">
                <span class="streak-badge" style="
                  position: relative;
                  font-size: 0.8rem; 
                  background: #deed00; 
                  color: #000000; 
                  padding: 0.35rem 0.75rem; 
                  border-radius: 4px; 
                  display: inline-flex; 
                  align-items: center; 
                  border: 2px solid #000000;
                  box-shadow: 3px 3px 0px #000000;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Racha: ${currentStreak} victorias
                </span>
                <div class="streak-fire" style="
                  position: absolute;
                  top: -11px;
                  right: -4px; /* Moved slightly left to look more included */
                  width: 22px;
                  height: 22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10;
                  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 5px ${fireGlow});
                ">
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="fireGrad-${currentStreak}" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="${gradStart}" />
                        <stop offset="100%" stop-color="${gradEnd}" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#fireGrad-${currentStreak})" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                  </svg>
                </div>
              </div>
            `;
          })() : ''}
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            Jugador del día <strong>#${dailyNumber}</strong> (LaLiga EA Sports)
          </p>
          
          <!-- Mode switches & stats icon -->
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 0.75rem; gap: 0.5rem;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Solo un intento al día</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <button id="show-stats-btn" class="btn-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.75rem; border-radius: 8px;" title="Ver Estadísticas">
                Estadísticas
              </button>
            </div>
          </div>
        </div>

        <!-- Banner de partida terminada -->
        ${gameStatus !== 'IN_PROGRESS' ? `
          <div class="card glass" style="width: 100%; padding: 1.25rem; text-align: center; margin-bottom: 1.25rem; border: 1px solid var(--border-color-glow);">
            <h3 style="font-size: 1.05rem; margin-bottom: 0.35rem; color: ${gameStatus === 'WON' ? 'var(--primary)' : 'var(--danger)'};">
              ${gameStatus === 'WON' ? '¡Enhorabuena! Has acertado.' : 'Has agotado tus 6 intentos.'}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              El jugador de hoy era: <strong style="color: var(--accent); letter-spacing: 0.5px;">${secretPlayer}</strong>. Vuelve mañana para un nuevo reto.
            </p>
            <button id="banner-share-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem; margin: 0 auto; display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
              <span>Compartir Resultado</span>
            </button>
          </div>
        ` : ''}

        <!-- Wordle Grid Container -->
        <div class="wordle-grid" style="
          display: grid; 
          grid-template-rows: repeat(6, 1fr); 
          gap: 0.35rem; 
          width: 100%; 
          max-width: ${Math.min(380, secretPlayer.length * 55)}px; 
          margin-bottom: 1.25rem; 
          aspect-ratio: ${secretPlayer.length} / 6;
        ">
          ${Array(6).fill(null).map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const isActive = rowIndex === guesses.length;
            const isFinished = rowIndex < guesses.length;
            
            // Evaluates colors if row is already checked
            const evaluation = isFinished ? checkGuess(guess, secretPlayer) : [];

            return `
              <div class="wordle-row ${isActive && gameStatus === 'IN_PROGRESS' ? 'active' : ''}" data-row-index="${rowIndex}" style="
                display: grid; 
                grid-template-columns: repeat(${secretPlayer.length}, 1fr); 
                gap: 0.35rem;
              ">
                ${Array(secretPlayer.length).fill(null).map((_, colIndex) => {
                  let char = "";
                  let cellClass = "empty";
                  
                  if (isFinished) {
                    char = guess[colIndex];
                    cellClass = evaluation[colIndex]; // 'correct', 'present', 'absent'
                  } else if (isActive && gameStatus === 'IN_PROGRESS') {
                    char = currentGuess[colIndex] || "";
                    cellClass = char ? "pop" : "empty";
                  }

                   return `
                    <div class="wordle-cell ${cellClass}" style="
                      aspect-ratio: 1; 
                      border: 3px solid ${char ? 'var(--accent)' : '#000000'};
                      border-radius: 8px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: calc(1rem + 0.5vw);
                      font-weight: 800;
                      text-transform: uppercase;
                      background: var(--bg-card);
                      user-select: none;
                      transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
                      transform: ${char && !isFinished ? 'translate(-2px, -2px)' : 'none'};
                      box-shadow: ${char && !isFinished ? '5px 5px 0px #000000' : '3px 3px 0px #000000'};
                    ">${char}</div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Virtual Keyboard -->
        <div class="wordle-keyboard" style="
          width: 100%; 
          max-width: 500px; 
          display: flex; 
          flex-direction: column; 
          gap: 0.4rem;
          margin-top: auto;
          background: rgba(0,0,0,0.1);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          ${gameStatus !== 'IN_PROGRESS' ? 'opacity: 0.5; pointer-events: none;' : ''}
        ">
          ${[
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
            ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
          ].map(row => `
            <div style="display: flex; justify-content: center; gap: 0.25rem; width: 100%;">
              ${row.map(key => {
                const state = letterStates[key] || "";
                const isSpecial = key === 'ENTER' || key === 'BACK';
                return `
                  <button class="keyboard-key ${state}" data-key="${key}" style="
                    flex: ${isSpecial ? '1.5 1 0px' : '1 1 0px'};
                    min-width: 0;
                    height: 55px;
                    border-radius: 6px;
                    background: ${
                      state === 'correct' ? '#22c55e' :
                      state === 'present' ? '#deed00' :
                      state === 'absent' ? '#1a1a1a' :
                      '#2a2a2a'
                    };
                    color: ${
                      state === 'present' ? '#000000' :
                      'var(--text-light)'
                    };
                    font-family: var(--font-sans);
                    font-size: ${isSpecial ? '0.8rem' : '1.05rem'};
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                  ">
                    ${key === 'BACK' ? '⌫' : key}
                  </button>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Hook virtual keyboard buttons
    if (gameStatus === 'IN_PROGRESS') {
      container.querySelectorAll('.keyboard-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
          btn.blur();
          const key = btn.dataset.key;
          handleKeyPress(key === 'BACK' ? 'BACKSPACE' : key);
        });
      });
    }

    const statsBtn = container.querySelector('#show-stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        showStatsModal(gameStatus === 'WON');
      });
    }

    const bannerShareBtn = container.querySelector('#banner-share-btn');
    if (bannerShareBtn) {
      bannerShareBtn.addEventListener('click', handleShareClick);
    }
  }

  // Handle Physical Keyboards
  function handleKeyDown(e) {
    if (gameStatus !== 'IN_PROGRESS') return;
    if (e.repeat) return;
    
    // Check if user is typing in some text input elsewhere
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-ZÑ]$/.test(key)) {
      e.preventDefault();
      handleKeyPress(key);
    }
  }

  // Initialize daily game
  initGame();
  renderView();

  // Attach and detach keydown listener correctly
  window.addEventListener('keydown', handleKeyDown);
  
  // Custom cleanup when view gets destroyed/unmounted
  const observer = new MutationObserver((mutations) => {
    if (!document.body.contains(container)) {
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
