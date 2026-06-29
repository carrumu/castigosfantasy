/**
 * Renders the Herramientas (Sala VAR) hub page.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {Function} callbacks.onNavigate
 */
export function renderHerramientas(container, callbacks) {
  const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID') || 'default';
  
  let subview = 'grid';
  let contractState = 'view'; // 'view', 'edit', 'loading', 'preview'
  let draftRules = '';
  let generatedContract = '';

  // Client-side funny legal formalization generator (no emojis!)
  function formalizeRule(rule, index) {
    const cleaned = rule.trim().replace(/^[-*•\d.\s]+/, ''); // remove bullet points
    if (!cleaned) return '';
    // Capitalize first letter
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Add funny legal prefixes based on keywords
    const lower = capitalized.toLowerCase();
    let prefix = "DE LAS NORMAS GENERALES";
    if (lower.includes('paga') || lower.includes('euro') || lower.includes('dinero') || lower.includes('multa') || lower.includes('bote')) {
      prefix = "DE LAS SANCIONES ECONOMICAS";
    } else if (lower.includes('ultimo') || lower.includes('colista') || lower.includes('perdedor') || lower.includes('farolillo')) {
      prefix = "DE LAS PENITENCIAS DEL COLISTA";
    } else if (lower.includes('whatsapp') || lower.includes('grupo') || lower.includes('foto') || lower.includes('audio') || lower.includes('perfil')) {
      prefix = "DE LA DISCIPLINA EN REDES SOCIALES";
    } else if (lower.includes('quedada') || lower.includes('quedar') || lower.includes('partido') || lower.includes('ver') || lower.includes('cerveza')) {
      prefix = "DE LOS EVENTOS PRESENCIALES";
    } else {
      const sections = [
        "DE LA CONDUCTA DEPORTIVA",
        "DEL COMPROMISO CON LA LIGA",
        "DE LA LEALTAD COMPETITIVA",
        "DE LAS DISPUTAS Y RECLAMACIONES"
      ];
      prefix = sections[index % sections.length];
    }

    return `CLAUSULA ${index + 1} (${prefix}): ${capitalized}.`;
  }

  function generateContractFromRules(rulesString) {
    const lines = rulesString.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let clauses = '';
    if (lines.length === 0) {
      clauses = `CLAUSULA 1 (DE LA FALTA DE REGLAS): Se establece de manera obligatoria que la liga debe regirse por el honor competitivo al carecer de normas escritas en el borrador original.`;
    } else {
      clauses = lines.map((line, idx) => formalizeRule(line, idx)).join('\n\n');
    }

    return `CONTRATO OFICIAL DE LA LIGA FANTASY - TEMPORADA 2026/2027

Reunidos de una parte los Directores Tecnicos de la Liga, y de otra el sentido comun deportivo, acuerdan formalizar el presente reglamento de obligado cumplimiento bajo las siguientes condiciones:

${clauses}

DISPOSICION FINAL: Las clausulas detalladas anteriormente son sagradas. Ningun firmante podra alegar desconocimiento de las mismas, ni justificar su incumplimiento por motivos de mala racha, lesiones o decisiones arbitrales. El VAR actuara de oficio ante cualquier infraccion.

Firmado y jurado por todos los miembros del grupo de WhatsApp.`;
  }

  function render() {
    if (subview === 'grid') {
      container.innerHTML = `
        <div class="container fade-in-up">
          <!-- Header -->
          <div style="margin-bottom: 2.2rem;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Revisión de jugadas</span>
            <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: clamp(1.8rem, 8vw, 2.4rem); font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.15rem 0 0.6rem;">
              Sala VAR
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500; max-width: 500px; line-height: 1.4;">
              Gestiona el ocio y la justicia de tu liga: gira la ruleta de sentencias, genera castigos, calcula el bote o formaliza el contrato del grupo.
            </p>
          </div>

          <!-- Tool Cards Grid (Reordered: Calculadora is 3rd, Contrato is 4th) -->
          <div class="tools-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            
            <!-- Ruleta Card (1st) -->
            <button id="tool-ruleta-btn" class="tool-card-btn">
              <div class="tool-card-inner">
                <div class="tool-card-icon-wrap" style="background: var(--accent); color: #000;">
                  <span class="material-symbols-outlined" style="font-size: 32px;">casino</span>
                </div>
                <div class="tool-card-text">
                  <h2 class="tool-card-title">Ruleta de Sentencias</h2>
                  <p class="tool-card-desc">Gira la rueda del destino y que la suerte decida el castigo de la semana.</p>
                </div>
                <div class="tool-card-arrow">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </button>

            <!-- Generador Card (2nd) -->
            <button id="tool-generador-btn" class="tool-card-btn">
              <div class="tool-card-inner">
                <div class="tool-card-icon-wrap" style="background: var(--danger); color: #fff;">
                  <span class="material-symbols-outlined" style="font-size: 32px;">psychology</span>
                </div>
                <div class="tool-card-text">
                  <h2 class="tool-card-title">Generador de Castigos</h2>
                  <p class="tool-card-desc">Crea castigos épicos con IA para que nadie quiera quedar último nunca más.</p>
                </div>
                <div class="tool-card-arrow">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </button>

            <!-- Calculadora Card (3rd) -->
            <button id="tool-calculadora-btn" class="tool-card-btn">
              <div class="tool-card-inner">
                <div class="tool-card-icon-wrap" style="background: var(--yellow); color: #000;">
                  <span class="material-symbols-outlined" style="font-size: 32px;">calculate</span>
                </div>
                <div class="tool-card-text">
                  <h2 class="tool-card-title">Calculadora del Bote</h2>
                  <p class="tool-card-desc">Proyecta la recaudación acumulada de las multas de la liga por jornadas.</p>
                </div>
                <div class="tool-card-arrow">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </button>

            <!-- Contrato Card (4th) -->
            <button id="tool-contrato-btn" class="tool-card-btn">
              <div class="tool-card-inner">
                <div class="tool-card-icon-wrap" style="background: var(--primary-green); color: #000;">
                  <span class="material-symbols-outlined" style="font-size: 32px;">description</span>
                </div>
                <div class="tool-card-text">
                  <h2 class="tool-card-title">Contrato de la Liga</h2>
                  <p class="tool-card-desc">Redacta y formaliza con IA las reglas de las multas para vuestro grupo.</p>
                </div>
                <div class="tool-card-arrow">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </button>

          </div>
        </div>
      `;

      container.querySelector('#tool-ruleta-btn').addEventListener('click', () => {
        if (callbacks.onNavigate) callbacks.onNavigate('ruleta');
      });

      container.querySelector('#tool-generador-btn').addEventListener('click', () => {
        if (callbacks.onNavigate) callbacks.onNavigate('generador');
      });

      container.querySelector('#tool-contrato-btn').addEventListener('click', () => {
        subview = 'contrato';
        // Auto resolve contract state based on whether one already exists
        const saved = localStorage.getItem('CF_LEAGUE_CONTRACT_' + activeLeagueId);
        contractState = saved ? 'view' : 'edit';
        render();
      });

      container.querySelector('#tool-calculadora-btn').addEventListener('click', () => {
        subview = 'calculadora';
        render();
      });

    } else if (subview === 'contrato') {
      const savedContract = localStorage.getItem('CF_LEAGUE_CONTRACT_' + activeLeagueId);

      if (contractState === 'view' && savedContract) {
        container.innerHTML = `
          <div class="container fade-in-up">
            <!-- Header -->
            <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
              <button id="btn-back-to-var" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--text-light); border: 2px solid var(--border-color); box-shadow: 2px 2px 0 #000;" title="Volver al VAR">
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
              </button>
              <div>
                <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0;">
                  Contrato de la Liga
                </h1>
              </div>
            </div>

            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                Este es el contrato oficial configurado para vuestra liga. Cópialo y pégalo en el estado o descripción de vuestro grupo de WhatsApp.
              </p>
              
              <pre id="contract-text-area" style="background: rgba(0,0,0,0.3); border: 2px solid var(--border-color); border-radius: 6px; padding: 1.25rem; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.5; color: var(--text-light); white-space: pre-wrap; word-break: break-word; max-height: 350px; overflow-y: auto; margin-bottom: 1.5rem; text-align: left;"></pre>
              
              <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button id="btn-copy-contract" class="btn-primary" style="flex: 1; min-width: 180px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800; padding: 0.85rem; background: var(--accent); color: #000;">
                  <span class="material-symbols-outlined">content_copy</span>
                  <span id="copy-btn-text">Copiar Contrato</span>
                </button>
                <button id="btn-edit-contract-rules" class="btn-primary" style="flex: 1; min-width: 180px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800; padding: 0.85rem; background: transparent; color: var(--text-light); border: 2.5px solid var(--border-color); box-shadow: 3px 3px 0 #000;">
                  <span class="material-symbols-outlined">edit</span>
                  Redactar Nuevo Reglamento
                </button>
              </div>
            </div>
          </div>
        `;

        container.querySelector('#contract-text-area').textContent = savedContract;

        container.querySelector('#btn-back-to-var').addEventListener('click', () => {
          subview = 'grid';
          render();
        });

        const copyBtn = container.querySelector('#btn-copy-contract');
        const copyBtnText = container.querySelector('#copy-btn-text');
        
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(savedContract).then(() => {
            copyBtn.style.background = 'var(--primary-green)';
            copyBtnText.textContent = '¡Copiado con Éxito!';
            setTimeout(() => {
              copyBtn.style.background = 'var(--accent)';
              copyBtnText.textContent = 'Copiar Contrato';
            }, 2000);
          }).catch(err => {
            console.error('Error al copiar el texto: ', err);
          });
        });

        container.querySelector('#btn-edit-contract-rules').addEventListener('click', () => {
          contractState = 'edit';
          render();
        });

      } else if (contractState === 'edit') {
        container.innerHTML = `
          <div class="container fade-in-up" style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
              <button id="btn-back-to-var" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--text-light); border: 2px solid var(--border-color); box-shadow: 2px 2px 0 #000;" title="Volver">
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
              </button>
              <div>
                <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0;">
                  Contrato de la Liga
                </h1>
              </div>
            </div>

            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem;">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
                Escribe a continuación las reglas informales de tu liga. El VAR las reestructurará dándoles un formato legal y serio para vuestro contrato.
              </p>
              
              <div style="margin-bottom: 1.5rem;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Reglas de la liga:</label>
                <textarea id="rules-input-textarea" class="input-field" style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 600; width: 100%; height: 180px; padding: 0.75rem; color: var(--text-light); font-family: var(--font-sans); line-height: 1.4; resize: vertical;"></textarea>
              </div>

              <button id="btn-generate-ai-contract" class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800; padding: 0.85rem; background: var(--accent); color: #000;">
                <span class="material-symbols-outlined">auto_awesome</span>
                Reestructurar contrato
              </button>
            </div>
          </div>
        `;

        const textarea = container.querySelector('#rules-input-textarea');
        textarea.value = draftRules;

        container.querySelector('#btn-back-to-var').addEventListener('click', () => {
          subview = 'grid';
          render();
        });

        container.querySelector('#btn-generate-ai-contract').addEventListener('click', () => {
          draftRules = textarea.value.trim();
          contractState = 'loading';
          render();
        });

      } else if (contractState === 'loading') {
        container.innerHTML = `
          <div class="container fade-in-up" style="max-width: 500px; margin: 0 auto; text-align: center; padding: 4rem 1rem;">
            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 3rem 2rem;">
              <div class="loading-spinner" style="border: 4px solid rgba(0,0,0,0.1); border-left-color: var(--accent); border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
              <h2 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.75rem;">
                Procesando Reglamento
              </h2>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin: 0;">
                La inteligencia del VAR está analizando vuestras normas y redactando las cláusulas legales definitivas...
              </p>
            </div>
          </div>
        `;

        // Simulate AI restructurer delay (1.5 seconds)
        setTimeout(() => {
          generatedContract = generateContractFromRules(draftRules);
          contractState = 'preview';
          render();
        }, 1500);

      } else if (contractState === 'preview') {
        container.innerHTML = `
          <div class="container fade-in-up" style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
              <button id="btn-edit-rules" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--text-light); border: 2px solid var(--border-color); box-shadow: 2px 2px 0 #000;" title="Modificar Reglas">
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
              </button>
              <div>
                <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0;">
                  Contrato de la Liga
                </h1>
              </div>
            </div>

            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
                Revisa el contrato reestructurado por el VAR. Si es correcto, confírmalo para guardarlo como el reglamento oficial de vuestra liga.
              </p>
              
              <pre style="background: rgba(0,0,0,0.3); border: 2px solid var(--border-color); border-radius: 6px; padding: 1.25rem; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.5; color: var(--text-light); white-space: pre-wrap; word-break: break-word; max-height: 350px; overflow-y: auto; margin-bottom: 1.5rem; text-align: left;">${generatedContract}</pre>
              
              <button id="btn-save-ai-contract" class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800; padding: 0.85rem; background: var(--primary-green); color: #000;">
                <span class="material-symbols-outlined">check_circle</span>
                Confirmar y Guardar Contrato
              </button>
            </div>
          </div>
        `;

        container.querySelector('#btn-edit-rules').addEventListener('click', () => {
          contractState = 'edit';
          render();
        });

        container.querySelector('#btn-save-ai-contract').addEventListener('click', () => {
          localStorage.setItem('CF_LEAGUE_CONTRACT_' + activeLeagueId, generatedContract);
          contractState = 'view';
          render();
        });
      }

    } else if (subview === 'calculadora') {
      container.innerHTML = `
        <div class="container fade-in-up">
          <!-- Header -->
          <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <button id="btn-back-to-var" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--text-light); border: 2px solid var(--border-color); box-shadow: 2px 2px 0 #000;" title="Volver al VAR">
              <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
            </button>
            <div>
              <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Finanzas de Liga</span>
              <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0;">
                Calculadora del Bote
              </h1>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; margin-bottom: 1.5rem;">
            <!-- Inputs Panel -->
            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem;">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                Ingresa el importe que paga el colista en cada jornada para proyectar la recaudación acumulada.
              </p>
              
              <!-- Input 1 -->
              <div style="margin-bottom: 1.25rem;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Cuota del colista por jornada (€)</label>
                <input type="number" id="calc-payment-input" class="input-field" value="5" min="0" step="0.5" style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 700; width: 100%; padding: 0.65rem; color: var(--text-light);" />
              </div>

              <!-- Input 2 -->
              <div style="margin-bottom: 1.25rem;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Número de Jornadas</label>
                <input type="number" id="calc-multiplier-input" class="input-field" value="8" min="1" step="1" style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 700; width: 100%; padding: 0.65rem; color: var(--text-light);" />
              </div>

              <!-- Input 3: Destino (Fijar/Editar Flow) -->
              <div style="margin-bottom: 0.25rem;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Destino del bote</label>
                
                <!-- Display Wrap -->
                <div id="calc-destination-display-wrap" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.55rem 0.75rem; border: 2px dashed var(--border-color); border-radius: 6px;">
                  <span id="calc-destination-text-val" style="font-weight: 700; color: var(--text-light); font-size: 0.78rem;">Una buena cena de campeones</span>
                  <button id="btn-edit-destination" style="background: transparent; border: none; color: var(--accent); display: flex; align-items: center; justify-content: center; padding: 0.2rem; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.18)'" onmouseout="this.style.transform='scale(1)'" title="Editar destino">
                    <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
                  </button>
                </div>
                
                <!-- Input Wrap (Hidden by default) -->
                <div id="calc-destination-input-wrap" style="display: none; gap: 0.5rem;">
                  <input type="text" id="calc-destination-input" class="input-field" value="Una buena cena de campeones" placeholder="Ej. Una cena, copas..." style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 700; flex-grow: 1; padding: 0.5rem 0.65rem; color: var(--text-light); font-size: 0.8rem;" />
                  <button id="btn-save-destination" class="btn-primary" style="width: auto; padding: 0.5rem 1.1rem; font-size: 0.78rem; font-weight: 800; background: var(--accent); color: #000; box-shadow: none;">Fijar</button>
                </div>
              </div>
            </div>

            <!-- Results Panel -->
            <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem; text-align: center;">
              <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Bote Acumulado (Resultado)</span>
              
              <!-- Big Result -->
              <div id="calc-result-box" style="font-size: clamp(3.2rem, 10vw, 4.5rem); font-weight: 900; color: var(--yellow); margin: 0.75rem 0; font-family: var(--font-display); line-height: 1; text-shadow: 0 0 15px rgba(255,214,10,0.25);">
                40,00€
              </div>

              <!-- Destination Display -->
              <div id="calc-destination-display" style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-top: -0.5rem; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.5px; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                Una buena cena de campeones
              </div>
              
              <!-- Explanation -->
              <p style="font-size: 0.85rem; color: var(--text-light); font-weight: 600; margin-bottom: 1.25rem;">
                Total recaudado: <span id="calc-formula-text" style="color: var(--accent);">5,00€ x 8 jornadas = 40,00€</span>
              </p>

              <hr style="border: 0; border-top: 1.5px dashed var(--border-color); margin: 1.25rem 0;" />

              <!-- Extra Projections -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1.5px solid var(--border-color);">
                  <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: block; text-transform: uppercase; margin-bottom: 0.25rem;">Mitad Temporada (19j)</span>
                  <span id="calc-projection-half" style="font-size: 1.1rem; font-weight: 900; color: var(--text-light);">95,00€</span>
                </div>
                <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1.5px solid var(--border-color);">
                  <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: block; text-transform: uppercase; margin-bottom: 0.25rem;">Temporada Completa (38j)</span>
                  <span id="calc-projection-full" style="font-size: 1.1rem; font-weight: 900; color: var(--text-light);">190,00€</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bote Objetivo Card -->
          <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; display: block; margin-bottom: 0.25rem;">Meta Financiera</span>
            <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 900; text-transform: uppercase; margin: 0 0 0.5rem; color: var(--text-light);">
              Calcular Cuota según Bote Objetivo
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              ¿Queréis conseguir un bote específico? Introduce el objetivo para ver cuánto debe pagar el colista en cada jornada.
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div>
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Bote objetivo (€)</label>
                <input type="number" id="calc-target-input" class="input-field" value="200" min="1" step="10" style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 700; width: 100%; padding: 0.65rem; color: var(--text-light);" />
              </div>
              <div>
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Jornadas para lograrlo</label>
                <input type="number" id="calc-target-days-input" class="input-field" value="38" min="1" step="1" style="border: 2px solid var(--border-color); background: var(--bg-input); font-weight: 700; width: 100%; padding: 0.65rem; color: var(--text-light);" />
              </div>
            </div>

            <div style="background: rgba(222, 237, 0, 0.04); border: 2.5px solid #000; border-radius: 6px; padding: 1.25rem; text-align: center; box-shadow: 3px 3px 0 #000;">
              <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Cuota necesaria del colista</span>
              <div id="calc-target-result" style="font-size: 2.2rem; font-weight: 900; color: var(--yellow); margin: 0.5rem 0; font-family: var(--font-display); line-height: 1; text-shadow: 0 0 10px rgba(255,214,10,0.2);">
                5,26€
              </div>
              <p id="calc-target-formula" style="font-size: 0.8rem; color: var(--text-light); font-weight: 600; margin: 0;">
                Para alcanzar 200,00€ en 38 jornadas.
              </p>
            </div>
          </div>

        </div>
      `;

      container.querySelector('#btn-back-to-var').addEventListener('click', () => {
        subview = 'grid';
        render();
      });

      const paymentInput = container.querySelector('#calc-payment-input');
      const multiplierInput = container.querySelector('#calc-multiplier-input');
      const resultBox = container.querySelector('#calc-result-box');
      const formulaText = container.querySelector('#calc-formula-text');
      const projectionHalf = container.querySelector('#calc-projection-half');
      const projectionFull = container.querySelector('#calc-projection-full');

      // Target fields
      const targetInput = container.querySelector('#calc-target-input');
      const targetDaysInput = container.querySelector('#calc-target-days-input');
      const targetResult = container.querySelector('#calc-target-result');
      const targetFormula = container.querySelector('#calc-target-formula');

      // Destination state & bindings
      let currentDestinationText = 'Una buena cena de campeones';
      
      const destinationDisplayWrap = container.querySelector('#calc-destination-display-wrap');
      const destinationInputWrap = container.querySelector('#calc-destination-input-wrap');
      const destinationTextVal = container.querySelector('#calc-destination-text-val');
      const destinationInput = container.querySelector('#calc-destination-input');
      const btnEditDestination = container.querySelector('#btn-edit-destination');
      const btnSaveDestination = container.querySelector('#btn-save-destination');
      const destinationDisplay = container.querySelector('#calc-destination-display');

      btnEditDestination.addEventListener('click', () => {
        destinationDisplayWrap.style.display = 'none';
        destinationInputWrap.style.display = 'flex';
        destinationInput.focus();
      });

      function saveDestination() {
        const text = destinationInput.value.trim() || 'El bote de la liga';
        currentDestinationText = text;
        destinationTextVal.textContent = text;
        destinationDisplayWrap.style.display = 'flex';
        destinationInputWrap.style.display = 'none';
        calculate();
      }

      btnSaveDestination.addEventListener('click', saveDestination);
      destinationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveDestination();
        }
      });

      function calculate() {
        const payment = parseFloat(paymentInput.value) || 0;
        const matchdays = parseInt(multiplierInput.value) || 0;
        const totalAccumulated = payment * matchdays;
        const totalHalf = payment * 19;
        const totalFull = payment * 38;

        resultBox.textContent = `${totalAccumulated.toFixed(2).replace('.', ',')}€`;
        destinationDisplay.textContent = currentDestinationText;
        formulaText.innerHTML = `${payment.toFixed(2).replace('.', ',')}€ x ${matchdays} jornadas = <span style="color: var(--accent);">${totalAccumulated.toFixed(2).replace('.', ',')}€</span>`;
        projectionHalf.textContent = `${totalHalf.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
        projectionFull.textContent = `${totalFull.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
      }

      function calculateTarget() {
        const target = parseFloat(targetInput.value) || 0;
        const days = parseInt(targetDaysInput.value) || 1;
        const requiredFee = target / days;

        targetResult.textContent = `${requiredFee.toFixed(2).replace('.', ',')}€`;
        targetFormula.textContent = `Para alcanzar ${target.toFixed(2).replace('.', ',')}€ en ${days} jornadas.`;
      }

      paymentInput.addEventListener('input', calculate);
      multiplierInput.addEventListener('input', calculate);
      
      targetInput.addEventListener('input', calculateTarget);
      targetDaysInput.addEventListener('input', calculateTarget);

      calculate(); // Initial run
      calculateTarget(); // Initial run
    }
  }

  render();
}
