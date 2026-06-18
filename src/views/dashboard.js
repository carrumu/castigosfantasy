import { supabase } from '../supabase';
import { getRandomPhrase } from '../utils/phrases';

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
      // 1. Load Demo data from localStorage or create defaults
      let activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID');
      
      if (!activeDemoId) {
        // Auto-generate default demo league on first run
        const savedDemoLeagues = JSON.parse(localStorage.getItem('CF_SAVED_DEMO_LEAGUES') || '[]');
        if (savedDemoLeagues.length === 0) {
          activeDemoId = "DEMO-ASTURES";
          localStorage.setItem('CF_ACTIVE_DEMO_LEAGUE_ID', activeDemoId);
          localStorage.setItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`, "Liga Demo Astures");
          localStorage.setItem(`CF_DEMO_LEAGUE_FEATURES_${activeDemoId}`, "both");
          localStorage.setItem(`CF_DEMO_MEMBERS_${activeDemoId}`, JSON.stringify(DEFAULT_DEMO_MEMBERS));
          localStorage.setItem(`CF_DEMO_RECORDS_${activeDemoId}`, JSON.stringify(DEFAULT_DEMO_RECORDS));
          
          savedDemoLeagues.push({ inviteCode: activeDemoId, name: "Liga Demo Astures" });
          localStorage.setItem('CF_SAVED_DEMO_LEAGUES', JSON.stringify(savedDemoLeagues));
        } else {
          renderNoLeague();
          return;
        }
      }

      let leagueName = localStorage.getItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`) || "Liga Demo";

      let storedMembers = localStorage.getItem(`CF_DEMO_MEMBERS_${activeDemoId}`);
      if (!storedMembers) {
        storedMembers = JSON.stringify(DEFAULT_DEMO_MEMBERS);
        localStorage.setItem(`CF_DEMO_MEMBERS_${activeDemoId}`, storedMembers);
      }
      members = JSON.parse(storedMembers);

      let storedRecords = localStorage.getItem(`CF_DEMO_RECORDS_${activeDemoId}`);
      if (!storedRecords) {
        storedRecords = JSON.stringify(DEFAULT_DEMO_RECORDS);
        localStorage.setItem(`CF_DEMO_RECORDS_${activeDemoId}`, storedRecords);
      }
      records = JSON.parse(storedRecords);

      let leagueFeatures = localStorage.getItem(`CF_DEMO_LEAGUE_FEATURES_${activeDemoId}`) || 'both';

      currentLeague = {
        id: activeDemoId,
        name: leagueName,
        invite_code: activeDemoId,
        features: leagueFeatures
      };

      localStorage.setItem('CF_CURRENT_LEAGUE_FEATURES', leagueFeatures);
      isAdmin = true;

      renderMainDashboard();
    } else {
      // 2. Real Supabase Flow
      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        
        // Get member info
        const { data: memberData, error: memberErr } = await supabase
          .from('league_members')
          .select('*')
          .eq('profile_id', currentUser.id)
          .maybeSingle();

        if (memberErr) throw memberErr;

        if (!memberData) {
          renderNoLeague();
          return;
        }

        isAdmin = !!memberData.is_admin;

        // Get league details
        const { data: leagueData, error: leagueErr } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', memberData.league_id)
          .single();

        if (leagueErr) throw leagueErr;
        currentLeague = leagueData;
        
        const features = currentLeague.features || 'both';
        localStorage.setItem('CF_CURRENT_LEAGUE_FEATURES', features);

        // Get members
        const { data: membersList, error: listErr } = await supabase
          .from('league_members')
          .select(`
            profile_id,
            is_admin,
            profiles (
              display_name,
              avatar_url
            )
          `)
          .eq('league_id', currentLeague.id);

        if (listErr) throw listErr;
        
        // Parse database structure to match uniform profiles layout
        members = membersList.map(m => ({
          profile_id: m.profile_id,
          display_name: m.profiles?.display_name || 'Desconocido',
          avatar_url: m.profiles?.avatar_url || ''
        }));

        // Get records
        const { data: recordsList, error: recErr } = await supabase
          .from('matchday_records')
          .select('*')
          .eq('league_id', currentLeague.id);

        if (recErr) throw recErr;
        records = recordsList;

        renderMainDashboard();
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error cargando datos de la liga', 'error');
      }
    }
  }

  function renderNoLeague() {
    const savedLeaguesKey = isGuest ? 'CF_SAVED_DEMO_LEAGUES' : 'CF_SAVED_SUPABASE_LEAGUES';
    const savedLeagues = JSON.parse(localStorage.getItem(savedLeaguesKey) || '[]');

    container.innerHTML = `
      <div class="container">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 class="logo gradient-text-gold" style="justify-content: center; font-size: 2rem; margin-bottom: 0.5rem;">
            ¡Bienvenido, Míster!
          </h1>
          <p style="color: var(--text-muted);">Para empezar a picar a tus amigos, debes crear una liga privada o unirte a una existente.</p>
        </div>

        <div class="card glass pitch-card">
          <h2 class="card-title gradient-text-green">${isGuest ? 'Crear una Liga Demo Nueva' : 'Crear una Liga Nueva'}</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Crea el grupo de tu liga de fantasy y comparte el código con tus amigos.</p>
          <form id="create-league-form">
            <div class="form-group">
              <label for="new-league-name">Nombre de la Liga (Ej: Liga Los Troncos)</label>
              <input type="text" id="new-league-name" class="input-field" placeholder="Nombre de tu comunidad" required />
            </div>
            <div class="form-group">
              <label for="new-league-features">Funcionalidades Activas</label>
              <select id="new-league-features" class="input-field">
                <option value="both">Ruleta + Registro de Deudas (Ambos)</option>
                <option value="wheel">Solo Ruleta de Castigos (Sin deudas)</option>
                <option value="money">Solo Registro de Deudas/Bote (Sin ruleta)</option>
              </select>
            </div>
            <button type="submit" class="btn-primary" id="btn-create">Crear Liga</button>
          </form>
        </div>

        <div class="card glass" style="margin-top: 1.5rem;">
          <h2 class="card-title">${isGuest ? 'Unirse a una Liga Demo Existente' : 'Unirse a una Liga Existente'}</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Introduce el código de invitación que te ha enviado el administrador de tu liga.</p>
          
          ${savedLeagues.length > 0 ? `
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label for="saved-leagues-select">📋 Mis Ligas Guardadas</label>
              <select id="saved-leagues-select" class="input-field" style="background: rgba(var(--primary-rgb), 0.08); border-color: var(--border-color-glow);">
                <option value="">-- Selecciona una liga anterior --</option>
                ${savedLeagues.map((l, idx) => `
                  <option value="${idx}">${l.name} (${l.inviteCode})</option>
                `).join('')}
              </select>
            </div>
          ` : ''}

          <form id="join-league-form">
            <div class="form-group">
              <label for="join-code">Código de Invitación</label>
              <input type="text" id="join-code" class="input-field" placeholder="Ej: AB12CD" style="text-transform: uppercase;" required />
            </div>
            <button type="submit" class="btn-secondary" id="btn-join">Unirse a Liga</button>
          </form>
        </div>
      </div>
    `;

    // Hook saved leagues select
    const savedLeaguesSelect = container.querySelector('#saved-leagues-select');
    const joinForm = container.querySelector('#join-league-form');
    if (savedLeaguesSelect && joinForm) {
      savedLeaguesSelect.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx !== "") {
          const l = savedLeagues[Number(idx)];
          joinForm.querySelector('#join-code').value = l.inviteCode;
        } else {
          joinForm.querySelector('#join-code').value = "";
        }
      });
    }

    // Hook Create Liga
    const createForm = container.querySelector('#create-league-form');
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = createForm.querySelector('#btn-create');
      const name = createForm.querySelector('#new-league-name').value.trim();
      const features = createForm.querySelector('#new-league-features').value;
      const inviteCode = (isGuest ? "DEMO-" : "") + generateInviteCode();

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      if (isGuest) {
        // Create local demo league
        localStorage.setItem(`CF_DEMO_LEAGUE_NAME_${inviteCode}`, name);
        localStorage.setItem(`CF_DEMO_LEAGUE_FEATURES_${inviteCode}`, features);
        localStorage.setItem(`CF_DEMO_MEMBERS_${inviteCode}`, JSON.stringify(DEFAULT_DEMO_MEMBERS));
        localStorage.setItem(`CF_DEMO_RECORDS_${inviteCode}`, JSON.stringify(DEFAULT_DEMO_RECORDS));
        
        localStorage.setItem('CF_ACTIVE_DEMO_LEAGUE_ID', inviteCode);
        
        // Save to demo saved leagues list
        let savedDemoLeagues = JSON.parse(localStorage.getItem('CF_SAVED_DEMO_LEAGUES') || '[]');
        savedDemoLeagues.push({ inviteCode, name });
        localStorage.setItem('CF_SAVED_DEMO_LEAGUES', JSON.stringify(savedDemoLeagues));

        callbacks.showToast(`¡Liga Demo "${name}" creada!`, 'success');
        loadData();
        return;
      }

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        const { data: newLeague, error: leagueErr } = await supabase
          .from('leagues')
          .insert({
            name,
            invite_code: inviteCode,
            created_by: currentUser.id,
            features: features
          })
          .select()
          .single();

        if (leagueErr) throw leagueErr;

        // Save to Supabase saved leagues list
        let savedSupabaseLeagues = JSON.parse(localStorage.getItem('CF_SAVED_SUPABASE_LEAGUES') || '[]');
        savedSupabaseLeagues.push({ inviteCode, name });
        localStorage.setItem('CF_SAVED_SUPABASE_LEAGUES', JSON.stringify(savedSupabaseLeagues));

        const { error: memberErr } = await supabase
          .from('league_members')
          .insert({
            league_id: newLeague.id,
            profile_id: currentUser.id,
            is_admin: true
          });

        if (memberErr) throw memberErr;

        callbacks.showToast(`¡Liga "${name}" creada con éxito!`, 'success');
        loadData();
      } catch (err) {
        // Fallback for databases lacking 'features' column
        if (err.message && (err.message.includes('column') || err.message.includes('features') || err.code === '42703')) {
          try {
            const { data: newLeague, error: leagueErr2 } = await supabase
              .from('leagues')
              .insert({
                name,
                invite_code: inviteCode,
                created_by: currentUser.id
              })
              .select()
              .single();

            if (leagueErr2) throw leagueErr2;

            const { error: memberErr } = await supabase
              .from('league_members')
              .insert({
                league_id: newLeague.id,
                profile_id: currentUser.id,
                is_admin: true
              });

            if (memberErr) throw memberErr;

            callbacks.showToast(`¡Liga "${name}" creada! El ajuste de características requiere añadir la columna 'features' en tu Supabase.`, 'success');
            loadData();
          } catch (retryErr) {
            console.error(retryErr);
            callbacks.showToast('No se pudo crear la liga', 'error');
            btn.disabled = false;
            btn.innerHTML = 'Crear Liga';
          }
        } else {
          console.error(err);
          callbacks.showToast('No se pudo crear la liga', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Crear Liga';
        }
      }
    });

    // Hook Join Liga
    const joinLeagueForm = container.querySelector('#join-league-form');
    joinLeagueForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = joinLeagueForm.querySelector('#btn-join');
      const code = joinLeagueForm.querySelector('#join-code').value.trim().toUpperCase();

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      if (isGuest) {
        // Find local demo league
        const existsName = localStorage.getItem(`CF_DEMO_LEAGUE_NAME_${code}`);
        if (!existsName) {
          callbacks.showToast('Código de liga demo no encontrado o no válido', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Unirse a Liga';
          return;
        }

        localStorage.setItem('CF_ACTIVE_DEMO_LEAGUE_ID', code);

        // Add to saved list if not exists
        let savedDemoLeagues = JSON.parse(localStorage.getItem('CF_SAVED_DEMO_LEAGUES') || '[]');
        if (!savedDemoLeagues.some(l => l.inviteCode === code)) {
          savedDemoLeagues.push({ inviteCode: code, name: existsName });
          localStorage.setItem('CF_SAVED_DEMO_LEAGUES', JSON.stringify(savedDemoLeagues));
        }

        callbacks.showToast(`¡Te has unido a la Liga Demo "${existsName}"!`, 'success');
        loadData();
        return;
      }

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        const { data: targetLeague, error: findErr } = await supabase
          .from('leagues')
          .select('*')
          .eq('invite_code', code)
          .maybeSingle();

        if (findErr) throw findErr;
        if (!targetLeague) {
          callbacks.showToast('Código de invitación no válido', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Unirse a Liga';
          return;
        }

        const { error: joinErr } = await supabase
          .from('league_members')
          .insert({
            league_id: targetLeague.id,
            profile_id: currentUser.id,
            is_admin: false
          });

        if (joinErr) {
          if (joinErr.code === '23505') {
            callbacks.showToast('Ya formas parte de esta liga', 'info');
          } else {
            throw joinErr;
          }
        } else {
          callbacks.showToast(`¡Te has unido a "${targetLeague.name}"!`, 'success');
          
          // Save to Supabase saved leagues list
          let savedSupabaseLeagues = JSON.parse(localStorage.getItem('CF_SAVED_SUPABASE_LEAGUES') || '[]');
          if (!savedSupabaseLeagues.some(l => l.inviteCode === code)) {
            savedSupabaseLeagues.push({ inviteCode: code, name: targetLeague.name });
            localStorage.setItem('CF_SAVED_SUPABASE_LEAGUES', JSON.stringify(savedSupabaseLeagues));
          }
        }
        loadData();
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al unirse a la liga', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Unirse a Liga';
      }
    });
  }

  function renderMainDashboard() {
    const features = currentLeague.features || 'both';

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

    if (features === 'wheel') {
      leaderboard.sort((a, b) => b.countLast - a.countLast);
    } else {
      leaderboard.sort((a, b) => b.totalOwed - a.totalOwed || b.countLast - a.countLast);
    }

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
          </div>
         <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${isGuest ? `
              <button class="header-action-btn btn-danger" id="btn-exit-demo-league" title="Cambiar de Liga Demo" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                Cambiar Liga
              </button>
            ` : ''}
            ${(isGuest || isAdmin) ? `
              <button class="header-action-btn" id="btn-league-settings" title="Configurar Liga" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; border-color: var(--border-color-glow);">
                Ajustar Liga
              </button>
            ` : ''}
          </div>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: ${features === 'wheel' ? '1fr 1fr' : ''};">
          <!-- Muro de la Vergüenza -->
          <div class="card glass pitch-card" style="margin-bottom: 0;">
            <h2 class="card-title gradient-text-gold">Muro de la Vergüenza</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              ${features === 'wheel' ? 'Ranking acumulado del que más veces ha quedado último.' : 'Ranking del que más debe al bote común y más veces ha sido último.'}
            </p>
            
            <div class="leaderboard-list">
              ${leaderboard.length === 0 ? `
                <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
                  Nadie es el último todavía. ¡Buena jornada para todos!
                </div>
              ` : leaderboard.map((item, idx) => `
                <div class="leaderboard-item rank-${idx + 1}">
                  <div class="leaderboard-rank">${idx + 1}</div>
                  <div class="leaderboard-info">
                    <div class="leaderboard-name">${item.name}</div>
                    <div class="leaderboard-stats">Último puesto: <strong>${item.countLast}</strong> veces</div>
                  </div>
                  ${features !== 'wheel' ? `
                    <div class="leaderboard-debt">
                      <div class="debt-amount">${item.totalOwed.toFixed(2)}€</div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Registrar Último de la Jornada Form -->
          <div class="card glass" style="margin-bottom: 0;">
            <h2 class="card-title">📝 Registrar Último</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              ${features === 'wheel' ? 'Registra quién ha quedado último en esta jornada fantasy.' : 'Selecciona quién ha quedado último en esta jornada y cuánto debe al bote.'}
            </p>
            
            <form id="record-loser-form">
              <div style="display: grid; grid-template-columns: ${features === 'wheel' ? '1fr' : '1fr 1fr'}; gap: 0.75rem;">
                <div class="form-group">
                  <label for="matchday-num">Jornada</label>
                  <input type="number" id="matchday-num" class="input-field" min="1" max="50" value="${nextMatchday}" required />
                </div>
                ${features !== 'wheel' ? `
                  <div class="form-group">
                    <label for="amount-owed">Deuda al Bote (€)</label>
                    <input type="number" id="amount-owed" class="input-field" min="0" step="0.5" value="2.00" required />
                  </div>
                ` : `
                  <input type="hidden" id="amount-owed" value="0" />
                `}
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
              ${features !== 'money' ? `
                <button class="btn-primary" id="go-to-wheel-btn">Girar Ruleta de Castigos</button>
              ` : ''}
              <button class="btn-secondary" id="stay-dashboard-btn">${features === 'money' ? 'Entendido' : 'Cerrar'}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Ajustes de la Liga (Admin) -->
      <div class="modal-overlay" id="league-settings-modal">
        <div class="modal-content glass">
          <div class="modal-header">
            <h3 class="gradient-text-gold" style="font-weight: 800; font-size: 1.25rem;">Ajustes de la Liga</h3>
            <button class="modal-close" id="close-settings-modal-btn">✕</button>
          </div>
          <div class="modal-body">
            <form id="league-settings-form">
              <div class="form-group">
                <label for="edit-league-name">Nombre de la Liga</label>
                <input type="text" id="edit-league-name" class="input-field" value="${currentLeague.name}" required />
              </div>
              <div class="form-group">
                <label for="edit-league-features">Funcionalidades Activas</label>
                <select id="edit-league-features" class="input-field">
                  <option value="both" ${features === 'both' ? 'selected' : ''}>Ruleta + Registro de Deudas (Ambos)</option>
                  <option value="wheel" ${features === 'wheel' ? 'selected' : ''}>Solo Ruleta de Castigos (Sin deudas)</option>
                  <option value="money" ${features === 'money' ? 'selected' : ''}>Solo Registro de Deudas/Bote (Sin ruleta)</option>
                </select>
              </div>
              <button type="submit" class="btn-primary" id="btn-save-settings" style="margin-top: 1.5rem;">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Hook Copy Invite Code
    const copyBtn = container.querySelector('#copy-invite-code');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentLeague.invite_code).then(() => {
        callbacks.showToast('Código copiado al portapapeles', 'success');
      }).catch(err => {
        console.error(err);
      });
    });

    // Hook settings modal triggers
    const settingsBtn = container.querySelector('#btn-league-settings');
    const settingsModal = container.querySelector('#league-settings-modal');
    const exitDemoBtn = container.querySelector('#btn-exit-demo-league');

    if (exitDemoBtn) {
      exitDemoBtn.addEventListener('click', () => {
        if (confirm('¿Quieres salir de esta liga demo y volver al menú principal?')) {
          localStorage.removeItem('CF_ACTIVE_DEMO_LEAGUE_ID');
          loadData();
        }
      });
    }

    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
      });

      const closeSettingsBtn = container.querySelector('#close-settings-modal-btn');
      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
          settingsModal.classList.remove('active');
        });
      }

      const settingsForm = container.querySelector('#league-settings-form');
      if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const saveBtn = settingsForm.querySelector('#btn-save-settings');
          const newName = settingsForm.querySelector('#edit-league-name').value.trim();
          const newFeatures = settingsForm.querySelector('#edit-league-features').value;

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="spinner"></span>';

          if (isGuest) {
            const activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID');
            localStorage.setItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`, newName);
            localStorage.setItem(`CF_DEMO_LEAGUE_FEATURES_${activeDemoId}`, newFeatures);
            localStorage.setItem('CF_CURRENT_LEAGUE_FEATURES', newFeatures);
            
            // Also update the name in CF_SAVED_DEMO_LEAGUES list
            let savedLeagues = JSON.parse(localStorage.getItem('CF_SAVED_DEMO_LEAGUES') || '[]');
            savedLeagues = savedLeagues.map(l => l.inviteCode === activeDemoId ? { ...l, name: newName } : l);
            localStorage.setItem('CF_SAVED_DEMO_LEAGUES', JSON.stringify(savedLeagues));

            callbacks.showToast('Cambios guardados con éxito en la demo', 'success');
            settingsModal.classList.remove('active');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            try {
              const { error } = await supabase
                .from('leagues')
                .update({
                  name: newName,
                  features: newFeatures
                })
                .eq('id', currentLeague.id);

              if (error) throw error;

              localStorage.setItem('CF_CURRENT_LEAGUE_FEATURES', newFeatures);
              callbacks.showToast('Configuración de liga actualizada', 'success');
              settingsModal.classList.remove('active');
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } catch (err) {
              // Fail-safe fallback if column 'features' doesn't exist
              if (err.message && (err.message.includes('column') || err.message.includes('features') || err.code === '42703')) {
                try {
                  const { error: nameErr } = await supabase
                    .from('leagues')
                    .update({
                      name: newName
                    })
                    .eq('id', currentLeague.id);

                  if (nameErr) throw nameErr;
                  callbacks.showToast('Nombre guardado. El cambio de características requiere añadir la columna "features" de tipo text a la tabla leagues en Supabase.', 'success');
                  settingsModal.classList.remove('active');
                  setTimeout(() => {
                    window.location.reload();
                  }, 2500);
                } catch (retryErr) {
                  console.error(retryErr);
                  callbacks.showToast('Error al guardar cambios', 'error');
                  saveBtn.disabled = false;
                  saveBtn.innerHTML = 'Guardar Cambios';
                }
              } else {
                console.error(err);
                callbacks.showToast('Error al actualizar liga', 'error');
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar Cambios';
              }
            }
          }
        });
      }
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
      const amount = features === 'wheel' ? 0 : Number(recordForm.querySelector('#amount-owed').value);
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

      if (isGuest) {
        // --- Guest Flow (Save in localStorage) ---
        setTimeout(() => {
          lastRecordId = `d-rec-${Math.random().toString(36).substring(2, 9)}`;
          const newRecord = {
            id: lastRecordId,
            matchday_number: matchday,
            loser_profile_id: loserId,
            amount_owed: amount,
            punishment_id: null,
            trash_talk_phrase: trashPhrase,
            created_at: new Date().toISOString()
          };

          const activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID');
          const storedRecords = JSON.parse(localStorage.getItem(`CF_DEMO_RECORDS_${activeDemoId}`) || '[]');
          storedRecords.push(newRecord);
          localStorage.setItem(`CF_DEMO_RECORDS_${activeDemoId}`, JSON.stringify(storedRecords));

          // Set pending record for the wheel
          localStorage.setItem('CF_PENDING_RECORD_ID', lastRecordId);

          if (features === 'wheel') {
            modal.querySelector('#modal-desc').innerHTML = `¡Se ha registrado a <strong>${loserName}</strong> en el Muro como el último de la <strong>Jornada ${matchday}</strong>!`;
          } else {
            modal.querySelector('#modal-desc').innerHTML = `¡Se ha guardado el registro de la <strong>Jornada ${matchday}</strong> en la demo!<br><strong>${loserName}</strong> suma <strong>${amount.toFixed(2)}€</strong> de deuda.`;
          }
          modal.querySelector('#modal-phrase').innerText = trashPhrase;
          modal.classList.add('active');

          recordForm.reset();
          btn.disabled = false;
          btn.innerHTML = 'Guardar y Picar 🤫';
        }, 300);

      } else {
        // --- Real Supabase Flow ---
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

          if (features === 'wheel') {
            modal.querySelector('#modal-desc').innerHTML = `¡Se ha registrado a <strong>${loserName}</strong> en el Muro como el último de la <strong>Jornada ${matchday}</strong>!`;
          } else {
            modal.querySelector('#modal-desc').innerHTML = `¡Se ha guardado el registro de la <strong>Jornada ${matchday}</strong>!<br><strong>${loserName}</strong> suma <strong>${amount.toFixed(2)}€</strong> de deuda.`;
          }
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
      }
    });

    const closeModal = () => {
      modal.classList.remove('active');
      loadData(); // Reload stats
    };

    container.querySelector('#close-modal-btn').addEventListener('click', closeModal);
    container.querySelector('#stay-dashboard-btn').addEventListener('click', closeModal);
    
    if (features !== 'money') {
      container.querySelector('#go-to-wheel-btn').addEventListener('click', () => {
        modal.classList.remove('active');
        callbacks.onNavigate('roulette');
      });
    }
  }

  loadData();
}
