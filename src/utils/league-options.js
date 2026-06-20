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
        <!-- Vista de Admin: Ajustar Nombre -->
        <form id="league-settings-form" style="margin-bottom: 1.75rem;">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="edit-league-name" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">Nombre de la Liga</label>
            <input type="text" id="edit-league-name" class="input-field" value="${leagueData.name}" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
          </div>
          <button type="submit" class="btn-primary" id="btn-save-settings" style="width: 100%; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.65rem 1rem; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; cursor: pointer;">
            Guardar Nombre
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

      <!-- Acciones -->
      <div style="border-top: 1px dashed var(--border-color-glow); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 0.25rem; display: block;">Acciones de Liga</span>
        
        <button class="btn-league-danger-outline" id="btn-leave-league" style="width: 100%; padding: 0.75rem; font-weight: 800; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
          🚪 Salirse de la Liga
        </button>

        ${isAdmin ? `
          <button class="btn-league-danger-solid" id="btn-delete-league" style="width: 100%; padding: 0.75rem; font-weight: 800; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
            🗑️ Eliminar Liga
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

    // Hook Save settings (Admin name edit)
    const settingsForm = modal.querySelector('#league-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = settingsForm.querySelector('#btn-save-settings');
        const newName = settingsForm.querySelector('#edit-league-name').value.trim();

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner"></span>';

        try {
          const { error } = await supabase
            .from('leagues')
            .update({ name: newName })
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
