import { supabase } from '../supabase';
import { getRandomPhrase } from './phrases';

/**
 * Opens the Biwenger Synchronization Modal.
 * Runs the sync automatically using the stored credentials.
 * @param {string} leagueId - Local league uuid
 * @param {Object} leagueData - League database record (contains sync credentials)
 * @param {boolean} isAdmin - Whether the current user is admin
 * @param {Object} callbacks - Main view callbacks (showToast, onNavigate)
 */
export async function openBiwengerSyncModal(leagueId, leagueData, isAdmin, callbacks) {
  const existing = document.querySelector('#biwenger-sync-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'biwenger-sync-modal';
  modal.className = 'modal-overlay active';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 550px; width: 95%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(222,237,0,0.15); max-height: 90vh; display: flex; flex-direction: column;">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem; flex-shrink: 0;">
        <h3 class="gradient-text-green" style="font-family: var(--font-display); font-weight: 900; font-size: 1.1rem; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow:0 0 8px var(--accent);"></span>
          Sincronizar Liga Biwenger
        </h3>
        <button id="close-biwenger-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
      </div>
      
      <div class="modal-body" style="padding: 1.5rem; overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 1rem;">
        
        <div id="biwenger-sync-status" style="font-size: 0.85rem; line-height: 1.45; color: var(--text-light); text-align: center; padding: 1.5rem 0;">
          <span class="spinner" style="width:28px;height:28px;display:block;margin:0 auto 10px;"></span>
          Iniciando conexión segura con Biwenger...
        </div>

        <div id="biwenger-sync-result" style="display: none;"></div>
        
        <div id="biwenger-admin-action" style="display: none; border-top: 1.5px dashed var(--border-color-glow); padding-top: 1.25rem; margin-top: 0.5rem;">
          <h4 class="gradient-text-gold" style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 900; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">
            📝 Registrar Último Puesto por Sincronización
          </h4>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">
            Hemos detectado automáticamente al farolillo rojo de la jornada. Configura la deuda para añadirlo a la lista de morosos.
          </p>

          <form id="biwenger-save-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Jornada</label>
                <input type="number" id="biwenger-matchday" class="input-field" min="1" max="50" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Multa al Bote (€)</label>
                <input type="number" id="biwenger-amount" class="input-field" min="0" step="0.5" value="2.00" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Farolillo Rojo Detectado</label>
              <div style="background: rgba(222,237,0,0.04); border: 1px solid var(--border-color-glow); border-radius: 6px; padding: 0.65rem 0.85rem; margin-bottom: 0.5rem; font-size: 0.8rem; color: var(--text-light); display: flex; justify-content: space-between; align-items: center;">
                <span>Nombre en Biwenger:</span>
                <strong id="biwenger-detected-loser-name" style="color: var(--accent);">--</strong>
              </div>
              <label for="biwenger-loser-select" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Asociar con Manager de la App</label>
              <select id="biwenger-loser-select" class="input-field" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;">
                <option value="">-- Selecciona el Perdedor --</option>
              </select>
              <p id="biwenger-match-notice" style="font-size: 0.7rem; margin-top: 0.35rem; font-weight: 500;"></p>
            </div>

            <button type="submit" class="btn-primary" id="btn-biwenger-save" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000000; box-shadow: 3px 3px 0px #000000; width: 100%; padding: 0.8rem; cursor: pointer; background: var(--accent); color: #000;">
              Confirmar y Registrar en la Liga 🤫
            </button>
          </form>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#close-biwenger-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const statusEl = modal.querySelector('#biwenger-sync-status');
  const resultEl = modal.querySelector('#biwenger-sync-result');
  const adminActionEl = modal.querySelector('#biwenger-admin-action');
  const saveForm = modal.querySelector('#biwenger-save-form');

  // Trigger sync immediately using stored credentials
  try {
    const emailVal = leagueData.biwenger_email;
    const passVal = leagueData.biwenger_password;
    const leagueIdVal = leagueData.biwenger_league_id;

    if (!emailVal || !passVal || !leagueIdVal) {
      throw new Error('La liga no tiene configuradas correctamente las credenciales de Biwenger.');
    }

    statusEl.innerHTML = '<span class="spinner" style="width:28px;height:28px;display:block;margin:0 auto 10px;"></span>Llamando a Supabase Edge Function...';

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
      body: JSON.stringify({ email: emailVal, password: passVal, leagueId: leagueIdVal })
    });

    if (res.status !== 200) {
      const errText = await res.text();
      let errMsg = `Error de Edge Function (Status ${res.status})`;
      try {
        const errJSON = JSON.parse(errText);
        errMsg = errJSON.error || errJSON.message || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    const syncData = await res.json();
    const users = syncData.data?.users || [];
    const standings = syncData.data?.standings || [];

    if (standings.length === 0) {
      throw new Error('No se han encontrado clasificaciones en la liga de Biwenger.');
    }

    // Sort standings by position
    const sortedStandings = standings.map(s => {
      const u = users.find(user => user.id === s.id) || {};
      return {
        id: s.id,
        name: u.name || 'Entrenador',
        email: u.email || '-',
        points: s.points || 0,
        lastPoints: s.lastPoints || 0,
        position: s.position || 1
      };
    });

    // Find the one with the lowest lastPoints (round colista)
    const standingsByRound = [...sortedStandings].sort((a, b) => a.lastPoints - b.lastPoints);
    const roundLoser = standingsByRound[0];
    const loserBiwengerName = roundLoser ? roundLoser.name : 'Entrenador';

    // Hide loading status, show results
    statusEl.style.display = 'none';
    resultEl.style.display = 'block';
    
    resultEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
        <h4 style="color: var(--text-light); font-size: 0.85rem; font-weight: 700; margin: 0; text-transform: uppercase;">Clasificación de la Liga</h4>
        <div style="display: flex; gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.25rem; border-radius: 4px; border: 1.5px solid var(--border-color-glow);">
          <button id="btn-sort-round" class="btn-select-league is-active" style="font-size: 0.65rem; padding: 0.25rem 0.5rem; width: auto;">Última Jornada</button>
          <button id="btn-sort-general" class="btn-select-league" style="font-size: 0.65rem; padding: 0.25rem 0.5rem; width: auto;">General</button>
        </div>
      </div>
      <div id="standings-table-container" style="overflow-x: auto; max-height: 250px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: 6px;"></div>
    `;

    const renderTable = (sortBy) => {
      let displayList = [...sortedStandings];
      if (sortBy === 'round') {
        // Sort round points ascending (lowest first, so loser is at the top!)
        displayList.sort((a, b) => a.lastPoints - b.lastPoints);
      } else {
        // Sort by general position ascending (winner first)
        displayList.sort((a, b) => a.position - b.position);
      }

      const tableContainer = modal.querySelector('#standings-table-container');
      if (tableContainer) {
        tableContainer.innerHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
            <thead>
              <tr style="background: rgba(222,237,0,0.1); border-bottom: 2px solid #000000; position: sticky; top: 0; z-index: 1;">
                <th style="padding: 0.55rem; color: var(--accent); width: 60px;">Pos</th>
                <th style="padding: 0.55rem;">Nombre</th>
                <th style="padding: 0.55rem; text-align: right;">Ptos. General</th>
                <th style="padding: 0.55rem; text-align: right; color: var(--accent-gold);">Ptos. Jornada</th>
              </tr>
            </thead>
            <tbody>
              ${displayList.map((s, idx) => {
                const isRoundLoser = roundLoser && s.id === roundLoser.id;
                const rowStyle = isRoundLoser && sortBy === 'round' 
                  ? 'background: rgba(239, 68, 68, 0.08); border-bottom: 1.5px solid var(--danger); font-weight: bold;'
                  : 'border-bottom: 1.5px solid var(--border-color); background: rgba(255,255,255,0.01);';
                
                const posText = sortBy === 'round' ? `${idx + 1}º` : `${s.position}º`;

                return `
                  <tr style="${rowStyle}">
                    <td style="padding: 0.55rem; color: var(--text-muted);">${posText}</td>
                    <td style="padding: 0.55rem; color: var(--text-light);">${s.name} ${isRoundLoser && sortBy === 'round' ? '⚠️' : ''} <span style="font-size:0.65rem; color:var(--text-muted); font-weight:normal; display:block;">${s.email}</span></td>
                    <td style="padding: 0.55rem; text-align: right; color: var(--text-light); font-size:0.8rem;">${s.points} pts</td>
                    <td style="padding: 0.55rem; color: var(--accent-gold); font-weight: 900; text-align: right; font-size:0.85rem;">${s.lastPoints} pts</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }
    };

    // Render initially sorted by round (latest matchday)
    renderTable('round');

    // Bind sort buttons
    const btnSortRound = modal.querySelector('#btn-sort-round');
    const btnSortGeneral = modal.querySelector('#btn-sort-general');

    btnSortRound.addEventListener('click', () => {
      btnSortRound.classList.add('is-active');
      btnSortGeneral.classList.remove('is-active');
      renderTable('round');
    });

    btnSortGeneral.addEventListener('click', () => {
      btnSortGeneral.classList.add('is-active');
      btnSortRound.classList.remove('is-active');
      renderTable('general');
    });

    // Admin integration: Autofill and record loser
    if (isAdmin) {
      modal.querySelector('#biwenger-detected-loser-name').innerText = `${loserBiwengerName} (${roundLoser ? roundLoser.lastPoints : 0} pts)`;

      // Load local members to fuzzy match and check for linked accounts
      const { data: membersList, error: memErr } = await supabase
        .from('league_members')
        .select(`
          profile_id,
          biwenger_user_name,
          profiles (
            apodo,
            display_name
          )
        `)
        .eq('league_id', leagueId);

      if (memErr) throw memErr;

      const localMembers = (membersList || []).map(m => ({
        profile_id: m.profile_id,
        biwenger_user_name: m.biwenger_user_name || '',
        name: m.profiles?.apodo || m.profiles?.display_name || 'Desconocido'
      }));

      // Load matchdays to get next number
      const { data: records, error: recErr } = await supabase
        .from('matchday_records')
        .select('matchday_number')
        .eq('league_id', leagueId);

      if (recErr) throw recErr;

      const maxMatchday = (records || []).reduce((max, r) => r.matchday_number > max ? r.matchday_number : max, 0);
      modal.querySelector('#biwenger-matchday').value = maxMatchday + 1;

      // Populate select dropdown
      const selectEl = modal.querySelector('#biwenger-loser-select');
      localMembers.forEach(member => {
        const opt = document.createElement('option');
        opt.value = member.profile_id;
        opt.textContent = member.name;
        selectEl.appendChild(opt);
      });

      // Find match: first check explicit biwenger_user_name, then fallback to name similarity
      const findMatch = (biwengerName, list) => {
        if (!biwengerName) return null;
        const query = biwengerName.toLowerCase().trim();
        
        // 1. Explicit link (exact match on biwenger_user_name)
        let matched = list.find(m => m.biwenger_user_name.toLowerCase().trim() === query);
        if (matched) return { member: matched, type: 'linked' };

        // 2. Exact match on app name
        matched = list.find(m => m.name.toLowerCase().trim() === query);
        if (matched) return { member: matched, type: 'fuzzy' };

        // 3. Substring match on app name
        matched = list.find(m => {
          const name = m.name.toLowerCase().trim();
          return name.includes(query) || query.includes(name);
        });
        if (matched) return { member: matched, type: 'fuzzy' };

        return null;
      };

      const matchResult = findMatch(loserBiwengerName, localMembers);
      const matchedMember = matchResult?.member || null;
      const matchType = matchResult?.type || null;
      const noticeEl = modal.querySelector('#biwenger-match-notice');

      if (matchedMember) {
        selectEl.value = matchedMember.profile_id;
        if (matchType === 'linked') {
          noticeEl.style.color = '#88ff88';
          noticeEl.innerHTML = `✓ Emparejado automáticamente por vinculación con <strong>${matchedMember.name}</strong>.`;
        } else {
          noticeEl.style.color = 'var(--accent-gold)';
          noticeEl.innerHTML = `✓ Emparejado por similitud de nombre con <strong>${matchedMember.name}</strong>. (Se recomienda vincular en Ajustes).`;
        }
      } else {
        noticeEl.style.color = 'var(--danger)';
        noticeEl.innerHTML = `⚠️ No se pudo emparejar. El usuario '${loserBiwengerName}' no está vinculado a ningún manager local. Selecciónalo manualmente.`;
      }

      // Show form
      adminActionEl.style.display = 'block';

      // Submit handler
      saveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = saveForm.querySelector('#btn-biwenger-save');
        const matchdayNum = Number(modal.querySelector('#biwenger-matchday').value);
        const amountNum = Number(modal.querySelector('#biwenger-amount').value);
        const selectedLoserId = selectEl.value;

        if (!selectedLoserId) {
          callbacks.showToast('Por favor, selecciona un manager de la lista.', 'error');
          return;
        }

        const finalLoserName = localMembers.find(m => m.profile_id === selectedLoserId)?.name || 'Entrenador';
        const trashPhrase = getRandomPhrase(finalLoserName, amountNum);

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Guardando...';

        try {
          const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;

          const { error: insertErr } = await supabase
            .from('matchday_records')
            .insert({
              league_id: leagueId,
              matchday_number: matchdayNum,
              loser_profile_id: selectedLoserId,
              amount_owed: amountNum,
              trash_talk_phrase: trashPhrase,
              recorded_by: currentUser.id
            });

          if (insertErr) throw insertErr;

          callbacks.showToast(`¡Jornada ${matchdayNum} registrada para ${finalLoserName} con éxito!`, 'success');
          closeModal();
          
          // Trigger page reload / state update if callbacks provide it
          if (callbacks.onNavigate) {
            // Re-render menu-liga or muro
            callbacks.onNavigate('menu-liga');
          }
        } catch (saveErr) {
          console.error(saveErr);
          callbacks.showToast('Error al registrar el perdedor de la jornada.', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Confirmar y Registrar en la Liga 🤫';
        }
      });
    }

  } catch (err) {
    console.error(err);
    statusEl.innerHTML = `
      <strong style="color:var(--danger);">❌ Error de Sincronización</strong><br/>
      <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.4rem; line-height:1.45; text-align: left;">
        Detalle del error: <strong style="color: #ff8888;">${err.message}</strong><br/><br/>
        <em>Comprueba que las credenciales de Biwenger de la liga sean correctas en las opciones de configuración de la liga.</em>
      </span>
    `;
  }
}
