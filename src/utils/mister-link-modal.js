import { supabase } from '../supabase';

/**
 * Vincula el perfil local con el mánager de Mister.
 *
 * Igual que el de Comunio, con una diferencia importante: Mister no tiene
 * identificador de liga en su API, así que `/standings` devuelve la liga que
 * la cuenta tenga activa. Por eso este modal enseña arriba el NOMBRE de la
 * liga detectada — para que el usuario confirme que estamos leyendo la suya y
 * no otra en la que también esté.
 *
 * @param {string} leagueId UUID de la liga local
 * @param {string} currentUserId UUID del usuario activo
 * @param {Object} callbacks showToast, onNavigate
 * @param {Function} [onComplete] Se llama al cerrar, vincule o no
 */
export async function openMisterLinkModal(leagueId, currentUserId, callbacks, onComplete) {
  document.querySelector('#mister-link-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'mister-link-modal';
  modal.className = 'modal-overlay active';
  modal.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:9999;';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 450px; width: 90%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(222, 237, 0, 0.15);">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem;">
        <h3 class="gradient-text-green" style="font-family: var(--font-display); font-weight: 900; font-size: 1.1rem; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow:0 0 8px var(--accent);"></span>
          Vincular con Mister
        </h3>
        <button id="close-mister-link-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.45; margin: 0;">
          Selecciona tu mánager para emparejar tus estadísticas automáticamente.
        </p>

        <!-- Mister no deja elegir liga: se enseña la detectada para que el
             usuario confirme que es la correcta antes de vincular nada. -->
        <div id="mister-league-banner" style="display:none; font-size:0.75rem; line-height:1.4; color:var(--text-muted); background:rgba(255,255,255,0.03); border:1px solid var(--border-color-glow); border-radius:8px; padding:0.6rem 0.75rem;">
          Leyendo la liga <strong id="mister-league-name" style="color:var(--accent);"></strong> de tu cuenta de Mister.
        </div>

        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label for="mister-manager-select" style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.35rem;">Tu mánager de Mister</label>
          <select id="mister-manager-select" class="input-field" disabled style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem; color: var(--text-light);">
            <option value="">Cargando mánagers...</option>
          </select>
        </div>

        <p id="mister-link-error" style="display: none; font-size: 0.72rem; color: var(--danger); line-height: 1.4; margin: 0;"></p>

        <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">
          <button id="btn-confirm-mister-link" class="btn-primary" disabled style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; background: var(--accent); color: #000; padding: 0.75rem; cursor: not-allowed; opacity: 0.5;">
            Vincular Cuenta
          </button>
          <button id="btn-skip-mister-link" class="btn-secondary" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 2px 2px 0 #000; padding: 0.75rem; cursor: pointer;">
            Hacer más tarde
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const selectEl = modal.querySelector('#mister-manager-select');
  const confirmBtn = modal.querySelector('#btn-confirm-mister-link');
  const errorEl = modal.querySelector('#mister-link-error');
  const banner = modal.querySelector('#mister-league-banner');

  const close = () => {
    modal.remove();
    if (onComplete) onComplete();
  };

  modal.querySelector('#close-mister-link-modal').addEventListener('click', close);
  modal.querySelector('#btn-skip-mister-link').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  try {
    // Vinculación actual y rol del usuario.
    const { data: memberData } = await supabase
      .from('league_members')
      .select('mister_manager_id, is_admin')
      .eq('league_id', leagueId)
      .eq('profile_id', currentUserId)
      .maybeSingle();
    const yaVinculado = memberData?.mister_manager_id ?? null;
    const esAdmin = !!memberData?.is_admin;

    // Managers que ya ha reclamado otro miembro: no deben ofrecerse, o dos
    // personas acabarían apuntando al mismo y las estadísticas se cruzarían.
    let ocupados = new Map();
    try {
      const { data: otros } = await supabase
        .from('league_members')
        .select('profile_id, mister_manager_id, mister_manager_name')
        .eq('league_id', leagueId)
        .not('mister_manager_id', 'is', null);
      (otros || [])
        .filter(m => m.profile_id !== currentUserId)
        .forEach(m => ocupados.set(String(m.mister_manager_id), m.mister_manager_name));
    } catch (_) { /* si no se pueden leer, se ofrecen todos */ }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';

    let token = supabaseAnonKey;
    try {
      const s = await supabase.auth.getSession();
      if (s.data?.session?.access_token) token = s.data.session.access_token;
    } catch (_) {}

    const res = await fetch(`${supabaseUrl}/functions/v1/mister-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ appLeagueId: leagueId })
    });

    const syncData = await res.json();
    if (!syncData.ok) throw new Error(syncData.error || 'No se pudo conectar con Mister.');

    const managers = syncData.members || [];
    if (!managers.length) throw new Error('No se han encontrado mánagers en esa liga de Mister.');

    if (syncData.league?.name) {
      modal.querySelector('#mister-league-name').textContent = syncData.league.name;
      banner.style.display = 'block';
    }

    /** Guarda la vinculación. Devuelve true si fue bien. */
    async function vincular(manager) {
      const { error } = await supabase
        .from('league_members')
        // El id de Mister se guarda como texto: viene así de la URL y no hay
        // ninguna razón para convertirlo a número.
        .update({ mister_manager_id: String(manager.id), mister_manager_name: manager.name || null })
        .eq('league_id', leagueId)
        .eq('profile_id', currentUserId);
      if (error) { console.error(error); return false; }
      return true;
    }

    // ---- Vinculación automática ----
    // Mister marca con `isMe` al dueño de las credenciales guardadas, que es
    // el admin que las configuró. Para él se puede vincular solo, sin
    // preguntarle nada. Para el resto de miembros NO: verían el mánager del
    // admin marcado como "esta cuenta" y acabarían vinculados a él.
    const yo = managers.find(m => m.isMe);
    const libre = yo && !ocupados.has(String(yo.id));
    if (esAdmin && yo && libre && !yaVinculado) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Vinculando...';
      if (await vincular(yo)) {
        callbacks.showToast(`Vinculado automáticamente a "${yo.name}"`, 'success');
        close();
        return;
      }
      // Si falla, se sigue con el desplegable de siempre.
      confirmBtn.innerHTML = 'Vincular Cuenta';
    }

    selectEl.innerHTML = '<option value="">-- Selecciona tu mánager --</option>';
    managers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = String(m.id);
      const tomadoPor = ocupados.get(String(m.id));
      if (tomadoPor !== undefined) {
        opt.textContent = `${m.name} — ya vinculado`;
        opt.disabled = true;
      } else {
        opt.textContent = m.isMe ? `${m.name} (esta cuenta)` : m.name;
      }
      if (yaVinculado !== null && String(m.id) === String(yaVinculado)) opt.selected = true;
      selectEl.appendChild(opt);
    });

    // Si es el dueño de las credenciales, se le deja preseleccionado aunque no
    // se haya podido vincular solo: es casi seguro el suyo.
    if (yo && libre && !yaVinculado) selectEl.value = String(yo.id);

    selectEl.disabled = false;
    confirmBtn.disabled = false;
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.opacity = '1';

    confirmBtn.addEventListener('click', async () => {
      const elegido = selectEl.value;
      if (!elegido) {
        callbacks.showToast('Por favor, selecciona un mánager', 'error');
        return;
      }
      const manager = managers.find(m => String(m.id) === elegido);

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Vinculando...';

      if (await vincular(manager || { id: elegido, name: null })) {
        callbacks.showToast(`¡Perfil vinculado a "${manager?.name || elegido}"!`, 'success');
        close();
      } else {
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
