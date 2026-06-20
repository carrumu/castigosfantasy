import './style.css';
import { supabase, isConfigured, clearSupabaseConfig } from './supabase';
import { checkAndNotifyNewUser } from './utils/email';
import { renderAuth } from './views/auth';
import { renderDashboard } from './views/dashboard';
import { renderRoulette } from './views/roulette';
import { renderChallenges } from './views/challenges';
import { renderMinigame } from './views/minigame';
import { renderBufon } from './views/bufon';
import { renderLanding } from './views/landing';
import { renderSelectLeague } from './views/select-league';
import { renderLeagueHub } from './views/league-hub';
import { renderGenerator } from './views/generator';

// Initialize Theme
const savedTheme = localStorage.getItem('CF_THEME') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
} else {
  document.body.classList.remove('light-theme');
}

// Root elements
const app = document.querySelector('#app');

// State
let currentView = 'inicio'; // 'inicio', 'muro', 'ruleta', 'retos', or 'acceso'
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

  // Route Guard: restrict private views to authenticated users
  const privateViews = ['muro', 'mis-ligas', 'menu-liga'];
  if (isGuest && privateViews.includes(currentView)) {
    history.replaceState({}, '', '/acceso');
    showToast('Debes iniciar sesión para acceder a esta sección', 'warning');
    handleRouting();
    return;
  }

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
          <div class="logo gradient-text-green" style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;" id="logo-home">
            <span class="logo-icon" style="width: 50px; height: 36px; flex-shrink: 0;"></span>
            CastigoFantasy
          </div>
          <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Cerrar menú">✕</button>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item ${currentView === 'inicio' ? 'active' : ''}" id="nav-landing-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Inicio</span>
          </button>
          ${!isGuest ? `
            <button class="nav-item ${currentView === 'mis-ligas' ? 'active' : ''}" id="nav-select-league-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Mis Ligas</span>
            </button>
          ` : ''}

          <button class="nav-item ${currentView === 'ruleta' ? 'active' : ''}" id="nav-wheel-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
            <span>Ruleta</span>
          </button>

          <button class="nav-item ${currentView === 'retos' ? 'active' : ''}" id="nav-challenges-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
              <path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path>
              <path d="M13 19 19 13"></path>
              <path d="m16 16 4 4"></path>
              <path d="m19 21 2-2"></path>
              <path d="M14.5 6.5 21 13v3h-3L6.5 14.5"></path>
              <path d="M13 5 19 11"></path>
              <path d="m8 16-4 4"></path>
              <path d="m5 21 2-2"></path>
            </svg>
            <span>Reto Semanal</span>
          </button>
          <button class="nav-item ${currentView === 'bufon' ? 'active' : ''}" id="nav-bufon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
              <path d="M2 10s2.5-3 5-3 5 3 5 3V14s-2.5 3-5 3-5-3-5-3z"></path>
              <path d="M12 10s2.5-3 5-3 5 3 5 3V14s-2.5 3-5 3-5-3-5-3z"></path>
              <path d="M5 10c.5 0 1-.5 1-1"></path>
              <path d="M8 10c-.5 0-1-.5-1-1"></path>
              <path d="M5 12s1.5 1.5 3 0"></path>
              <path d="M15 10c.5 0 1-.5 1-1"></path>
              <path d="M18 10c-.5 0-1-.5-1-1"></path>
              <path d="M15 12s1.5 1.5 3 0"></path>
            </svg>
            <span>El Bufón</span>
          </button>
          <button class="nav-item ${currentView === 'minijuego' ? 'active' : ''}" id="nav-minigame-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="3"></rect></svg>
            <span>Adivinar Jugador</span>
          </button>
          <button class="nav-item ${currentView === 'generador' ? 'active' : ''}" id="nav-generator-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"></path>
            </svg>
            <span>Generador</span>
          </button>
        </nav>

        <div class="sidebar-footer" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div class="footer-widgets" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
            <!-- Theme Toggle on the Left -->
            <label class="switch-theme" title="Cambiar Tema (Día/Noche)">
              <input type="checkbox" id="theme-toggle-checkbox" ${document.body.classList.contains('light-theme') ? 'checked' : ''}>
              <span class="slider-theme"></span>
            </label>
            
            <!-- Social Icons on the Right -->
            <div class="social-icons" style="display: flex; gap: 0.75rem; align-items: center;">
              <a href="#" class="social-link" title="Twitter / X" style="color: var(--text-muted); transition: var(--transition-fast); display: flex; align-items: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" class="social-link" title="Instagram" style="color: var(--text-muted); transition: var(--transition-fast); display: flex; align-items: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" class="social-link" title="TikTok" style="color: var(--text-muted); transition: var(--transition-fast); display: flex; align-items: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
            </div>
          </div>
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
          <div class="header-left" style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="menu-toggle-btn" id="menu-toggle-btn" aria-label="Abrir menú">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div class="logo text-primary" style="cursor: pointer; user-select: none; font-family: var(--font-display); font-weight: 900; font-size: 1.3rem;" id="header-logo-home">
              CASTIGO FANTASY
            </div>
          </div>
          
          <!-- Enlaces de navegación en cabecera (Escritorio) -->
          <nav class="header-nav">
            <button class="header-nav-link ${currentView === 'inicio' ? 'active' : ''}" data-nav="inicio">INICIO</button>
            ${!isGuest ? `<button class="header-nav-link ${currentView === 'mis-ligas' ? 'active' : ''}" data-nav="mis-ligas">MIS LIGAS</button>` : ''}
            <button class="header-nav-link ${currentView === 'muro' ? 'active' : ''}" data-nav="muro">MURO</button>
            <button class="header-nav-link ${currentView === 'ruleta' ? 'active' : ''}" data-nav="ruleta">RULETA</button>
            <button class="header-nav-link ${currentView === 'retos' ? 'active' : ''}" data-nav="retos">RETOS</button>
            <button class="header-nav-link ${currentView === 'minijuego' ? 'active' : ''}" data-nav="minijuego">JUEGO</button>
          </nav>
          
          <div class="header-right">
            ${isGuest ? `
              <button class="nav-btn-guest" id="nav-login-btn" title="Login / Registro">
                LOGIN / REGISTER
              </button>
            ` : `
              <button class="header-action-btn btn-danger" id="nav-logout-btn" title="Cerrar Sesión">
                LOGOUT
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
  if (currentView === 'inicio') {
    viewContainer.className = 'container-brutalist';
  } else {
    viewContainer.className = 'container';
  }
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
  if (currentView === 'inicio') {
    renderLanding(viewContainer, {
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'acceso') {
    renderAuth(viewContainer, {
      onAuthSuccess: () => navigate('mis-ligas'),
      showToast
    });
  } else if (currentView === 'mis-ligas') {
    renderSelectLeague(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'menu-liga') {
    renderLeagueHub(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'muro') {
    renderDashboard(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'ruleta') {
    renderRoulette(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'retos') {
    renderChallenges(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'minijuego') {
    renderMinigame(viewContainer, {
      showToast
    });
  } else if (currentView === 'bufon') {
    renderBufon(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'generador') {
    renderGenerator(viewContainer, {
      onNavigate: navigate,
      showToast
    });
  }

  // Hook Navigation Elements (Cerrando el sidebar al hacer clic en móvil/escritorio)
  const homeBtn = app.querySelector('#logo-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      navigate('inicio');
    });
  }
  
  const headerHomeBtn = app.querySelector('#header-logo-home');
  if (headerHomeBtn) {
    headerHomeBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('inicio');
    });
  }

  const landingBtn = app.querySelector('#nav-landing-btn');
  if (landingBtn) {
    landingBtn.addEventListener('click', () => {
      navigate('inicio');
    });
  }

  const selectLeagueBtn = app.querySelector('#nav-select-league-btn');
  if (selectLeagueBtn) {
    selectLeagueBtn.addEventListener('click', () => {
      navigate('mis-ligas');
    });
  }

  const dashBtn = app.querySelector('#nav-dash-btn');
  if (dashBtn) {
    dashBtn.addEventListener('click', () => {
      navigate('muro');
    });
  }
  
  const wheelBtn = app.querySelector('#nav-wheel-btn');
  if (wheelBtn) {
    wheelBtn.addEventListener('click', () => {
      navigate('ruleta');
    });
  }

  const challengesBtn = app.querySelector('#nav-challenges-btn');
  if (challengesBtn) {
    challengesBtn.addEventListener('click', () => {
      navigate('retos');
    });
  }

  const minigameBtn = app.querySelector('#nav-minigame-btn');
  if (minigameBtn) {
    minigameBtn.addEventListener('click', () => {
      navigate('minijuego');
    });
  }

  const bufonBtn = app.querySelector('#nav-bufon-btn');
  if (bufonBtn) {
    bufonBtn.addEventListener('click', () => {
      navigate('bufon');
    });
  }

  const generatorBtn = app.querySelector('#nav-generator-btn');
  if (generatorBtn) {
    generatorBtn.addEventListener('click', () => {
      navigate('generador');
    });
  }
  
  // Bind Header Navigation Links (Desktop)
  const headerLinks = app.querySelectorAll('.header-nav-link');
  headerLinks.forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.nav;
      navigate(view);
    });
  });
  
  if (isGuest) {
    app.querySelector('#nav-login-btn').addEventListener('click', () => {
      closeSidebar();
      navigate('acceso');
    });
    const bannerLink = app.querySelector('#banner-login-link');
    if (bannerLink) {
      bannerLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        navigate('acceso');
      });
    }
  } else {
    app.querySelector('#nav-logout-btn').addEventListener('click', handleLogout);
  }

  const settingsBtn = app.querySelector('#nav-reset-sb-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      closeSidebar();
      navigate('acceso');
    });
  }

  // Theme toggle switch listener
  const themeToggle = app.querySelector('#theme-toggle-checkbox');
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('CF_THEME', 'light');
      } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('CF_THEME', 'dark');
      }
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
  const newPath = '/' + view;
  if (window.location.pathname !== newPath) {
    history.pushState({}, '', newPath);
  }
  handleRouting();
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast('Sesión cerrada correctamente', 'success');
    navigate('inicio');
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
      navigate('inicio');
    }
  });
}

// Listen for notifications updates
window.addEventListener('cf-notification-update', () => {
  checkAuthAndRender();
});

// Route parsing on load/change
function handleRouting() {
  const path = window.location.pathname;
  const view = path.replace(/^\//, '') || 'inicio';
  currentView = view;
  checkAuthAndRender();
}

window.addEventListener('popstate', handleRouting);

// Start App: trigger routing on initial load
if (window.location.pathname === '/') {
  history.replaceState({}, '', '/inicio');
  handleRouting();
} else {
  handleRouting();
}

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

