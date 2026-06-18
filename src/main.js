import './style.css';
import { supabase, isConfigured, clearSupabaseConfig } from './supabase';
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
    } catch (err) {
      console.warn("Could not check Supabase session, running as guest", err);
    }
  }

  const isGuest = !user;

  renderMainLayout(isGuest);
}

function renderMainLayout(isGuest) {
  const activeFeatures = localStorage.getItem('CF_CURRENT_LEAGUE_FEATURES') || 'both';

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar de Navegación Lateral -->
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="logo gradient-text-green" style="cursor: pointer; display: flex; align-items: center; gap: 0.75rem;" id="logo-home">
            <img src="/logo.png" alt="CastigoFantasy Logo" style="width: 52px; height: 52px; border-radius: 10px; object-fit: cover; border: 1.5px solid var(--border-color-glow); box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);" />
            CastigoFantasy
          </div>
          <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Cerrar menú">✕</button>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" id="nav-dash-btn">
            <span>🏆</span>
            <span>Muro de la Vergüenza</span>
          </button>
          ${activeFeatures !== 'money' ? `
            <button class="nav-item ${currentView === 'roulette' ? 'active' : ''}" id="nav-wheel-btn">
              <span>🎡</span>
              <span>Ruleta de Castigos</span>
            </button>
          ` : ''}
          <button class="nav-item ${currentView === 'challenges' ? 'active' : ''}" id="nav-challenges-btn">
            <span>🔥</span>
            <span>Reto Semanal</span>
          </button>
          <button class="nav-item ${currentView === 'minigame' ? 'active' : ''}" id="nav-minigame-btn">
            <span>🎮</span>
            <span>Adivinar Jugador</span>
          </button>
          <button class="nav-item ${currentView === 'bufon' ? 'active' : ''}" id="nav-bufon-btn">
            <span>🤡</span>
            <span>El Bufón</span>
          </button>
          <button class="nav-item ${currentView === 'feed' ? 'active' : ''}" id="nav-feed-btn">
            <span>📸</span>
            <span>Comunidad</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <span style="font-weight: 700; color: var(--primary-green);">Ligas Fútbol Fantasy</span>
          <span class="sidebar-version">Versión 1.1.0</span>
        </div>
      </aside>

      <!-- Backdrop para Móvil -->
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

      <!-- Contenedor de Contenido Principal -->
      <div class="main-content">
        <!-- Cabecera Superior -->
        <header class="top-header">
          <button class="menu-toggle-btn" id="menu-toggle-btn" aria-label="Abrir menú">☰</button>
          
          <div class="header-right">
            ${isGuest ? `
              <button class="header-action-btn" id="nav-reset-sb-btn" title="Ajustes de APIs" style="margin-right: 0.25rem;">
                ⚙️
              </button>
              <button class="nav-btn-guest" id="nav-login-btn">
                👤 Entrar / Registro
              </button>
            ` : `
              <button class="header-action-btn" id="nav-reset-sb-btn" title="Ajustes de APIs">
                ⚙️ Ajustes
              </button>
              <button class="header-action-btn btn-danger" id="nav-logout-btn" title="Cerrar Sesión">
                Salir ✕
              </button>
            `}
          </div>
        </header>

        <!-- Banner de Modo Demo -->
        ${isGuest ? `
          <div class="demo-banner">
            🎮 <strong>Modo Demo Activo:</strong> Estás probando la app en local sin cuenta. 
            <a href="#" id="banner-login-link">Registra tu Liga Real</a>
          </div>
        ` : ''}

        <!-- Contenedor de la Vista Activa -->
        <main id="view-container" class="container"></main>
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
      showToast
    });
  } else if (currentView === 'feed') {
    renderFeed(viewContainer, {
      showToast
    });
  }

  // Hook Navigation Elements (Cerrando el sidebar al hacer clic en móvil)
  app.querySelector('#logo-home').addEventListener('click', () => {
    closeSidebar();
    navigate('dashboard');
  });
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

// Start App
checkAuthAndRender();
