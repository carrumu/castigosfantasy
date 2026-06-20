import { supabase } from '../supabase';

/**
 * Opens a modal for a user to link their local profile with their Biwenger participant name.
 * @param {string} leagueId - The local league UUID
 * @param {string} currentUserId - The active user's UUID
 * @param {Object} callbacks - callbacks (showToast, onNavigate)
 * @param {Function} [onComplete] - Optional callback triggered after successful link or skip
 */
export async function openBiwengerLinkModal(leagueId, currentUserId, callbacks, onComplete) {
  const existing = document.querySelector('#biwenger-link-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'biwenger-link-modal';
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
          Vincular con Biwenger
        </h3>
        <button id="close-link-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.45; margin: 0;">
          Esta liga está sincronizada con Biwenger. Selecciona tu participante de la lista para emparejar tus estadísticas automáticamente.
        </p>

        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label for="biwenger-user-select" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.35rem;">Tu participante de Biwenger</label>
          <select id="biwenger-user-select" class="input-field" disabled style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem; color: var(--text-light);">
            <option value="">Cargando participantes...</option>
          </select>
        </div>

        <p id="link-modal-error" style="display: none; font-size: 0.72rem; color: var(--danger); line-height: 1.4; margin: 0;"></p>

        <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">
          <button id="btn-confirm-link" class="btn-primary" disabled style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; background: var(--accent); color: #000; padding: 0.75rem; cursor: not-allowed; opacity: 0.5;">
            Vincular Cuenta 🔗
          </button>
          <button id="btn-skip-link" class="btn-secondary" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; padding: 0.75rem; cursor: pointer;">
            Hacer más tarde
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const selectEl = modal.querySelector('#biwenger-user-select');
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

    const email = leagueData.biwenger_email;
    const password = leagueData.biwenger_password;
    const bLeagueId = leagueData.biwenger_league_id;

    if (!email || !password || !bLeagueId) {
      throw new Error('Las credenciales de sincronización de Biwenger aún no están configuradas por el administrador.');
    }

    // 2. Fetch active membership to check current link
    const { data: memberData } = await supabase
      .from('league_members')
      .select('biwenger_user_name')
      .eq('league_id', leagueId)
      .eq('profile_id', currentUserId)
      .maybeSingle();

    const currentLinkedName = memberData?.biwenger_user_name || '';

    // 3. Call Edge Function to get participants
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
      throw new Error('No se pudo conectar con el servidor de Biwenger.');
    }

    const syncData = await res.json();
    const biwengerUsers = syncData.data?.users || [];

    if (biwengerUsers.length === 0) {
      throw new Error('No se encontraron participantes en esta liga de Biwenger.');
    }

    // Populate Select
    selectEl.innerHTML = '<option value="">-- Selecciona tu usuario --</option>';
    biwengerUsers.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.name;
      opt.textContent = u.name;
      if (u.name === currentLinkedName) opt.selected = true;
      selectEl.appendChild(opt);
    });

    selectEl.disabled = false;
    confirmBtn.disabled = false;
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.opacity = '1';

    // Hook Confirm Link
    confirmBtn.addEventListener('click', async () => {
      const selectedName = selectEl.value;
      if (!selectedName) {
        callbacks.showToast('Por favor, selecciona un usuario', 'error');
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Vinculando...';

      try {
        const { error } = await supabase
          .from('league_members')
          .update({ biwenger_user_name: selectedName })
          .eq('league_id', leagueId)
          .eq('profile_id', currentUserId);

        if (error) throw error;

        callbacks.showToast(`¡Perfil vinculado a "${selectedName}"!`, 'success');
        close();
      } catch (saveErr) {
        console.error(saveErr);
        callbacks.showToast('Error al guardar la vinculación', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Vincular Cuenta 🔗';
      }
    });

  } catch (err) {
    console.error(err);
    selectEl.innerHTML = '<option value="">-- Error al cargar participantes --</option>';
    errorEl.style.display = 'block';
    errorEl.innerHTML = `<strong>Error:</strong> ${err.message}`;
  }
}
