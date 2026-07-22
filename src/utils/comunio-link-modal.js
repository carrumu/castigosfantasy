import { supabase } from '../supabase';

/**
 * Opens a modal for a user to link their local profile with their Comunio manager.
 * @param {string} leagueId - The local league UUID
 * @param {string} currentUserId - The active user's UUID
 * @param {Object} callbacks - callbacks (showToast, onNavigate)
 * @param {Function} [onComplete] - Optional callback triggered after successful link or skip
 */
export async function openComunioLinkModal(leagueId, currentUserId, callbacks, onComplete) {
  const existing = document.querySelector('#comunio-link-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'comunio-link-modal';
  modal.className = 'modal-overlay active';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 450px; width: 90%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(222, 237, 0, 0.15);">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem;">
        <h3 class="gradient-text-green" style="font-family: var(--font-display); font-weight: 900; font-size: 1.1rem; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow:0 0 8px var(--accent);"></span>
          Vincular con Comunio
        </h3>
        <button id="close-link-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.45; margin: 0;">
          Esta liga está sincronizada con Comunio. Selecciona tu mánager de la lista para emparejar tus estadísticas automáticamente.
        </p>

        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label for="comunio-manager-select" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.35rem;">Tu mánager de Comunio</label>
          <select id="comunio-manager-select" class="input-field" disabled style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem; color: var(--text-light);">
            <option value="">Cargando mánagers...</option>
          </select>
        </div>

        <p id="link-modal-error" style="display: none; font-size: 0.72rem; color: var(--danger); line-height: 1.4; margin: 0;"></p>

        <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">
          <button id="btn-confirm-link" class="btn-primary" disabled style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; background: var(--accent); color: #000; padding: 0.75rem; cursor: not-allowed; opacity: 0.5;">
            Vincular Cuenta
          </button>
          <button id="btn-skip-link" class="btn-secondary" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; padding: 0.75rem; cursor: pointer;">
            Hacer más tarde
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const selectEl = modal.querySelector('#comunio-manager-select');
  const confirmBtn = modal.querySelector('#btn-confirm-link');
  const skipBtn = modal.querySelector('#btn-skip-link');
  const closeBtn = modal.querySelector('#close-link-modal');
  const errorEl = modal.querySelector('#link-modal-error');

  const close = () => {
    modal.remove();
    if (onComplete) onComplete();
  };

  closeBtn.addEventListener('click', close);
  skipBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // Background loader
  try {
    // 1. Fetch league sync credentials
    const { data: leagueData, error: leagueErr } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (leagueErr) throw leagueErr;

    // Credentials are stored server-side (league_secrets) and never fetched
    // here; we only need to know the league is configured for Comunio sync.
    if (!leagueData.comunio_community_id) {
      throw new Error('Las credenciales de sincronización de Comunio aún no están configuradas por el administrador.');
    }

    // 2. Fetch active membership to check current link
    const { data: memberData } = await supabase
      .from('league_members')
      .select('comunio_manager_id, comunio_manager_name')
      .eq('league_id', leagueId)
      .eq('profile_id', currentUserId)
      .maybeSingle();

    const currentLinkedId = memberData?.comunio_manager_id ?? null;

    // 3. Call Edge Function to get members
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';

    let token = supabaseAnonKey;
    try {
      const sessionData = await supabase.auth.getSession();
      if (sessionData.data?.session?.access_token) {
        token = sessionData.data.session.access_token;
      }
    } catch (_) {}

    const res = await fetch(`${supabaseUrl}/functions/v1/comunio-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ appLeagueId: leagueId })
    });

    const syncData = await res.json();

    if (!syncData.ok) {
      throw new Error(syncData.error || 'No se pudo conectar con el servidor de Comunio.');
    }

    const comunioMembers = syncData.members || [];

    if (comunioMembers.length === 0) {
      throw new Error('No se encontraron mánagers en esta comunidad de Comunio.');
    }

    // Populate Select
    selectEl.innerHTML = '<option value="">-- Selecciona tu mánager --</option>';
    comunioMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = String(m.id);
      opt.textContent = m.leader ? `${m.name} (líder)` : m.name;
      if (currentLinkedId !== null && m.id === currentLinkedId) opt.selected = true;
      selectEl.appendChild(opt);
    });

    selectEl.disabled = false;
    confirmBtn.disabled = false;
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.opacity = '1';

    // Hook Confirm Link
    confirmBtn.addEventListener('click', async () => {
      const selectedId = selectEl.value;
      if (!selectedId) {
        callbacks.showToast('Por favor, selecciona un mánager', 'error');
        return;
      }

      const chosenMember = comunioMembers.find(m => String(m.id) === selectedId);

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Vinculando...';

      try {
        const { error } = await supabase
          .from('league_members')
          .update({ comunio_manager_id: Number(selectedId), comunio_manager_name: chosenMember?.name || null })
          .eq('league_id', leagueId)
          .eq('profile_id', currentUserId);

        if (error) throw error;

        callbacks.showToast(`¡Perfil vinculado a "${chosenMember?.name || selectedId}"!`, 'success');
        close();
      } catch (saveErr) {
        console.error(saveErr);
        callbacks.showToast('Error al guardar la vinculación', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Vincular Cuenta';
      }
    });

  } catch (err) {
    console.error(err);
    selectEl.innerHTML = '<option value="">-- Error al cargar mánagers --</option>';
    errorEl.style.display = 'block';
    errorEl.innerHTML = `<strong>Error:</strong> ${err.message}`;
  }
}
