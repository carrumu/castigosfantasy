import { setupAutocomplete } from '../utils/autocomplete';
import { LALIGA_TOPICS_DB } from '../utils/topics-db';
import { LALIGA_PLAYERS_DB } from '../utils/players-db';

// Clean, official names list for Spanish football clubs
const LALIGA_TEAMS_CLEAN = [
  { name: "Real Madrid CF", searchKeys: ["real madrid", "madrid", "real madrid cf"] },
  { name: "FC Barcelona", searchKeys: ["fc barcelona", "barcelona", "barca", "blaugrana"] },
  { name: "Atlético de Madrid", searchKeys: ["atletico de madrid", "atletico", "atleti"] },
  { name: "Athletic Club", searchKeys: ["athletic club", "athletic", "bilbao"] },
  { name: "Real Sociedad", searchKeys: ["real sociedad", "la real"] },
  { name: "Real Betis Balompié", searchKeys: ["real betis", "betis", "real betis balompie"] },
  { name: "Sevilla FC", searchKeys: ["sevilla fc", "sevilla"] },
  { name: "Valencia CF", searchKeys: ["valencia cf", "valencia"] },
  { name: "Villarreal CF", searchKeys: ["villarreal cf", "villarreal", "submarino amarillo"] },
  { name: "Getafe CF", searchKeys: ["getafe cf", "getafe"] },
  { name: "CA Osasuna", searchKeys: ["ca osasuna", "osasuna"] },
  { name: "Rayo Vallecano", searchKeys: ["rayo vallecano", "rayo"] },
  { name: "Girona FC", searchKeys: ["girona fc", "girona"] },
  { name: "RC Celta de Vigo", searchKeys: ["rc celta de vigo", "celta de vigo", "celta"] },
  { name: "RCD Mallorca", searchKeys: ["rcd mallorca", "mallorca"] },
  { name: "Deportivo Alavés", searchKeys: ["deportivo alaves", "alaves"] },
  { name: "UD Las Palmas", searchKeys: ["ud las palmas", "las palmas"] },
  { name: "CD Leganés", searchKeys: ["cd leganes", "leganes"] },
  { name: "Real Valladolid CF", searchKeys: ["real valladolid cf", "real valladolid", "valladolid"] },
  { name: "RCD Espanyol", searchKeys: ["rcd espanyol", "espanyol"] },
  { name: "Real Zaragoza", searchKeys: ["real zaragoza", "zaragoza"] },
  { name: "Real Racing Club de Santander", searchKeys: ["real racing club de santander", "racing de santander", "racing", "santander"] },
  { name: "Málaga CF", searchKeys: ["malaga cf", "malaga"] },
  { name: "Elche CF", searchKeys: ["elche cf", "elche"] },
  { name: "RC Deportivo de La Coruña", searchKeys: ["rc deportivo de la coruña", "deportivo de la coruña", "deportivo", "depor"] },
  { name: "Real Sporting de Gijón", searchKeys: ["real sporting de gijon", "sporting de gijon", "sporting", "gijon"] },
  { name: "Granada CF", searchKeys: ["granada cf", "granada"] },
  { name: "Levante UD", searchKeys: ["levante ud", "levante"] },
  { name: "Cádiz CF", searchKeys: ["cadiz cf", "cadiz"] },
  { name: "UD Almería", searchKeys: ["ud almeria", "almeria"] },
  { name: "SD Eibar", searchKeys: ["sd eibar", "eibar"] },
  { name: "CD Tenerife", searchKeys: ["cd tenerife", "tenerife"] },
  { name: "Real Oviedo", searchKeys: ["real oviedo", "oviedo"] },
  { name: "SD Huesca", searchKeys: ["sd huesca", "huesca"] }
];

/**
 * Renders the Futbol11 - Daily Top 10 game view.
 * Displays the single synchronized daily topic for the user.
 * Users guess answers from the daily topic using autocomplete.
 * Progress is saved to localStorage.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 * @param {Function} callbacks.showToast
 */
export function renderTop10(container, callbacks) {
  let activeTopic = null; // Topic object from LALIGA_TOPICS_DB
  let topicIndex = -1;
  let guessedIndices = new Set();
  let surrendered = false;
  let dailyNumber = 0;
  let autocompleteCleanup = null;
  let feedbackMessage = "";

  // Helper: Get Date String (YYYY-MM-DD)
  const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  };

  // Helper: Get Daily Topic from date seed
  const getDailyTopic = () => {
    const epoch = new Date(2026, 0, 1).getTime(); // Reference point: Jan 1, 2026
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - epoch) / (1000 * 60 * 60 * 24));
    // Support wrap-around for index if dates exceed DB length
    const index = Math.abs(diffDays) % LALIGA_TOPICS_DB.length;
    return {
      topic: LALIGA_TOPICS_DB[index],
      index: index,
      number: diffDays + 1
    };
  };

  // Initialize Daily Game State
  function initGame() {
    const todayStr = getDateString();
    const savedState = JSON.parse(localStorage.getItem('CF_TOP10_DAILY_STATE') || 'null');
    const dailyInfo = getDailyTopic();
    activeTopic = dailyInfo.topic;
    topicIndex = dailyInfo.index;
    dailyNumber = dailyInfo.number;

    if (savedState && savedState.date === todayStr && savedState.topicIndex === topicIndex) {
      guessedIndices = new Set(savedState.guessedIndices || []);
      surrendered = savedState.surrendered || false;
    } else {
      guessedIndices = new Set();
      surrendered = false;
      saveDailyState();
    }
  }

  // Save State
  function saveDailyState() {
    const todayStr = getDateString();
    localStorage.setItem('CF_TOP10_DAILY_STATE', JSON.stringify({
      date: todayStr,
      topicIndex: topicIndex,
      guessedIndices: Array.from(guessedIndices),
      surrendered: surrendered
    }));
  }

  // Helper to remove accents for fuzzy matching
  function cleanString(str) {
    if (!str) return '';
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o")
      .replace(/Ø/g, "O")
      .toLowerCase()
      .trim();
  }

  // Convert standard regional indicator country flag emoji to lowercase 2-letter country code
  const getCountryCode = (flag) => {
    if (!flag) return "es";
    const countryFlagRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/;
    const match = flag.match(countryFlagRegex);
    if (match) {
      const emoji = match[0];
      const char1 = emoji.charCodeAt(1) - 0xDDE6;
      const char2 = emoji.charCodeAt(3) - 0xDDE6;
      const letter1 = String.fromCharCode(97 + char1);
      const letter2 = String.fromCharCode(97 + char2);
      return (letter1 + letter2).toLowerCase();
    }
    
    // Fallback dictionary for string flags
    const flagLower = flag.toLowerCase();
    if (flagLower.includes("es") || flagLower.includes("esp")) return "es";
    if (flagLower.includes("ar") || flagLower.includes("arg")) return "ar";
    if (flagLower.includes("pt") || flagLower.includes("por")) return "pt";
    if (flagLower.includes("fr") || flagLower.includes("fra")) return "fr";
    if (flagLower.includes("mx") || flagLower.includes("mex")) return "mx";
    if (flagLower.includes("uy") || flagLower.includes("uru")) return "uy";
    if (flagLower.includes("br") || flagLower.includes("bra")) return "br";
    if (flagLower.includes("hr") || flagLower.includes("cro")) return "hr";
    if (flagLower.includes("it") || flagLower.includes("ita")) return "it";
    if (flagLower.includes("be") || flagLower.includes("bel")) return "be";
    if (flagLower.includes("hu") || flagLower.includes("hun")) return "hu";
    if (flagLower.includes("si") || flagLower.includes("slo")) return "si";
    if (flagLower.includes("cl") || flagLower.includes("chi")) return "cl";
    if (flagLower.includes("ph") || flagLower.includes("fil")) return "ph";
    
    return "es";
  };

  // Render colorful flag img using flagcdn.com (works on all OS including Windows)
  const getFlagHtml = (flag) => {
    const code = getCountryCode(flag);
    return `<img src="https://flagcdn.com/w40/${code}.png" style="width: 24px; height: auto; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); display: inline-block; vertical-align: middle;" alt="${code.toUpperCase()}" />`;
  };

  // Dynamically resolve autocomplete search database based on topic
  const getAutocompleteDatabase = () => {
    const badge = (activeTopic.badgeTitle || "").toUpperCase();
    const title = (activeTopic.title || "").toLowerCase();

    if (badge.includes("CLUBES") || badge.includes("TEMPORADAS EN PRIMERA") || title.includes("equipo") || title.includes("club")) {
      // It is a team/club topic. Return our clean official list of teams.
      const db = [...LALIGA_TEAMS_CLEAN];
      // Ensure all answers in activeTopic are in the database (as fallbacks)
      activeTopic.answers.forEach(ans => {
        if (!db.some(x => x.name.toLowerCase() === ans.name.toLowerCase())) {
          db.push({ name: ans.name, team: "", searchKeys: [cleanString(ans.name)] });
        }
      });
      return db;
    } else if (badge.includes("ESTADIOS") || title.includes("estadio")) {
      // It is a stadium topic
      const SPAIN_STADIUMS = [
        "Camp Nou", "Santiago Bernabéu", "Metropolitano", "Benito Villamarín", "San Mamés", 
        "Mestalla", "Sánchez-Pizjuán", "RCD Stadium", "Reale Arena", "La Cartuja", 
        "La Rosaleda", "Riazor", "El Molinón", "Martínez Valero", "Estadi Montilivi", 
        "Estadio de la Cerámica", "El Sadar", "Coliseum", "Vallecas", 
        "Nuevo Mirandilla", "Gran Canaria", "Son Moix", "Mendizorrotza", "Balaídos"
      ];
      const db = SPAIN_STADIUMS.map(s => ({ name: s, team: "", searchKeys: [cleanString(s)] }));
      // Ensure all answers in activeTopic are in the database
      activeTopic.answers.forEach(ans => {
        if (!db.some(x => x.name.toLowerCase() === ans.name.toLowerCase())) {
          db.push({ name: ans.name, team: "", searchKeys: [cleanString(ans.name)] });
        }
      });
      return db;
    }

    // Default to players database
    return LALIGA_PLAYERS_DB;
  };

  const getIncorrectMessage = () => {
    const badge = (activeTopic.badgeTitle || "").toUpperCase();
    const title = (activeTopic.title || "").toLowerCase();

    if (badge.includes("CLUBES") || badge.includes("TEMPORADAS EN PRIMERA") || title.includes("equipo") || title.includes("club")) {
      return "Este equipo no está en la lista.";
    } else if (badge.includes("ESTADIOS") || title.includes("estadio")) {
      return "Este estadio no está en la lista.";
    }
    return "Este jugador no está en la lista.";
  };

  function handleGuess(guessVal) {
    if (surrendered || guessedIndices.size === 10) return;

    const normalizedGuess = cleanString(guessVal);
    if (!normalizedGuess) return;

    const topicData = activeTopic;
    let foundIndex = -1;

    for (let i = 0; i < topicData.answers.length; i++) {
      if (guessedIndices.has(i)) continue;

      const ans = topicData.answers[i];
      const cleanAnsName = cleanString(ans.name);
      
      // Let's test if there is a match:
      // 1. Direct match
      let isMatch = cleanAnsName === normalizedGuess;

      // 2. Match with answers' matches synonyms
      if (!isMatch && ans.matches) {
        isMatch = ans.matches.some(m => cleanString(m) === normalizedGuess);
      }

      // 3. Substring matching (handles "RC Celta de Vigo" matching "Celta de Vigo")
      if (!isMatch) {
        isMatch = normalizedGuess.includes(cleanAnsName) || cleanAnsName.includes(normalizedGuess);
      }

      // 4. Substring matching with synonyms
      if (!isMatch && ans.matches) {
        isMatch = ans.matches.some(m => {
          const cleanM = cleanString(m);
          return normalizedGuess.includes(cleanM) || cleanM.includes(normalizedGuess);
        });
      }

      if (isMatch) {
        foundIndex = i;
        break;
      }
    }

    const inputField = container.querySelector('#guess-input');

    if (foundIndex !== -1) {
      guessedIndices.add(foundIndex);
      saveDailyState();
      callbacks.showToast(`¡Correcto! ${topicData.answers[foundIndex].name} está en el puesto ${foundIndex + 1}`, 'success');
      
      feedbackMessage = "";
      const feedbackEl = container.querySelector('#feedback-message');
      if (feedbackEl) {
        feedbackEl.style.display = 'none';
      }

      if (inputField) inputField.value = '';
      renderGameBoard();

      if (guessedIndices.size === 10) {
        showVictoryEffects();
      }
    } else {
      // Small shake animation on the input box if incorrect
      const inputWrap = container.querySelector('.top10-input-wrap');
      if (inputWrap) {
        inputWrap.classList.add('shake');
        inputWrap.addEventListener('animationend', () => {
          inputWrap.classList.remove('shake');
        }, { once: true });
      }

      feedbackMessage = getIncorrectMessage();
      const feedbackEl = container.querySelector('#feedback-message');
      if (feedbackEl) {
        feedbackEl.innerHTML = `❌ ${feedbackMessage}`;
        feedbackEl.style.display = 'block';
      }

      callbacks.showToast(feedbackMessage, 'error');
      
      // Clear the input field for incorrect guesses as requested
      if (inputField) inputField.value = '';
    }
  }

  function handleSurrender() {
    if (surrendered) return;
    surrendered = true;
    saveDailyState();
    callbacks.showToast('Te has rendido. Descubre las respuestas correctas.', 'info');
    renderGameBoard();
  }

  function handleShare() {
    let emojiBlock = '';
    for (let i = 0; i < 10; i++) {
      emojiBlock += guessedIndices.has(i) ? '🟩' : '🟥';
    }
    const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const text = `LaLiga Top 10 #${dailyNumber} (${todayStr})
🏆 Adivinados: ${guessedIndices.size}/10
${emojiBlock}
Juega en Castigos Fantasy`;

    navigator.clipboard.writeText(text).then(() => {
      callbacks.showToast('¡Resultados copiados al portapapeles!', 'success');
    }).catch(err => {
      callbacks.showToast('No se pudo copiar al portapapeles', 'error');
    });
  }

  function showVictoryEffects() {
    // Show a premium victory announcement overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal-content glass animate-scale" style="max-width: 400px; text-align: center; border: 2.5px solid var(--primary-green); box-shadow: 0 0 25px rgba(34,197,94,0.35); padding: 2rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🏆</div>
        <h2 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase;">¡PERFECTO!</h2>
        <p style="font-size: 0.9rem; color: var(--text-light); margin: 0.5rem 0 1.5rem; line-height: 1.4;">
          Has adivinado los 10 elementos correctamente. ¡Eres un auténtico experto de LaLiga!
        </p>
        <button id="victory-close-btn" class="btn-primary" style="font-weight: 800; width: 100%;">Ver Resultados</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#victory-close-btn').addEventListener('click', () => {
      overlay.remove();
      renderGameBoard();
    });
  }

  function renderGameBoard() {
    const topicData = activeTopic;
    const isFinished = surrendered || guessedIndices.size === 10;

    // Header title styled exactly like Futbol11
    let gameHeaderHtml = `
      <div style="text-align: center; margin-bottom: 1.5rem; width: 100%; box-sizing: border-box;">
        <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px; color: var(--text-muted); font-family: var(--font-display);">Reto Diario #${dailyNumber}</span>
        <h1 style="font-family: var(--font-sans); font-weight: 900; font-size: 2.2rem; font-style: italic; letter-spacing: -1.5px; text-transform: uppercase; margin-bottom: 0.25rem; display: inline-flex; justify-content: center; align-items: center; gap: 0.5rem; width: 100%;">
          <span style="color: var(--primary-green);">LALIGA</span>
          <span style="color: var(--accent-gold);">TOP 10</span>
        </h1>
        <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.05rem; letter-spacing: 0.5px; color: #fff; text-transform: uppercase; margin-top: 0.5rem; background: var(--bg-obsidian); border: 2px solid var(--border-color); padding: 0.65rem 1rem; border-radius: 8px; box-shadow: 3px 3px 0px #000; width: 100%; box-sizing: border-box;">
          ${topicData.title}
        </div>
        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-top: 0.75rem; text-transform: uppercase;">
          Adivinados: <span style="color: var(--primary-green); font-size: 1.05rem; font-weight: 900;">${guessedIndices.size} / 10</span>
        </div>
      </div>
    `;

    // Render list items 1 to 10 with guaranteed uniform width (width: 100%) and box-sizing
    let listHtml = `
      <div style="display: flex; flex-direction: column; gap: 0.6rem; width: 100%; margin: 0 auto 1.5rem; box-sizing: border-box;">
        ${topicData.answers.map((ans, idx) => {
          const isGuessed = guessedIndices.has(idx);
          const revealRed = surrendered && !isGuessed;

          let cellStyle = `
            background: var(--bg-obsidian);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 0.65rem 1rem;
            display: flex;
            align-items: center;
            min-height: 52px;
            box-shadow: 3px 3px 0px #000000;
            transition: border-color 0.2s, box-shadow 0.2s;
            position: relative;
            width: 100%;
            box-sizing: border-box;
          `;
          
          if (isGuessed) {
            cellStyle += ` border-color: var(--primary-green); box-shadow: 4px 4px 0px rgba(34,197,94,0.15);`;
          } else if (revealRed) {
            cellStyle += ` border-color: var(--danger); box-shadow: 4px 4px 0px rgba(239,68,68,0.15);`;
          }

          let flagHtml = `
            <span style="margin-right: 1rem; width: 28px; display: inline-flex; align-items: center; justify-content: center;">
              ${getFlagHtml(ans.flag)}
            </span>
          `;

          let textHtml = '';
          if (isGuessed) {
            textHtml = `
              <span style="font-weight: 800; color: var(--text-light); font-size: 0.95rem;">${ans.name}</span>
            `;
          } else if (revealRed) {
            textHtml = `
              <span style="font-weight: 800; color: #f87171; font-size: 0.95rem; text-decoration: line-through;">${ans.name}</span>
            `;
          } else {
            textHtml = `
              <span style="font-family: var(--font-display); font-weight: 800; color: var(--text-muted); letter-spacing: 2px; font-size: 0.85rem; opacity: 0.3;">???????????</span>
            `;
          }

          return `
            <div style="${cellStyle}">
              <!-- Number badge -->
              <span style="font-family: var(--font-display); font-weight: 900; font-size: 0.95rem; color: ${isGuessed ? 'var(--primary-green)' : (revealRed ? 'var(--danger)' : 'var(--text-muted)')}; margin-right: 0.75rem; width: 20px; text-align: right; display: inline-block;">
                ${idx + 1}.
              </span>
              
              <!-- Pista visual (bandera de país como imagen) -->
              ${flagHtml}

              <!-- Contenido -->
              ${textHtml}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Game input and surrender buttons with uniform box-sizing, and extra separation from the list (margin-top: 1.8rem)
    let inputControlsHtml = `
      <div style="width: 100%; display: flex; flex-direction: column; gap: 0.8rem; align-items: center; box-sizing: border-box; margin-top: 1.8rem;">
        
        <!-- Input section -->
        ${!isFinished ? `
          <div style="display: flex; gap: 0.5rem; width: 100%; align-items: center; box-sizing: border-box;">
            <div class="top10-input-wrap" style="flex-grow: 1; position: relative; width: 100%; box-sizing: border-box;">
              <input 
                type="text" 
                id="guess-input" 
                class="input-field" 
                placeholder="Escribe tu respuesta aquí..." 
                autocomplete="off"
                style="padding: 0.75rem 1rem; font-weight: 700; border: 2.5px solid #000000; box-shadow: 4px 4px 0px #000000; width: 100%; box-sizing: border-box;" 
              />
            </div>
            
            <!-- Surrender flag button -->
            <button id="btn-surrender" style="
              width: 50px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffe16d;
              border: 2.5px solid #000000;
              box-shadow: 4px 4px 0px #000000;
              border-radius: 8px;
              cursor: pointer;
              transition: transform 0.05s ease, box-shadow 0.05s ease;
              flex-shrink: 0;
            "
            title="Rendirse y revelar respuestas"
            onmouseover="this.style.transform='translate(-1px,-1px)'; this.style.boxShadow='5px 5px 0px #000000';"
            onmouseout="this.style.transform=''; this.style.boxShadow='4px 4px 0px #000000';"
            onmousedown="this.style.transform='translate(2px,2px)'; this.style.boxShadow='0px 0px 0px #000000';"
            onmouseup="this.style.transform='translate(-1px,-1px)'; this.style.boxShadow='5px 5px 0px #000000';"
            >
              <span style="font-size: 1.4rem;">🏳️</span>
            </button>
          </div>

          <!-- Feedback warning message -->
          <div id="feedback-message" style="
            font-size: 0.85rem; 
            font-weight: 800; 
            color: #f87171; 
            text-align: left; 
            width: 100%; 
            box-sizing: border-box; 
            min-height: 20px; 
            margin-top: 0.35rem; 
            margin-bottom: 0.2rem;
            padding-left: 0.2rem;
            display: ${feedbackMessage ? 'block' : 'none'};
          ">
            ${feedbackMessage ? `❌ ${feedbackMessage}` : ''}
          </div>
          
          <button id="btn-back-hub" class="btn-secondary" style="width: auto; padding: 0.5rem 1.25rem; font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">
            Volver a Juegos
          </button>
        ` : `
          <!-- Game Over Banner -->
          <div class="card glass" style="width: 100%; border: 1.5px solid ${guessedIndices.size === 10 ? 'var(--primary-green)' : 'var(--danger)'}; text-align: center; padding: 1.25rem; box-shadow: 4px 4px 0px #000; box-sizing: border-box;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: ${guessedIndices.size === 10 ? 'var(--primary-green)' : 'var(--danger)'}; margin-bottom: 0.35rem;">
              ${guessedIndices.size === 10 ? '¡Enhorabuena! Has completado el Top 10 diario.' : 'Partida terminada.'}
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.2rem;">
              Adivinaste ${guessedIndices.size} de 10 respuestas. Vuelve mañana para un nuevo reto.
            </p>
            <div style="display: flex; gap: 0.65rem; justify-content: center; flex-wrap: wrap; width: 100%; box-sizing: border-box;">
              <button id="btn-share-top10" class="btn-primary" style="width: auto; padding: 0.65rem 1.5rem; font-weight: 800; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 4px 4px 0px #000;">
                <span>📢</span> Compartir Resultados
              </button>
              <button id="btn-back-hub" class="btn-secondary" style="width: auto; padding: 0.65rem 1.5rem; font-weight: 800; font-size: 0.85rem; box-shadow: 4px 4px 0px #000;">
                Volver a Juegos
              </button>
            </div>
          </div>
        `}
      </div>
    `;

    container.innerHTML = `
      <div class="fade-in-up" style="width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; padding-bottom: 2rem; box-sizing: border-box;">
        ${gameHeaderHtml}
        ${listHtml}
        ${inputControlsHtml}
      </div>
    `;

    // Setup autocomplete dropdown list if game is active
    if (!isFinished) {
      const inputEl = container.querySelector('#guess-input');
      
      // Cleanup previous binding if exists
      if (autocompleteCleanup) {
        autocompleteCleanup();
      }

      // Bind autocomplete dropdown widget with dynamic database (players, teams or stadiums)
      autocompleteCleanup = setupAutocomplete(inputEl, (selectedItem) => {
        handleGuess(selectedItem.name);
      }, getAutocompleteDatabase());

      // Bind Enter submit on keyboard
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          // Add minor timeout to allow active item click to trigger first if dropdown is open
          setTimeout(() => {
            handleGuess(inputEl.value);
          }, 100);
        }
      });

      // Bind input listener to clear feedback message on typing
      inputEl.addEventListener('input', () => {
        feedbackMessage = "";
        const feedbackEl = container.querySelector('#feedback-message');
        if (feedbackEl) {
          feedbackEl.style.display = 'none';
        }
      });

      // Bind surrender click
      container.querySelector('#btn-surrender').addEventListener('click', handleSurrender);
      // Bind back to hub
      container.querySelector('#btn-back-hub').addEventListener('click', () => {
        callbacks.onNavigate('juegos');
      });
    } else {
      // Bind share click
      container.querySelector('#btn-share-top10').addEventListener('click', handleShare);
      // Bind back to hub
      container.querySelector('#btn-back-hub').addEventListener('click', () => {
        callbacks.onNavigate('juegos');
      });
    }
  }

  // Initialize and run
  initGame();
  renderGameBoard();

  // Custom cleanup when view gets destroyed/unmounted (prevent autocomplete memory leaks)
  const observer = new MutationObserver((mutations) => {
    if (!document.body.contains(container)) {
      if (autocompleteCleanup) {
        autocompleteCleanup();
        autocompleteCleanup = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
