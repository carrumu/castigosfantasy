import { supabase } from '../supabase';

/**
 * Renders the League Selection / Creation / Joining screen.
 * Authentication is mandatory.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderSelectLeague(container, callbacks) {
  const isGuest = callbacks.isGuest;

  // Check auth
  if (isGuest) {
    callbacks.onNavigate('acceso');
    return;
  }

  let leagues = [];

  // Helper to generate a random 6-character invite code
  function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function loadUserLeagues() {
    container.innerHTML = `
      <div class="container" style="display: flex; justify-content: center; align-items: center; padding: 3rem 0;">
        <span class="spinner" style="width: 40px; height: 40px;"></span>
      </div>
    `;

    try {
      const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      
      const { data: memberList, error: fetchErr } = await supabase
        .from('league_members')
        .select(`
          is_admin,
          leagues (
            id,
            name,
            invite_code,
            features
          )
        `)
        .eq('profile_id', currentUser.id);

      if (fetchErr) throw fetchErr;

      leagues = (memberList || [])
        .filter(m => m.leagues !== null)
        .map(m => ({
          id: m.leagues.id,
          name: m.leagues.name,
          inviteCode: m.leagues.invite_code,
          isAdmin: m.is_admin
        }));

      renderView();
    } catch (err) {
      console.error(err);
      callbacks.showToast('Error al cargar tus ligas', 'error');
    }
  }

  function renderView() {
    const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');

    container.innerHTML = `
      <div class="container fade-in-up" style="max-width: 800px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <h1 class="gradient-text-gold" style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem;">
            🏆 Mis Ligas Fantasy
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Selecciona tu liga activa para ver la ruleta y la clasificación, o únete/crea una nueva comunidad.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- List of leagues -->
          <div class="card glass">
            <h2 class="card-title gradient-text-green" style="margin-bottom: 1.25rem;">📋 Ligas Activas</h2>
            
            ${leagues.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; border: 1.5px dashed var(--border-color); border-radius: 12px; background: rgba(0,0,0,0.1);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚽</div>
                <p style="font-weight: 600;">No formas parte de ninguna liga todavía.</p>
                <p style="font-size: 0.8rem; margin-top: 0.25rem;">¡Crea una liga nueva o únete a una existente abajo!</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${leagues.map(l => {
                  const isActive = l.id === activeLeagueId;

                  return `
                    <div class="leaderboard-item ${isActive ? 'active-league-row' : ''}" style="
                      display: flex; 
                      align-items: center; 
                      justify-content: space-between; 
                      padding: 1rem 1.25rem; 
                      border-radius: 12px;
                      background: ${isActive ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)'};
                      border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'};
                      transition: var(--transition-fast);
                    ">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-light);">${l.name}</h4>
                          ${isActive ? `
                            <span class="feature-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
                              Activa
                            </span>
                          ` : ''}
                        </div>
                        <div style="display: flex; gap: 0.75rem; margin-top: 0.3rem; font-size: 0.8rem; color: var(--text-muted);">
                          <span>Código: <strong style="color: var(--text-light);">${l.inviteCode}</strong></span>
                          <span>•</span>
                          <span>Rol: <strong>${l.isAdmin ? 'Administrador' : 'Miembro'}</strong></span>
                        </div>
                      </div>
                      
                      <button class="btn-select-league btn-primary" data-id="${l.id}" data-name="${l.name}" style="
                        width: auto; 
                        padding: 0.55rem 1.25rem; 
                        font-size: 0.85rem; 
                        font-weight: 700;
                        background: ${isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : ''};
                      ">
                        ${isActive ? 'Entrar ✓' : 'Seleccionar'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Botones de Acción (Unirse / Crear) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 1rem;">
            <button id="btn-show-join" class="btn-secondary" style="padding: 1.5rem 1rem; font-weight: 800; font-size: 1.05rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.65rem; border-radius: 14px; cursor: pointer; transition: all var(--transition-fast); background: rgba(255, 255, 255, 0.02); border: 1.5px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <span style="font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">🔑</span>
              <span>Unirse a una Liga</span>
            </button>
            <button id="btn-show-create" class="btn-secondary" style="padding: 1.5rem 1rem; font-weight: 800; font-size: 1.05rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.65rem; border-radius: 14px; cursor: pointer; transition: all var(--transition-fast); background: rgba(255, 255, 255, 0.02); border: 1.5px solid var(--border-color-glow); color: var(--text-light); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <span style="font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">✨</span>
              <span style="font-weight: 800; color: var(--accent-gold);">Crear Liga Nueva</span>
            </button>
          </div>

          <!-- Contenedor de Formularios Desplegables en Modales -->
          <!-- Modal Unirse a una Liga -->
          <div id="modal-join-form" class="modal-overlay">
            <div class="modal-content glass" style="border-color: rgba(255, 255, 255, 0.08);">
              <div class="modal-header">
                <h3 class="gradient-text-green" style="font-weight: 800; font-size: 1.25rem;">🔑 Unirse a una Liga</h3>
                <button id="btn-close-join" class="modal-close" style="font-size: 1.25rem; font-weight: 700;">✕</button>
              </div>
              <div class="modal-body">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                  Introduce el código de invitación de 6 caracteres para entrar a la liga.
                </p>
                
                <form id="join-league-form" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label for="join-code">Código de Invitación</label>
                    <input type="text" id="join-code" class="input-field" placeholder="Ej: AB12CD" style="text-transform: uppercase;" required />
                  </div>
                  <button type="submit" class="btn-secondary" id="btn-join" style="font-weight: 700;">Unirse a la Liga</button>
                </form>
              </div>
            </div>
          </div>

          <!-- Modal Crear una Liga -->
          <div id="modal-create-form" class="modal-overlay">
            <div class="modal-content glass pitch-card" style="border-color: var(--border-color-glow);">
              <div class="modal-header">
                <h3 class="gradient-text-gold" style="font-weight: 800; font-size: 1.25rem;">✨ Crear una Liga Nueva</h3>
                <button id="btn-close-create" class="modal-close" style="font-size: 1.25rem; font-weight: 700;">✕</button>
              </div>
              <div class="modal-body">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                  Define el nombre y las características para tu nueva comunidad de juego.
                </p>
                
                <form id="create-league-form" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="form-group" style="margin-bottom: 0.25rem;">
                    <label for="new-league-name">Nombre de la Liga (Ej: Liga Los Troncos)</label>
                    <input type="text" id="new-league-name" class="input-field" placeholder="Nombre de tu liga fantasy" required />
                  </div>

                  <button type="submit" class="btn-primary" id="btn-create" style="font-weight: 700;">Crear Liga</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook Select League Buttons
    container.querySelectorAll('.btn-select-league').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', id);
        localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', name);

        callbacks.showToast(`Has seleccionado la liga "${name}"`, 'success');
        callbacks.onNavigate('menu-liga');
      });
    });

    // Toggle Form Modals Logic
    const btnShowJoin = container.querySelector('#btn-show-join');
    const btnShowCreate = container.querySelector('#btn-show-create');
    const modalJoinForm = container.querySelector('#modal-join-form');
    const modalCreateForm = container.querySelector('#modal-create-form');
    const btnCloseJoin = container.querySelector('#btn-close-join');
    const btnCloseCreate = container.querySelector('#btn-close-create');

    if (btnShowJoin && btnShowCreate) {
      btnShowJoin.addEventListener('click', () => {
        modalJoinForm.classList.add('active');
      });

      btnShowCreate.addEventListener('click', () => {
        modalCreateForm.classList.add('active');
      });
    }

    const closeJoin = () => {
      modalJoinForm.classList.remove('active');
    };

    const closeCreate = () => {
      modalCreateForm.classList.remove('active');
    };

    if (btnCloseJoin) btnCloseJoin.addEventListener('click', closeJoin);
    if (btnCloseCreate) btnCloseCreate.addEventListener('click', closeCreate);

    // Close on backdrop click
    if (modalJoinForm) {
      modalJoinForm.addEventListener('click', (e) => {
        if (e.target === modalJoinForm) closeJoin();
      });
    }

    if (modalCreateForm) {
      modalCreateForm.addEventListener('click', (e) => {
        if (e.target === modalCreateForm) closeCreate();
      });
    }

    // Hook Join Liga
    const joinForm = container.querySelector('#join-league-form');
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = joinForm.querySelector('#btn-join');
      const code = joinForm.querySelector('#join-code').value.trim().toUpperCase();

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        
        // Find league by code
        const { data: targetLeague, error: findErr } = await supabase
          .from('leagues')
          .select('*')
          .eq('invite_code', code)
          .maybeSingle();

        if (findErr) throw findErr;
        if (!targetLeague) {
          callbacks.showToast('Código de invitación no válido', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Unirse a la Liga';
          return;
        }

        // Join league
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
        }

        // Set joined league as active
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', targetLeague.id);
        localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', targetLeague.name);

        callbacks.onNavigate('menu-liga');
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al unirse a la liga', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Unirse a la Liga';
      }
    });

    // Hook Create Liga
    const createForm = container.querySelector('#create-league-form');
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = createForm.querySelector('#btn-create');
      const name = createForm.querySelector('#new-league-name').value.trim();
      const inviteCode = generateInviteCode();

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        
        // Insert league
        const { data: newLeague, error: leagueErr } = await supabase
          .from('leagues')
          .insert({
            name,
            invite_code: inviteCode,
            created_by: currentUser.id
          })
          .select()
          .single();

        if (leagueErr) throw leagueErr;

        // Insert creator as admin member
        const { error: memberErr } = await supabase
          .from('league_members')
          .insert({
            league_id: newLeague.id,
            profile_id: currentUser.id,
            is_admin: true
          });

        if (memberErr) throw memberErr;

        callbacks.showToast(`¡Liga "${name}" creada con éxito!`, 'success');

        // Set created league as active
        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', newLeague.id);
        localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', newLeague.name);

        callbacks.onNavigate('menu-liga');
      } catch (err) {
        console.error(err);
        callbacks.showToast('No se pudo crear la liga', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Crear Liga';
      }
    });
  }

  loadUserLeagues();
}
