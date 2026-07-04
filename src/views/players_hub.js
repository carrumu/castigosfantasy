import { supabase } from '../supabase';

export function renderPlayersHub(container, callbacks) {
  let players = [];
  let loading = true;
  let searchTerm = '';
  let errorMsg = '';

  async function loadPlayers() {
    try {
      loading = true;
      renderView();
      
      const { data, error } = await supabase
        .from('football_players')
        .select('*')
        .order('market_value', { ascending: false, nullsFirst: false }); // Note: market_value is text in DB, so ordering might be alphabetical. For now, it's ok.
        
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet
          errorMsg = 'La tabla football_players no existe. Por favor, asegúrate de haber actualizado el esquema de Supabase y ejecutado el script fetch_transfermarkt.js.';
        } else {
          throw error;
        }
      } else {
        // Sort by club and then name for better grouping
        players = data.sort((a, b) => {
          if (a.club < b.club) return -1;
          if (a.club > b.club) return 1;
          return a.name.localeCompare(b.name);
        });
      }
    } catch (err) {
      console.error(err);
      errorMsg = 'Error al cargar los jugadores.';
      callbacks.showToast('Error al cargar la base de datos de jugadores', 'error');
    } finally {
      loading = false;
      renderView();
    }
  }

  function renderView() {
    const filteredPlayers = players.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.club.toLowerCase().includes(searchTerm.toLowerCase())
    );

    container.innerHTML = `
      <div class="container">
        <!-- Encabezado -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="gradient-text-green" style="font-size: 2rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 12l8.5 2.5"></path><path d="M12 12l-2.5 8.5"></path><path d="M12 12l-8.5-2.5"></path><path d="M12 12l2.5-8.5"></path></svg>
              Base de Datos Oficial
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem;">
              Jugadores actualizados vía Transfermarkt para su uso en los juegos.
            </p>
          </div>
          <button class="header-action-btn btn-secondary" id="btn-back-to-hub" title="Volver al Menú" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
        </div>

        <!-- Buscador -->
        <div class="card glass" style="margin-bottom: 2rem; display: flex; gap: 1rem; align-items: center;">
          <input type="text" id="player-search" class="input-field" placeholder="Buscar por nombre o club..." value="${escapeHTML(searchTerm)}" style="flex-grow: 1; max-width: 400px; font-size: 1rem;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
            ${filteredPlayers.length} Jugadores Encontrados
          </div>
        </div>

        <!-- Estados (Loading / Error / Empty) -->
        ${loading ? `
          <div style="text-align: center; padding: 4rem 0;">
            <div style="width: 40px; height: 40px; border: 4px solid rgba(222,237,0,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem auto;"></div>
            <p style="color: var(--text-muted); font-weight: 600;">Cargando base de datos...</p>
          </div>
        ` : errorMsg ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 8px; padding: 1.5rem; text-align: center;">
            <h3 style="color: #f87171; font-weight: 800; margin-bottom: 0.5rem;">Error de Conexión</h3>
            <p style="color: var(--text-light);">${escapeHTML(errorMsg)}</p>
          </div>
        ` : filteredPlayers.length === 0 ? `
          <div style="text-align: center; padding: 4rem 0; color: var(--text-muted);">
            <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No hay jugadores en la base de datos.</p>
            <p style="font-size: 0.9rem;">Ejecuta el script fetch_transfermarkt.js en tu terminal para obtener los datos iniciales.</p>
          </div>
        ` : `
          <!-- Grid de Jugadores -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem;">
            ${filteredPlayers.map(p => `
              <div class="card glass brutalist-shadow-hover" style="margin-bottom: 0; padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; border: 2px solid #000;">
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-light); margin-bottom: 0.25rem; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(p.name)}">
                  ${escapeHTML(p.name)}
                </h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.75rem; text-transform: uppercase;">
                  ${escapeHTML(p.club)}
                </p>
                <div style="display: flex; justify-content: space-between; width: 100%; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: auto;">
                  <span style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-obsidian); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #000;">${escapeHTML(p.position)}</span>
                  <span style="font-size: 0.85rem; font-weight: 900; color: var(--accent);">${escapeHTML(p.market_value)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Hook search
    const searchInput = container.querySelector('#player-search');
    if (searchInput) {
      // Focus if it was focused before
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderView();
        
        // Restore focus
        const newSearchInput = container.querySelector('#player-search');
        if (newSearchInput) {
          newSearchInput.focus();
          // Maintain cursor position roughly at the end
          const val = newSearchInput.value;
          newSearchInput.value = '';
          newSearchInput.value = val;
        }
      });
    }

    // Hook Back Button
    const backBtn = container.querySelector('#btn-back-to-hub');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        callbacks.onNavigate('menu-liga');
      });
    }
  }

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  loadPlayers();
}
