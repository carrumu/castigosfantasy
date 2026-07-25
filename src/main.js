import './style.css';
import { supabase, isConfigured, clearSupabaseConfig } from './supabase';
import { setSEO } from './utils/seo';
import { checkAndNotifyNewUser } from './utils/email';
import { renderAuth } from './views/auth';
import { renderDashboard } from './views/dashboard';
import { renderRoulette } from './views/roulette';
import { renderChallenges } from './views/challenges';
import { renderMinigame } from './views/minigame';
import { renderJuegos } from './views/juegos';
import { renderBufon } from './views/bufon';
import { renderLanding } from './views/landing';
import { renderSelectLeague } from './views/select-league';
import { renderLeagueHub } from './views/league-hub';
import { renderGenerator } from './views/generator';
import { renderComunidad } from './views/comunidad';
import { renderForo } from './views/foro';
import { renderHerramientas } from './views/herramientas';
import { renderTop10 } from './views/top10';
import { renderDuelo } from './views/duelo';
import { renderMuro } from './views/muro';
import { renderPlayersHub } from './views/players_hub';
import { renderLegal } from './views/legal';
import { renderSeoHome, removeFaqSchema } from './views/seo-home';
import { renderAbout, renderContacto } from './views/about';
import { renderGuias, getGuideBySlug } from './views/guias';

// Initialize Theme (Force Dark Mode)
document.body.classList.remove('light-theme');
localStorage.removeItem('CF_THEME');

// Root elements
const app = document.querySelector('#app');

// State
let currentView = 'inicio'; // 'inicio', 'muro', 'ruleta', 'retos', or 'acceso'
let currentGuideSlug = null; // slug del artículo cuando la ruta es /guias/<slug>
let preAuthView = 'mis-ligas'; // view to return to once login/signup from 'acceso' succeeds
let supportBubblePos = null; // { left, top }

// Dynamic Toast Helper
export function showToast(message, type = 'info') {
  // Disabled globally per user request
  return;
}

// Router and View Renderer
async function checkAuthAndRender() {
  let user = null;
  
  if (isConfigured) {
    try {
      const session = supabase.auth.session ? supabase.auth.session() : null;
      user = session?.user || (supabase.auth.getUser ? (await supabase.auth.getUser()).data?.user : null);
      if (user) {
        try {
          const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle();
          if (profile) {
            user.is_superadmin = !!profile.is_superadmin;
          }
        } catch (err) {
          console.warn('Could not fetch superadmin status:', err);
        }

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
    handleRouting();
    return;
  }

  renderMainLayout(isGuest, user);
}

function renderMainLayout(isGuest, currentUser = null) {
  app.innerHTML = `
    <div class="app-layout">
      <!-- Contenedor de Contenido Principal -->
      <div class="main-content">
        <!-- Cabecera Superior -->
        <header class="top-header">
          <div class="header-left" style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="logo text-primary" style="cursor: pointer; user-select: none; font-family: var(--font-display); font-weight: 900; font-size: 1.3rem;" id="header-logo-home">
              CASTIGOS FANTASY
            </div>
          </div>
          
          <!-- Enlaces de navegación en cabecera (Escritorio).
               El <nav> se mantiene siempre (aunque vacío) para conservar las 3
               columnas del grid del header. Al visitante sin registrar no le
               mostramos los destinos de la app: compiten con "Crea tu liga". -->
          <nav class="header-nav">
            ${isGuest ? '' : `
            <button class="header-nav-link ${currentView === 'inicio' ? 'active' : ''}" data-nav="inicio">INICIO</button>
            <button class="header-nav-link ${currentView === 'herramientas' || currentView === 'ruleta' || currentView === 'generador' ? 'active' : ''}" data-nav="herramientas">SALA VAR</button>
            <button class="header-nav-link ${currentView === 'retos' ? 'active' : ''}" data-nav="retos">RETOS</button>
            <button class="header-nav-link ${currentView === 'comunidad' || currentView === 'bufon' || currentView === 'foro' ? 'active' : ''}" data-nav="comunidad">COMUNIDAD</button>
            <button class="header-nav-link ${currentView === 'juegos' || currentView === 'adivina-jugador' || currentView === 'top-10' || currentView === 'duelo' ? 'active' : ''}" data-nav="juegos">JUEGOS</button>
            <button class="header-nav-link ${currentView === 'mis-ligas' ? 'active' : ''}" data-nav="mis-ligas">MIS LIGAS</button>
            `}
          </nav>

          <div class="header-right">
            ${isGuest ? `
              <button class="nav-btn-guest" id="nav-create-btn" title="Crea tu liga gratis">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span class="nav-btn-text">CREA TU LIGA</span>
              </button>
              <button class="nav-btn-ghost" id="nav-login-btn" title="Iniciar Sesión">
                <span class="nav-btn-ghost-text">Entrar</span>
              </button>
            ` : `
              <button class="btn-profile-header" id="nav-profile-btn" title="Mi Perfil">
                <svg class="btn-profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>
                </svg>
                <span class="btn-profile-label">MI PERFIL</span>
              </button>
            `}
          </div>
        </header>

        <!-- Contenedor de la Vista Activa -->
        <main id="view-container" class="container"></main>

        <!-- Pie de página con enlaces legales (visible en todas las vistas) -->
        <footer class="site-footer" style="border-top: 1px solid var(--border-color); margin-top: 2rem; padding: 1.5rem 1rem ${isGuest ? '1.5rem' : 'calc(1.5rem + 70px)'}; text-align: center; color: var(--text-muted); font-size: 0.78rem; line-height: 1.6;">
          <!-- Redes sociales: enlaces externos a Instagram y TikTok (nueva pestaña). -->
          <div class="footer-social" style="display: flex; justify-content: center; gap: 0.85rem; margin-bottom: 1rem;">
            <a class="footer-social-link" href="https://www.instagram.com/castigosfantasyy.__/" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a class="footer-social-link" href="https://www.tiktok.com/@castigosfantasy255" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en TikTok" title="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.11v12.63a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.36-2.47V9.4a5.7 5.7 0 0 0-.77-.05A5.72 5.72 0 0 0 4.14 15.07a5.72 5.72 0 0 0 11.44 0V8.9a7.33 7.33 0 0 0 4.29 1.37V7.16a4.28 4.28 0 0 1-3.27-1.34z"></path>
              </svg>
            </a>
          </div>
          <div style="margin-bottom: 0.5rem;">© 2026 CastigosFantasy · Ligas de fútbol fantasy entre amigos</div>
          <div style="display: flex; gap: 0.4rem 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 0.4rem;">
            <a class="legal-link" data-page="sobre-nosotros" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Sobre nosotros</a>
            <span aria-hidden="true">·</span>
            <a class="legal-link" data-page="guias" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Guías</a>
            <span aria-hidden="true">·</span>
            <a class="legal-link" data-page="contacto" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Contacto</a>
          </div>
          <div style="display: flex; gap: 0.4rem 1rem; flex-wrap: wrap; justify-content: center;">
            <a class="legal-link" data-page="privacidad" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Política de Privacidad</a>
            <span aria-hidden="true">·</span>
            <a class="legal-link" data-page="cookies" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Política de Cookies</a>
            <span aria-hidden="true">·</span>
            <a class="legal-link" data-page="terminos" style="color: var(--text-muted); cursor: pointer; font-weight: 600;">Términos y Condiciones</a>
          </div>
        </footer>
      </div>

      <!-- Navegación Inferior para Móvil.
           Solo para usuarios logueados: el visitante sin registrar no la ve,
           así la home no compite con el único objetivo (crear liga). -->
      ${isGuest ? '' : `
      <nav class="mobile-bottom-nav">
        <!-- 1. Panel -->
        <button class="mobile-nav-item mobile-nav-main mobile-nav-panel ${currentView === 'inicio' ? 'active' : ''}" data-nav="inicio" title="Panel principal">
          <span class="material-symbols-outlined">grid_view</span>
          <span class="mobile-nav-label">PANEL</span>
        </button>
        <!-- 2. Comunidad -->
        <button class="mobile-nav-item ${currentView === 'comunidad' || currentView === 'bufon' || currentView === 'foro' ? 'active' : ''}" data-nav="comunidad" title="Comunidad">
          <span class="material-symbols-outlined">groups</span>
          <span class="mobile-nav-label">COMUNIDAD</span>
        </button>
        <!-- 3. Ligas (Destacado) -->
        <button class="mobile-nav-item mobile-nav-main mobile-nav-ligas ${currentView === 'mis-ligas' || currentView === 'menu-liga' || currentView === 'muro' ? 'active' : ''}" data-nav="mis-ligas" title="Mis ligas">
          <span class="material-symbols-outlined">shield</span>
          <span class="mobile-nav-label">LIGAS</span>
        </button>
        <!-- 4. Sala VAR -->
        <button class="mobile-nav-item ${currentView === 'herramientas' || currentView === 'ruleta' || currentView === 'generador' ? 'active' : ''}" data-nav="herramientas" title="Sala VAR">
          <span class="material-symbols-outlined">casino</span>
          <span class="mobile-nav-label">VAR</span>
        </button>
        <!-- 5. Juegos -->
        <button class="mobile-nav-item ${currentView === 'juegos' || currentView === 'adivina-jugador' || currentView === 'top-10' || currentView === 'duelo' ? 'active' : ''}" data-nav="juegos" title="Juegos interactivos">
          <span class="material-symbols-outlined">sports_esports</span>
          <span class="mobile-nav-label">JUEGOS</span>
        </button>
        <!-- 6. Retos -->
        <button class="mobile-nav-item ${currentView === 'retos' ? 'active' : ''}" data-nav="retos" title="Reto semanal">
          <span class="material-symbols-outlined">emoji_events</span>
          <span class="mobile-nav-label">RETOS</span>
        </button>
      </nav>
      `}

    </div>
  `;

  const viewContainer = app.querySelector('#view-container');
  if (currentView === 'inicio') {
    viewContainer.className = 'container-brutalist';
  } else {
    viewContainer.className = 'container';
  }
  // Route Views
  // The FAQ structured data only belongs on the SEO home; clear it on every
  // route change and let renderSeoHome re-inject it when appropriate.
  removeFaqSchema();
  if (currentView === 'inicio') {
    if (currentUser) {
      // Logged-in users get the app landing.
      renderLanding(viewContainer, {
        onNavigate: navigate,
        showToast
      });
    } else {
      // Non-registered visitors get the SEO content page.
      renderSeoHome(viewContainer, {
        onNavigate: navigate
      });
    }
  } else if (currentView === 'acceso') {
    renderAuth(viewContainer, {
      onAuthSuccess: () => navigate(preAuthView),
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
  } else if (currentView === 'herramientas') {
    renderHerramientas(viewContainer, {
      onNavigate: navigate
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
  } else if (currentView === 'juegos') {
    renderJuegos(viewContainer, {
      onNavigate: navigate
    });
  } else if (currentView === 'adivina-jugador') {
    renderMinigame(viewContainer, {
      showToast
    });
  } else if (currentView === 'top-10') {
    renderTop10(viewContainer, {
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'duelo') {
    renderDuelo(viewContainer, {
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'jugadores') {
    renderPlayersHub(viewContainer, {
      onNavigate: navigate,
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
  } else if (currentView === 'comunidad') {
    renderComunidad(viewContainer, {
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'foro') {
    renderForo(viewContainer, {
      isGuest,
      currentUser: currentUser,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'muro-verguenza') {
    renderMuro(viewContainer, {
      isGuest,
      onNavigate: navigate,
      showToast
    });
  } else if (currentView === 'privacidad' || currentView === 'cookies' || currentView === 'terminos') {
    renderLegal(viewContainer, {
      page: currentView,
      onNavigate: navigate
    });
  } else if (currentView === 'sobre-nosotros') {
    renderAbout(viewContainer, { onNavigate: navigate });
  } else if (currentView === 'contacto') {
    renderContacto(viewContainer, { onNavigate: navigate });
  } else if (currentView === 'guias') {
    renderGuias(viewContainer, { onNavigate: navigate, slug: currentGuideSlug });
  }

  // Hook Navigation Elements
  const headerHomeBtn = app.querySelector('#header-logo-home');
  if (headerHomeBtn) {
    headerHomeBtn.addEventListener('click', () => {
      navigate('inicio');
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

  // Bind Mobile Bottom Navigation Links
  const mobileNavLinks = app.querySelectorAll('.mobile-nav-item');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.nav;
      navigate(view);
    });
  });
  
  if (isGuest) {
    app.querySelector('#nav-login-btn').addEventListener('click', () => {
      navigate('acceso');
    });
    app.querySelector('#nav-create-btn')?.addEventListener('click', () => {
      navigate('acceso');
    });
    const bannerLink = app.querySelector('#banner-login-link');
    if (bannerLink) {
      bannerLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('acceso');
      });
    }
  } else {
    const profileBtn = app.querySelector('#nav-profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => openProfileModal(currentUser));
    }
  }

  app.querySelectorAll('.legal-link').forEach(link => {
    link.addEventListener('click', () => {
      navigate(link.dataset.page);
    });
  });


}

function navigate(view) {
  const newPath = view === 'inicio' ? '/' : '/' + view;
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

async function openProfileModal(user) {
  // Remove any existing modal
  const existing = document.querySelector('#profile-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.className = 'modal-overlay active';

  const email = user?.email || '';
  // Try to load apodo from profiles table
  let currentApodo = user?.user_metadata?.apodo || email.split('@')[0];

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 420px; width: 90%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(222,237,0,0.15);">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow);">
        <h3 class="gradient-text-gold" style="font-weight: 900; font-size: 1.35rem; font-family: var(--font-display); margin: 0;">Mi Perfil</h3>
        <button class="modal-close" id="close-profile-modal" style="font-size: 1.2rem; background: none; border: none; color: var(--text-light); cursor: pointer;">✕</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem;">
        <!-- Info del usuario -->
        <div style="background: rgba(222,237,0,0.04); border: 1.5px solid var(--border-color-glow); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
          <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Correo electrónico</span>
          <p style="margin: 0.25rem 0 0; font-size: 0.95rem; font-weight: 700; color: var(--text-light);">${email}</p>
        </div>

        <!-- Cambiar Apodo -->
        <form id="profile-apodo-form">
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label for="profile-apodo-input" style="color: var(--text-light); font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">Apodo / Nombre de entrenador</label>
            <input
              type="text"
              id="profile-apodo-input"
              class="input-field"
              value="${currentApodo}"
              maxlength="30"
              placeholder="Tu apodo en la app"
              style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;"
            />
          </div>
          <button type="submit" id="btn-save-apodo" class="btn-select-league is-active" style="width: 100%; padding: 0.7rem; font-weight: 900; text-transform: uppercase; font-size: 0.85rem; box-shadow: 3px 3px 0px #000; cursor: pointer;">
            Guardar Apodo
          </button>
        </form>

        <!-- Cerrar Sesión -->
        <div style="border-top: 1px dashed var(--border-color-glow); padding-top: 1.25rem; margin-top: 1.5rem;">
          <button id="btn-profile-logout" class="btn-league-danger-solid" style="width: 100%; padding: 0.7rem; font-weight: 900; text-transform: uppercase; font-family: var(--font-display); cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#close-profile-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Load real apodo from Supabase profiles table
  try {
    if (user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('apodo')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.apodo) {
        modal.querySelector('#profile-apodo-input').value = data.apodo;
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar el apodo del perfil:', err);
  }

  // Save apodo form
  modal.querySelector('#profile-apodo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = modal.querySelector('#btn-save-apodo');
    const newApodo = modal.querySelector('#profile-apodo-input').value.trim();
    if (!newApodo) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span>';

    try {
      // Update apodo column in profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ apodo: newApodo })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      // Also update user_metadata apodo key
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { apodo: newApodo }
      });
      if (metaErr) console.warn('No se pudo actualizar metadata:', metaErr);

      saveBtn.innerHTML = '✓ Guardado';
      saveBtn.style.background = '#10b981';
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Guardar Apodo';
        saveBtn.style.background = '';
      }, 2000);
    } catch (err) {
      console.error(err);
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Error al guardar';
      saveBtn.style.background = 'var(--danger)';
      setTimeout(() => {
        saveBtn.innerHTML = 'Guardar Apodo';
        saveBtn.style.background = '';
      }, 2000);
    }
  });

  // Logout button
  modal.querySelector('#btn-profile-logout').addEventListener('click', async () => {
    closeModal();
    await handleLogout();
  });
}

// Listen for Auth Session changes
if (isConfigured) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      showUpdatePasswordModal();
    } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      checkAuthAndRender();
    }
  });
}

function showUpdatePasswordModal() {
  const existing = document.querySelector('#update-password-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'update-password-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 400px; padding: 2rem; border: 2px solid var(--primary); box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.2);">
      <h2 class="gradient-text-green" style="font-family: var(--font-display); text-transform: uppercase; margin-bottom: 1rem; text-align: center;">Nueva Contraseña</h2>
      <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 1.5rem;">Por favor, ingresa tu nueva contraseña para acceder a la liga.</p>
      <form id="update-password-form">
        <div class="form-group">
          <label for="new-password">Nueva Contraseña</label>
          <input type="password" id="new-password" class="input-field" placeholder="Mínimo 6 caracteres" required minlength="6" />
        </div>
        <button type="submit" class="btn-primary" id="update-password-btn" style="margin-top: 1rem; width: 100%;">
          <span>Actualizar Contraseña</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#update-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#update-password-btn');
    const newPassword = modal.querySelector('#new-password').value;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      showToast('Contraseña actualizada con éxito. ¡Bienvenido de nuevo!', 'success');
      modal.remove();
      navigate('inicio');
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al actualizar la contraseña.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Actualizar Contraseña</span>';
    }
  });
}

// Route parsing on load/change
function handleRouting() {
  const path = window.location.pathname;
  let view = 'inicio';
  
  const parts = path.split('/').filter(p => p && p !== 'index.html');
  if (parts.length > 0) {
    view = parts[0];
  }

  // Fallback to home for unknown routes so the view never renders blank.
  const KNOWN_VIEWS = [
    'inicio', 'acceso', 'mis-ligas', 'menu-liga', 'muro', 'muro-verguenza',
    'herramientas', 'ruleta', 'retos', 'juegos', 'adivina-jugador', 'top-10',
    'duelo', 'jugadores', 'bufon', 'generador', 'comunidad', 'foro',
    'privacidad', 'cookies', 'terminos',
    'sobre-nosotros', 'contacto', 'guias'
  ];
  if (!KNOWN_VIEWS.includes(view)) {
    view = 'inicio';
  }

  // Segundo segmento de la ruta: solo lo usamos para las guías (/guias/<slug>).
  // Si el slug no corresponde a ninguna guía, caemos al índice del hub.
  let guide = null;
  if (view === 'guias' && parts[1]) {
    guide = getGuideBySlug(parts[1]);
  }
  currentGuideSlug = guide ? guide.id : null;

  // Remember where the user was before landing on the login/signup screen,
  // so a successful login returns them there instead of always to 'mis-ligas'.
  if (view === 'acceso' && currentView !== 'acceso') {
    preAuthView = currentView;
  }

  currentView = view;
  // SEO por artículo: cada guía tiene su propio título, meta y canonical.
  if (guide) {
    setSEO('guias', {
      title: `${guide.title} | CastigosFantasy`,
      description: guide.description,
      path: `guias/${guide.id}`
    });
  } else {
    setSEO(currentView);
  }
  checkAuthAndRender();
}

window.addEventListener('popstate', handleRouting);

// Start App: trigger routing on initial load
handleRouting();

// --- Cookie consent + consent-gated advertising ---
const COOKIE_CONSENT_KEY = 'CF_COOKIE_CONSENT';
const ADSENSE_CLIENT = 'ca-pub-7549006958989496';

function loadAdSense() {
  if (document.querySelector('script[data-adsense]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  s.crossOrigin = 'anonymous';
  s.setAttribute('data-adsense', 'true');
  document.head.appendChild(s);
}

function initCookieConsent() {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent === 'accepted') {
    loadAdSense();
    return;
  }
  if (consent === 'rejected') return;

  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.style.cssText = `
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 10000;
    background: #101010; border-top: 2px solid var(--accent, #deed00);
    padding: 1rem 1.25rem; display: flex; flex-wrap: wrap; align-items: center;
    justify-content: center; gap: 0.85rem 1.25rem; box-shadow: 0 -6px 24px rgba(0,0,0,0.5);
  `;
  banner.innerHTML = `
    <p style="margin:0;font-size:0.82rem;line-height:1.45;color:#e8e8e8;max-width:620px;flex:1;min-width:240px;">
      Usamos cookies técnicas necesarias y, con tu permiso, cookies de terceros
      (Google) para publicidad. Consulta la
      <a href="/cookies" id="cookie-policy-link" style="color:var(--accent,#deed00);font-weight:700;">Política de Cookies</a>.
    </p>
    <div style="display:flex;gap:0.5rem;flex-shrink:0;">
      <button id="cookie-reject" style="
        background:none;color:#cfcfcf;border:1px solid #444;border-radius:6px;
        padding:0.55rem 1rem;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;">Rechazar</button>
      <button id="cookie-accept" style="
        background:var(--accent,#deed00);color:#000;border:2px solid #000;border-radius:6px;
        padding:0.55rem 1.25rem;font-size:0.8rem;font-weight:800;cursor:pointer;white-space:nowrap;">Aceptar</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('#cookie-policy-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('cookies');
  });
  banner.querySelector('#cookie-accept').addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    banner.remove();
    loadAdSense();
  });
  banner.querySelector('#cookie-reject').addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    banner.remove();
  });
}

initCookieConsent();

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
          Soporte Técnico
        </h3>
        <button class="modal-close" id="close-support-btn">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
          ¿Tienes alguna sugerencia, duda o problema con CastigosFantasy? Rellena el formulario o utiliza nuestro correo oficial. Responderemos a tu consulta en un plazo de 24 a 48 horas.
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

