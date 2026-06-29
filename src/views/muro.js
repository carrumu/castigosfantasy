import { supabase } from '../supabase';

/**
 * Renders the "Muro de la Vergüenza" (Wall of Shame) audit log view.
 * Displays which league members accepted or rejected generated punishments.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 * @param {boolean} callbacks.isGuest
 */
export function renderMuro(container, callbacks) {
  const isGuest = callbacks.isGuest;
  const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID') || 'default';
  
  let events = [];
  let cowardsRanking = [];
  let isLoading = true;

  async function loadEvents() {
    isLoading = true;
    renderView();

    if (isGuest || activeLeagueId === 'default') {
      // Local Guest fallback
      events = [
        { id: '1', punishment_name: "La Camiseta de la Vergüenza", status: 'rechazado', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), profiles: { apodo: "Paco G." } },
        { id: '2', punishment_name: "El Mayordomo del Grupo", status: 'aceptado', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), profiles: { apodo: "Álvaro M." } },
        { id: '3', punishment_name: "El Comentarista Pelma", status: 'rechazado', created_at: new Date(Date.now() - 3600000 * 48).toISOString(), profiles: { apodo: "Santi K." } }
      ];
      calculateRanking();
      isLoading = false;
      renderView();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('punishment_events')
        .select('id, punishment_name, status, created_at, profiles(apodo, display_name)')
        .eq('league_id', activeLeagueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      events = data || [];
      calculateRanking();
    } catch (e) {
      console.error('Error fetching punishment events:', e);
    } finally {
      isLoading = false;
      renderView();
    }
  }

  function calculateRanking() {
    const counts = {};
    events.forEach(ev => {
      if (ev.status === 'rechazado') {
        const name = ev.profiles?.apodo || ev.profiles?.display_name || 'Desconocido';
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    cowardsRanking = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  function renderView() {
    if (isLoading) {
      container.innerHTML = `
        <div class="container fade-in-up" style="max-width: 500px; margin: 0 auto; text-align: center; padding: 4rem 1rem;">
          <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 3rem 2rem;">
            <div class="loading-spinner" style="border: 4px solid rgba(255,255,255,0.1); border-left-color: var(--accent); border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
            <h2 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.75rem;">
              Cargando Historial
            </h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin: 0;">
              Conectando con Supabase para obtener el Muro de la Vergüenza...
            </p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container fade-in-up">
        <!-- Header -->
        <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <button id="btn-back-to-comunidad" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--text-light); border: 2px solid var(--border-color); box-shadow: 2px 2px 0 #000;" title="Volver">
            <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
          </button>
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); font-family: var(--font-display);">Historial de Cobardes</span>
            <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0;">
              Muro de la Vergüenza
            </h1>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start;">
          
          <!-- Cowards Leaderboard Card -->
          <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem;">
            <h2 style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.5rem;">
              Ranking de Cobardes
            </h2>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Los entrenadores que más veces han rechazado los castigos generados por el sistema.
            </p>

            ${cowardsRanking.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 1rem 0;">
                Ningún entrenador ha rechazado castigos todavía. Honor y gloria.
              </p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${cowardsRanking.map((c, idx) => {
                  let badgeBg = '#444';
                  let badgeColor = '#fff';
                  if (idx === 0) {
                    badgeBg = 'var(--danger)';
                    badgeColor = '#fff';
                  } else if (idx === 1) {
                    badgeBg = 'var(--accent)';
                    badgeColor = '#000';
                  }
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15); padding: 0.75rem 1rem; border-radius: 6px; border: 1.5px solid var(--border-color);">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-weight: 900; color: var(--text-muted); width: 20px;">#${idx + 1}</span>
                        <span style="font-weight: 700; color: var(--text-light);">${c.name}</span>
                      </div>
                      <span style="font-size: 0.7rem; font-weight: 800; background: ${badgeBg}; color: ${badgeColor}; padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid #000; text-transform: uppercase;">
                        ${c.count} rechazo${c.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Audit Log Feed Card -->
          <div style="background: var(--bg-card); border: 3px solid #000; box-shadow: 6px 6px 0 #000; border-radius: 8px; padding: 1.5rem;">
            <h2 style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.5rem;">
              Auditoria de Sentencias
            </h2>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Historial de resoluciones de castigos en tiempo real.
            </p>

            ${events.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 2rem 0;">
                No hay registros de castigos en esta liga.
              </p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${events.map(ev => {
                  const name = ev.profiles?.apodo || ev.profiles?.display_name || 'Desconocido';
                  const dateStr = new Date(ev.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                  
                  const isAccepted = ev.status === 'aceptado';
                  const statusLabel = isAccepted ? 'Acepto' : 'Rechazo';
                  const statusBg = isAccepted ? 'rgba(222, 237, 0, 0.1)' : 'rgba(211, 0, 23, 0.1)';
                  const statusColor = isAccepted ? 'var(--accent)' : 'var(--danger)';
                  const statusBorder = isAccepted ? 'var(--accent)' : 'var(--danger)';

                  return `
                    <div style="background: ${statusBg}; border: 1.5px solid ${statusBorder}; padding: 0.85rem 1rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-weight: 800; font-size: 0.9rem; color: var(--text-light);">${name}</span>
                        <span style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: ${statusColor}; border: 1px solid ${statusBorder}; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(0,0,0,0.1);">
                          ${statusLabel}
                        </span>
                      </div>
                      <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.4; margin: 0;">
                        Castigo: <span style="font-weight: 700;">${ev.punishment_name}</span>
                      </p>
                      <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 500;">
                        Fecha: ${dateStr}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

        </div>
      </div>
    `;

    container.querySelector('#btn-back-to-comunidad').addEventListener('click', () => {
      callbacks.onNavigate('comunidad');
    });
  }

  loadEvents();
}
