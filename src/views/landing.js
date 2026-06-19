/**
 * Renders the stunning, modern Landing/Home Page.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 */
export function renderLanding(container, callbacks) {
  // Check active features from localStorage (same as main.js)
  const activeFeatures = localStorage.getItem('CF_CURRENT_LEAGUE_FEATURES') || 'both';

  // Define the pages data
  const sections = [
    {
      id: 'dashboard',
      title: 'Muro de la Vergüenza',
      description: 'Clasificación de deudas, deudas perdonadas y pagadas. Registra deudas e inmortaliza los castigos en el historial.',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"></path></svg>`,
      badge: 'Liga',
      colorClass: 'color-dashboard'
    },
    ...(activeFeatures !== 'money' ? [{
      id: 'roulette',
      title: 'Ruleta de Castigos',
      description: 'El azar decide tu destino. Haz girar la ruleta de la muerte para asignar un castigo aleatorio al perdedor de la jornada.',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path><path d="m19.07 4.93-14.14 14.14"></path><path d="m4.93 4.93 14.14 14.14"></path></svg>`,
      badge: 'Azar',
      colorClass: 'color-roulette'
    }] : []),
    {
      id: 'challenges',
      title: 'Reto Semanal',
      description: 'Ver los retos activos de la semana, votar nuevas propuestas y evitar quedar en la cola para no ser castigado.',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
      badge: 'Retos',
      colorClass: 'color-challenges'
    },
    {
      id: 'bufon',
      title: 'El Bufón de la Corte',
      description: 'La comunidad manda. Propón castigos locos y graciosos para tus amigos, vota las ideas y condena al peor jugador.',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4 5 12h14l3-8-7 4-3-6-3 6-7-4z"></path><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7H5z"></path></svg>`,
      badge: 'Votaciones',
      colorClass: 'color-bufon'
    },
    {
      id: 'minigame',
      title: 'Adivinar Jugador',
      description: 'Ponte a prueba en el Wordle diario de fútbol. Tienes 6 intentos para adivinar el jugador misterioso de LaLiga.',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="3"></rect></svg>`,
      badge: 'Diario',
      colorClass: 'color-minigame'
    }
  ];

  // Render HTML structure
  container.innerHTML = `
    <div class="landing-container fade-in-up">
      <!-- Hero Section -->
      <section class="landing-hero glass">
        <div class="hero-badge">🏆 Temporada 2026 Activa</div>
        <h1 class="hero-title">
          Donde el fútbol fantasy se paga con <span class="gradient-text-green">Honor</span> (o Vergüenza)
        </h1>
        <p class="hero-subtitle">
          Administra los castigos de tu comunidad, gira la ruleta de la muerte, vota por el Bufón del grupo y demuestra tus conocimientos futbolísticos diarios.
        </p>
        <div class="hero-actions">
          <button class="btn-primary hero-btn-main" id="hero-go-dash">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"></path></svg>
            Ver Clasificación
          </button>
          ${activeFeatures !== 'money' ? `
            <button class="btn-secondary hero-btn-sec" id="hero-go-wheel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path><path d="m19.07 4.93-14.14 14.14"></path><path d="m4.93 4.93 14.14 14.14"></path></svg>
              Girar Ruleta
            </button>
          ` : ''}
        </div>
      </section>

      <!-- Section Title -->
      <div class="landing-section-header">
        <h2 class="landing-section-title">🔮 Explora las Secciones</h2>
        <p class="landing-section-desc">Selecciona una tarjeta para empezar a jugar o gestionar tu liga.</p>
      </div>

      <!-- Feature Cards Grid -->
      <div class="features-grid">
        ${sections.map(sec => `
          <div class="feature-card glass cursor-pointer" data-view-id="${sec.id}">
            <div class="feature-icon-wrapper ${sec.colorClass}">
              ${sec.icon}
            </div>
            <div class="feature-content">
              <div class="feature-title-row">
                <h3 class="feature-card-title">${sec.title}</h3>
                <span class="feature-badge">${sec.badge}</span>
              </div>
              <p class="feature-card-desc">${sec.description}</p>
              <div class="feature-action-indicator">
                <span>Entrar</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Footer Info -->
      <div class="landing-footer glass">
        <p>⚡ Diseñado para llevar la competitividad de Comunio, Futmondo, Biwenger y Fantasy Marca al siguiente nivel.</p>
      </div>
    </div>
  `;

  // Attach Event Listeners
  const cardElements = container.querySelectorAll('.feature-card');
  cardElements.forEach(card => {
    card.addEventListener('click', () => {
      const viewId = card.dataset.viewId;
      if (callbacks.onNavigate) {
        callbacks.onNavigate(viewId);
      }
    });
  });

  const dashBtn = container.querySelector('#hero-go-dash');
  if (dashBtn) {
    dashBtn.addEventListener('click', () => {
      if (callbacks.onNavigate) {
        callbacks.onNavigate('dashboard');
      }
    });
  }

  const wheelBtn = container.querySelector('#hero-go-wheel');
  if (wheelBtn) {
    wheelBtn.addEventListener('click', () => {
      if (callbacks.onNavigate) {
        callbacks.onNavigate('roulette');
      }
    });
  }
}
