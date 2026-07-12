import { supabase } from '../supabase';
import { openLeagueSettings } from '../utils/league-options';
import { openBiwengerLinkModal } from '../utils/biwenger-link-modal';

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
            sync_source
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
    // Tracks the pre-registered roster fetched in step 1 of the 2-step join flow.
    let currentRoster = null;

    container.innerHTML = `
      <div class="container fade-in-up" style="max-width: 800px;">
        <!-- Header -->
        <div style="margin-bottom: 2.5rem;">
          <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Panel de Ligas</span>
          <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; margin: 0.15rem 0 0.6rem;">
            Mis Ligas Fantasy
          </h1>
          <p style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500; max-width: 500px; line-height: 1.4;">
            Selecciona tu liga activa, únete con un código o crea una nueva comunidad.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- List of leagues -->
          <div class="card glass" style="border: 1.5px solid var(--border-color-glow); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(222, 237, 0, 0.05);">
            <h2 class="card-title gradient-text-green" style="margin-bottom: 1.5rem; font-family: var(--font-display); font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; background: var(--accent); border-radius: 2px; margin-right: 0.65rem; box-shadow: 0 0 8px var(--accent);"></span>
              Ligas Activas
            </h2>
            
            ${leagues.length === 0 ? `
              <div class="empty-state-container">
                <svg class="empty-state-svg" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m12 2-2 3.5 2 3.5h3L17 5.5z"></path>
                  <path d="M12 9v4l-3 2v3"></path>
                  <path d="M12 13v4l3 2v-3"></path>
                  <path d="M10 5.5 5 7.5l-1 4.5 3.5 3"></path>
                  <path d="m15 5.5 5 2 1 4.5-3.5 3"></path>
                </svg>
                <span class="feature-badge" style="background: rgba(222, 237, 0, 0.08); color: var(--accent); border: 1.5px solid var(--border-color-glow); padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; font-family: var(--font-sans);">Sin liga activa</span>
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 900; color: var(--text-light); margin-top: 1rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.5px;">El banquillo te espera</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 440px; margin: 0 auto; line-height: 1.45;">No perteneces a ninguna liga todavía. Únete a una existente con un código o crea una nueva para empezar el pique.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${leagues.map(l => {
                  const isActive = l.id === activeLeagueId;

                  return `
                    <div class="league-item ${isActive ? 'is-active' : ''}">
                      <div class="league-item-top-row">
                        <h4 class="league-item-name">${l.name}</h4>
                        ${isActive ? `
                          <span class="league-active-badge">Activa</span>
                        ` : ''}
                      </div>
                      
                      <div class="league-item-bottom-row">
                        <div class="league-item-meta">
                          <span>Código: <strong class="league-code-text">${l.inviteCode}</strong></span>
                          <span class="league-meta-separator">•</span>
                          <span>Rol: <strong class="league-role-text">${l.isAdmin ? 'Admin' : 'Miembro'}</strong></span>
                        </div>
                        
                        <div class="league-item-actions">
                          <button class="btn-dots btn-league-opts" data-id="${l.id}" title="Opciones de la Liga">⋮</button>
                          <button class="btn-select-league ${isActive ? 'is-active' : ''}" data-id="${l.id}" data-name="${l.name}">
                            ${isActive ? 'Entrar ✓' : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Botones de Acción (Unirse / Crear) -->
          <div class="league-actions-grid">
            <button id="btn-show-join" class="btn-league-action brutalist-border brutalist-shadow brutalist-shadow-hover" style="
              background: var(--bg-card); 
              color: var(--text-light); 
            ">
              <span>Unirse a una Liga</span>
            </button>
            <button id="btn-show-create" class="btn-league-action brutalist-border brutalist-shadow brutalist-shadow-hover" style="
              background: var(--accent); 
              color: #000000; 
            ">
              <span>Crear Liga Nueva</span>
            </button>
          </div>

          <!-- Contenedor de Formularios Desplegables en Modales -->
          <!-- Modal Unirse a una Liga -->
          <div id="modal-join-form" class="modal-overlay">
            <div class="modal-content glass" style="max-width: 450px; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(222, 237, 0, 0.15);">
              <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow);">
                <h3 class="gradient-text-green" style="font-weight: 900; font-size: 1.35rem; font-family: var(--font-display);">Unirse a una Liga</h3>
                <button id="btn-close-join" class="modal-close" style="font-size: 1.2rem;">✕</button>
              </div>
              <div class="modal-body">
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.45;">
                  Introduce el código de invitación de 6 caracteres para entrar a la liga.
                </p>
                
                <form id="join-league-form" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="form-group" style="margin-bottom: 0.5rem;" id="join-code-group">
                    <label for="join-code" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem;">Código de Invitación</label>
                    <input type="text" id="join-code" class="input-field" placeholder="Ej: AB12CD" style="text-transform: uppercase; border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input);" required />
                  </div>
                  <div class="form-group" style="margin-bottom: 0.5rem; display: none;" id="join-identity-group">
                    <label for="join-identity" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem;">¿Quién eres en esta liga?</label>
                    <select id="join-identity" class="input-field" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input);">
                      <!-- Opciones dinámicas -->
                    </select>
                  </div>
                  <button type="submit" class="btn-primary" id="btn-join" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Comprobar Código</button>
                </form>
              </div>
            </div>
          </div>

          <!-- Modal Crear una Liga -->
          <div id="modal-create-form" class="modal-overlay">
            <div class="modal-content glass" style="max-width: 450px; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(222, 237, 0, 0.15);">
              <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow);">
                <h3 class="gradient-text-gold" style="font-weight: 900; font-size: 1.35rem; font-family: var(--font-display);">Crear una Liga Nueva</h3>
                <button id="btn-close-create" class="modal-close" style="font-size: 1.2rem;">✕</button>
              </div>
              <div class="modal-body">
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.45;">
                  Define el nombre para tu nueva comunidad de juego.
                </p>
                
                <form id="create-league-form" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="form-group" style="margin-bottom: 0.25rem;">
                    <label for="new-league-name" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem;">Nombre de la Liga (Ej: Liga Los Troncos)</label>
                    <input type="text" id="new-league-name" class="input-field" placeholder="Nombre de tu liga fantasy" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input);" required />
                  </div>

                  <div class="form-group" style="margin-bottom: 0.25rem;">
                    <label for="new-league-roster-count" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem;">Número de participantes esperados (excluyéndote a ti)</label>
                    <select id="new-league-roster-count" class="input-field" style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input);">
                      <option value="0">0 (Solo yo por ahora)</option>
                      ${Array.from({length: 20}, (_, i) => i + 1).map(n => `<option value="${n}">${n}</option>`).join('')}
                    </select>
                    <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem;">Tú ya estás incluido como Admin, añade al resto de jugadores de tu liga.</p>
                  </div>
                  <div id="roster-inputs-container" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.25rem;">
                  </div>

                  <div class="form-group" style="margin-bottom: 0.25rem;">
                    <label style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.4rem;">Tipo de Liga</label>
                    <div style="display: flex; gap: 1.25rem; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 0.65rem 0.85rem; border-radius: 6px; border: 1.5px solid var(--border-color-glow);">
                      <label style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-light); font-size: 0.8rem; cursor: pointer; font-weight: 600;">
                        <input type="radio" name="league-type" value="manual" checked style="accent-color: var(--accent);" />
                        Fantasy
                      </label>
                      <label style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-light); font-size: 0.8rem; cursor: pointer; font-weight: 600;">
                        <input type="radio" name="league-type" value="biwenger" style="accent-color: var(--accent);" />
                        Biwenger
                      </label>
                      <label style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-light); font-size: 0.8rem; cursor: pointer; font-weight: 600;">
                        <input type="radio" name="league-type" value="comunio" style="accent-color: var(--accent);" />
                        Comunio
                      </label>
                    </div>
                    <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem;">Si eliges Biwenger o Comunio, configura tus credenciales después en Ajustes de la liga.</p>
                  </div>

                  <button type="submit" class="btn-primary" id="btn-create" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Crear Liga</button>
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

    // Hook Option Buttons (3 dots)
    container.querySelectorAll('.btn-league-opts').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openLeagueSettings(id, callbacks);
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
      // Reset the 2-step join flow so reopening starts fresh; otherwise the
      // code stays read-only and the modal is stuck on step 2.
      currentRoster = null;
      const codeInput = container.querySelector('#join-code');
      const idGroup = container.querySelector('#join-identity-group');
      const idSelect = container.querySelector('#join-identity');
      const joinBtn = container.querySelector('#btn-join');
      if (codeInput) { codeInput.readOnly = false; codeInput.value = ''; }
      if (idGroup) idGroup.style.display = 'none';
      if (idSelect) { idSelect.innerHTML = ''; idSelect.required = false; }
      if (joinBtn) { joinBtn.disabled = false; joinBtn.innerHTML = 'Comprobar Código'; }
    };

    const closeCreate = () => {
      modalCreateForm.classList.remove('active');
      const createForm = container.querySelector('#create-league-form');
      if (createForm) createForm.reset();
      // form.reset() clears values but leaves the dynamically-added roster
      // inputs in the DOM (still required), so wipe them out too.
      const rosterCont = container.querySelector('#roster-inputs-container');
      if (rosterCont) rosterCont.innerHTML = '';
    };

    if (btnCloseJoin) btnCloseJoin.addEventListener('click', closeJoin);
    if (btnCloseCreate) btnCloseCreate.addEventListener('click', closeCreate);

    // Dynamic Roster Inputs Logic
    const rosterCountSelect = container.querySelector('#new-league-roster-count');
    const rosterInputsContainer = container.querySelector('#roster-inputs-container');
    
    if (rosterCountSelect && rosterInputsContainer) {
      rosterCountSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value, 10);
        let inputsHtml = '';
        for (let i = 1; i <= count; i++) {
          inputsHtml += `
            <input type="text" class="input-field roster-dynamic-input" placeholder="Nombre/Apodo del Jugador ${i}" style="border: 1.5px solid var(--border-color-glow); font-weight: 600; background: var(--bg-input); padding: 0.6rem;" required />
          `;
        }
        rosterInputsContainer.innerHTML = inputsHtml;
      });
    }

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
      const identitySelect = joinForm.querySelector('#join-identity');
      const identityGroup = joinForm.querySelector('#join-identity-group');

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        
        // Paso 1: Comprobar código y obtener roster si aún no se ha hecho
        if (!currentRoster) {
          const { data: roster, error: rosterErr } = await supabase
            .rpc('get_league_roster_by_code', { invite_code_arg: code });
          
          if (rosterErr) {
            callbacks.showToast('Código de invitación no válido o inexistente', 'error');
            btn.disabled = false;
            btn.innerHTML = 'Comprobar Código';
            return;
          }

          if (roster && roster.length > 0) {
            currentRoster = roster;
            identityGroup.style.display = 'block';
            joinForm.querySelector('#join-code').readOnly = true;
            
            // Llenar select
            let optionsHtml = '<option value="">-- Selecciona tu identidad --</option>';
            roster.forEach(r => {
              if (!r.is_claimed) {
                optionsHtml += `<option value="${r.id}">${r.name}</option>`;
              }
            });
            optionsHtml += '<option value="new">Nuevo Jugador (No estoy en la lista)</option>';
            identitySelect.innerHTML = optionsHtml;
            identitySelect.required = true;

            btn.disabled = false;
            btn.innerHTML = 'Unirse a la Liga';
            return;
          }
          // Si no hay roster, procede al Paso 2 automáticamente con null
        }

        // Paso 2: Unirse a la liga
        let selectedRosterId = null;
        if (currentRoster && identitySelect.value !== 'new') {
          selectedRosterId = identitySelect.value;
        }

        const { data: joinedLeagueId, error: rpcErr } = await supabase
          .rpc('join_league_by_code', { invite_code_arg: code, roster_id_arg: selectedRosterId });

        if (rpcErr) {
          callbacks.showToast(rpcErr.message || 'Error al unirse a la liga', 'error');
          console.error(rpcErr);
          btn.disabled = false;
          btn.innerHTML = 'Unirse a la Liga';
          return;
        }

        // Leer datos de la liga recién unida
        const { data: targetLeague, error: findErr } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', joinedLeagueId)
          .single();

        if (findErr) throw findErr;

        callbacks.showToast(`¡Te has unido a "${targetLeague.name}"!`, 'success');

        localStorage.setItem('CF_ACTIVE_LEAGUE_ID', targetLeague.id);
        localStorage.setItem('CF_ACTIVE_LEAGUE_NAME', targetLeague.name);

        if (targetLeague.sync_source === 'biwenger' && targetLeague.biwenger_league_id) {
          openBiwengerLinkModal(targetLeague.id, currentUser.id, callbacks, () => {
            callbacks.onNavigate('menu-liga');
          });
        } else {
          callbacks.onNavigate('menu-liga');
        }
      } catch (err) {
        console.error(err);
        callbacks.showToast('Error al procesar la solicitud', 'error');
        btn.disabled = false;
        btn.innerHTML = currentRoster ? 'Unirse a la Liga' : 'Comprobar Código';
      }
    });

    // Hook Create Liga
    const createForm = container.querySelector('#create-league-form');
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = createForm.querySelector('#btn-create');
      const name = createForm.querySelector('#new-league-name').value.trim();
      const rosterInputs = Array.from(createForm.querySelectorAll('.roster-dynamic-input'));
      const names = rosterInputs.map(input => input.value.trim()).filter(n => n);
      const inviteCode = generateInviteCode();
      const syncSource = createForm.querySelector('input[name="league-type"]:checked').value;

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
            created_by: currentUser.id,
            sync_source: syncSource
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

        // Insert roster names
        if (names.length > 0) {
          const rosterInserts = names.map(n => ({
            league_id: newLeague.id,
            name: n
          }));
          const { error: rosterErr } = await supabase
            .from('league_roster')
            .insert(rosterInserts);
          
          if (rosterErr) console.error('Error inserting roster:', rosterErr);
        }

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
