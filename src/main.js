import './style.css';
import { supabase, isConfigured, clearSupabaseConfig } from './supabase';
import { checkAndNotifyNewUser } from './utils/email';
import { renderAuth } from './views/auth';
import { renderDashboard } from './views/dashboard';
import { renderRoulette } from './views/roulette';
import { renderChallenges } from './views/challenges';
import { renderMinigame } from './views/minigame';
import { renderBufon } from './views/bufon';
import { renderFeed } from './views/feed';

// Root elements
const app = document.querySelector('#app');

// State
let currentView = 'dashboard'; // 'dashboard', 'roulette', 'challenges', or 'auth'
let supportBubblePos = null; // { left, top }

// Dynamic Toast Helper
export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close">✕</button>
  `;

  container.appendChild(toast);

  // Close hook
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => toast.remove());

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

// Router and View Renderer
async function checkAuthAndRender() {
  let user = null;
  
  if (isConfigured) {
    try {
      const session = supabase.auth.session ? supabase.auth.session() : null;
      user = session?.user || (supabase.auth.getUser ? (await supabase.auth.getUser()).data?.user : null);
      if (user) {
        // Asynchronously check and notify if this is a new OAuth or email sign up
        checkAndNotifyNewUser(user).catch(err => {
          console.error("Error al verificar/enviar notificación de nuevo usuario:", err);
        });
      }
    } catch (err) {
      console.warn("Could not check Supabase session, running as guest", err);
    }
  }

  const isGuest = !user;

  renderMainLayout(isGuest);
}

function renderMainLayout(isGuest) {
  const activeFeatures = localStorage.getItem('CF_CURRENT_LEAGUE_FEATURES') || 'both';
  const notificationsCount = parseInt(localStorage.getItem('CF_COMMUNITY_NOTIFICATIONS_COUNT') || '0', 10);

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar de Navegación Lateral -->
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="logo gradient-text-green" style="cursor: pointer; display: flex; align-items: center; gap: 0.75rem;" id="logo-home">
            <img src="/logo.png" alt="CastigoFantasy Logo" style="width: 52px; height: 52px; border-radius: 10px; object-fit: cover; border: 1.5px solid var(--border-color-glow); box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.15);" />
            CastigoFantasy
          </div>
          <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Cerrar menú">✕</button>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" id="nav-dash-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"></path></svg>
            <span>Muro de la Vergüenza</span>
          </button>
          ${activeFeatures !== 'money' ? `
            <button class="nav-item ${currentView === 'roulette' ? 'active' : ''}" id="nav-wheel-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path><path d="m19.07 4.93-14.14 14.14"></path><path d="m4.93 4.93 14.14 14.14"></path></svg>
              <span>Ruleta de Castigos</span>
            </button>
          ` : ''}
          <button class="nav-item ${currentView === 'challenges' ? 'active' : ''}" id="nav-challenges-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
            <span>Reto Semanal</span>
          </button>
          <button class="nav-item ${currentView === 'bufon' ? 'active' : ''}" id="nav-bufon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M2 4 5 12h14l3-8-7 4-3-6-3 6-7-4z"></path><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7H5z"></path></svg>
            <span>El Bufón</span>
          </button>
          <button class="nav-item ${currentView === 'feed' ? 'active' : ''}" id="nav-feed-btn" style="position: relative; display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>Comunidad</span>
            </div>
            ${notificationsCount > 0 ? `
              <span class="notification-badge" style="
                background: var(--accent);
                color: #fff;
                font-size: 0.7rem;
                font-weight: 800;
                padding: 0.15rem 0.45rem;
                border-radius: 10px;
                line-height: 1;
                margin-left: auto;
                box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.4);
              ">+${notificationsCount}</span>
            ` : ''}
          </button>
          <button class="nav-item ${currentView === 'minigame' ? 'active' : ''}" id="nav-minigame-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="3"></rect></svg>
            <span>Adivinar Jugador</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <span style="font-weight: 700; color: var(--primary);">Ligas Fútbol Fantasy</span>
          <span class="sidebar-version">Versión 1.1.0</span>
        </div>
      </aside>

      <!-- Backdrop para Móvil -->
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

      <!-- Contenedor de Contenido Principal -->
      <div class="main-content">
        <!-- Cabecera Superior -->
        <header class="top-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="menu-toggle-btn" id="menu-toggle-btn" aria-label="Abrir menú">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div class="logo gradient-text-green" style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 700; user-select: none;" id="header-logo-home">
              <img src="/logo.png" alt="CastigoFantasy Logo" style="width: 32px; height: 32px; border-radius: 8px; border: 1.2px solid var(--border-color-glow);" />
              CastigoFantasy
            </div>
          </div>
          
          <div class="header-right">
            ${isGuest ? `
              <button class="nav-btn-guest" id="nav-login-btn" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Login / Register
              </button>
            ` : `
              <button class="header-action-btn" id="nav-reset-sb-btn" title="Ajustes de APIs" style="display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
              </button>
              <button class="header-action-btn btn-danger" id="nav-logout-btn" title="Cerrar Sesión" style="display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            `}
          </div>
        </header>

        <!-- Banner de Modo Demo -->
        ${isGuest ? `
          <div class="demo-banner">
            <strong>Modo Demo Activo:</strong> Estás probando la app en local sin cuenta. 
            <a href="#" id="banner-login-link">Registra tu Liga Real</a>
          </div>
        ` : ''}

        <!-- Contenedor de la Vista Activa -->
        <main id="view-container" class="container"></main>
      </div>

      <!-- Burbuja Flotante de Soporte -->
      <div id="draggable-support-bubble" class="support-bubble" title="Soporte y Ayuda">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
    </div>
  `;

  const viewContainer = app.querySelector('#view-container');
  const sidebar = app.querySelector('#app-sidebar');
  const backdrop = app.querySelector('#sidebar-backdrop');
  const menuToggle = app.querySelector('#menu-toggle-btn');
  const sidebarClose = app.querySelector('#sidebar-close-btn');

  // Funciones auxiliares para abrir/cerrar el sidebar en móvil
  const openSidebar = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('active');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
  };

  // Eventos del menú móvil
  if (menuToggle) menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Route Views
  if (currentView === 'auth') {
    renderAuth(viewContainer, {
      onAuthSuccess: () => navigate('dashboard'),
      showToast
    });
  } else if (currentView === 'dashboard') {
    renderDashboard(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'roulette') {
    renderRoulette(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'challenges') {
    renderChallenges(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'minigame') {
    renderMinigame(viewContainer, {
      showToast
    });
  } else if (currentView === 'bufon') {
    renderBufon(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'feed') {
    renderFeed(viewContainer, {
      showToast
    });
  }

  // Hook Navigation Elements (Cerrando el sidebar al hacer clic en móvil/escritorio)
  const homeBtn = app.querySelector('#logo-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('dashboard');
    });
  }
  
  const headerHomeBtn = app.querySelector('#header-logo-home');
  if (headerHomeBtn) {
    headerHomeBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('dashboard');
    });
  }
  app.querySelector('#nav-dash-btn').addEventListener('click', () => {
    closeSidebar();
    navigate('dashboard');
  });
  
  const wheelBtn = app.querySelector('#nav-wheel-btn');
  if (wheelBtn) {
    wheelBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('roulette');
    });
  }

  const challengesBtn = app.querySelector('#nav-challenges-btn');
  if (challengesBtn) {
    challengesBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('challenges');
    });
  }

  const minigameBtn = app.querySelector('#nav-minigame-btn');
  if (minigameBtn) {
    minigameBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('minigame');
    });
  }

  const bufonBtn = app.querySelector('#nav-bufon-btn');
  if (bufonBtn) {
    bufonBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('bufon');
    });
  }

  const feedBtn = app.querySelector('#nav-feed-btn');
  if (feedBtn) {
    feedBtn.addEventListener('click', () => {
      closeSidebar();
      localStorage.setItem('CF_COMMUNITY_NOTIFICATIONS_COUNT', '0');
      navigate('feed');
    });
  }
  
  if (isGuest) {
    app.querySelector('#nav-login-btn').addEventListener('click', () => {
      closeSidebar();
      navigate('auth');
    });
    const bannerLink = app.querySelector('#banner-login-link');
    if (bannerLink) {
      bannerLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        navigate('auth');
      });
    }
  } else {
    app.querySelector('#nav-logout-btn').addEventListener('click', handleLogout);
  }

  const settingsBtn = app.querySelector('#nav-reset-sb-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('auth');
    });
  }

  // Draggable Support Bubble Logic
  const bubble = app.querySelector('#draggable-support-bubble');
  if (bubble) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    // Apply or compute position
    if (supportBubblePos) {
      bubble.style.position = 'fixed';
      bubble.style.left = `${supportBubblePos.left}px`;
      bubble.style.top = `${supportBubblePos.top}px`;
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
    } else {
      // Default position: bottom-right
      const initLeft = window.innerWidth - 80;
      const initTop = window.innerHeight - 80;
      bubble.style.position = 'fixed';
      bubble.style.left = `${initLeft}px`;
      bubble.style.top = `${initTop}px`;
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
      supportBubblePos = { left: initLeft, top: initTop };
    }

    const onStart = (clientX, clientY) => {
      isDragging = true;
      bubble.classList.add('dragging');
      startX = clientX;
      startY = clientY;
      initialLeft = parseFloat(bubble.style.left) || 0;
      initialTop = parseFloat(bubble.style.top) || 0;
      hasMoved = false;
    };

    const onMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
      }
      
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Keep within bounds
      const minX = 10;
      const maxX = window.innerWidth - bubble.offsetWidth - 10;
      const minY = 10;
      const maxY = window.innerHeight - bubble.offsetHeight - 10;

      newLeft = Math.max(minX, Math.min(newLeft, maxX));
      newTop = Math.max(minY, Math.min(newTop, maxY));

      bubble.style.left = `${newLeft}px`;
      bubble.style.top = `${newTop}px`;
      
      // Persist globally
      supportBubblePos = { left: newLeft, top: newTop };
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      bubble.classList.remove('dragging');
      if (!hasMoved) {
        // Open support modal
        showSupportModal();
      }
    };

    const onMouseMove = (e) => {
      onMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      onEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      onEnd();
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    // Attach drag triggers
    bubble.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    bubble.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
      }
    }, { passive: true });
  }
}

function navigate(view) {
  currentView = view;
  checkAuthAndRender();
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast('Sesión cerrada correctamente', 'success');
    navigate('dashboard');
  } catch (err) {
    console.error(err);
    showToast('Error al cerrar sesión', 'error');
  }
}

// Listen for Auth Session changes
if (isConfigured) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      checkAuthAndRender();
    } else if (event === 'SIGNED_OUT') {
      navigate('dashboard');
    }
  });
}

// Listen for notifications updates
window.addEventListener('cf-notification-update', () => {
  checkAuthAndRender();
});

// Start App
checkAuthAndRender();

// Support Modal Functionality
function showSupportModal() {
  let modal = document.querySelector('#support-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'support-modal';
  modal.className = 'modal-overlay active';
  
  let userEmail = '';
  const storedUser = localStorage.getItem('sb-giieisavasjbijnvpsnw-auth-token');
  if (storedUser) {
    try {
      userEmail = JSON.parse(storedUser)?.user?.email || '';
    } catch {}
  }

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 500px; animation: slideDown 0.3s ease-out;">
      <div class="modal-header">
        <h3 class="gradient-text-green" style="font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; gap: 0.5rem; color: var(--primary);">
          📬 Soporte Técnico
        </h3>
        <button class="modal-close" id="close-support-btn">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
          ¿Tienes alguna sugerencia, duda o problema con CastigoFantasy? Rellena el formulario o utiliza nuestro correo oficial. Responderemos a tu consulta en un plazo de 24 a 48 horas.
        </p>

        <form id="support-form" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label for="support-email" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; text-transform: uppercase;">Tu Correo Electrónico</label>
            <input type="email" id="support-email" class="input-field" placeholder="ejemplo@correo.com" value="${userEmail}" required style="padding: 0.65rem 0.85rem;" />
          </div>
          
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label for="support-subject" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; text-transform: uppercase;">Asunto</label>
            <input type="text" id="support-subject" class="input-field" placeholder="Ej: Problema con la ruleta, Sugerencia de reto..." required style="padding: 0.65rem 0.85rem;" />
          </div>

          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label for="support-message" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; text-transform: uppercase;">Mensaje / Consulta</label>
            <textarea id="support-message" class="input-field" rows="4" placeholder="Escribe aquí los detalles de tu consulta..." required style="resize: none; font-family: var(--font-sans); padding: 0.65rem 0.85rem;"></textarea>
          </div>

          <button type="submit" class="btn-primary" style="font-weight: 700; padding: 0.7rem; font-size: 0.95rem;">
            Enviar Consulta
          </button>
        </form>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">O escríbenos directamente a:</span>
          <div style="display: flex; gap: 0.5rem; width: 100%;">
            <input type="text" readonly class="input-field" value="soporte@castigosfantasy.com" style="text-align: center; font-weight: 700; background: rgba(0,0,0,0.15); padding: 0.5rem;" />
            <button id="copy-support-email-btn" class="btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; white-space: nowrap;">
              Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close actions
  const closeBtn = modal.querySelector('#close-support-btn');
  closeBtn.addEventListener('click', () => modal.remove());

  // Form submit
  const form = modal.querySelector('#support-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Mensaje enviado con éxito. Responderemos a tu correo lo antes posible.', 'success');
    modal.remove();
  });

  // Copy email action
  const copyBtn = modal.querySelector('#copy-support-email-btn');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('soporte@castigosfantasy.com')
      .then(() => showToast('Correo de soporte copiado al portapapeles', 'success'))
      .catch(() => showToast('Error al copiar el correo', 'error'));
  });
}

