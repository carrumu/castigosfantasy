import { supabase } from '../supabase';

/**
 * Renders the Roulette screen (Wheel, Punishments list, Spin history).
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderRoulette(container, callbacks) {
  const isGuest = callbacks.isGuest;

  let punishments = [];
  let history = [];
  let currentLeagueId = null;
  let pendingRecord = null;
  let isSpinning = false;

  // Initial default punishments
  const DEFAULT_PUNISHMENTS = [
    { id: 'd-pun-1', name: "Invitar a una ronda de cervezas", description: "En la próxima reunión del grupo." },
    { id: 'd-pun-2', name: "Llevar la camiseta del rival histórico", description: "Durante todo el próximo fin de semana." },
    { id: 'd-pun-3', name: "Pagar el doble del bote esta jornada", description: "Suma otros 2€ adicionales al bote." },
    { id: 'd-pun-4', name: "Hacer de utillero/recogepelotas", description: "En la próxima pachanga del grupo." },
    { id: 'd-pun-5', name: "Foto a redes elogiando al líder", description: "Subir foto con texto redactado por el líder de la liga." },
    { id: 'd-pun-6', name: "Comprar una caja de donuts", description: "Traer donuts para desayunar el próximo lunes." }
  ];

  async function loadData() {
    const pendingId = localStorage.getItem('CF_PENDING_RECORD_ID');

    if (isGuest) {
      callbacks.showToast('Debes iniciar sesión para acceder a esta sección', 'warning');
      callbacks.onNavigate('auth');
      return;
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

      // 1. Fetch user's leagues memberships
      const { data: userLeagues, error: leaguesErr } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('profile_id', currentUser.id);

      if (leaguesErr) throw leaguesErr;

      if (!userLeagues || userLeagues.length === 0) {
        localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
        callbacks.showToast('No perteneces a ninguna liga todavía', 'info');
        callbacks.onNavigate('select-league');
        return;
      }

      // 2. Resolve active league
      let activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
      const hasActiveLeague = userLeagues.some(l => l.league_id === activeLeagueId);

      if (!activeLeagueId || !hasActiveLeague) {
        activeLeagueId = userLeagues[0].league_id;
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', activeLeagueId);
      }

      currentLeagueId = activeLeagueId;

      // Load pending record if any
      if (pendingId) {
        const { data: recData, error: recErr } = await supabase
          .from('matchday_records')
          .select(`
            id,
            matchday_number,
            amount_owed,
            loser_profile_id,
            profiles:loser_profile_id (
              display_name
            )
          `)
          .eq('id', pendingId)
          .single();

        if (!recErr && recData) {
          pendingRecord = {
            id: recData.id,
            matchday_number: recData.matchday_number,
            amount_owed: recData.amount_owed,
            display_name: recData.profiles?.display_name || 'Entrenador'
          };
        }
      }

      // Load punishments
      const { data: punList, error: punErr } = await supabase
        .from('punishments')
        .select('*')
        .eq('league_id', currentLeagueId);

      if (punErr) throw punErr;

      if (punList.length === 0) {
        const insertList = DEFAULT_PUNISHMENTS.map(p => ({
          league_id: currentLeagueId,
          name: p.name,
          description: p.description
        }));

        const { data: insertedData, error: insErr } = await supabase
          .from('punishments')
          .insert(insertList)
          .select();
        
        if (insErr) throw insErr;
        punishments = insertedData;
      } else {
        punishments = punList;
      }

      // Load history
      const { data: histList, error: histErr } = await supabase
        .from('matchday_records')
        .select(`
          id,
          matchday_number,
          amount_owed,
          trash_talk_phrase,
          created_at,
          profiles:loser_profile_id (
            display_name
          ),
          punishments:punishment_id (
            name,
            description
          )
        `)
        .eq('league_id', currentLeagueId)
        .not('punishment_id', 'is', null)
        .order('created_at', { ascending: false });

      if (histErr) throw histErr;
      history = histList;

      renderView();
    } catch (err) {
      console.error(err);
    }
  }

  function renderView() {
    container.innerHTML = `
      <div class="container">
        <!-- Indicador de Tirada Pendiente -->
        ${pendingRecord ? `
          <div class="supabase-banner" style="background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); margin-bottom: 1.25rem;">
            <div class="supabase-banner-text" style="color: var(--text-light);">
              Tirada pendiente para <strong>${pendingRecord.display_name}</strong> (Jornada ${pendingRecord.matchday_number}). ¡Gira la ruleta para asignarle su castigo!
            </div>
          </div>
        ` : ''}

        <div class="roulette-grid">
          <!-- Columna Izquierda: Componente Ruleta -->
          <div class="card glass roulette-container" style="margin-bottom: 0;">
            <h2 class="card-title gradient-text-gold">Ruleta de Castigos</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; text-align: center;">
              El azar dictará sentencia. Hay <strong>${punishments.length}</strong> castigos cargados en tu liga.
            </p>

            <div class="wheel-wrapper">
              <div class="wheel-arrow"></div>
              <div class="wheel-center"></div>
              <canvas id="wheel-canvas" class="wheel-canvas" width="500" height="500"></canvas>
            </div>

            <button id="spin-btn" class="btn-primary" style="max-width: 200px;">¡GIRAR!</button>
          </div>

          <!-- Columna Derecha: Personalizar e Historial -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Personalizar Castigos -->
            <div class="card glass" style="margin-bottom: 0;">
              <h2 class="card-title">Personalizar Castigos</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Añade o elimina castigos a la lista oficial de tu liga.</p>
              
              <form id="add-punishment-form" style="margin-bottom: 1.5rem;">
                <div class="form-group">
                  <label for="new-pun-name">Nombre del Castigo (Ej: Lavar coche del ganador)</label>
                  <input type="text" id="new-pun-name" class="input-field" placeholder="Nombre breve" required />
                </div>
                <div class="form-group">
                  <label for="new-pun-desc">Descripción (Opcional)</label>
                  <input type="text" id="new-pun-desc" class="input-field" placeholder="Instrucciones del castigo" />
                </div>
                <button type="submit" class="btn-secondary">Añadir Castigo</button>
              </form>

              <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto;" id="punishments-admin-list">
                ${punishments.map(p => `
                  <div class="item-row">
                    <div>
                      <div style="font-weight: 700; font-size: 0.95rem;">${p.name}</div>
                      ${p.description ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${p.description}</div>` : ''}
                    </div>
                    <button class="btn-secondary btn-danger delete-pun-btn" data-id="${p.id}" style="width: auto; padding: 0.4rem 0.6rem; font-size: 0.8rem; border-radius: 6px;">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Historial de Castigos -->
            <div class="card glass pitch-card" style="margin-bottom: 0; flex-grow: 1;">
              <h2 class="card-title gradient-text-green">Historial de Sentencias</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Castigos aplicados a los perdedores en las jornadas jugadas.</p>
              
              <div class="history-list" style="max-height: 250px; overflow-y: auto;">
                ${history.length === 0 ? `
                  <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
                    Ningún castigo aplicado todavía. ¡Todos limpios!
                  </div>
                ` : history.map(item => `
                  <div class="history-item">
                    <div class="history-header">
                      <span class="history-loser">${item.profiles?.display_name || 'Entrenador'}</span>
                      <span class="history-date">Jornada ${item.matchday_number} (${item.amount_owed}€)</span>
                    </div>
                    <div style="font-weight: 700; color: var(--accent); margin-top: 0.25rem; font-size: 0.95rem;">
                      ${item.punishments?.name || 'Castigo Desconocido'}
                    </div>
                    ${item.punishments?.description ? `
                      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
                        ${item.punishments.description}
                      </div>
                    ` : ''}
                    ${item.trash_talk_phrase ? `
                      <div class="history-trash">${item.trash_talk_phrase}</div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Castigo Asignado -->
      <div class="modal-overlay" id="result-modal">
        <div class="modal-content glass">
          <div class="modal-header">
            <h3 class="gradient-text-gold" style="font-weight: 800; font-size: 1.3rem;">¡Castigo Sentenciado!</h3>
            <button class="modal-close" id="close-resmodal-btn">✕</button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 1s infinite alternate;"></div>
            <h2 id="result-title" style="color: var(--accent); font-size: 1.4rem; font-weight: 900; margin-bottom: 0.5rem;"></h2>
            <p id="result-desc" style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.4; margin-bottom: 1.5rem;"></p>
            
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                Asignado a: <strong id="result-loser" style="color: var(--text-light)"></strong>
              </p>
              <button class="btn-primary" id="confirm-result-btn">Aceptar Sentencia</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Canvas drawing
    const canvas = container.querySelector('#wheel-canvas');
    drawWheel(canvas);

    // Event listeners
    const spinBtn = container.querySelector('#spin-btn');
    spinBtn.addEventListener('click', () => {
      if (isSpinning) return;
      spinWheel(canvas);
    });

    // Handle add punishment
    const addForm = container.querySelector('#add-punishment-form');
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = addForm.querySelector('#new-pun-name').value.trim();
      const description = addForm.querySelector('#new-pun-desc').value.trim();

      try {
        const { error } = await supabase
          .from('punishments')
          .insert({
            league_id: currentLeagueId,
            name,
            description
          });

        if (error) throw error;
        callbacks.showToast('Castigo añadido con éxito', 'success');
        loadData();
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al añadir castigo', 'error');
      }
    });

    // Handle delete punishment
    container.querySelectorAll('.delete-pun-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (punishments.length <= 2) {
          callbacks.showToast('Tu liga necesita tener al menos 2 castigos en la ruleta', 'error');
          return;
        }

      try {
        const { error } = await supabase
          .from('punishments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        callbacks.showToast('Castigo eliminado', 'success');
        loadData();
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al eliminar castigo', 'error');
      }
      });
    });

    // Modal result confirmations
    const resModal = container.querySelector('#result-modal');
    
    const finishSession = () => {
      resModal.classList.remove('active');
      loadData();
    };

    container.querySelector('#close-resmodal-btn').addEventListener('click', finishSession);
    container.querySelector('#confirm-result-btn').addEventListener('click', finishSession);
  }

  // Draw wheel helper
  function drawWheel(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    ctx.clearRect(0, 0, width, height);

    const arcLength = (2 * Math.PI) / punishments.length;

    const colors = [
      '#6366f1', // indigo
      '#4f46e5', // indigo dark
      '#f43f5e', // rose
      '#db2777', // pink/rose dark
      '#1e293b', // charcoal
      '#0f172a'  // dark slate
    ];

    for (let i = 0; i < punishments.length; i++) {
      const angle = i * arcLength;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, center - 10, angle, angle + arcLength);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcLength / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 5;
      
      const nameText = punishments[i].name;
      let fontSize = 20;
      if (nameText.length > 20) fontSize = 16;
      if (nameText.length > 28) fontSize = 13;
      if (nameText.length > 36) fontSize = 11;
      
      ctx.font = `bold ${fontSize}px Outfit`;
      
      let displayName = nameText;
      if (nameText.length > 45) {
        displayName = nameText.substring(0, 42) + "...";
      }

      ctx.fillText(displayName, center - 20, 6);
      ctx.restore();
    }
  }

  // Spin wheel simulation
  function spinWheel(canvas) {
    if (punishments.length === 0) return;
    isSpinning = true;
    const spinBtn = container.querySelector('#spin-btn');
    spinBtn.disabled = true;

    const sectorsCount = punishments.length;
    const winningIdx = Math.floor(Math.random() * sectorsCount);
    const winningPunishment = punishments[winningIdx];

    const sliceAngle = 360 / sectorsCount;
    const winningMidAngle = (winningIdx * sliceAngle) + (sliceAngle / 2);
    const finalRot = 1800 + (270 - winningMidAngle);

    canvas.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1)';
    canvas.style.transform = `rotate(${finalRot}deg)`;

    canvas.addEventListener('transitionend', async function handleEnd() {
      canvas.removeEventListener('transitionend', handleEnd);
      
      isSpinning = false;
      spinBtn.disabled = false;
      
      const loserName = pendingRecord ? pendingRecord.display_name : 'Entrenador Aleatorio';
      
      if (pendingRecord) {
        try {
          const { error } = await supabase
            .from('matchday_records')
            .update({ punishment_id: winningPunishment.id })
            .eq('id', pendingRecord.id);

          if (error) throw error;
          
          localStorage.removeItem('CF_PENDING_RECORD_ID');
          pendingRecord = null;
          callbacks.showToast(`¡Castigo guardado para ${loserName}!`, 'success');
        } catch (err) {
          console.error(err);
          callbacks.showToast('Error al guardar el castigo', 'error');
        }
      }

      // Show Result Modal
      const resModal = container.querySelector('#result-modal');
      resModal.querySelector('#result-title').innerText = winningPunishment.name;
      resModal.querySelector('#result-desc').innerText = winningPunishment.description || 'Cumple con el castigo en tu próxima cita.';
      resModal.querySelector('#result-loser').innerText = loserName;
      resModal.classList.add('active');

      setTimeout(() => {
        canvas.style.transition = 'none';
        const normalizedAngle = finalRot % 360;
        canvas.style.transform = `rotate(${normalizedAngle}deg)`;
      }, 500);

    }, { once: true });
  }

  loadData();
}
