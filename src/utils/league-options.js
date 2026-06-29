import { supabase } from '../supabase';

/**
 * Dynamically loads and displays the league settings/options modal.
 * @param {string} leagueId - The ID of the league to show options for
 * @param {Object} callbacks
 * @param {Function} callbacks.showToast
 * @param {Function} callbacks.onNavigate
 */
export async function openLeagueSettings(leagueId, callbacks) {
  const { showToast, onNavigate } = callbacks;

  // 1. Create and show loading modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 450px; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(222, 237, 0, 0.15); width: 90%;">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem;">
        <h3 class="gradient-text-gold" style="font-weight: 900; font-size: 1.35rem; font-family: var(--font-display); margin: 0;">Opciones de la Liga</h3>
        <button class="modal-close" id="close-settings-modal-btn" style="font-size: 1.2rem; background: none; border: none; color: var(--text-light); cursor: pointer;">✕</button>
      </div>
      <div class="modal-body" style="padding: 2.5rem 1.5rem; text-align: center;">
        <span class="spinner" style="width: 40px; height: 40px; margin: 0 auto; display: block;"></span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();

  const closeSettingsBtn = modal.querySelector('#close-settings-modal-btn');
  closeSettingsBtn.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  try {
    const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
    const currentUserId = currentUser ? currentUser.id : null;

    if (!currentUserId) {
      showToast('Sesión no iniciada', 'error');
      closeModal();
      return;
    }

    // Load league details
    const { data: leagueData, error: leagueErr } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .maybeSingle();

    if (leagueErr) throw leagueErr;
    if (!leagueData) {
      showToast('La liga no existe', 'error');
      closeModal();
      return;
    }

    // Load user's member details
    const { data: memberData, error: memberErr } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', leagueId)
      .eq('profile_id', currentUserId)
      .maybeSingle();

    if (memberErr) throw memberErr;
    if (!memberData) {
      showToast('No eres miembro de esta liga', 'error');
      closeModal();
      return;
    }

    const isAdmin = !!memberData.is_admin;

    // Load all members of the league to check for successors
    const { data: membersList, error: listErr } = await supabase
      .from('league_members')
      .select(`
        profile_id,
        is_admin,
        profiles (
          display_name
        )
      `)
      .eq('league_id', leagueId);

    if (listErr) throw listErr;

    const members = (membersList || []).map(m => ({
      profile_id: m.profile_id,
      is_admin: m.is_admin,
      display_name: m.profiles?.display_name || 'Entrenador'
    }));

    // Render loaded state
    const bodyEl = modal.querySelector('.modal-body');
    bodyEl.style.textAlign = 'left';
    bodyEl.style.padding = '1.5rem';
    bodyEl.innerHTML = `
      ${isAdmin ? `
        <!-- Vista de Admin: Ajustes de la Liga -->
        <form id="league-settings-form" style="margin-bottom: 1.75rem; display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="edit-league-name" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">Nombre de la Liga</label>
            <input type="text" id="edit-league-name" class="input-field" value="${leagueData.name}" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
          </div>

          ${leagueData.sync_source === 'biwenger' ? `
            <div class="form-group" style="margin-bottom: 0;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">Tipo de Liga / Sincronización</label>
              <div style="display: flex; gap: 1rem; background: rgba(255,255,255,0.02); padding: 0.55rem 0.75rem; border-radius: 6px; border: 1.5px solid var(--border-color-glow);">
                <label style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-light); font-size: 0.78rem; cursor: pointer; font-weight: 600;">
                  <input type="radio" name="edit-league-type" value="manual" ${leagueData.sync_source !== 'biwenger' ? 'checked' : ''} style="accent-color: var(--accent);" />
                  Fantasy
                </label>
                <label style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-light); font-size: 0.78rem; cursor: pointer; font-weight: 600;">
                  <input type="radio" name="edit-league-type" value="biwenger" ${leagueData.sync_source === 'biwenger' ? 'checked' : ''} style="accent-color: var(--accent);" />
                  Biwenger
                </label>
              </div>
            </div>
          ` : ''}

          <!-- Fields to configure Biwenger credentials -->
          <div id="edit-biwenger-fields" style="display: ${leagueData.sync_source === 'biwenger' ? 'flex' : 'none'}; flex-direction: column; gap: 0.75rem; border-top: 1.5px dashed var(--border-color-glow); padding-top: 0.75rem; margin-top: 0.15rem;">
            <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Automatización Biwenger</span>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit-biwenger-league-id" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Código de Liga Biwenger</label>
              <input type="text" id="edit-biwenger-league-id" class="input-field" value="${leagueData.biwenger_league_id || ''}" placeholder="Ej: cwRzHsqCc6nx" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.55rem 0.75rem;" />
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit-biwenger-email" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Correo de Biwenger</label>
              <input type="email" id="edit-biwenger-email" class="input-field" value="${leagueData.biwenger_email || ''}" placeholder="ejemplo@correo.com" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.55rem 0.75rem;" />
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit-biwenger-password" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Contraseña de Biwenger</label>
              <input type="password" id="edit-biwenger-password" class="input-field" placeholder="Dejar en blanco para no cambiar" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.55rem 0.75rem;" />
            </div>
          </div>

          <button type="submit" class="btn-primary" id="btn-save-settings" style="width: 100%; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.65rem 1rem; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; cursor: pointer; background: var(--accent); color: #000;">
            Guardar Ajustes
          </button>
        </form>
      ` : `
        <!-- Vista de Miembro: Nombre de la liga -->
        <div style="margin-bottom: 1.75rem; background: rgba(222, 237, 0, 0.02); padding: 0.85rem 1.1rem; border-radius: 10px; border: 1.5px solid var(--border-color-glow);">
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Nombre de la Liga</span>
          <h4 style="font-size: 1.2rem; font-weight: 900; color: var(--accent-gold); margin-top: 0.35rem; font-family: var(--font-sans); margin-bottom: 0;">${leagueData.name}</h4>
        </div>
      `}

      <!-- Código de Invitación -->
      <div style="margin-bottom: 1.75rem; background: rgba(255, 255, 255, 0.02); padding: 0.85rem 1.1rem; border-radius: 10px; border: 1.5px solid var(--border-color);">
        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Código de Invitación</span>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; gap: 1rem;">
          <h4 style="font-size: 1.2rem; font-weight: 900; color: var(--text-light); margin: 0; font-family: monospace;">${leagueData.invite_code}</h4>
          <button id="copy-invite-code-btn" class="btn-secondary" style="width: auto; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-weight: 700; border: 2.5px solid #000000; box-shadow: 2px 2px 0px #000000; cursor: pointer;">Copiar</button>
        </div>
      </div>

      <!-- Vincular Usuario Biwenger (Solo si la liga es de tipo Biwenger) -->
      ${leagueData.sync_source === 'biwenger' ? `
        <div style="margin-bottom: 1.75rem; background: rgba(222, 237, 0, 0.02); padding: 1rem; border-radius: 10px; border: 1.5px solid var(--border-color-glow);">
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">Vincular tu usuario de Biwenger</span>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.75rem; line-height: 1.35;">
            Selecciona tu participante de Biwenger para que las sincronizaciones te reconozcan automáticamente.
          </p>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select id="user-biwenger-name-select" class="input-field" disabled style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); flex-grow: 1; padding: 0.5rem 0.75rem; font-size: 0.8rem; color: var(--text-light);">
              <option value="">Cargando participantes de Biwenger...</option>
            </select>
            <button id="btn-save-user-biwenger" class="btn-primary" disabled style="width: auto; font-weight: 800; padding: 0.5rem 1rem; border: 2px solid #000; box-shadow: 1.5px 1.5px 0 #000; cursor: not-allowed; font-size: 0.8rem; background: var(--accent); color: #000; opacity: 0.5;">
              Vincular
            </button>
          </div>
          <p id="biwenger-link-error-msg" style="display: none; font-size: 0.7rem; color: var(--danger); margin-top: 0.5rem;"></p>
        </div>
      ` : ''}

      <!-- Acciones -->
      <div style="border-top: 1px dashed var(--border-color-glow); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 0.25rem; display: block;">Acciones de Liga</span>
        
        <button class="btn-league-danger-outline" id="btn-leave-league" style="width: 100%; padding: 0.75rem; font-weight: 800; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
          Salirse de la Liga
        </button>

        ${isAdmin ? `
          <button class="btn-league-danger-solid" id="btn-delete-league" style="width: 100%; padding: 0.75rem; font-weight: 800; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
            Eliminar Liga
          </button>
        ` : ''}
      </div>

      <!-- Sección de salida para el admin (Selector de Nuevo Admin) -->
      ${isAdmin ? `
        <div id="transfer-admin-section" style="display: none; border-top: 1px dashed var(--border-color-glow); padding-top: 1.5rem; margin-top: 1.5rem;">
          <h4 style="font-size: 1rem; font-weight: 900; color: var(--accent-gold); margin-bottom: 0.5rem; text-transform: uppercase; font-family: var(--font-display); margin-top: 0;">Designar Sucesor</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.45; margin-top: 0;">
            Como eres el administrador de la liga, debes delegar el cargo a otro miembro antes de salir.
          </p>
          
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label for="new-admin-select" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">Nuevo Administrador</label>
            <select id="new-admin-select" class="input-field" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem; color: var(--text-light);">
              <option value="">-- Selecciona el sucesor --</option>
              ${members.filter(m => m.profile_id !== currentUserId).map(m => `
                <option value="${m.profile_id}">${m.display_name}</option>
              `).join('')}
            </select>
          </div>

          <button class="btn-league-danger-solid" id="btn-confirm-leave-transfer" style="width: 100%; padding: 0.75rem; font-weight: 800; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
            Transferir y Salir
          </button>
        </div>
      ` : ''}
    `;

    // Hook Copy Invite Code
    const copyBtn = modal.querySelector('#copy-invite-code-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(leagueData.invite_code).then(() => {
        showToast('Código copiado al portapapeles', 'success');
      }).catch(err => {
        console.error(err);
      });
    });

    // Hook Save settings (Admin name/type/sync settings edit)
    const settingsForm = modal.querySelector('#league-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = settingsForm.querySelector('#btn-save-settings');
        const newName = settingsForm.querySelector('#edit-league-name').value.trim();
        const typeRadio = settingsForm.querySelector('input[name="edit-league-type"]:checked');
        const newType = typeRadio ? typeRadio.value : (leagueData.sync_source || 'manual');

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner"></span>';

        try {
          const updatePayload = {
            name: newName,
            sync_source: newType
          };

          if (newType === 'biwenger') {
            updatePayload.biwenger_email = settingsForm.querySelector('#edit-biwenger-email').value.trim();
            updatePayload.biwenger_league_id = settingsForm.querySelector('#edit-biwenger-league-id').value.trim();
            
            const newPasswordVal = settingsForm.querySelector('#edit-biwenger-password').value.trim();
            if (newPasswordVal) {
              updatePayload.biwenger_password = newPasswordVal;
            }
          } else {
            updatePayload.biwenger_email = null;
            updatePayload.biwenger_password = null;
            updatePayload.biwenger_league_id = null;
          }

          const { error } = await supabase
            .from('leagues')
            .update(updatePayload)
            .eq('id', leagueId);

          if (error) throw error;

          showToast('Nombre de liga actualizado', 'success');
          
          if (localStorage.getItem('CF_ACTIVE_LEAGUE_ID') === leagueId) {
            localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', newName);
          }

          closeModal();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (err) {
          console.error(err);
          showToast('Error al actualizar liga', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Guardar Nombre';
        }
      });
    }

    // Load Biwenger users in the background to populate the select
    if (leagueData.sync_source === 'biwenger') {
      const selectEl = modal.querySelector('#user-biwenger-name-select');
      const saveBtn = modal.querySelector('#btn-save-user-biwenger');
      const errorMsgEl = modal.querySelector('#biwenger-link-error-msg');

      const emailVal = leagueData.biwenger_email;
      const passVal = leagueData.biwenger_password;
      const leagueIdVal = leagueData.biwenger_league_id;

      if (!emailVal || !passVal || !leagueIdVal) {
        if (selectEl) {
          selectEl.innerHTML = '<option value="">-- Credenciales de Liga no configuradas --</option>';
          selectEl.disabled = true;
        }
      } else {
        (async () => {
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
              body: JSON.stringify({ email: emailVal, password: passVal, leagueId: leagueIdVal })
            });

            if (res.status !== 200) throw new Error('No se pudo conectar con la API de Biwenger.');

            const syncData = await res.json();
            const biwengerUsers = syncData.data?.users || [];

            if (selectEl) {
              selectEl.innerHTML = '<option value="">-- Selecciona tu participante --</option>';
              biwengerUsers.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.name;
                opt.textContent = u.name;
                if (memberData.biwenger_user_name === u.name) {
                  opt.selected = true;
                }
                selectEl.appendChild(opt);
              });
              selectEl.disabled = false;
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.style.cursor = 'pointer';
                saveBtn.style.opacity = '1';
              }
            }
          } catch (err) {
            console.error(err);
            if (selectEl) {
              selectEl.innerHTML = '<option value="">-- Error al cargar participantes --</option>';
              selectEl.disabled = true;
            }
            if (errorMsgEl) {
              errorMsgEl.style.display = 'block';
              errorMsgEl.textContent = 'Asegúrate de que el administrador haya configurado correctamente el código de liga y las credenciales de Biwenger en Ajustes.';
            }
          }
        })();
      }
    }

    // Hook Save User Biwenger Name
    const saveUserBiwengerBtn = modal.querySelector('#btn-save-user-biwenger');
    if (saveUserBiwengerBtn) {
      saveUserBiwengerBtn.addEventListener('click', async () => {
        const selectEl = modal.querySelector('#user-biwenger-name-select');
        const inputVal = selectEl ? selectEl.value : '';

        saveUserBiwengerBtn.disabled = true;
        saveUserBiwengerBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span>';

        try {
          const { error } = await supabase
            .from('league_members')
            .update({ biwenger_user_name: inputVal || null })
            .eq('league_id', leagueId)
            .eq('profile_id', currentUserId);

          if (error) throw error;

          showToast('Usuario de Biwenger vinculado correctamente', 'success');
          memberData.biwenger_user_name = inputVal;
        } catch (err) {
          console.error(err);
          showToast('Error al vincular usuario de Biwenger', 'error');
        } finally {
          saveUserBiwengerBtn.disabled = false;
          saveUserBiwengerBtn.innerHTML = 'Vincular';
        }
      });
    }

    // Leave league button
    const leaveBtn = modal.querySelector('#btn-leave-league');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        if (isAdmin) {
          const otherMembers = members.filter(m => m.profile_id !== currentUserId);
          if (otherMembers.length > 0) {
            const transferSection = modal.querySelector('#transfer-admin-section');
            if (transferSection) {
              transferSection.style.display = 'block';
              transferSection.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            const confirmDelete = confirm('Eres el único miembro de la liga. Si sales, la liga se eliminará por completo de Supabase. ¿Deseas continuar?');
            if (confirmDelete) {
              executeDeleteLeague();
            }
          }
        } else {
          const confirmLeave = confirm('¿Estás seguro de que quieres salirte de esta liga? Se borrará tu participación de Supabase.');
          if (confirmLeave) {
            executeLeaveLeague();
          }
        }
      });
    }

    // Confirm leave and transfer button
    const confirmTransferBtn = modal.querySelector('#btn-confirm-leave-transfer');
    if (confirmTransferBtn) {
      confirmTransferBtn.addEventListener('click', () => {
        const newAdminId = modal.querySelector('#new-admin-select').value;
        if (!newAdminId) {
          alert('Por favor, selecciona un nuevo administrador.');
          return;
        }
        const selectEl = modal.querySelector('#new-admin-select');
        const newAdminName = selectEl.options[selectEl.selectedIndex].text;
        const confirmTransfer = confirm(`¿Estás seguro de que deseas transferir la administración a ${newAdminName} y salirte de la liga?`);
        if (confirmTransfer) {
          executeTransferAndLeave(newAdminId);
        }
      });
    }

    // Delete league button
    const deleteBtn = modal.querySelector('#btn-delete-league');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm('¿ESTÁS COMPLETAMENTE SEGURO? Esta acción es irreversible. Se eliminará la liga y todo su historial de deudas, ruletas y bufón de Supabase.');
        if (confirmDelete) {
          const input = prompt('Escribe "ELIMINAR" (en mayúsculas) para confirmar la eliminación definitiva de la liga:');
          if (input === 'ELIMINAR') {
            executeDeleteLeague();
          } else {
            alert('Confirmación incorrecta. Eliminación cancelada.');
          }
        }
      });
    }

    async function executeDeleteLeague() {
      try {
        const { error } = await supabase
          .from('leagues')
          .delete()
          .eq('id', leagueId);

        if (error) throw error;

        alert('La liga ha sido eliminada correctamente de Supabase.');
        
        if (localStorage.getItem('CF_ACTIVE_LEAGUE_ID') === leagueId) {
          localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
          localStorage.removeItem('CF_ACTIVE_LEAGUE_NAME');
        }

        closeModal();
        onNavigate('mis-ligas');
      } catch (err) {
        console.error(err);
        alert('Error al eliminar la liga: ' + err.message);
      }
    }

    async function executeLeaveLeague() {
      try {
        const { error } = await supabase
          .from('league_members')
          .delete()
          .eq('league_id', leagueId)
          .eq('profile_id', currentUserId);

        if (error) throw error;

        alert('Te has salido de la liga correctamente.');

        if (localStorage.getItem('CF_ACTIVE_LEAGUE_ID') === leagueId) {
          localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
          localStorage.removeItem('CF_ACTIVE_LEAGUE_NAME');
        }

        closeModal();
        onNavigate('mis-ligas');
      } catch (err) {
        console.error(err);
        alert('Error al salir de la liga: ' + err.message);
      }
    }

    async function executeTransferAndLeave(newAdminId) {
      try {
        // 1. Promover al nuevo admin
        const { error: promoErr } = await supabase
          .from('league_members')
          .update({ is_admin: true })
          .eq('league_id', leagueId)
          .eq('profile_id', newAdminId);

        if (promoErr) throw promoErr;

        // 2. Salirse
        const { error: leaveErr } = await supabase
          .from('league_members')
          .delete()
          .eq('league_id', leagueId)
          .eq('profile_id', currentUserId);

        if (leaveErr) throw leaveErr;

        alert('Administración transferida y salida de la liga completada con éxito.');

        if (localStorage.getItem('CF_ACTIVE_LEAGUE_ID') === leagueId) {
          localStorage.removeItem('CF_ACTIVE_LEAGUE_ID');
          localStorage.removeItem('CF_ACTIVE_LEAGUE_NAME');
        }

        closeModal();
        onNavigate('mis-ligas');
      } catch (err) {
        console.error(err);
        alert('Error al procesar la transferencia y salida: ' + err.message);
      }
    }

  } catch (err) {
    console.error(err);
    showToast('Error al cargar opciones de la liga', 'error');
    closeModal();
  }
}
