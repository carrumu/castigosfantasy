import { supabase } from '../supabase';
import { getRandomPhrase } from '../utils/phrases';
import { openLeagueSettings } from '../utils/league-options';
import { openBiwengerLinkModal } from '../utils/biwenger-link-modal';

/**
 * Renders the Main Dashboard (Leaderboard, Registering matchday loser).
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderDashboard(container, callbacks) {
  const isGuest = callbacks.isGuest;

  let currentLeague = null;
  let members = [];
  let records = [];
  let isAdmin = false;
  let currentUserId = null;

  let activeTab = 'deudas'; // 'deudas', 'biwenger-general', 'biwenger-jornada'
  let biwengerStandings = [];
  let biwengerLoaded = false;
  let biwengerLoadError = false;
  let biwengerErrorMsg = '';
  let biwengerRoundName = '';
  let biwengerSeasonRounds = []; // all season rounds from the competition

  // Default Mock Data for Guest / Demo Mode
  const DEFAULT_DEMO_MEMBERS = [
    { profile_id: 'd-member-1', display_name: 'Paco G.', avatar_url: '' },
    { profile_id: 'd-member-2', display_name: 'Álvaro M.', avatar_url: '' },
    { profile_id: 'd-member-3', display_name: 'Santi K.', avatar_url: '' },
    { profile_id: 'd-member-4', display_name: 'Luis T.', avatar_url: '' }
  ];

  const DEFAULT_DEMO_RECORDS = [
    { id: 'd-rec-1', matchday_number: 1, loser_profile_id: 'd-member-1', amount_owed: 2.00, punishment_id: 'd-pun-1', trash_talk_phrase: '"Paco G.: ¡Farolillo rojo oficial! Esa alineación no la salva ni el VAR."', created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString() },
    { id: 'd-rec-2', matchday_number: 2, loser_profile_id: 'd-member-2', amount_owed: 2.00, punishment_id: 'd-pun-2', trash_talk_phrase: '"Álvaro M.: Tus jugadores corrieron menos que el utillero esta jornada."', created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString() },
    { id: 'd-rec-3', matchday_number: 3, loser_profile_id: 'd-member-1', amount_owed: 2.00, punishment_id: null, trash_talk_phrase: '"Paco G.: El bote de la liga te agradece enormemente tu generoso patrocinio."', created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() }
  ];

  // Helper to generate a random 6-character invite code
  function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function loadData() {
    if (isGuest) {
      callbacks.onNavigate('acceso');
      return;
    }

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      currentUserId = currentUser ? currentUser.id : null;

      // 1. Fetch user's leagues memberships
      const { data: userLeagues, error: leaguesErr } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('profile_id', currentUser.id);

      if (leaguesErr) throw leaguesErr;

      if (!userLeagues || userLeagues.length === 0) {
        localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
        callbacks.showToast('No perteneces a ninguna liga todavía', 'info');
        callbacks.onNavigate('mis-ligas');
        return;
      }

      // 2. Resolve active league
      let activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
      const hasActiveLeague = userLeagues.some(l => l.league_id === activeLeagueId);

      if (!activeLeagueId || !hasActiveLeague) {
        activeLeagueId = userLeagues[0].league_id;
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', activeLeagueId);
      }

      // 3. Load active league member info
      const { data: memberData, error: memberErr } = await supabase
        .from('league_members')
        .select('*')
        .eq('profile_id', currentUser.id)
        .eq('league_id', activeLeagueId)
        .single();

      if (memberErr) throw memberErr;
      isAdmin = !!memberData.is_admin;

      // 4. Load league details
      const { data: leagueData, error: leagueErr } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', activeLeagueId)
        .single();

      if (leagueErr) throw leagueErr;
      currentLeague = leagueData;

      // 5. Get members
      const { data: membersList, error: listErr } = await supabase
        .from('league_members')
        .select(`
          profile_id,
          is_admin,
          biwenger_user_name,
          profiles (
            apodo,
            display_name,
            avatar_url
          )
        `)
        .eq('league_id', currentLeague.id);

      if (listErr) throw listErr;
      
      members = membersList.map(m => ({
        profile_id: m.profile_id,
        display_name: m.profiles?.apodo || m.profiles?.display_name || 'Desconocido',
        avatar_url: m.profiles?.avatar_url || '',
        biwenger_user_name: m.biwenger_user_name || ''
      }));

      // 6. Get records
      const { data: recordsList, error: recErr } = await supabase
        .from('matchday_records')
        .select('*')
        .eq('league_id', currentLeague.id);

      if (recErr) throw recErr;
      records = recordsList;

      // Start fetching Biwenger standings asynchronously
      fetchBiwengerStandings();

      renderMainDashboard();
    } catch (err) {
      console.error(err);
      callbacks.showToast('Error cargando datos de la liga', 'error');
    }
  }

  async function fetchBiwengerStandings() {
    if (!currentLeague || currentLeague.sync_source !== 'biwenger') return;
    
    const email = currentLeague.biwenger_email;
    const password = currentLeague.biwenger_password;
    const bLeagueId = currentLeague.biwenger_league_id;

    if (!email || !password || !bLeagueId) {
      biwengerLoadError = true;
      biwengerErrorMsg = 'Las credenciales de Biwenger no están configuradas en Ajustes.';
      updateLeaderboardView();
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';
      
      let token = supabaseAnonKey;
      try {
        const sessionData = await supabase.auth.getSession();
        if (sessionData.data?.session?.access_token) {
          token = sessionData.data.session.access_token;
        }
      } catch (_) {}

      const res = await fetch(`${supabaseUrl}/functions/v1/biwenger-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ email, password, leagueId: bLeagueId })
      });

      if (res.status !== 200) {
        const errText = await res.text();
        let errMsg = `Error de conexión (Status ${res.status})`;
        try {
          const errJSON = JSON.parse(errText);
          errMsg = errJSON.error || errJSON.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const syncData = await res.json();
      const users = syncData.data?.users || [];
      const standings = syncData.data?.standings || [];
      biwengerRoundName = syncData.data?.round?.name || '';
      biwengerSeasonRounds = syncData.data?.season_rounds || [];

      biwengerStandings = standings.map(s => {
        const u = users.find(user => user.id === s.id) || {};
        return {
          id: s.id,
          name: u.name || 'Entrenador',
          points: s.points || 0,
          lastPoints: s.lastPoints || 0,
          position: s.position || 1
        };
      });

      biwengerLoaded = true;
      biwengerLoadError = false;
      updateLeaderboardView();

      // Detect finished rounds and cache colista data for admin banner
      detectAndCacheFinishedRound();
    } catch (err) {
      console.error('Error loading Biwenger standings:', err);
      biwengerLoadError = true;
      biwengerErrorMsg = err.message || 'Error de conexión con Biwenger.';
      updateLeaderboardView();
    }
  }

  // --- Biwenger Round-End Detection ---
  async function detectAndCacheFinishedRound() {
    if (!currentLeague || currentLeague.sync_source !== 'biwenger') return;
    if (biwengerSeasonRounds.length === 0 || biwengerStandings.length === 0) return;

    // Find most recent finished round
    const finishedRounds = biwengerSeasonRounds.filter(r => r.status === 'finished');
    if (finishedRounds.length === 0) return;
    const lastFinished = finishedRounds[finishedRounds.length - 1];

    // Check if already saved in DB
    const { data: existing } = await supabase
      .from('matchday_records')
      .select('id')
      .eq('league_id', currentLeague.id)
      .eq('biwenger_round_id', lastFinished.id)
      .limit(1);

    if (existing && existing.length > 0) {
      // Already saved, clear any stale localStorage entry
      localStorage.removeItem(`CF_PENDING_BW_ROUND_${currentLeague.id}`);
      return;
    }

    // Detect colista (lowest lastPoints)
    const minPts = Math.min(...biwengerStandings.map(s => s.lastPoints));
    const colistaList = biwengerStandings.filter(s => s.lastPoints === minPts);
    // Pick the one with the worst overall position in case of tie
    const colista = colistaList.sort((a, b) => b.position - a.position)[0];

    // Cache to localStorage so data survives even if next round starts and lastPoints changes
    const cacheKey = `CF_PENDING_BW_ROUND_${currentLeague.id}`;
    const existing_cache = localStorage.getItem(cacheKey);
    // Only overwrite if round changed or not set yet
    if (!existing_cache || JSON.parse(existing_cache).roundId !== lastFinished.id) {
      localStorage.setItem(cacheKey, JSON.stringify({
        roundId: lastFinished.id,
        roundName: lastFinished.name || lastFinished.short || `Ronda ${lastFinished.id}`,
        colistaName: colista.name,
        colistaPts: colista.lastPoints,
        isTie: colistaList.length > 1,
        tieNames: colistaList.map(s => s.name)
      }));
    }

    // Show admin banner if applicable
    if (isAdmin) showJornadaBanner();
  }

  function showJornadaBanner() {
    const cacheKey = `CF_PENDING_BW_ROUND_${currentLeague.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return;
    const pending = JSON.parse(cached);

    const existingBanner = container.querySelector('#jornada-close-banner');
    if (existingBanner) return; // already shown

    // Find linked member for colista
    const matchedMember = members.find(m =>
      m.biwenger_user_name &&
      m.biwenger_user_name.toLowerCase().trim() === pending.colistaName.toLowerCase().trim()
    );
    const colistaLocalName = matchedMember ? matchedMember.display_name : null;
    const colistaDisplay = colistaLocalName
      ? `${colistaLocalName} <span style="color:var(--text-muted);font-size:0.8rem">(${pending.colistaName})</span>`
      : `<span style="color:var(--accent-gold)">${pending.colistaName} ⚠️ sin vincular</span>`;

    const banner = document.createElement('div');
    banner.id = 'jornada-close-banner';
    banner.style.cssText = `
      background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05));
      border: 2px solid rgba(239,68,68,0.5);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    `;
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;flex:1;min-width:0;">
        <span style="font-size:1.5rem">🔴</span>
        <div>
          <div style="font-weight:800;font-size:0.9rem;color:var(--text-light);margin-bottom:0.2rem;">
            Jornada terminada: <span style="color:#f87171">${pending.roundName}</span>
          </div>
          <div style="font-size:0.82rem;color:var(--text-muted);">
            Último: ${colistaDisplay} · ${pending.colistaPts} pts
            ${pending.isTie ? `<span style="color:var(--accent-gold);margin-left:0.4rem">⚠️ Empate — elige quién paga</span>` : ''}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-shrink:0;">
        <button id="btn-confirm-jornada" style="
          background: var(--danger); color: #fff; border: none; border-radius: 6px;
          padding: 0.55rem 1rem; font-weight: 800; font-size: 0.8rem; cursor: pointer;
          text-transform: uppercase; letter-spacing: 0.5px;
        ">Cerrar Jornada</button>
        <button id="btn-dismiss-jornada" style="
          background: none; color: var(--text-muted); border: 1px solid var(--border-color);
          border-radius: 6px; padding: 0.55rem 0.75rem; font-size: 0.75rem; cursor: pointer;
        ">Ignorar</button>
      </div>
    `;

    // Insert banner before dashboard-grid
    const grid = container.querySelector('.dashboard-grid');
    if (grid) grid.parentNode.insertBefore(banner, grid);

    // Dismiss button
    banner.querySelector('#btn-dismiss-jornada').addEventListener('click', () => {
      banner.remove();
    });

    // Confirm button → open modal
    banner.querySelector('#btn-confirm-jornada').addEventListener('click', () => {
      openJornadaConfirmModal(pending, matchedMember);
    });
  }

  function openJornadaConfirmModal(pending, defaultMember) {
    // Remove any existing modal
    const old = document.querySelector('#jornada-confirm-modal');
    if (old) old.remove();

    const maxMatchday = records.reduce((max, r) => r.matchday_number > max ? r.matchday_number : max, 0);
    const nextMatchday = maxMatchday + 1;

    // Build member options for select
    const memberOptions = members.map(m => {
      const bwMatch = m.biwenger_user_name &&
        pending.tieNames.some(n => n.toLowerCase().trim() === m.biwenger_user_name.toLowerCase().trim());
      return `<option value="${m.profile_id}" ${defaultMember?.profile_id === m.profile_id || (pending.isTie && bwMatch) ? 'selected' : ''}>${m.display_name}</option>`;
    }).join('');

    const modal = document.createElement('div');
    modal.id = 'jornada-confirm-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    `;
    modal.innerHTML = `
      <div style="
        background: var(--bg-card); border: 2px solid rgba(239,68,68,0.4);
        border-radius: 14px; padding: 1.75rem; max-width: 440px; width: 100%;
      ">
        <h3 style="font-weight:900;font-size:1.1rem;margin-bottom:0.25rem;">🔴 Cerrar Jornada</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1.25rem;">${pending.roundName} · ${pending.colistaPts} pts</p>

        ${!defaultMember ? `<div style="background:rgba(222,237,0,0.08);border:1px solid rgba(222,237,0,0.3);border-radius:6px;padding:0.65rem 0.85rem;font-size:0.8rem;color:var(--accent-gold);margin-bottom:1rem;">
          ⚠️ <strong>${pending.colistaName}</strong> no tiene mánager vinculado. Selecciona quién paga:
        </div>` : ''}

        <div style="display:grid;gap:0.75rem;">
          <div>
            <label style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.35rem;display:block;">El Farolillo Rojo</label>
            <select id="jornada-loser-select" style="width:100%;padding:0.6rem 0.75rem;background:var(--bg-input);border:1.5px solid var(--border-color-glow);border-radius:6px;color:var(--text-light);font-size:0.9rem;">
              ${memberOptions}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.35rem;display:block;">Jornada #</label>
              <input type="number" id="jornada-num" value="${nextMatchday}" min="1" style="width:100%;padding:0.6rem 0.75rem;background:var(--bg-input);border:1.5px solid var(--border-color-glow);border-radius:6px;color:var(--text-light);font-size:0.9rem;" />
            </div>
            <div>
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.35rem;display:block;">Deuda (€)</label>
              <input type="number" id="jornada-amount" value="2.00" min="0" step="0.5" style="width:100%;padding:0.6rem 0.75rem;background:var(--bg-input);border:1.5px solid var(--border-color-glow);border-radius:6px;color:var(--text-light);font-size:0.9rem;" />
            </div>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
          <button id="btn-jornada-save" style="
            flex:1;background:var(--danger);color:#fff;border:none;border-radius:8px;
            padding:0.75rem;font-weight:800;font-size:0.9rem;cursor:pointer;
            text-transform:uppercase;letter-spacing:0.5px;
          ">Confirmar y Guardar</button>
          <button id="btn-jornada-cancel" style="
            background:none;color:var(--text-muted);border:1px solid var(--border-color);
            border-radius:8px;padding:0.75rem 1rem;font-size:0.85rem;cursor:pointer;
          ">Cancelar</button>
        </div>
        <div id="jornada-save-error" style="display:none;color:#f87171;font-size:0.8rem;margin-top:0.5rem;"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-jornada-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#btn-jornada-save').addEventListener('click', async () => {
      const btn = modal.querySelector('#btn-jornada-save');
      const errorEl = modal.querySelector('#jornada-save-error');
      const loserId = modal.querySelector('#jornada-loser-select').value;
      const matchday = Number(modal.querySelector('#jornada-num').value);
      const amount = Number(modal.querySelector('#jornada-amount').value);

      if (!loserId) { errorEl.style.display = 'block'; errorEl.textContent = 'Selecciona quién paga.'; return; }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';
      errorEl.style.display = 'none';

      try {
        const loserProfile = members.find(m => m.profile_id === loserId);
        const trashPhrase = getRandomPhrase(loserProfile?.display_name || '', amount);

        const { error: insertErr } = await supabase
          .from('matchday_records')
          .insert({
            league_id: currentLeague.id,
            matchday_number: matchday,
            loser_profile_id: loserId,
            amount_owed: amount,
            biwenger_round_id: pending.roundId,
            trash_talk_phrase: trashPhrase
          });

        if (insertErr) throw insertErr;

        // Clear cache and remove banner
        localStorage.removeItem(`CF_PENDING_BW_ROUND_${currentLeague.id}`);
        container.querySelector('#jornada-close-banner')?.remove();
        modal.remove();
        callbacks.showToast(`¡Jornada cerrada! ${loserProfile?.display_name} queda registrado como moroso.`, 'success');
        loadData();
      } catch (err) {
        console.error(err);
        errorEl.style.display = 'block';
        errorEl.textContent = `Error al guardar: ${err.message}`;
        btn.disabled = false;
        btn.innerHTML = 'Confirmar y Guardar';
      }
    });
  }
  // --- End Round-End Detection ---

  function updateLeaderboardView() {
    const contentArea = container.querySelector('#leaderboard-content-area');
    if (!contentArea) return;

    if (activeTab === 'deudas') {
      const leaderboard = members.map(m => {
        const userRecords = records.filter(r => r.loser_profile_id === m.profile_id);
        const totalOwed = userRecords.reduce((sum, r) => sum + Number(r.amount_owed), 0);
        const countLast = userRecords.length;
        return {
          profile_id: m.profile_id,
          name: m.display_name,
          avatar: m.avatar_url,
          totalOwed,
          countLast
        };
      });

      leaderboard.sort((a, b) => b.totalOwed - a.totalOwed || b.countLast - a.countLast);

      if (leaderboard.length === 0) {
        contentArea.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
            Nadie es el último todavía. ¡Buena jornada para todos!
          </div>
        `;
        return;
      }

      contentArea.innerHTML = leaderboard.map((item, idx) => {
        const memberObj = members.find(m => m.profile_id === item.profile_id);
        const biwengerPart = (currentLeague?.sync_source === 'biwenger' && memberObj?.biwenger_user_name) 
          ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal; margin-left: 0.35rem;">(${memberObj.biwenger_user_name})</span>`
          : '';

        return `
          <div class="leaderboard-item rank-${idx + 1}">
            <div class="leaderboard-rank">${idx + 1}</div>
            <div class="leaderboard-info">
              <div class="leaderboard-name" style="display: flex; align-items: center; flex-wrap: wrap;">
                ${item.name} ${biwengerPart}
              </div>
              <div class="leaderboard-stats">Último puesto: <strong>${item.countLast}</strong> veces</div>
            </div>
            <div class="leaderboard-debt">
              <div class="debt-amount">${item.totalOwed.toFixed(2)}€</div>
            </div>
          </div>
        `;
      }).join('');

    } else if (activeTab === 'biwenger-general' || activeTab === 'biwenger-jornada') {
      if (biwengerLoadError) {
        contentArea.innerHTML = `
          <div style="text-align: center; color: var(--danger); padding: 1.5rem 0; font-size: 0.85rem;">
            ⚠️ ${biwengerErrorMsg}<br>
            <button id="btn-retry-biwenger" class="btn-secondary" style="margin-top: 0.75rem; font-size: 0.75rem; padding: 0.4rem 0.75rem; width: auto; display: inline-block;">Reintentar</button>
          </div>
        `;
        const retryBtn = contentArea.querySelector('#btn-retry-biwenger');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            biwengerLoadError = false;
            biwengerErrorMsg = '';
            updateLeaderboardView();
            fetchBiwengerStandings();
          });
        }
        return;
      }

      if (!biwengerLoaded) {
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 2rem 0;">
            <span class="spinner" style="width:32px;height:32px;display:inline-block;"></span>
            <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">Cargando clasificación de Biwenger...</p>
          </div>
        `;
        return;
      }

      if (biwengerStandings.length === 0) {
        contentArea.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
            No hay datos disponibles en la liga de Biwenger.
          </div>
        `;
        return;
      }

      const isGeneral = activeTab === 'biwenger-general';
      const sortField = isGeneral ? 'points' : 'lastPoints';

      const sortedBiwenger = [...biwengerStandings].sort((a, b) => b[sortField] - a[sortField]);

      let minLastPoints = Infinity;
      if (!isGeneral) {
        minLastPoints = Math.min(...biwengerStandings.map(s => s.lastPoints));
      }

      const linkedMemberIds = new Set();
      
      const biwengerRows = sortedBiwenger.map(s => {
        const matchedMember = members.find(m => 
          m.biwenger_user_name && 
          m.biwenger_user_name.toLowerCase().trim() === s.name.toLowerCase().trim()
        );

        if (matchedMember) {
          linkedMemberIds.add(matchedMember.profile_id);
          return {
            type: 'linked',
            biwengerName: s.name,
            localName: matchedMember.display_name,
            score: s[sortField],
            isColista: !isGeneral && s.lastPoints === minLastPoints,
            profile_id: matchedMember.profile_id
          };
        } else {
          return {
            type: 'biwenger-only',
            biwengerName: s.name,
            localName: null,
            score: s[sortField],
            isColista: !isGeneral && s.lastPoints === minLastPoints
          };
        }
      });

      const unlinkedMembers = members.filter(m => !linkedMemberIds.has(m.profile_id));

      let rowsHtml = '';
      
      biwengerRows.forEach((row, idx) => {
        const rank = idx + 1;
        const scoreText = `${row.score} pts`;
        let rowClass = `leaderboard-item rank-${rank}`;
        if (row.isColista) {
          rowClass += ' colista-highlight';
        }

        let nameHtml = '';
        if (row.type === 'linked') {
          nameHtml = `
            <div class="leaderboard-name" style="display: flex; align-items: center; flex-wrap: wrap;">
              ${row.localName}
              <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal; margin-left: 0.35rem;">(${row.biwengerName})</span>
            </div>
          `;
        } else {
          nameHtml = `
            <div class="leaderboard-name" style="display: flex; align-items: center; flex-wrap: wrap; color: var(--text-muted);">
              ${row.biwengerName}
              <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: normal; margin-left: 0.35rem;">(Sin mánager vinculado - ¡vincúlate!)</span>
            </div>
          `;
        }

        rowsHtml += `
          <div class="${rowClass}">
            <div class="leaderboard-rank">${rank}</div>
            <div class="leaderboard-info">
              ${nameHtml}
              <div class="leaderboard-stats">${isGeneral ? 'Puntuación Total' : `Puntos en ${biwengerRoundName || 'Jornada'}`}</div>
            </div>
            <div class="leaderboard-debt">
              <div class="debt-amount" style="font-size: 1.1rem; font-weight: 800;">${scoreText}</div>
            </div>
          </div>
        `;
      });

      unlinkedMembers.forEach(m => {
        const isSelf = m.profile_id === currentUserId;
        const linkActionHtml = isSelf 
          ? `<button class="btn-link-biwenger-inline" style="background: none; border: none; color: var(--accent); font-weight: bold; cursor: pointer; text-decoration: underline; font-size: 0.72rem; padding: 0; margin-left: 0.35rem;">¡Vincúlate aquí!</button>`
          : `(Pídele que se vincule)`;

        rowsHtml += `
          <div class="leaderboard-item" style="border: 1.5px dashed var(--border-color); background: rgba(255, 255, 255, 0.01); opacity: 0.85;">
            <div class="leaderboard-rank" style="background: rgba(255,255,255,0.03); color: var(--text-muted);">--</div>
            <div class="leaderboard-info">
              <div class="leaderboard-name" style="display: flex; align-items: center; flex-wrap: wrap;">
                ${m.display_name}
                <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 500; margin-left: 0.35rem;">⚠️ Sin vincular ${linkActionHtml}</span>
              </div>
              <div class="leaderboard-stats">Mánager de CastigosFantasy no asociado a Biwenger</div>
            </div>
            <div class="leaderboard-debt">
              <div class="debt-amount" style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">-</div>
            </div>
          </div>
        `;
      });

      contentArea.innerHTML = rowsHtml;
    }
  }

  function renderMainDashboard() {
    const features = 'both';

    // 1. Calculate Leaderboard data (works for both Guest/Demo and Supabase)
    const leaderboard = members.map(m => {
      const userRecords = records.filter(r => r.loser_profile_id === m.profile_id);
      const totalOwed = userRecords.reduce((sum, r) => sum + Number(r.amount_owed), 0);
      const countLast = userRecords.length;
      return {
        profile_id: m.profile_id,
        name: m.display_name,
        avatar: m.avatar_url,
        totalOwed,
        countLast
      };
    });

    leaderboard.sort((a, b) => b.totalOwed - a.totalOwed || b.countLast - a.countLast);

    // Get default next matchday number
    const maxMatchday = records.reduce((max, r) => r.matchday_number > max ? r.matchday_number : max, 0);
    const nextMatchday = maxMatchday + 1;

    container.innerHTML = `
      <div class="container">
        <!-- Banner de Liga -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h1 class="gradient-text-green" style="font-size: 1.6rem; font-weight: 900;">${currentLeague.name}</h1>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Código de Invitación: <strong style="color: var(--accent-gold); cursor: pointer;" id="copy-invite-code" title="Copiar código">${currentLeague.invite_code} (Copiar)</strong>
            </p>
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
            ${!isGuest ? `
              <button class="btn-select-league" id="btn-back-to-hub" title="Volver al Menú" style="width: auto; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 900; display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver al Menú
              </button>
            ` : ''}
            ${isGuest ? `
              <button class="header-action-btn btn-danger" id="btn-exit-demo-league" title="Cambiar de Liga Demo" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                Cambiar Liga
              </button>
            ` : ''}
          </div>    </div>
        </div>

        <div class="dashboard-grid">
          <!-- Lista de Morosos -->
          <div class="card glass pitch-card" style="margin-bottom: 0;">
            <h2 class="card-title gradient-text-gold">Lista de Morosos</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Ranking del que más debe al bote común y más veces ha sido último.
            </p>

            ${(currentLeague && currentLeague.sync_source === 'biwenger') ? `
              <div class="biwenger-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; background: rgba(0, 0, 0, 0.2); padding: 0.25rem; border-radius: 8px; border: 1.5px solid var(--border-color);">
                <button class="btn-select-league ${activeTab === 'deudas' ? 'is-active' : ''}" id="tab-deudas" style="font-size: 0.72rem; padding: 0.4rem 0.65rem; width: auto; flex-grow: 1; text-transform: uppercase; font-weight: 800;">Deudas</button>
                <button class="btn-select-league ${activeTab === 'biwenger-general' ? 'is-active' : ''}" id="tab-biwenger-general" style="font-size: 0.72rem; padding: 0.4rem 0.65rem; width: auto; flex-grow: 1; text-transform: uppercase; font-weight: 800;">B. General</button>
                <button class="btn-select-league ${activeTab === 'biwenger-jornada' ? 'is-active' : ''}" id="tab-biwenger-jornada" style="font-size: 0.72rem; padding: 0.4rem 0.65rem; width: auto; flex-grow: 1; text-transform: uppercase; font-weight: 800;">B. Jornada</button>
              </div>
            ` : ''}
            
            <div class="leaderboard-list" id="leaderboard-content-area">
              <!-- Cargado dinámicamente -->
            </div>
          </div>

          <!-- Registrar Último de la Jornada Form -->
          <div class="card glass" style="margin-bottom: 0;">
            <h2 class="card-title">Registrar Último</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              Selecciona quién ha quedado último en esta jornada y cuánto debe al bote.
            </p>
            
            <form id="record-loser-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                  <label for="matchday-num">Jornada</label>
                  <input type="number" id="matchday-num" class="input-field" min="1" max="50" value="${nextMatchday}" required />
                </div>
                <div class="form-group">
                  <label for="amount-owed">Deuda al Bote (€)</label>
                  <input type="number" id="amount-owed" class="input-field" min="0" step="0.5" value="2.00" required />
                </div>
              </div>

              <div class="form-group">
                <label for="loser-select">El Farolillo Rojo</label>
                <select id="loser-select" class="input-field" required>
                  <option value="">-- Selecciona el Perdedor --</option>
                  ${members.map(m => `
                    <option value="${m.profile_id}">${m.display_name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <label for="screenshot-upload">O subir captura de clasificación 📸</label>
                <input type="file" id="screenshot-upload" class="input-field" accept="image/*" />
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Compatible con capturas de cualquier aplicación de ligas fantasy.
                </p>
              </div>
              
              <div id="ia-status-box" style="display: none; margin-bottom: 1.25rem; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.4; font-weight: 500;"></div>

              <button type="submit" class="btn-primary" id="btn-save-loser" style="margin-top: 0.5rem;">
                Guardar y Picar 🤫
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Pique y Ruleta -->
      <div class="modal-overlay" id="loser-modal">
        <div class="modal-content glass">
          <div class="modal-header">
            <h3 class="gradient-text-gold" style="font-weight: 800; font-size: 1.25rem;">Pique de la Jornada</h3>
            <button class="modal-close" id="close-modal-btn">✕</button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"></div>
            <p id="modal-desc" style="font-size: 1rem; margin-bottom: 1rem;"></p>
            
            <div class="pique-box">
              <span class="pique-title">Frase del Pique</span>
              <span class="pique-text" id="modal-phrase"></span>
            </div>

            <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn-primary" id="go-to-wheel-btn">Girar Ruleta de Castigos</button>
              <button class="btn-secondary" id="stay-dashboard-btn">Cerrar</button>
            </div>
          </div>
        </div>
      </div>


    `;

    // Initial render of the leaderboard view
    updateLeaderboardView();

    // Hook Biwenger Tabs click events
    if (currentLeague && currentLeague.sync_source === 'biwenger') {
      const tabDeudas = container.querySelector('#tab-deudas');
      const tabGeneral = container.querySelector('#tab-biwenger-general');
      const tabJornada = container.querySelector('#tab-biwenger-jornada');

      const setTabActive = (tabId) => {
        activeTab = tabId;
        [tabDeudas, tabGeneral, tabJornada].forEach(btn => {
          if (btn) btn.classList.remove('is-active');
        });
        if (tabId === 'deudas' && tabDeudas) tabDeudas.classList.add('is-active');
        if (tabId === 'biwenger-general' && tabGeneral) tabGeneral.classList.add('is-active');
        if (tabId === 'biwenger-jornada' && tabJornada) tabJornada.classList.add('is-active');
        updateLeaderboardView();
      };

      tabDeudas?.addEventListener('click', () => setTabActive('deudas'));
      tabGeneral?.addEventListener('click', () => setTabActive('biwenger-general'));
      tabJornada?.addEventListener('click', () => setTabActive('biwenger-jornada'));
    }

    // Hook inline link click delegation
    const contentArea = container.querySelector('#leaderboard-content-area');
    contentArea?.addEventListener('click', (e) => {
      const linkBtn = e.target.closest('.btn-link-biwenger-inline');
      if (linkBtn) {
        e.preventDefault();
        openBiwengerLinkModal(currentLeague.id, currentUserId, callbacks, () => {
          loadData();
        });
      }
    });

    // Hook Copy Invite Code
    const copyBtn = container.querySelector('#copy-invite-code');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentLeague.invite_code).then(() => {
        callbacks.showToast('Código copiado al portapapeles', 'success');
      }).catch(err => {
        console.error(err);
      });
    });

    // Hook Back to Hub Button
    const backToHubBtn = container.querySelector('#btn-back-to-hub');
    if (backToHubBtn) {
      backToHubBtn.addEventListener('click', () => {
        callbacks.onNavigate('menu-liga');
      });
    }

    // Hook Record Loser Form
    const recordForm = container.querySelector('#record-loser-form');
    const modal = container.querySelector('#loser-modal');
    let lastRecordId = null;

    // Hook IA Screenshot Upload
    const screenshotInput = container.querySelector('#screenshot-upload');
    const statusBox = container.querySelector('#ia-status-box');
    const loserSelect = container.querySelector('#loser-select');

    if (screenshotInput) {
      // Clear notice if manual change occurs
      loserSelect.addEventListener('change', () => {
        if (statusBox.innerHTML.includes('IA detectó') || statusBox.innerHTML.includes('IA leyó')) {
          statusBox.style.display = 'none';
        }
      });

      screenshotInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('CF_GEMINI_API_KEY') || '';
        if (!geminiKey) {
          statusBox.style.display = 'block';
          statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
          statusBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          statusBox.style.color = '#fca5a5';
          statusBox.innerHTML = `<strong>Error de configuración:</strong> Configura tu Gemini API Key en Ajustes (icono de ajustes en la cabecera) para poder usar la lectura por IA.`;
          screenshotInput.value = '';
          return;
        }

        // Show loading state
        statusBox.style.display = 'block';
        statusBox.style.background = 'rgba(255, 255, 255, 0.03)';
        statusBox.style.border = '1px solid var(--border-color)';
        statusBox.style.color = 'var(--text-light)';
        statusBox.innerHTML = `<span class="spinner" style="vertical-align: middle; margin-right: 0.5rem;"></span> Analizando clasificación con la IA de Gemini...`;

        try {
          // Read file as Base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            try {
              const base64Data = reader.result.split(',')[1];
              
              const prompt = "Analiza esta captura de pantalla de la clasificación de una liga de fútbol fantasy (puede ser Biwenger, Comunio, LaLiga Fantasy, Futmondo, etc.). Extrae la lista de participantes y sus puntuaciones o posiciones en la imagen. Identifica quién ha quedado en la última posición (farolillo rojo) según los puntos o el puesto de la lista de esta jornada. Devuelve únicamente un objeto JSON con el siguiente formato, sin bloques de código de markdown ni comentarios:\\n{\\n  \\\"last_place_name\\\": \\\"Nombre del último clasificado en la imagen\\\",\\n  \\\"all_players\\\": [\\\"Jugador 1\\\", \\\"Jugador 2\\\"]\\n}";

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: prompt },
                        {
                          inlineData: {
                            mimeType: file.type,
                            data: base64Data
                          }
                        }
                      ]
                    }
                  ]
                })
              });

              if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'Error en la petición a Gemini API');
              }

              const resData = await response.json();
              const textOutput = resData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (!textOutput) {
                throw new Error('La IA no devolvió ninguna clasificación legible.');
              }

              // Clean markdown syntax if present
              let cleanJsonText = textOutput.trim();
              if (cleanJsonText.startsWith('```')) {
                cleanJsonText = cleanJsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
              }

              const parsed = JSON.parse(cleanJsonText);
              const detectedLoserName = parsed.last_place_name;

              if (!detectedLoserName) {
                throw new Error('No se pudo determinar el último puesto en la imagen.');
              }

              // Fuzzy match the names
              const matchedMember = findMatchingMember(detectedLoserName, members);

              if (matchedMember) {
                loserSelect.value = matchedMember.profile_id;
                statusBox.style.background = 'rgba(var(--primary-rgb), 0.1)';
                statusBox.style.border = '1px solid rgba(var(--primary-rgb), 0.3)';
                statusBox.style.color = 'var(--text-light)';
                statusBox.innerHTML = `<strong>IA detectó perdedor:</strong> Hemos marcado a <strong>${matchedMember.display_name}</strong> (leído como "${detectedLoserName}"). Confirma los datos o cámbialo si es incorrecto.`;
              } else {
                statusBox.style.background = 'rgba(var(--accent-rgb), 0.1)';
                statusBox.style.border = '1px solid rgba(var(--accent-rgb), 0.3)';
                statusBox.style.color = 'var(--text-light)';
                statusBox.innerHTML = `<strong>IA leyó perdedor:</strong> Se detectó a "${detectedLoserName}", pero no coincide con ningún miembro de tu liga. Selecciónalo manualmente.`;
                screenshotInput.value = '';
              }

            } catch (innerErr) {
              console.error(innerErr);
              statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
              statusBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
              statusBox.style.color = '#fca5a5';
              statusBox.innerHTML = `<strong>Error de análisis:</strong> ${innerErr.message}`;
              screenshotInput.value = '';
            }
          };
        } catch (fileErr) {
          console.error(fileErr);
          statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
          statusBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          statusBox.style.color = '#fca5a5';
          statusBox.innerHTML = `<strong>Error al cargar archivo:</strong> ${fileErr.message}`;
          screenshotInput.value = '';
        }
      });
    }

    // Helper fuzzy matching function
    function findMatchingMember(detectedName, membersList) {
      if (!detectedName) return null;
      const query = detectedName.toLowerCase().trim();
      
      // 1. Exact match
      let matched = membersList.find(m => m.display_name.toLowerCase().trim() === query);
      if (matched) return matched;
      
      // 2. Substring match
      matched = membersList.find(m => {
        const name = m.display_name.toLowerCase().trim();
        return name.includes(query) || query.includes(name);
      });
      return matched || null;
    }

    recordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = recordForm.querySelector('#btn-save-loser');
      const matchday = Number(recordForm.querySelector('#matchday-num').value);
      const amount = Number(recordForm.querySelector('#amount-owed').value);
      const loserId = recordForm.querySelector('#loser-select').value;
      
      if (!loserId) {
        callbacks.showToast('Debes seleccionar un perdedor', 'error');
        return;
      }

      const loserProfile = members.find(m => m.profile_id === loserId);
      const loserName = loserProfile?.display_name || 'Entrenador';
      
      const trashPhrase = getRandomPhrase(loserName, amount);

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

        const { data: recordData, error: insertErr } = await supabase
          .from('matchday_records')
          .insert({
            league_id: currentLeague.id,
            matchday_number: matchday,
            loser_profile_id: loserId,
            amount_owed: amount,
            trash_talk_phrase: trashPhrase,
            recorded_by: currentUser.id
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        lastRecordId = recordData.id;
        localStorage.setItem('CF_PENDING_RECORD_ID', lastRecordId);

        modal.querySelector('#modal-desc').innerHTML = `¡Se ha guardado el registro de la <strong>Jornada ${matchday}</strong>!<br><strong>${loserName}</strong> suma <strong>${amount.toFixed(2)}€</strong> de deuda.`;
        modal.querySelector('#modal-phrase').innerText = trashPhrase;
        modal.classList.add('active');

        recordForm.reset();
        btn.disabled = false;
        btn.innerHTML = 'Guardar y Picar 🤫';
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al registrar el perdedor', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Guardar y Picar 🤫';
      }
    });

    const closeModal = () => {
      modal.classList.remove('active');
      loadData(); // Reload stats
    };

    container.querySelector('#close-modal-btn').addEventListener('click', closeModal);
    container.querySelector('#stay-dashboard-btn').addEventListener('click', closeModal);
    
    container.querySelector('#go-to-wheel-btn').addEventListener('click', () => {
      modal.classList.remove('active');
      callbacks.onNavigate('ruleta');
    });
  }

  loadData();
}
