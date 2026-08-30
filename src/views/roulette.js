import { supabase } from '../supabase';
import { adSlotHtml, mountAd } from '../utils/ads.js';

/**
 * Renders the Roulette screen (Wheel, Punishments list, Spin history).
 * Supports both league database mode and free local mode for guests.
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
  let currentLeague = null;
  let pendingRecord = null;
  let isSpinning = false;
  let currentUser = null;
  let currentUserApodo = null;
  let showLegend = false; // State to control legend visibility

  // Idle spin state
  let idleAngle = 0;
  let idleSpeed = 0.1; // degrees per frame
  let idleReq = null;

  // Shared colors array for the wheel slices and the legend
  const WHEEL_COLORS = [
    '#6366f1', // indigo
    '#4f46e5', // indigo dark
    '#f43f5e', // rose
    '#db2777', // pink/rose dark
    '#1e293b', // charcoal
    '#0f172a'  // dark slate
  ];

  // Initial default punishments
  const DEFAULT_PUNISHMENTS = [
    { id: 'd-pun-1', name: "Invitar a una ronda de cervezas", description: "En la próxima reunión del grupo." },
    { id: 'd-pun-2', name: "Llevar la camiseta del rival histórico", description: "Durante todo el próximo fin de semana." },
    { id: 'd-pun-3', name: "Pagar el doble del bote esta jornada", description: "Suma otros 2€ adicionales al bote." },
    { id: 'd-pun-4', name: "Hacer de utillero/recogepelotas", description: "En la próxima pachanga del grupo." },
    { id: 'd-pun-5', name: "Foto a redes elogiando al líder", description: "Subir foto con texto redactado por el líder de la liga." },
    { id: 'd-pun-6', name: "Comprar una caja de donuts", description: "Traer donuts para desayunar el próximo lunes." }
  ];

  let activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  let leagueMembers = [];
  let farolilloRojo = null;
  let selectedTargetManagerId = 'farolillo'; // 'farolillo', 'casual', or 'profile-<id>' / 'roster-<id>'

  async function loadData() {
    const pendingId = localStorage.getItem('CF_PENDING_RECORD_ID');

    if (isGuest || !activeLeagueId) {
      // Local mode - no database, fully stored in local storage
      punishments = JSON.parse(localStorage.getItem('CF_LOCAL_ROULETTE_PUNISHMENTS') || 'null');
      if (!punishments || punishments.length === 0) {
        punishments = DEFAULT_PUNISHMENTS.map(p => ({ ...p }));
        localStorage.setItem('CF_LOCAL_ROULETTE_PUNISHMENTS', JSON.stringify(punishments));
      }
      history = []; // No history card in local mode
      currentLeague = { name: "Ruleta Libre", invite_code: "MODO-DEMO" };
      selectedTargetManagerId = 'casual';
      renderView();
      return;
    }

    try {
      currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

      // Load the spinner's own apodo, used as the result label on a free spin
      if (currentUser) {
        const { data: ownProfile } = await supabase
          .from('profiles')
          .select('apodo, display_name')
          .eq('id', currentUser.id)
          .maybeSingle();
        currentUserApodo = ownProfile?.apodo || ownProfile?.display_name || null;
      }

      // 1. Fetch user's leagues memberships
      const { data: userLeagues, error: leaguesErr } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('profile_id', currentUser.id);

      if (leaguesErr) throw leaguesErr;

      if (!userLeagues || userLeagues.length === 0) {
        localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
        callbacks.showToast('No perteneces a ninguna liga todavía. Te mostramos la ruleta en modo libre.', 'info');
        activeLeagueId = null;
        loadData();
        return;
      }

      // 2. Resolve active league
      const hasActiveLeague = userLeagues.some(l => l.league_id === activeLeagueId);
      if (!hasActiveLeague) {
        activeLeagueId = userLeagues[0].league_id;
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', activeLeagueId);
      }

      currentLeagueId = activeLeagueId;

      // 2.5 Load active league details
      const { data: leagueData, error: leagueErr } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', currentLeagueId)
        .single();

      if (leagueErr) throw leagueErr;
      currentLeague = leagueData;

      // Load league members & unclaimed roster slots for target selector
      const { data: membersData } = await supabase
        .from('league_members')
        .select(`
          profile_id,
          biwenger_user_name,
          profiles:profile_id (
            apodo,
            display_name
          )
        `)
        .eq('league_id', currentLeagueId);

      const { data: rosterData } = await supabase
        .from('league_roster')
        .select('id, name')
        .eq('league_id', currentLeagueId)
        .is('claimed_by', null);

      leagueMembers = [
        ...(membersData || []).map(m => ({
          targetId: `profile-${m.profile_id}`,
          profile_id: m.profile_id,
          roster_id: null,
          name: m.profiles?.apodo || m.profiles?.display_name || 'Entrenador'
        })),
        ...(rosterData || []).map(r => ({
          targetId: `roster-${r.id}`,
          profile_id: null,
          roster_id: r.id,
          name: r.name
        }))
      ];

      // Detect Farolillo Rojo (latest loser in matchday_records or standings)
      const { data: lastRecord } = await supabase
        .from('matchday_records')
        .select(`
          id,
          matchday_number,
          loser_profile_id,
          loser_roster_id,
          profiles:loser_profile_id (
            apodo,
            display_name
          ),
          roster:loser_roster_id (
            name
          )
        `)
        .eq('league_id', currentLeagueId)
        .order('matchday_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastRecord) {
        const loserName = lastRecord.profiles?.apodo || lastRecord.profiles?.display_name || lastRecord.roster?.name || 'Entrenador';
        const targetId = lastRecord.loser_profile_id ? `profile-${lastRecord.loser_profile_id}` : (lastRecord.loser_roster_id ? `roster-${lastRecord.loser_roster_id}` : null);
        farolilloRojo = {
          name: loserName,
          targetId,
          profile_id: lastRecord.loser_profile_id,
          roster_id: lastRecord.loser_roster_id,
          matchday_number: lastRecord.matchday_number
        };
      } else if (leagueMembers.length > 0) {
        farolilloRojo = {
          name: leagueMembers[0].name,
          targetId: leagueMembers[0].targetId,
          profile_id: leagueMembers[0].profile_id,
          roster_id: leagueMembers[0].roster_id,
          matchday_number: 1
        };
      }

      // Load pending record if any
      if (pendingId) {
        const { data: recData, error: recErr } = await supabase
          .from('matchday_records')
          .select(`
            id,
            matchday_number,
            amount_owed,
            loser_profile_id,
            loser_roster_id,
            profiles:loser_profile_id (
              apodo,
              display_name
            ),
            roster:loser_roster_id (
              name
            )
          `)
          .eq('id', pendingId)
          .single();

        if (!recErr && recData) {
          pendingRecord = {
            id: recData.id,
            matchday_number: recData.matchday_number,
            amount_owed: recData.amount_owed,
            loser_profile_id: recData.loser_profile_id,
            loser_roster_id: recData.loser_roster_id,
            display_name: recData.profiles?.apodo || recData.profiles?.display_name || recData.roster?.name || 'Entrenador'
          };
          const targetId = recData.loser_profile_id ? `profile-${recData.loser_profile_id}` : (recData.loser_roster_id ? `roster-${recData.loser_roster_id}` : null);
          if (targetId) selectedTargetManagerId = targetId;
        }
      }

      // Load punishments
      const { data: punList, error: punErr } = await supabase
        .from('punishments')
        .select('*')
        .eq('league_id', currentLeagueId);

      if (punErr) throw punErr;

      // Cada liga empieza con la ruleta VACÍA y sus miembros añaden sus propios
      // castigos. No sembramos los castigos por defecto en la nube: son de cada
      // liga (ahí se ponen locuras) y no deben imponerse ni mezclarse.
      punishments = punList || [];

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
            apodo,
            display_name
          ),
          roster:loser_roster_id (
            name
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
      activeLeagueId = null;
      loadData();
    }
  }

  function renderView() {
    const isLocalMode = isGuest || !activeLeagueId;
    const isLoser = !isLocalMode && pendingRecord && currentUser && currentUser.id === pendingRecord.loser_profile_id;
    // Roster losers (pre-registered, unclaimed) have no account, so no real user can
    // "be" them — let any league member spin on their behalf instead of deadlocking.
    const isRosterLoser = !isLocalMode && pendingRecord && !pendingRecord.loser_profile_id && !!pendingRecord.loser_roster_id;
    const isEmpty = punishments.length === 0;
    // A wheel needs at least 2 options to be worth spinning.
    const canSpin = punishments.length >= 2;

    container.innerHTML = `
      <div class="container">
        <!-- Banner de Liga -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="gradient-text-green" style="font-size: 1.6rem; font-weight: 900;">${escapeHTML(currentLeague.name)}</h1>
            ${isLocalMode ? `
              <p style="font-size: 0.85rem; color: var(--text-muted);">
                Prueba la ruleta de castigos en local. Para usarla en tu liga real, inicia sesión.
              </p>
            ` : `
              <p style="font-size: 0.85rem; color: var(--text-muted);">
                Código de Invitación: <strong style="color: var(--accent-gold); cursor: pointer;" id="copy-invite-code" title="Copiar código">${escapeHTML(currentLeague.invite_code)} (Copiar)</strong>
              </p>
            `}
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${isLocalMode ? `
              ${!isGuest ? `
                <button class="header-action-btn btn-secondary" id="btn-back-to-selector" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color);">
                  Ir a Mis Ligas
                </button>
              ` : ''}
            ` : `
              <button class="header-action-btn btn-secondary" id="btn-back-to-hub" title="Volver al Menú" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver al Menú
              </button>
            `}
          </div>
        </div>

        <!-- Tarjeta de Moroso en Capilla & Modo de Tirada -->
        ${!isLocalMode ? `
          <div class="card glass" style="margin-bottom: 1.25rem; background: rgba(19, 19, 19, 0.85); border: 1.5px solid var(--accent); box-shadow: 0 0 15px rgba(222, 237, 0, 0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(211, 0, 23, 0.2); border: 2px solid #d30017; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: #d30017; text-transform: uppercase;">
                  PAGO
                </div>
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #deed00; letter-spacing: 0.05em;">
                    Target de la Tirada
                  </div>
                  <h3 style="font-size: 1.1rem; font-weight: 900; margin: 0; color: #fff;">
                    Moroso en Capilla
                  </h3>
                </div>
              </div>

              <!-- Selector de Destinatario o Tirada Casual -->
              <div style="min-width: 260px;">
                <label for="select-target-manager" style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">
                  ¿Para quién es el giro?
                </label>
                <select id="select-target-manager" class="input-field" style="padding: 0.5rem 0.75rem; font-size: 0.85rem; font-weight: 700; background: #1a1a1a; color: var(--accent); border-color: rgba(222, 237, 0, 0.4);">
                  ${farolilloRojo ? `
                    <option value="farolillo" ${selectedTargetManagerId === 'farolillo' ? 'selected' : ''}>
                      Farolillo Rojo (${farolilloRojo.name})
                    </option>
                  ` : ''}
                  ${leagueMembers.map(m => `
                    <option value="${m.targetId}" ${selectedTargetManagerId === m.targetId ? 'selected' : ''}>
                      ${escapeHTML(m.name)}
                    </option>
                  `).join('')}
                  <option value="casual" ${selectedTargetManagerId === 'casual' ? 'selected' : ''}>
                    Tirada Casual (Solo por diversión / Sin registro)
                  </option>
                </select>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Indicador de Tirada Pendiente -->
        ${pendingRecord ? `
          <div class="supabase-banner" style="background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); margin-bottom: 1.25rem;">
            <div class="supabase-banner-text" style="color: var(--text-light);">
              Tirada pendiente para <strong>${escapeHTML(pendingRecord.display_name)}</strong> (Jornada ${pendingRecord.matchday_number}). ¡Debe girar la ruleta para asignarle su castigo!
            </div>
          </div>
        ` : ''}

        <div class="roulette-grid">
          <!-- Columna Izquierda: Componente Ruleta -->
          <div class="card glass roulette-container" style="margin-bottom: 0;">
            <h2 class="card-title gradient-text-gold">Ruleta de Castigos</h2>
            ${isEmpty ? `
            <!-- Empty state: no castigos yet in this league's wheel -->
            <div class="roulette-empty">
              <div class="roulette-empty-ring">
                <div class="roulette-empty-ring-inner">
                  <span class="material-symbols-outlined roulette-empty-icon">casino</span>
                </div>
              </div>
              <h3 class="roulette-empty-title">Monta la ruleta de tu liga</h3>
              <p class="roulette-empty-text">Todavía no hay castigos. Añadid los vuestros —cuanto más locos, mejor— y dejad que el azar dicte sentencia cada jornada.</p>
              <button id="btn-add-first-castigo" class="btn-primary" style="max-width: 280px; margin-top: 0.25rem;">Añadir mi primer castigo</button>
              <button id="link-generador-ideas" class="roulette-empty-link">¿Sin ideas? Inspírate en el Generador →</button>
            </div>
            ` : `
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; text-align: center;">
              El azar dictará sentencia. Hay <strong>${punishments.length}</strong> castigos cargados.
            </p>

            <div class="wheel-wrapper">
              <div class="wheel-arrow"></div>
              <div class="wheel-center"></div>
              <!-- High-definition canvas drawing: 800x800 resolution scaled down using CSS for ultimate sharpness -->
              <canvas id="wheel-canvas" class="wheel-canvas" width="800" height="800" style="width: 100%; max-width: 420px; height: auto; display: block; margin: 0 auto;"></canvas>
            </div>

            <!-- Gating: need >=2 castigos, and only the pending loser may spin -->
            ${!canSpin ? `
              <div style="background: rgba(var(--accent-rgb), 0.08); border: 2px dashed var(--border-color-glow); border-radius: 6px; padding: 0.75rem; font-size: 0.85rem; color: var(--text-light); text-align: center; width: 100%; max-width: 320px; margin: 0.5rem auto 1.25rem auto; line-height: 1.35;">
                Necesitas al menos <strong>2 castigos</strong> para poder girar. Añade otro abajo.
              </div>
              <button id="spin-btn" class="btn-primary" style="max-width: 200px; opacity: 0.5; cursor: not-allowed; margin-bottom: 0.5rem;" disabled>¡GIRAR!</button>
            ` : (!isLocalMode && pendingRecord && !isLoser ? `
              <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 6px; padding: 0.75rem; font-size: 0.85rem; color: #f87171; text-align: center; margin-bottom: 1rem; width: 100%; max-width: 320px; margin: 0.5rem auto 1.25rem auto; line-height: 1.35;">
                Solo el jugador castigado, <strong>${escapeHTML(pendingRecord.display_name)}</strong>, puede girar la ruleta. ¡Haz que inicie sesión para tirar!
              </div>
              <button id="spin-btn" class="btn-primary" style="max-width: 200px; opacity: 0.5; cursor: not-allowed; margin-bottom: 0.5rem;" disabled>¡GIRAR!</button>
            ` : `
              <button id="spin-btn" class="btn-primary" style="max-width: 200px; margin-bottom: 0.5rem;">¡GIRAR!</button>
            `)}

            <!-- Color-coded Legend for Roulette Options (Collapsible/Optional) -->
            <div style="margin-top: 1.5rem; width: 100%; text-align: left; padding: 0.5rem; border-top: 1.5px solid var(--border-color); padding-top: 1.25rem;">
              <button id="btn-toggle-legend" style="
                background: transparent;
                border: none;
                color: var(--text-muted);
                font-family: var(--font-sans);
                font-size: 0.8rem;
                font-weight: 800;
                text-transform: uppercase;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.35rem;
                padding: 0;
                width: 100%;
                justify-content: space-between;
              ">
                <span>Opciones en la Ruleta</span>
                <span style="font-size: 0.7rem; color: var(--accent);" id="legend-toggle-indicator">
                  ${showLegend ? 'Ocultar ▲' : 'Mostrar ▼'}
                </span>
              </button>

              <div id="roulette-legend-content" style="
                display: ${showLegend ? 'grid' : 'none'};
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem 1rem;
                max-height: 140px;
                overflow-y: auto;
                padding-right: 0.25rem;
                margin-top: 0.75rem;
              ">
                ${punishments.map((p, idx) => {
      const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];
      return `
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; min-width: 0;">
                      <span style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 1.5px solid #000; flex-shrink: 0;"></span>
                      <span style="font-weight: 700; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(p.name)}: ${escapeHTML(p.description || '')}">
                        ${escapeHTML(p.name)}
                      </span>
                    </div>
                  `;
    }).join('')}
              </div>
            </div>
            `}
          </div>

          <!-- Columna Derecha: Personalizar e Historial -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Personalizar Castigos -->
            <div class="card glass" style="margin-bottom: 0;">
              <h2 class="card-title">Personalizar Castigos</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Añade o elimina opciones de la ruleta local.</p>
              
              <form id="add-punishment-form" style="margin-bottom: 1.5rem;">
                <div class="form-group">
                  <label for="new-pun-name">Nombre del Castigo</label>
                  <input type="text" id="new-pun-name" class="input-field" placeholder="Nombre breve" required />
                </div>
                <div class="form-group">
                  <label for="new-pun-desc">Descripción</label>
                  <input type="text" id="new-pun-desc" class="input-field" placeholder="Instrucciones del castigo" />
                </div>
                <button type="submit" class="btn-secondary">Añadir Castigo</button>
              </form>

              <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto;" id="punishments-admin-list">
                ${punishments.map(p => `
                  <div class="item-row">
                    <div>
                      <div style="font-weight: 700; font-size: 0.95rem;">${escapeHTML(p.name)}</div>
                      ${p.description ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(p.description)}</div>` : ''}
                    </div>
                    <button class="btn-secondary btn-danger delete-pun-btn" data-id="${p.id}" style="width: auto; padding: 0.4rem 0.6rem; font-size: 0.8rem; border-radius: 6px;">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Historial de Castigos (solo en modo liga) -->
            ${isLocalMode ? '' : `
              <div class="card glass pitch-card" style="margin-bottom: 0; flex-grow: 1;">
                <h2 class="card-title gradient-text-green">Historial de Sentencias</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Castigos aplicados a los perdedores.</p>
                
                <div class="history-list" style="max-height: 250px; overflow-y: auto;">
                  ${history.length === 0 ? `
                    <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
                      Ningún castigo aplicado todavía. ¡Todos limpios!
                    </div>
                  ` : history.map(item => `
                    <div class="history-item">
                      <div class="history-header">
                        <span class="history-loser">${escapeHTML(item.profiles?.apodo || item.profiles?.display_name || item.roster?.name || 'Entrenador')}</span>
                        <span class="history-date">Jornada ${item.matchday_number} ${item.amount_owed ? `(${item.amount_owed}€)` : ''}</span>
                      </div>
                      <div style="font-weight: 700; color: var(--accent); margin-top: 0.25rem; font-size: 0.95rem;">
                        ${escapeHTML(item.punishments?.name || 'Castigo Desconocido')}
                      </div>
                      ${item.punishments?.description ? `
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
                          ${escapeHTML(item.punishments.description)}
                        </div>
                      ` : ''}
                      ${item.trash_talk_phrase ? `
                        <div class="history-trash">${escapeHTML(item.trash_talk_phrase)}</div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `}
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

            <!-- Anuncio: aparece justo al terminar la tirada, aqui y no en
                 cualquier parte de la pagina, porque girar la ruleta es con
                 diferencia lo que mas interaccion tiene de toda la web. -->
            ${adSlotHtml('ruleta-resultado')}
          </div>
        </div>
      </div>
    `;

    // Initialize Canvas drawing
    const canvas = container.querySelector('#wheel-canvas');
    drawWheel(canvas);

    // Cancel any previous idle spin
    if (idleReq) cancelAnimationFrame(idleReq);

    // Idle spin loop
    function idleLoop() {
      if (isSpinning) return;
      idleAngle = (idleAngle + idleSpeed) % 360;
      if (canvas) {
        canvas.style.transform = `rotate(${idleAngle}deg)`;
      }
      idleReq = requestAnimationFrame(idleLoop);
    }

    // Start idle spin
    idleReq = requestAnimationFrame(idleLoop);

    // Speed up on hover
    if (canvas) {
      canvas.addEventListener('mouseenter', () => {
        if (!isSpinning) idleSpeed = 1.0;
      });
      canvas.addEventListener('mouseleave', () => {
        if (!isSpinning) idleSpeed = 0.1;
      });
    }

    // Target Manager / Casual mode selector change event
    const targetSelect = container.querySelector('#select-target-manager');
    if (targetSelect) {
      targetSelect.addEventListener('change', (e) => {
        selectedTargetManagerId = e.target.value;
        const selectedOptionText = e.target.options[e.target.selectedIndex].text;
        if (selectedTargetManagerId === 'casual') {
          callbacks.showToast('Modo Tirada Casual activado (sin guardar en base de datos)', 'info');
        } else {
          callbacks.showToast(`Moroso seleccionado: ${selectedOptionText.trim()}`, 'info');
        }
      });
    }

    // Event listeners
    const spinBtn = container.querySelector('#spin-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        if (isSpinning) return;

        // Enforce loser spin rule in database mode if pendingRecord exists and casual is NOT selected
        if (!isLocalMode && pendingRecord && selectedTargetManagerId !== 'casual') {
          if (!isLoser && !isRosterLoser) {
            callbacks.showToast(`Solo el jugador castigado (${pendingRecord.display_name}) puede girar la ruleta para su tirada pendiente`, 'error');
            return;
          }
        }

        spinWheel(canvas);
      });
    }

    // Empty-state actions
    const addFirstBtn = container.querySelector('#btn-add-first-castigo');
    if (addFirstBtn) {
      addFirstBtn.addEventListener('click', () => {
        const nameInput = container.querySelector('#new-pun-name');
        if (nameInput) {
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => nameInput.focus(), 350);
        }
      });
    }
    const ideasLink = container.querySelector('#link-generador-ideas');
    if (ideasLink) {
      ideasLink.addEventListener('click', () => {
        if (callbacks.onNavigate) callbacks.onNavigate('generador');
      });
    }

    // Collapsible legend toggle listener
    const toggleLegendBtn = container.querySelector('#btn-toggle-legend');
    if (toggleLegendBtn) {
      toggleLegendBtn.addEventListener('click', () => {
        showLegend = !showLegend;

        const contentEl = container.querySelector('#roulette-legend-content');
        const indicatorEl = container.querySelector('#legend-toggle-indicator');

        if (contentEl && indicatorEl) {
          if (showLegend) {
            contentEl.style.display = 'grid';
            indicatorEl.textContent = 'Ocultar ▲';
          } else {
            contentEl.style.display = 'none';
            indicatorEl.textContent = 'Mostrar ▼';
          }
        }
      });
    }

    // Handle add punishment
    const addForm = container.querySelector('#add-punishment-form');
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = addForm.querySelector('#new-pun-name').value.trim();
      const description = addForm.querySelector('#new-pun-desc').value.trim();

      if (isLocalMode) {
        const newPun = {
          id: 'local-pun-' + Date.now(),
          name,
          description
        };
        punishments.push(newPun);
        localStorage.setItem('CF_LOCAL_ROULETTE_PUNISHMENTS', JSON.stringify(punishments));
        callbacks.showToast('Castigo añadido a la ruleta local', 'success');
        loadData();
        return;
      }

      addPunishmentRemote(name, description);
    });

    // Handle delete punishment
    container.querySelectorAll('.delete-pun-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (punishments.length <= 2) {
          callbacks.showToast('La ruleta necesita tener al menos 2 castigos para girar', 'error');
          return;
        }

        if (isLocalMode) {
          punishments = punishments.filter(p => p.id !== id);
          localStorage.setItem('CF_LOCAL_ROULETTE_PUNISHMENTS', JSON.stringify(punishments));
          callbacks.showToast('Castigo eliminado de tu ruleta local', 'success');
          loadData();
          return;
        }

        deletePunishmentRemote(id);
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

    // Hook Copy Invite Code
    const copyBtn = container.querySelector('#copy-invite-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentLeague.invite_code).then(() => {
          callbacks.showToast('Código copiado al portapapeles', 'success');
        }).catch(err => {
          console.error(err);
        });
      });
    }

    // Hook Back to Hub Button
    const backToHubBtn = container.querySelector('#btn-back-to-hub');
    if (backToHubBtn) {
      backToHubBtn.addEventListener('click', () => {
        callbacks.onNavigate('menu-liga');
      });
    }

    // Hook Back to Selector Button
    const backToSelectorBtn = container.querySelector('#btn-back-to-selector');
    if (backToSelectorBtn) {
      backToSelectorBtn.addEventListener('click', () => {
        callbacks.onNavigate('mis-ligas');
      });
    }
  }

  async function addPunishmentRemote(name, description) {
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
  }

  async function deletePunishmentRemote(id) {
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
  }

  // Draw wheel helper
  function drawWheel(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    ctx.clearRect(0, 0, width, height);

    // Empty wheel (league starts with no castigos): draw a placeholder ring
    // instead of dividing by zero.
    if (punishments.length === 0) {
      ctx.beginPath();
      ctx.arc(center, center, center - 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#20201f';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#3a3a3a';
      ctx.stroke();
      ctx.fillStyle = '#c8c8ab';
      ctx.font = 'bold 34px Syne, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ruleta vacía', center, center - 10);
      ctx.font = '24px Syne, sans-serif';
      ctx.fillText('Añade castigos', center, center + 30);
      return;
    }

    const arcLength = (2 * Math.PI) / punishments.length;

    for (let i = 0; i < punishments.length; i++) {
      const angle = i * arcLength;
      ctx.beginPath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, center - 15, angle, angle + arcLength);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcLength / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 6;

      const nameText = punishments[i].name;

      // Significantly enlarged font size parameters for 800x800 canvas
      let fontSize = 28;
      if (nameText.length > 15) fontSize = 24;
      if (nameText.length > 22) fontSize = 20;
      if (nameText.length > 30) fontSize = 16;
      if (nameText.length > 38) fontSize = 13;

      ctx.font = `bold ${fontSize}px Syne, sans-serif`;

      let displayName = nameText;
      if (nameText.length > 45) {
        displayName = nameText.substring(0, 42) + "...";
      }

      const verticalOffset = fontSize / 3;
      ctx.fillText(displayName, center - 35, verticalOffset);
      ctx.restore();
    }
  }

  // Spin wheel simulation
  function spinWheel(canvas) {
    if (punishments.length === 0) return;
    isSpinning = true;
    const spinBtn = container.querySelector('#spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    const sectorsCount = punishments.length;
    const winningIdx = Math.floor(Math.random() * sectorsCount);
    const winningPunishment = punishments[winningIdx];

    const sliceAngle = 360 / sectorsCount;
    const winningMidAngle = (winningIdx * sliceAngle) + (sliceAngle / 2);

    // Stop idle loop
    if (idleReq) cancelAnimationFrame(idleReq);

    // Calculate how much more to rotate so it lands correctly, 
    // adding multiple full spins (e.g. 1800 deg = 5 spins)
    const normalizedIdle = idleAngle % 360;
    const targetOffset = (270 - winningMidAngle + 360) % 360;
    let additionalRotation = targetOffset - normalizedIdle;
    if (additionalRotation <= 0) additionalRotation += 360;
    const finalRot = idleAngle + 1800 + additionalRotation;

    canvas.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1)';
    canvas.style.transform = `rotate(${finalRot}deg)`;

    canvas.addEventListener('transitionend', async function handleEnd() {
      canvas.removeEventListener('transitionend', handleEnd);

      isSpinning = false;
      if (spinBtn) spinBtn.disabled = false;

      const isLocalMode = isGuest || !activeLeagueId;
      let targetName = 'Tirada Casual';
      let isCasualSpin = isLocalMode || selectedTargetManagerId === 'casual';

      if (!isCasualSpin) {
        let loserProfileId = null;
        let loserRosterId = null;

        if (pendingRecord) {
          targetName = pendingRecord.display_name;
          loserProfileId = pendingRecord.loser_profile_id;
          loserRosterId = pendingRecord.loser_roster_id;
        } else if (selectedTargetManagerId === 'farolillo' && farolilloRojo) {
          targetName = farolilloRojo.name;
          loserProfileId = farolilloRojo.profile_id;
          loserRosterId = farolilloRojo.roster_id;
        } else if (selectedTargetManagerId.startsWith('profile-')) {
          const profId = selectedTargetManagerId.replace('profile-', '');
          const memberObj = leagueMembers.find(m => m.profile_id === profId);
          targetName = memberObj?.name || 'Mánager';
          loserProfileId = profId;
        } else if (selectedTargetManagerId.startsWith('roster-')) {
          const rostId = selectedTargetManagerId.replace('roster-', '');
          const memberObj = leagueMembers.find(m => m.roster_id === rostId);
          targetName = memberObj?.name || 'Mánager';
          loserRosterId = rostId;
        }

        try {
          if (pendingRecord) {
            const { error } = await supabase
              .from('matchday_records')
              .update({ punishment_id: winningPunishment.id })
              .eq('id', pendingRecord.id);

            if (error) throw error;
            localStorage.removeItem('CF_PENDING_RECORD_ID');
            pendingRecord = null;
          } else {
            // Insert new matchday record for chosen loser
            const matchdayNum = farolilloRojo ? farolilloRojo.matchday_number : 1;
            const { error } = await supabase
              .from('matchday_records')
              .insert({
                league_id: currentLeagueId,
                matchday_number: matchdayNum,
                loser_profile_id: loserProfileId,
                loser_roster_id: loserRosterId,
                punishment_id: winningPunishment.id,
                amount_owed: 0
              });

            if (error) throw error;
          }

          callbacks.showToast(`¡Castigo registrado para ${targetName}!`, 'success');
        } catch (err) {
          console.error(err);
          callbacks.showToast('Error al guardar el castigo', 'error');
        }
      } else {
        callbacks.showToast(`¡Castigo casual sentenciado!`, 'success');
      }

      // Show Result Modal
      const resModal = container.querySelector('#result-modal');
      if (resModal) {
        resModal.querySelector('#result-title').innerText = winningPunishment.name;
        resModal.querySelector('#result-desc').innerText = winningPunishment.description || 'Cumple con el castigo en tu próxima cita.';
        resModal.querySelector('#result-loser').innerText = isCasualSpin ? 'Tirada Casual (Amigos)' : targetName;
        resModal.classList.add('active');
        mountAd(resModal, 'ruleta-resultado');
      }

      setTimeout(() => {
        canvas.style.transition = 'none';
        idleAngle = finalRot % 360;
        canvas.style.transform = `rotate(${idleAngle}deg)`;

        // Resume idle spin after a short delay
        setTimeout(() => {
          if (!isSpinning && document.body.contains(canvas)) {
            idleReq = requestAnimationFrame(idleLoop);
          }
        }, 1500);
      }, 500);

    }, { once: true });
  }

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  loadData();
}
