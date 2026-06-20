import { supabase } from '../supabase';
import { openLeagueSettings } from '../utils/league-options';
import { openBiwengerSyncModal } from '../utils/biwenger-sync-modal';
import { openBiwengerLinkModal } from '../utils/biwenger-link-modal';

export async function renderLeagueHub(container, callbacks) {
  const isGuest = callbacks.isGuest;

  if (isGuest) {
    callbacks.onNavigate('acceso');
    return;
  }

  const leagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  const leagueName = localStorage.getItem('CF_ACTIVE_LEAGUE_NAME') || 'Mi Liga';

  if (!leagueId) {
    callbacks.showToast('Selecciona una liga primero', 'info');
    callbacks.onNavigate('mis-ligas');
    return;
  }

  let currentUserId = null;
  try {
    currentUserId = supabase.auth.user
      ? supabase.auth.user()?.id
      : (await supabase.auth.getUser()).data?.user?.id;
  } catch (_) {}

  let isAdmin = false;
  try {
    const { data: myMembership } = await supabase
      .from('league_members')
      .select('is_admin')
      .eq('league_id', leagueId)
      .eq('profile_id', currentUserId)
      .maybeSingle();
    isAdmin = !!myMembership?.is_admin;
  } catch (_) {}

  let league = null;
  try {
    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .maybeSingle();
    league = leagueData;
  } catch (_) {}

  container.innerHTML = `
    <div class="container fade-in-up" style="max-width: 700px;">

      <!-- Header compacto -->
      <div class="hub-header">
        <div>
          <span class="hub-header-label">Liga Activa</span>
          <h1 class="gradient-text-green hub-header-title">${leagueName}</h1>
        </div>
        <div class="hub-header-actions">
          <button id="btn-league-settings-hub" class="btn-select-league is-active hub-header-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M4.93 4.93a10 10 0 0 0 0 14.14"></path></svg>
            Opciones
          </button>
          <button id="btn-back-to-selector" class="btn-select-league hub-header-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Mis Ligas
          </button>
        </div>
      </div>

      <!-- Accesos -->
      <div class="hub-section-label">
        <span class="hub-dot"></span>Accesos
      </div>
      <div class="hub-actions-list">

        <button class="hub-action-row" id="card-go-dashboard">
          <div class="hub-action-row-left">
            <div class="hub-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div>
              <span class="hub-card-badge classification" style="margin-bottom:0.2rem;display:inline-block;">Clasificacion</span>
              <div class="hub-action-title">Lista de Morosos</div>
            </div>
          </div>
          <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>

        <button class="hub-action-row" id="card-go-roulette">
          <div class="hub-action-row-left">
            <div class="hub-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
            </div>
            <div>
              <span class="hub-card-badge roulette" style="margin-bottom:0.2rem;display:inline-block;">Castigos</span>
              <div class="hub-action-title">Ruleta de Castigos</div>
            </div>
          </div>
          <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>

        <button class="hub-action-row" id="card-go-bufon">
          <div class="hub-action-row-left">
            <div class="hub-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10s2.5-3 5-3 5 3 5 3V14s-2.5 3-5 3-5-3-5-3z"></path><path d="M12 10s2.5-3 5-3 5 3 5 3V14s-2.5 3-5 3-5-3-5-3z"></path></svg>
            </div>
            <div>
              <span class="hub-card-badge bufon" style="margin-bottom:0.2rem;display:inline-block;">Votacion</span>
              <div class="hub-action-title">El Bufon</div>
            </div>
          </div>
          <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>

        <!-- Participantes: abre modal -->
        <button class="hub-action-row" id="card-go-members">
          <div class="hub-action-row-left">
            <div class="hub-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <span class="hub-card-badge" style="margin-bottom:0.2rem;display:inline-block;background:transparent;border:1.5px solid var(--border-color);color:var(--text-muted);font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;padding:0.15rem 0.45rem;border-radius:3px;">Liga</span>
              <div class="hub-action-title">Participantes</div>
            </div>
          </div>
          <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>

        <!-- Sincronización Biwenger -->
        ${league && league.sync_source === 'biwenger' ? `
          <button class="hub-action-row" id="card-go-biwenger-sync" style="border: 2px solid var(--accent); background: rgba(222, 237, 0, 0.03);">
            <div class="hub-action-row-left">
              <div class="hub-action-icon" style="color: var(--accent);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              </div>
              <div>
                <span class="hub-card-badge roulette" style="background: var(--accent); color: #000000; margin-bottom:0.2rem;display:inline-block;">Biwenger</span>
                <div class="hub-action-title">Sincronizar Liga</div>
              </div>
            </div>
            <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>

          <button class="hub-action-row" id="card-go-biwenger-link" style="border: 1px solid var(--border-color); background: rgba(255,255,255,0.01);">
            <div class="hub-action-row-left">
              <div class="hub-action-icon" style="color: var(--accent-gold);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <div>
                <span class="hub-card-badge roulette" style="background: var(--accent-gold); color: #000000; margin-bottom:0.2rem;display:inline-block;">Cuenta</span>
                <div class="hub-action-title">Vincular Biwenger</div>
              </div>
            </div>
            <svg class="hub-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        ` : ''}

      </div>
    </div>
  `;

  // Navigation
  container.querySelector('#card-go-dashboard')?.addEventListener('click', () => callbacks.onNavigate('muro'));
  container.querySelector('#card-go-roulette')?.addEventListener('click', () => callbacks.onNavigate('ruleta'));
  container.querySelector('#card-go-bufon')?.addEventListener('click', () => callbacks.onNavigate('bufon'));
  container.querySelector('#btn-back-to-selector')?.addEventListener('click', () => callbacks.onNavigate('mis-ligas'));
  container.querySelector('#btn-league-settings-hub')?.addEventListener('click', () => openLeagueSettings(leagueId, callbacks));

  // Participantes modal
  container.querySelector('#card-go-members')?.addEventListener('click', () => {
    openMembersModal(leagueId, currentUserId, isAdmin);
  });

  // Biwenger Sync Modal
  container.querySelector('#card-go-biwenger-sync')?.addEventListener('click', () => {
    openBiwengerSyncModal(leagueId, league, isAdmin, callbacks);
  });

  // Biwenger Link Modal
  container.querySelector('#card-go-biwenger-link')?.addEventListener('click', () => {
    openBiwengerLinkModal(leagueId, currentUserId, callbacks, () => {
      callbacks.onNavigate('menu-liga');
    });
  });
}

async function openMembersModal(leagueId, currentUserId, isAdmin) {
  const existing = document.querySelector('#members-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'members-modal';
  modal.className = 'modal-overlay active';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 440px; width: 90%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(222,237,0,0.1);">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem;">
        <h3 style="font-family: var(--font-display); font-weight: 900; font-size: 1.1rem; text-transform: uppercase; margin: 0; color: var(--text-light); display: flex; align-items: center; gap: 0.5rem;">
          <span class="hub-dot"></span>
          Participantes
        </h3>
        <button id="close-members-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">&#x2715;</button>
      </div>
      <div id="members-modal-body" style="padding: 0; max-height: 70vh; overflow-y: auto;">
        <div style="padding: 2rem; text-align: center;">
          <span class="spinner" style="width:32px;height:32px;margin:0 auto;display:block;"></span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#close-members-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Load members
  try {
    const { data: membersData } = await supabase
      .from('league_members')
      .select('profile_id, is_admin, profiles(apodo, display_name)')
      .eq('league_id', leagueId);

    const members = (membersData || []).map(m => ({
      profile_id: m.profile_id,
      is_admin: m.is_admin,
      name: m.profiles?.apodo || m.profiles?.display_name || 'Entrenador'
    }));

    const body = modal.querySelector('#members-modal-body');
    body.innerHTML = members.length === 0
      ? `<p style="padding:1.25rem 1.5rem;color:var(--text-muted);font-size:0.85rem;">No hay participantes.</p>`
      : members.map(member => `
          <div class="member-row" data-member-id="${member.profile_id}">
            <div class="member-row-left">
              <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
              <div>
                <div class="member-name">${member.name}</div>
                ${member.is_admin
                  ? `<span class="member-badge admin">Admin</span>`
                  : `<span class="member-badge member">Miembro</span>`
                }
              </div>
            </div>
            ${isAdmin && member.profile_id !== currentUserId ? `
              <button class="btn-kick-member" data-member-id="${member.profile_id}" data-member-name="${member.name}" title="Expulsar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="23" y1="18" x2="17" y2="18"></line></svg>
                <span>Expulsar</span>
              </button>
            ` : ''}
          </div>
        `).join('');

    // Update title with count
    modal.querySelector('h3').innerHTML = `<span class="hub-dot"></span> Participantes (${members.length})`;

    // Kick buttons
    if (isAdmin) {
      body.querySelectorAll('.btn-kick-member').forEach(btn => {
        btn.addEventListener('click', async () => {
          const memberId = btn.dataset.memberId;
          const memberName = btn.dataset.memberName;
          if (!confirm(`Expulsar a "${memberName}" de la liga?`)) return;

          btn.disabled = true;
          btn.innerHTML = '<span class="spinner" style="width:13px;height:13px;"></span>';

          try {
            const { error } = await supabase
              .from('league_members')
              .delete()
              .eq('league_id', leagueId)
              .eq('profile_id', memberId);

            if (error) throw error;

            const row = body.querySelector(`.member-row[data-member-id="${memberId}"]`);
            if (row) {
              row.style.transition = 'opacity 0.25s, transform 0.25s';
              row.style.opacity = '0';
              row.style.transform = 'translateX(20px)';
              setTimeout(() => {
                row.remove();
                const remaining = body.querySelectorAll('.member-row').length;
                modal.querySelector('h3').innerHTML = `<span class="hub-dot"></span> Participantes (${remaining})`;
              }, 270);
            }
          } catch (err) {
            console.error(err);
            btn.disabled = false;
            btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="23" y1="18" x2="17" y2="18"></line></svg><span>Error</span>';
          }
        });
      });
    }

  } catch (err) {
    console.error(err);
    modal.querySelector('#members-modal-body').innerHTML =
      `<p style="padding:1.25rem 1.5rem;color:var(--danger);font-size:0.85rem;">Error al cargar participantes.</p>`;
  }
}
