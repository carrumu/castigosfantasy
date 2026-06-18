/**
 * Renders the Community Feed / Forum view (📸 Comunidad).
 * Users can share links to their Instagram/TikTok/YouTube completed punishments,
 * view other users' submissions, search/filter, and click "Me Gusta".
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.showToast 
 */
export function renderFeed(container, callbacks) {
  const showToast = callbacks.showToast;

  // Initial Mock Feed Data representing premium-looking posts
  const DEFAULT_FEED = [
    {
      id: "feed-mock-1",
      nickname: "Paco G.",
      league: "Liga de los Vagos",
      platform: "tiktok",
      url: "https://www.tiktok.com/@biwenger/video/123456789",
      description: "¡Cumpliendo el castigo de la jornada 12! Me tocó ir al supermercado vestido de dinosaurio inflable a comprar pepinillos y cantando el himno de la Champions League. ¡Cumplido! 🦖🥬",
      likes: 24,
      createdAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString() // 1.5 days ago
    },
    {
      id: "feed-mock-2",
      nickname: "Santi K.",
      league: "Liga Astures",
      platform: "instagram",
      url: "https://www.instagram.com/p/C_abc123/",
      description: "Cena de la liga pagada íntegramente por mí por quedar último... y encima obligado a llevar la camiseta del máximo rival firmada por todos y servirles las copas como si fuera el camarero oficial. Risas aseguradas 😂👕🍷",
      likes: 42,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3.2).toISOString() // 3.2 days ago
    },
    {
      id: "feed-mock-3",
      nickname: "Marta R.",
      league: "Liga Super Mánagers",
      platform: "instagram",
      url: "https://www.instagram.com/p/C_xyz789/",
      description: "Subiendo el vídeo cantando el himno del Sevilla FC a capela en el vagón de metro de Madrid con el megáfono que me compraron. ¡Qué vergüenza pasé por Dios! Nunca más confío en mis delanteros. 🚇🎤😅",
      likes: 53,
      createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString() // 6 days ago
    },
    {
      id: "feed-mock-4",
      nickname: "Álvaro M.",
      league: "Liga La Pachanga",
      platform: "tiktok",
      url: "https://www.tiktok.com/@laliga/video/987654321",
      description: "¡Castigo pagado! 1 hora completa transmitiendo en directo en TikTok vestido con equipación de árbitro profesional, silbato en mano, y sacándole tarjetas amarillas y rojas a mi gato cada vez que maullaba. 🐱🟥🟨",
      likes: 31,
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
    }
  ];

  // Load posts from localStorage or initialize defaults
  let posts = JSON.parse(localStorage.getItem('CF_COMMUNITY_FEED') || 'null');
  if (!posts) {
    posts = DEFAULT_FEED;
    localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
  }

  // Helper to retrieve liked posts
  function getLikedPosts() {
    return JSON.parse(localStorage.getItem('CF_LIKED_POSTS') || '[]');
  }

  // Helper to save liked posts
  function saveLikedPosts(likedIds) {
    localStorage.setItem('CF_LIKED_POSTS', JSON.stringify(likedIds));
  }

  // Pre-fill active demo league details if available
  const activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID');
  const activeDemoName = activeDemoId ? (localStorage.getItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`) || "Mi Liga Demo") : "";

  // State
  let searchQuery = "";
  let isFormExpanded = false;

  function renderView() {
    // Filter posts
    const filteredPosts = posts.filter(post => {
      const q = searchQuery.toLowerCase();
      return (
        post.nickname.toLowerCase().includes(q) ||
        post.league.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.platform.toLowerCase().includes(q)
      );
    });

    const likedIds = getLikedPosts();

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 2rem; text-align: center;">
          <h1 class="gradient-text-green" style="font-size: 1.85rem; font-weight: 900; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            📸 Comunidad de Castigos
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">
            ¡La diversión de las ligas fantasy! Descubre cómo pagan sus castigos los mánagers de toda España. Dale me gusta a las mejores humillaciones y comparte la tuya.
          </p>
        </div>

        <!-- Acciones Principales (Buscador y botón de compartir) -->
        <div class="feed-controls" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="position: relative; flex-grow: 1; min-width: 280px;">
            <input type="text" id="feed-search" class="input-field" placeholder="🔍 Buscar por usuario, liga o castigo..." value="${searchQuery}" style="margin-bottom: 0; padding-left: 2.5rem;" />
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted);"></span>
          </div>

          <button id="toggle-form-btn" class="btn-primary" style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            ${isFormExpanded ? '✕ Cerrar Formulario' : '📢 Compartir mi Castigo'}
          </button>
        </div>

        <!-- Formulario para compartir un nuevo castigo (Cajón Desplegable) -->
        <div id="new-post-card" class="card glass shadow-lg" style="margin-bottom: 2rem; display: ${isFormExpanded ? 'block' : 'none'}; border-color: var(--primary-green-glow); animation: slideDown 0.3s ease-out;">
          <h2 class="card-title gradient-text-gold" style="font-size: 1.25rem; margin-bottom: 0.25rem;">📢 Comparte tu Castigo Cumplido</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            ¿Has subido tu castigo a tus redes? Introduce el enlace para que el resto de usuarios de CastigoFantasy puedan verlo y darte su 'Me Gusta'.
          </p>
          
          <div class="alert-info-banner" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.8rem; color: var(--text-light); line-height: 1.4;">
            🔒 <strong>Política de Seguridad:</strong> Por seguridad y control de contenidos sensibles, <strong>no se admite la red Twitter/X</strong>. Solo permitimos enlaces públicos procedentes de <strong>Instagram</strong>, <strong>TikTok</strong> y <strong>YouTube</strong>.
          </div>

          <form id="add-feed-form">
            <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-row" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="feed-nickname">👤 Tu Apodo / Nombre</label>
                  <input type="text" id="feed-nickname" class="input-field" placeholder="Ej: Paco G." required />
                </div>
                <div class="form-group">
                  <label for="feed-league">🏆 Nombre de tu Liga</label>
                  <input type="text" id="feed-league" class="input-field" placeholder="Ej: Liga Los Vagos" value="${activeDemoName}" required />
                </div>
              </div>

              <div class="form-row" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="feed-platform">📱 Plataforma de Publicación</label>
                  <select id="feed-platform" class="input-field">
                    <option value="instagram">📸 Instagram</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="youtube">🎥 YouTube / Shorts</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="feed-url">🔗 Enlace de la Publicación (URL)</label>
                  <input type="url" id="feed-url" class="input-field" placeholder="https://www.instagram.com/p/..." required />
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label for="feed-description">📝 Descripción / ¿Qué castigo cumpliste?</label>
              <textarea id="feed-description" class="input-field" rows="3" placeholder="Ej: Fui al mercado en taparrabos cantando ópera por quedar último en la jornada de Biwenger..." required style="resize: vertical; min-height: 80px;"></textarea>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button type="button" id="cancel-form-btn" class="btn-secondary" style="padding: 0.6rem 1.25rem;">Cancelar</button>
              <button type="submit" class="btn-primary" style="padding: 0.6rem 1.75rem;">Publicar en el Muro</button>
            </div>
          </form>
        </div>

        <!-- Muro de Posts -->
        <div id="posts-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          ${filteredPosts.length === 0 ? `
            <div class="card glass text-center" style="padding: 3rem 1rem;">
              <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">🔍</span>
              <h3 style="font-weight: 700; margin-bottom: 0.5rem;">No se encontraron castigos</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Prueba a buscar con otros términos o sé el primero en compartir tu vídeo.</p>
            </div>
          ` : filteredPosts.map(post => {
            const isLiked = likedIds.includes(post.id);
            const timeAgo = formatTimeAgo(post.createdAt || new Date().toISOString(), post.id);

            // Icon markup for platforms
            let platformBadge = '';
            if (post.platform === 'instagram') {
              platformBadge = `<span class="platform-badge ig-badge">📸 Instagram</span>`;
            } else if (post.platform === 'tiktok') {
              platformBadge = `<span class="platform-badge tt-badge">🎵 TikTok</span>`;
            } else if (post.platform === 'youtube') {
              platformBadge = `<span class="platform-badge yt-badge">🎥 YouTube</span>`;
            }

            return `
              <div class="card glass feed-card" data-id="${post.id}" style="margin: 0; padding: 1.5rem; transition: transform var(--transition-normal), border-color var(--transition-normal); border: 1px solid var(--border-color); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                  <div>
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-light); margin-bottom: 0.15rem; display: flex; align-items: center; gap: 0.5rem;">
                      ${escapeHTML(post.nickname)}
                      <span style="font-size: 0.8rem; font-weight: 400; color: var(--accent-gold); background: rgba(245, 158, 11, 0.08); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2);">
                        ${escapeHTML(post.league)}
                      </span>
                    </h3>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo}</div>
                  </div>
                  <div>
                    ${platformBadge}
                  </div>
                </div>

                <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-light); margin-bottom: 1.25rem; white-space: pre-wrap;">${escapeHTML(post.description)}</p>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap;">
                  <button class="btn-like-post ${isLiked ? 'liked' : ''}" data-id="${post.id}" style="
                    background: transparent;
                    border: none;
                    color: ${isLiked ? 'var(--danger)' : 'var(--text-muted)'};
                    font-family: var(--font-sans);
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s;
                  ">
                    <span class="heart-icon" style="font-size: 1.25rem; display: inline-block; transition: transform 0.2s;">
                      ${isLiked ? '❤️' : '🤍'}
                    </span>
                    <span class="likes-count" style="color: ${isLiked ? 'var(--text-light)' : 'var(--text-muted)'};">${post.likes}</span> Me Gusta
                  </button>

                  <a href="${escapeHTML(post.url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="
                    padding: 0.45rem 1rem; 
                    font-size: 0.8rem; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.35rem; 
                    margin: 0;
                    text-decoration: none;
                    border-color: rgba(255, 255, 255, 0.1);
                  ">
                    Ver Castigo ↗
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Hook search bar
    const searchInput = container.querySelector('#feed-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        // Re-render only feed list without rebuilding outer container structure if possible,
        // or simple complete re-render (since it is fast and preserves search cursor focus if handled nicely)
        // To preserve focus, we don't blur the input.
        const postsContainer = container.querySelector('#posts-grid');
        if (postsContainer) {
          const likedIds = getLikedPosts();
          const filtered = posts.filter(post => {
            const q = searchQuery.toLowerCase();
            return (
              post.nickname.toLowerCase().includes(q) ||
              post.league.toLowerCase().includes(q) ||
              post.description.toLowerCase().includes(q) ||
              post.platform.toLowerCase().includes(q)
            );
          });
          
          if (filtered.length === 0) {
            postsContainer.innerHTML = `
              <div class="card glass text-center" style="padding: 3rem 1rem; grid-column: 1 / -1;">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">🔍</span>
                <h3 style="font-weight: 700; margin-bottom: 0.5rem;">No se encontraron castigos</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem;">Prueba a buscar con otros términos o sé el primero en compartir tu vídeo.</p>
              </div>
            `;
          } else {
            postsContainer.innerHTML = filtered.map(post => {
              const isLiked = likedIds.includes(post.id);
              const timeAgo = formatTimeAgo(post.createdAt || new Date().toISOString(), post.id);
              let platformBadge = '';
              if (post.platform === 'instagram') {
                platformBadge = `<span class="platform-badge ig-badge">📸 Instagram</span>`;
              } else if (post.platform === 'tiktok') {
                platformBadge = `<span class="platform-badge tt-badge">🎵 TikTok</span>`;
              } else if (post.platform === 'youtube') {
                platformBadge = `<span class="platform-badge yt-badge">🎥 YouTube</span>`;
              }

              return `
                <div class="card glass feed-card" data-id="${post.id}" style="margin: 0; padding: 1.5rem; transition: transform var(--transition-normal), border-color var(--transition-normal); border: 1px solid var(--border-color); border-radius: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                    <div>
                      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-light); margin-bottom: 0.15rem; display: flex; align-items: center; gap: 0.5rem;">
                        ${escapeHTML(post.nickname)}
                        <span style="font-size: 0.8rem; font-weight: 400; color: var(--accent-gold); background: rgba(245, 158, 11, 0.08); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2);">
                          ${escapeHTML(post.league)}
                        </span>
                      </h3>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo}</div>
                    </div>
                    <div>
                      ${platformBadge}
                    </div>
                  </div>

                  <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-light); margin-bottom: 1.25rem; white-space: pre-wrap;">${escapeHTML(post.description)}</p>

                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap;">
                    <button class="btn-like-post ${isLiked ? 'liked' : ''}" data-id="${post.id}" style="
                      background: transparent;
                      border: none;
                      color: ${isLiked ? 'var(--danger)' : 'var(--text-muted)'};
                      font-family: var(--font-sans);
                      font-weight: 700;
                      font-size: 0.9rem;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      padding: 0.5rem 0.75rem;
                      border-radius: 8px;
                      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s;
                    ">
                      <span class="heart-icon" style="font-size: 1.25rem; display: inline-block; transition: transform 0.2s;">
                        ${isLiked ? '❤️' : '🤍'}
                      </span>
                      <span class="likes-count" style="color: ${isLiked ? 'var(--text-light)' : 'var(--text-muted)'};">${post.likes}</span> Me Gusta
                    </button>

                    <a href="${escapeHTML(post.url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="
                      padding: 0.45rem 1rem; 
                      font-size: 0.8rem; 
                      display: inline-flex; 
                      align-items: center; 
                      gap: 0.35rem; 
                      margin: 0;
                      text-decoration: none;
                      border-color: rgba(255, 255, 255, 0.1);
                    ">
                      Ver Castigo ↗
                    </a>
                  </div>
                </div>
              `;
            }).join('');
            
            // Re-hook listeners for search-filtered items
            hookLikeButtons(postsContainer);
          }
        }
      });
      // Keep input selection/caret position when retyping
      searchInput.focus();
      searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    }

    // Hook toggle expand button
    const toggleFormBtn = container.querySelector('#toggle-form-btn');
    if (toggleFormBtn) {
      toggleFormBtn.addEventListener('click', () => {
        isFormExpanded = !isFormExpanded;
        const card = container.querySelector('#new-post-card');
        if (card) {
          card.style.display = isFormExpanded ? 'block' : 'none';
        }
        toggleFormBtn.innerHTML = isFormExpanded ? '✕ Cerrar Formulario' : '📢 Compartir mi Castigo';
        toggleFormBtn.className = isFormExpanded ? 'btn-secondary' : 'btn-primary';
      });
    }

    // Hook cancel button inside form
    const cancelFormBtn = container.querySelector('#cancel-form-btn');
    if (cancelFormBtn) {
      cancelFormBtn.addEventListener('click', () => {
        isFormExpanded = false;
        const card = container.querySelector('#new-post-card');
        if (card) card.style.display = 'none';
        if (toggleFormBtn) {
          toggleFormBtn.innerHTML = '📢 Compartir mi Castigo';
          toggleFormBtn.className = 'btn-primary';
        }
      });
    }

    // Handle form submission
    const form = container.querySelector('#add-feed-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nickname = form.querySelector('#feed-nickname').value.trim();
        const league = form.querySelector('#feed-league').value.trim();
        const platform = form.querySelector('#feed-platform').value;
        const url = form.querySelector('#feed-url').value.trim();
        const description = form.querySelector('#feed-description').value.trim();

        // 1. Validation for Platforms URLs (rejecting X/Twitter)
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
          showToast("Por motivos de seguridad, la red Twitter/X no está permitida en este foro.", "error");
          return;
        }

        let isVal = false;
        if (platform === 'instagram' && lowerUrl.includes("instagram.com")) isVal = true;
        if (platform === 'tiktok' && lowerUrl.includes("tiktok.com")) isVal = true;
        if (platform === 'youtube' && (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))) isVal = true;

        if (!isVal) {
          showToast(`El enlace no coincide con la plataforma seleccionada (${platform.toUpperCase()})`, "error");
          return;
        }

        // 2. Build the new post
        const newPost = {
          id: "feed-user-" + Date.now(),
          nickname,
          league,
          platform,
          url,
          description,
          likes: 0,
          createdAt: new Date().toISOString()
        };

        // 3. Add to beginning of array & save to localStorage
        posts.unshift(newPost);
        localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));

        // 4. Reset & Toast & Close
        form.reset();
        isFormExpanded = false;
        showToast("¡Tu castigo ha sido publicado con éxito en la comunidad!", "success");

        // Re-render entirely
        renderView();
      });
    }

    // Hook likes initially
    const postsContainer = container.querySelector('#posts-grid');
    if (postsContainer) {
      hookLikeButtons(postsContainer);
    }
  }

  // Hook event handlers to Me Gusta buttons
  function hookLikeButtons(parent) {
    const likeButtons = parent.querySelectorAll('.btn-like-post');
    likeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;

        let likedIds = getLikedPosts();
        const heartEl = btn.querySelector('.heart-icon');
        const countEl = btn.querySelector('.likes-count');

        if (likedIds.includes(id)) {
          // Unlike
          likedIds = likedIds.filter(x => x !== id);
          posts[postIndex].likes = Math.max(0, posts[postIndex].likes - 1);
          btn.classList.remove('liked');
          btn.style.color = 'var(--text-muted)';
          if (countEl) countEl.style.color = 'var(--text-muted)';
          if (heartEl) {
            heartEl.textContent = '🤍';
            heartEl.style.transform = 'scale(0.8)';
            setTimeout(() => heartEl.style.transform = 'scale(1)', 150);
          }
        } else {
          // Like
          likedIds.push(id);
          posts[postIndex].likes += 1;
          btn.classList.add('liked');
          btn.style.color = 'var(--danger)';
          if (countEl) countEl.style.color = 'var(--text-light)';
          if (heartEl) {
            heartEl.textContent = '❤️';
            heartEl.style.transform = 'scale(1.4)';
            setTimeout(() => heartEl.style.transform = 'scale(1)', 200);
          }
        }

        saveLikedPosts(likedIds);
        localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
        if (countEl) countEl.textContent = posts[postIndex].likes;
      });
    });
  }

  // Formatter helper for friendly timestamps
  function formatTimeAgo(isoString, postId) {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 600);
      const diffDay = Math.floor(diffHr / 24);

      if (postId && postId.startsWith("feed-mock-")) {
        // Keep initial mock friendly strings for static feeling
        if (postId === "feed-mock-1") return "Hace 2 días";
        if (postId === "feed-mock-2") return "Hace 3 días";
        if (postId === "feed-mock-3") return "Hace 1 semana";
        if (postId === "feed-mock-4") return "Hace 5 días";
      }

      if (diffMin < 1) return "Ahora mismo";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHr < 24) return `Hace ${diffHr} hora${diffHr > 1 ? 's' : ''}`;
      if (diffDay < 7) return `Hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
      
      // Default to readable date
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return "Recientemente";
    }
  }

  // Simple escaping function to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial display call
  renderView();
}
