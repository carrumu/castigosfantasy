import { supabase } from '../supabase.js';

let postsOffset = 0;
const postsLimit = 10;
let searchQuery = '';
let filterMyPosts = false;
let allPosts = [];
let currentUserState = null;
let isGuestState = true;

/**
 * Helper to show alert inside the forum
 */
function showForoAlert(message, type = 'info') {
  let alertContainer = document.querySelector('#foro-alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'foro-alert-container';
    alertContainer.style.cssText = `
      position: fixed;
      top: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      width: 90%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(alertContainer);
  }

  const alert = document.createElement('div');
  alert.className = 'brutalist-card';
  const accentColor = type === 'success' ? '#deed00' : type === 'error' ? 'var(--danger)' : '#ffe16d';
  alert.style.cssText = `
    background: var(--bg-card);
    color: var(--text-light);
    border: 3px solid #000;
    border-left: 6px solid ${accentColor};
    box-shadow: 4px 4px 0px #000;
    padding: 0.85rem 1.25rem;
    font-weight: 800;
    font-size: 0.85rem;
    font-family: var(--font-sans);
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: auto;
    animation: slideDown 0.3s ease-out;
    letter-spacing: 0.5px;
  `;
  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.65rem;">
      <span class="material-symbols-outlined" style="color: ${accentColor}; font-size: 1.2rem; vertical-align: middle;">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    </div>
    <button style="background: none; border: none; font-size: 1.1rem; font-weight: 900; cursor: pointer; margin-left: 0.85rem; color: var(--text-muted); transition: color var(--transition-fast);">✕</button>
  `;

  alertContainer.appendChild(alert);

  const removeAlert = () => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    alert.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => alert.remove(), 250);
  };

  alert.querySelector('button').addEventListener('click', removeAlert);
  setTimeout(removeAlert, 4000);
}

/**
 * Renders the "Foro de Mánagers" (Managers Forum) screen.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {boolean} callbacks.isGuest
 * @param {Object} callbacks.currentUser
 * @param {Function} callbacks.onNavigate
 */
export async function renderForo(container, callbacks) {
  isGuestState = callbacks.isGuest;
  currentUserState = callbacks.currentUser;
  postsOffset = 0;
  allPosts = [];
  searchQuery = '';
  filterMyPosts = false;

  container.innerHTML = `
    <div class="foro-container fade-in-up" style="max-width: 750px; margin: 0 auto; padding: 1.5rem 1.25rem;">
      
      <!-- Back navigation and Header -->
      <div style="display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 1.5rem; min-height: 38px;">
        <button class="brutalist-btn-secondary" id="foro-back-btn" style="position: absolute; left: 0; width: 30px; height: 30px; padding: 0 !important; display: inline-flex; align-items: center; justify-content: center; border-radius: 50% !important; margin: 0;" title="Atrás">
          <span class="material-symbols-outlined" style="font-size: 1.05rem;">arrow_back</span>
        </button>
        <h1 class="gradient-text-gold" style="font-size: 1.5rem; font-weight: 900; font-family: var(--font-display); text-transform: uppercase; margin: 0; text-align: center; padding: 0 40px;">
          Foro de Mánagers
        </h1>
      </div>

      <!-- Search bar & My Posts filter -->
      <div style="margin-bottom: 2rem; display: flex; gap: 0.5rem;" id="foro-search-bar-container">
        <input type="text" id="foro-search-input" class="input-field" placeholder="🔎 Buscar publicaciones..." style="border: 3px solid #000; padding: 0.65rem 1rem; font-weight: 700; background: var(--bg-input); flex-grow: 1; box-shadow: 4px 4px 0px #000; font-family: var(--font-sans);" />
        <button id="foro-clear-search-btn" class="brutalist-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 900; margin: 0; display: none; text-transform: uppercase; width: auto; border: 3px solid #000; box-shadow: 4px 4px 0px #000; background: var(--danger); color: white;">Limpiar</button>
        ${!isGuestState ? `
          <button id="foro-my-posts-btn" class="brutalist-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 900; margin: 0; white-space: nowrap; text-transform: uppercase; width: auto; border: 3px solid #000; box-shadow: 4px 4px 0px #000; background: transparent; color: var(--text-light);">Mis Posts</button>
        ` : ''}
      </div>

      <!-- Creation Box -->
      <div id="foro-creation-zone" style="margin-bottom: 2rem;"></div>

      <!-- Posts Feed Container -->
      <div id="foro-feed-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <span class="spinner" style="display: inline-block; margin-bottom: 0.5rem;"></span>
          <p style="font-weight: 700;">Cargando debates...</p>
        </div>
      </div>

      <!-- Load More Button -->
      <div style="text-align: center; margin-top: 2rem; display: none;" id="load-more-container">
        <button class="brutalist-btn" id="foro-load-more-btn" style="width: 100%; font-weight: 900; text-transform: uppercase;">
          Cargar Más Temas
        </button>
      </div>
    </div>
  `;

  // Attach Header Back Button
  container.querySelector('#foro-back-btn').addEventListener('click', () => {
    callbacks.onNavigate('comunidad');
  });

  // Render Creation Zone
  renderCreationForm(container, callbacks);

  // Setup Search Input event listener
  const searchInput = container.querySelector('#foro-search-input');
  const clearSearchBtn = container.querySelector('#foro-clear-search-btn');
  const myPostsBtn = container.querySelector('#foro-my-posts-btn');
  let searchTimeout = null;

  const triggerSearch = () => {
    searchQuery = searchInput.value.trim();
    if (searchQuery) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    postsOffset = 0;
    allPosts = [];
    fetchPostsAndRender(container);
  };

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(triggerSearch, 350); // Debounce of 350ms
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    triggerSearch();
  });

  // Setup "My Posts" Filter Button listener
  if (myPostsBtn) {
    myPostsBtn.addEventListener('click', () => {
      filterMyPosts = !filterMyPosts;
      if (filterMyPosts) {
        myPostsBtn.classList.add('is-active');
        myPostsBtn.style.background = 'var(--accent)';
        myPostsBtn.style.color = '#000';
        myPostsBtn.textContent = '✓ Mis Posts';
      } else {
        myPostsBtn.classList.remove('is-active');
        myPostsBtn.style.background = 'transparent';
        myPostsBtn.style.color = 'var(--text-light)';
        myPostsBtn.textContent = 'Mis Posts';
      }
      postsOffset = 0;
      allPosts = [];
      fetchPostsAndRender(container);
    });
  }

  // Fetch initial posts
  await fetchPostsAndRender(container);

  // Check if deep linked to a specific post via hash query (e.g. #foro?post=uuid)
  handleDeepLinkScroll();
}

/**
 * Renders the creation box (Form if logged in, banner if guest)
 */
function renderCreationForm(container, callbacks) {
  const zone = container.querySelector('#foro-creation-zone');
  if (isGuestState) {
    zone.innerHTML = `
      <div class="brutalist-card" style="background: var(--bg-card); border: 3px solid #000; box-shadow: 4px 4px 0px #000; padding: 1.5rem; text-align: center;">
        <h3 style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">🔒 ¿Quieres participar en el debate?</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; font-weight: 500;">
          Inicia sesión o regístrate para publicar nuevos temas, comentar y dar like a publicaciones de otros mánagers.
        </p>
        <button class="brutalist-btn" id="foro-login-btn" style="width: 100%; font-weight: 900; text-transform: uppercase;">Iniciar Sesión</button>
      </div>
    `;
    zone.querySelector('#foro-login-btn').addEventListener('click', () => {
      callbacks.onNavigate('acceso');
    });
  } else {
    renderCollapsedBox(zone, container, callbacks);
  }
}

/**
 * Renders the collapsed prompt box (microblog style input field trigger)
 */
function renderCollapsedBox(zone, container, callbacks) {
  zone.innerHTML = `
    <div class="brutalist-card concrete-bg" id="foro-collapsed-trigger" style="padding: 0.85rem 1.25rem; border: 3px solid #000; box-shadow: 4px 4px 0px #000; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: transform var(--transition-fast);">
      <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; user-select: none;">
        <span class="material-symbols-outlined" style="color: var(--accent); font-size: 1.3rem;">add_comment</span>
        ¿Qué quieres debatir hoy, mánager? Escribe aquí...
      </span>
      <span class="brutalist-btn" style="margin: 0; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase;">ESCRIBIR</span>
    </div>
  `;

  zone.querySelector('#foro-collapsed-trigger').addEventListener('click', () => {
    renderExpandedForm(zone, container, callbacks);
  });
}

/**
 * Renders the expanded form for creating a new post
 */
function renderExpandedForm(zone, container, callbacks) {
  zone.innerHTML = `
    <div class="brutalist-card concrete-bg" style="padding: 1.25rem; border: 3px solid #000; box-shadow: 4px 4px 0px #000; animation: slideDown 0.2s ease-out;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
        <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
          <span class="material-symbols-outlined">rate_review</span> Crear Publicación
        </h3>
        <button class="brutalist-btn-small" id="foro-cancel-post-btn" style="text-transform: uppercase;">Cancelar</button>
      </div>
      <form id="foro-post-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
          <div>
            <textarea id="post-content" class="input-field" placeholder="¿Qué quieres debatir hoy? (máx. 280 caracteres)" rows="3" required maxlength="280" style="width: 100%; border: 2px solid #000; padding: 0.65rem; font-family: var(--font-sans); font-weight: 700; background: var(--bg-input); resize: none;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
              <span id="post-spam-warning" style="font-size: 0.75rem; color: var(--danger); font-weight: 800;"></span>
              <span id="char-counter" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 800;">280 caracteres restantes</span>
            </div>
          </div>
        </div>
        <button type="submit" class="brutalist-btn" style="width: 100%; font-weight: 900; text-transform: uppercase;">Publicar en el Foro</button>
      </form>
    </div>
  `;

  const form = zone.querySelector('#foro-post-form');
  const textarea = form.querySelector('#post-content');
  const charCounter = form.querySelector('#char-counter');
  const cancelBtn = zone.querySelector('#foro-cancel-post-btn');

  // Focus the textarea automatically
  textarea.focus();

  // Cancel button collapses it back
  cancelBtn.addEventListener('click', () => {
    renderCollapsedBox(zone, container, callbacks);
  });

  // Handle character count
  textarea.addEventListener('input', () => {
    const remaining = 280 - textarea.value.length;
    charCounter.textContent = `${remaining} caracteres restantes`;
    if (remaining <= 30) {
      charCounter.style.color = 'var(--danger)';
    } else {
      charCounter.style.color = 'var(--text-muted)';
    }
  });

  // Form submit logic
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = textarea.value.trim();
    if (!content) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'PUBLICANDO...';

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          profile_id: currentUserState.id,
          category: 'general',
          content
        });

      if (error) throw error;

      // Reset to collapsed box and reload feed
      renderCollapsedBox(zone, container, callbacks);
      showForoAlert('¡Publicación creada con éxito!', 'success');
      
      postsOffset = 0;
      allPosts = [];
      await fetchPostsAndRender(container);
    } catch (err) {
      console.error('Error al guardar publicación:', err);
      if (err.message && err.message.includes('limite diario')) {
        showForoAlert('Has alcanzado el límite diario de 10 publicaciones.', 'error');
      } else {
        showForoAlert('Error al publicar. Inténtalo de nuevo.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'PUBLICAR EN EL FORO';
    }
  });
}

/**
 * Fetches posts from Supabase based on offset, limit, search query and filter
 */
async function fetchPostsAndRender(container) {
  const feedList = container.querySelector('#foro-feed-list');
  const loadMoreBtn = container.querySelector('#foro-load-more-btn');
  const loadMoreContainer = container.querySelector('#load-more-container');

  try {
    let commentedPostIds = [];
    if (filterMyPosts && currentUserState) {
      const { data: userComments } = await supabase
        .from('forum_comments')
        .select('post_id')
        .eq('profile_id', currentUserState.id);
      if (userComments) {
        commentedPostIds = [...new Set(userComments.map(c => c.post_id))];
      }
    }

    let query = supabase
      .from('forum_posts')
      .select(`
        id,
        profile_id,
        category,
        content,
        created_at,
        profiles!profile_id (
          apodo
        ),
        forum_post_likes (
          profile_id
        ),
        forum_comments (
          id
        )
      `)
      .order('created_at', { ascending: false })
      .range(postsOffset, postsOffset + postsLimit - 1);

    if (searchQuery) {
      query = query.ilike('content', `%${searchQuery}%`);
    }

    if (filterMyPosts && currentUserState) {
      if (commentedPostIds.length > 0) {
        query = query.or(`profile_id.eq.${currentUserState.id},id.in.(${commentedPostIds.join(',')})`);
      } else {
        query = query.eq('profile_id', currentUserState.id);
      }
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    if (postsOffset === 0) {
      allPosts = posts;
    } else {
      allPosts = [...allPosts, ...posts];
    }

    renderFeed(container, posts);

    // Update pagination variables
    if (posts.length === postsLimit) {
      postsOffset += postsLimit;
      loadMoreContainer.style.display = 'block';
      // Setup Load More button listener
      if (loadMoreBtn) {
        const newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        newBtn.addEventListener('click', async () => {
          newBtn.disabled = true;
          newBtn.textContent = 'CARGANDO...';
          await fetchPostsAndRender(container);
          newBtn.disabled = false;
          newBtn.textContent = 'Cargar Más Temas';
        });
      }
    } else {
      loadMoreContainer.style.display = 'none';
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
    feedList.innerHTML = `
      <div class="brutalist-card" style="background: rgba(239, 68, 68, 0.1); border-color: var(--danger); text-align: center; padding: 2rem;">
        <span class="material-symbols-outlined" style="font-size: 2.5rem; color: var(--danger); margin-bottom: 0.5rem;">error</span>
        <p style="font-weight: 800; color: var(--text-light);">No se pudieron cargar los posts.</p>
        <button class="brutalist-btn" id="foro-retry-fetch-btn" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.4rem 1rem;">Reintentar</button>
      </div>
    `;
    const retryBtn = feedList.querySelector('#foro-retry-fetch-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => fetchPostsAndRender(container));
    }
  }
}

/**
 * Renders the feed cards inside the list container
 */
function renderFeed(container, newPosts) {
  const feedList = container.querySelector('#foro-feed-list');
  
  if (postsOffset === 0 || allPosts.length === 0) {
    feedList.innerHTML = '';
  }

  if (allPosts.length === 0) {
    feedList.innerHTML = `
      <div class="brutalist-card" style="text-align: center; padding: 3rem; background: var(--bg-card); border-color: #000;">
        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 0.5rem;">search_off</span>
        <h3 style="font-family: var(--font-display); text-transform: uppercase; font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem;">Sin resultados</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 320px; margin: 0 auto;">
          ${searchQuery ? `No encontramos publicaciones que coincidan con la búsqueda de "<strong>${searchQuery}</strong>".` : 
            filterMyPosts ? 'No has publicado ningún post todavía en el foro.' : 'Nadie ha publicado nada todavía. ¡Sé el primero en iniciar el debate!'}
        </p>
      </div>
    `;
    return;
  }

  const postsToRender = postsOffset === 0 ? allPosts : newPosts;

  postsToRender.forEach(post => {
    const card = document.createElement('article');
    card.className = 'brutalist-card';
    card.id = `post-${post.id}`;
    card.style.cssText = `
      margin-bottom: 1.5rem;
      border: 3px solid #000;
      box-shadow: 4px 4px 0px #000;
      background: var(--bg-card);
      padding: 1.25rem;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    `;

    const commentsCount = post.forum_comments ? post.forum_comments.length : 0;
    
    // Group likes
    const likes = post.forum_post_likes || [];
    let likeCount = 0;
    let userLiked = false;

    likes.forEach(l => {
      likeCount++;
      if (!isGuestState && currentUserState && l.profile_id === currentUserState.id) {
        userLiked = true;
      }
    });

    const isAuthor = !isGuestState && currentUserState && post.profile_id === currentUserState.id;

    card.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #000; padding-bottom: 0.65rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 34px; height: 34px; border: 2.5px solid #000; border-radius: 50%; background: var(--accent); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-family: var(--font-display); font-size: 0.95rem; box-shadow: 1.5px 1.5px 0px #000;">
            ${post.profiles?.apodo ? post.profiles.apodo.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <span style="font-weight: 800; font-size: 0.95rem; display: block; line-height: 1.1;">@${post.profiles?.apodo || 'Mánager'}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">${new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <!-- Safe Content: We inject text via textContent on a helper element to block XSS -->
      <div class="post-text-container" style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.25rem; font-weight: 700; word-break: break-word; white-space: pre-wrap; color: var(--text-light);"></div>
      
      <!-- Actions Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 2px dashed #000; padding-top: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
        
        <!-- Likes Button -->
        <div style="display: flex; gap: 0.3rem;" class="likes-wrapper">
          <button class="like-btn brutalist-btn-small ${userLiked ? 'is-active' : ''}">
            ❤️ <span class="count">${likeCount}</span>
          </button>
        </div>
        
        <!-- Comments & Utility buttons -->
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="toggle-comments-btn brutalist-btn-small">
            <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">chat_bubble</span>
            <span class="comment-label">Respuestas (${commentsCount})</span>
          </button>
          <button class="share-post-btn brutalist-btn-small" title="Copiar enlace al post">
            <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">share</span>
          </button>
          ${isAuthor ? `
            <button class="delete-post-btn brutalist-btn-small btn-danger" title="Eliminar publicación">
              <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">delete</span>
            </button>
          ` : ''}
        </div>
      </div>
      
      <!-- Comments Section (Accordion) -->
      <div class="comments-section" style="display: none; margin-top: 1rem; border-top: 3px solid #000; padding-top: 1rem;">
        <div class="comments-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; padding-right: 0.25rem;">
          <!-- Comments render here dynamically -->
        </div>
        ${isGuestState ? `
          <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; background: rgba(0,0,0,0.15); padding: 0.65rem; border: 2px solid #000; font-weight: 700; text-transform: uppercase;">
            Inicia sesión para poder responder
          </div>
        ` : `
          <form class="comment-form" style="display: flex; gap: 0.5rem;">
            <input type="text" class="comment-input input-field" placeholder="Escribe una respuesta..." required style="flex-grow: 1; border: 2px solid #000; padding: 0.4rem 0.6rem; font-size: 0.85rem; font-weight: 700; background: var(--bg-input);" maxlength="500" />
            <button type="submit" class="brutalist-btn-small" style="text-transform: uppercase; white-space: nowrap;">Responder</button>
          </form>
        `}
      </div>
    `;

    // Inject Text safely to avoid HTML injection/XSS
    card.querySelector('.post-text-container').textContent = post.content;

    // Attach Event Listeners to Card Buttons
    setupCardListeners(card, post, container);

    feedList.appendChild(card);
  });
}

/**
 * Attaches click event handlers to all post card buttons (Reactions, Comments, Share, Delete)
 */
function setupCardListeners(card, post, container) {
  const commentSection = card.querySelector('.comments-section');
  const toggleCommentsBtn = card.querySelector('.toggle-comments-btn');
  const shareBtn = card.querySelector('.share-post-btn');
  const deleteBtn = card.querySelector('.delete-post-btn');
  const commentsList = card.querySelector('.comments-list');
  const commentForm = card.querySelector('.comment-form');

  // Comments accordion toggle
  let commentsLoaded = false;
  toggleCommentsBtn.addEventListener('click', async () => {
    const isHidden = commentSection.style.display === 'none';
    if (isHidden) {
      commentSection.style.display = 'block';
      toggleCommentsBtn.classList.add('is-active');
      if (!commentsLoaded) {
        await fetchCommentsAndRender(post.id, commentsList);
        commentsLoaded = true;
      }
    } else {
      commentSection.style.display = 'none';
      toggleCommentsBtn.classList.remove('is-active');
    }
  });

  // Comment post/reply submit
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = commentForm.querySelector('.comment-input');
      const text = input.value.trim();
      if (!text) return;

      const submitBtn = commentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'ENVIANDO...';

      try {
        const { error } = await supabase
          .from('forum_comments')
          .insert({
            post_id: post.id,
            profile_id: currentUserState.id,
            content: text
          });

        if (error) throw error;

        input.value = '';
        await fetchCommentsAndRender(post.id, commentsList);
        commentsLoaded = true;

        // Update count badge in UI
        const { count, error: countErr } = await supabase
          .from('forum_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        if (!countErr) {
          card.querySelector('.comment-label').textContent = `Respuestas (${count})`;
        }
      } catch (err) {
        console.error('Error al guardar comentario:', err);
        showForoAlert('Error al guardar el comentario.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'RESPONDER';
      }
    });
  }

  // Likes button logic
  const likeBtn = card.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      if (isGuestState) {
        showForoAlert('Inicia sesión para dar me gusta.', 'info');
        return;
      }

      const countEl = likeBtn.querySelector('.count');
      const isActive = likeBtn.classList.contains('is-active');

      // Optimistic UI updates
      let currentCount = parseInt(countEl.textContent, 10);
      if (isActive) {
        likeBtn.classList.remove('is-active');
        countEl.textContent = currentCount - 1;
      } else {
        likeBtn.classList.add('is-active');
        countEl.textContent = currentCount + 1;
        likeBtn.style.transform = 'scale(1.25)';
        setTimeout(() => likeBtn.style.transform = '', 150);
      }

      try {
        if (isActive) {
          const { error } = await supabase
            .from('forum_post_likes')
            .delete()
            .eq('post_id', post.id)
            .eq('profile_id', currentUserState.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('forum_post_likes')
            .insert({
              post_id: post.id,
              profile_id: currentUserState.id
            });
          if (error) throw error;
        }
      } catch (err) {
        console.error('Error toggling like:', err);
        likeBtn.classList.toggle('is-active');
        countEl.textContent = isActive ? currentCount : currentCount - 1;
        showForoAlert('Error al registrar el me gusta.', 'error');
      }
    });
  }

  // Share post button logic
  shareBtn.addEventListener('click', () => {
    const postUrl = `${window.location.origin}/foro?post=${post.id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        showForoAlert('¡Enlace copiado al portapapeles!', 'success');
      })
      .catch(err => {
        console.error('Error copying share link:', err);
        showForoAlert('No se pudo copiar el enlace automáticamente.', 'error');
      });
  });

  // Delete post button logic
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('¿Estás seguro de que quieres eliminar esta publicación permanentemente? Se borrarán también todos sus comentarios y likes.')) return;

      try {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', post.id);

        if (error) throw error;

        // Remove card from DOM
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        card.style.transition = 'opacity 0.25s, transform 0.25s';
        setTimeout(() => {
          card.remove();
          allPosts = allPosts.filter(p => p.id !== post.id);
          if (allPosts.length === 0) {
            renderFeed(container, []);
          }
        }, 250);

        showForoAlert('Publicación eliminada correctamente.', 'success');
      } catch (err) {
        console.error('Error deleting post:', err);
        showForoAlert('Error al eliminar la publicación.', 'error');
      }
    });
  }
}

/**
 * Fetches and renders comments inside the accordion, supporting threaded replies and likes
 */
async function fetchCommentsAndRender(postId, listContainer) {
  listContainer.innerHTML = `
    <div style="text-align: center; padding: 1rem; color: var(--text-muted);">
      <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Cargar respuestas...
    </div>
  `;

  try {
    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select(`
        id,
        content,
        created_at,
        profile_id,
        parent_id,
        profiles!profile_id (
          apodo
        ),
        forum_comment_likes (
          profile_id
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    listContainer.innerHTML = '';
    if (comments.length === 0) {
      listContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">Nadie ha respondido aún.</div>`;
      
      // Update count badge in UI
      const card = document.getElementById(`post-${postId}`);
      if (card) {
        const commentLabel = card.querySelector('.comment-label');
        if (commentLabel) {
          commentLabel.textContent = `Respuestas (0)`;
        }
      }
      return;
    }

    // Build comment map and tree
    const rootComments = [];
    const commentMap = {};

    comments.forEach(c => {
      c.replies = [];
      commentMap[c.id] = c;
    });

    comments.forEach(c => {
      if (c.parent_id) {
        let parent = commentMap[c.parent_id];
        while (parent && parent.parent_id) {
          parent = commentMap[parent.parent_id];
        }
        if (parent) {
          parent.replies.push(c);
        } else {
          rootComments.push(c);
        }
      } else {
        rootComments.push(c);
      }
    });

    // Helper: Create single comment card element
    function createCommentElement(comment, isNested = false) {
      const el = document.createElement('div');
      el.className = 'brutalist-card';
      el.style.cssText = isNested ? `
        padding: 0.5rem 0.75rem;
        background: var(--bg-item-light);
        border: 2px solid #000;
        box-shadow: 1.5px 1.5px 0px #000;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        margin-top: 0.35rem;
      ` : `
        padding: 0.65rem 0.85rem;
        background: var(--bg-input);
        border: 2px solid #000;
        box-shadow: 2px 2px 0px #000;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      `;

      const isCommentAuthor = !isGuestState && currentUserState && comment.profile_id === currentUserState.id;

      // Group comment likes
      const likes = comment.forum_comment_likes || [];
      let likeCount = 0;
      let userLiked = false;
      likes.forEach(l => {
        likeCount++;
        if (!isGuestState && currentUserState && l.profile_id === currentUserState.id) {
          userLiked = true;
        }
      });

      // Target indicator (Twitter style)
      let replyIndicator = '';
      if (comment.parent_id) {
        const targetComment = commentMap[comment.parent_id];
        const targetName = targetComment?.profiles?.apodo || 'Mánager';
        replyIndicator = `<span style="font-size: 0.7rem; color: var(--accent); font-weight: 700; margin-bottom: 0.15rem;">↳ En respuesta a @${targetName}</span>`;
      }

      el.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; font-weight: 800; border-bottom: 1.5px dashed #000; padding-bottom: 0.25rem; margin-bottom: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="color: var(--accent);">@${comment.profiles?.apodo || 'Mánager'}</span>
            <span style="color: var(--text-muted); font-size: 0.7rem;">(${new Date(comment.created_at).toLocaleTimeString()})</span>
          </div>
        </div>
        ${replyIndicator}
        <!-- Safe comment text -->
        <div class="comment-text-content" style="font-size: 0.85rem; font-weight: 700; word-break: break-word; white-space: pre-wrap; color: var(--text-light); margin-bottom: 0.25rem;"></div>
        
        <!-- Comment Actions -->
        <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.25rem; justify-content: flex-end;">
          <button class="comment-like-btn brutalist-btn-small ${userLiked ? 'is-active' : ''}" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">
            ❤️ <span class="count">${likeCount}</span>
          </button>
          ${!isGuestState ? `
            <button class="comment-reply-btn brutalist-btn-small" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">
              <span class="material-symbols-outlined" style="font-size: 0.85rem; vertical-align: middle;">reply</span> Responder
            </button>
          ` : ''}
          ${isCommentAuthor ? `
            <button class="delete-comment-btn brutalist-btn-small btn-danger" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;" title="Eliminar respuesta">
              <span class="material-symbols-outlined" style="font-size: 0.85rem; vertical-align: middle;">delete</span>
            </button>
          ` : ''}
        </div>

        <!-- Inline Reply Input (initially hidden) -->
        <div class="comment-reply-form-zone" style="display: none; margin-top: 0.5rem; border-top: 1.5px dashed #000; padding-top: 0.5rem;">
          <form class="comment-reply-form" style="display: flex; gap: 0.35rem;">
            <input type="text" class="reply-input input-field" placeholder="Responde a @${comment.profiles?.apodo || 'Mánager'}..." required style="flex-grow: 1; border: 1.5px solid #000; padding: 0.25rem 0.45rem; font-size: 0.78rem; font-weight: 700; background: var(--bg-input);" maxlength="500" />
            <button type="submit" class="brutalist-btn-small" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Enviar</button>
          </form>
        </div>
      `;

      el.querySelector('.comment-text-content').textContent = comment.content;

      // Event listeners
      const likeBtn = el.querySelector('.comment-like-btn');
      const replyBtn = el.querySelector('.comment-reply-btn');
      const deleteBtn = el.querySelector('.delete-comment-btn');
      const replyFormZone = el.querySelector('.comment-reply-form-zone');
      const replyForm = el.querySelector('.comment-reply-form');

      if (likeBtn) {
        likeBtn.addEventListener('click', async () => {
          if (isGuestState) {
            showForoAlert('Inicia sesión para dar me gusta.', 'info');
            return;
          }

          const countEl = likeBtn.querySelector('.count');
          const isActive = likeBtn.classList.contains('is-active');
          let currentCount = parseInt(countEl.textContent, 10);

          if (isActive) {
            likeBtn.classList.remove('is-active');
            countEl.textContent = currentCount - 1;
          } else {
            likeBtn.classList.add('is-active');
            countEl.textContent = currentCount + 1;
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => likeBtn.style.transform = '', 150);
          }

          try {
            if (isActive) {
              const { error } = await supabase
                .from('forum_comment_likes')
                .delete()
                .eq('comment_id', comment.id)
                .eq('profile_id', currentUserState.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('forum_comment_likes')
                .insert({
                  comment_id: comment.id,
                  profile_id: currentUserState.id
                });
              if (error) throw error;
            }
          } catch (err) {
            console.error('Error toggling comment like:', err);
            likeBtn.classList.toggle('is-active');
            countEl.textContent = isActive ? currentCount : currentCount - 1;
            showForoAlert('Error al guardar me gusta.', 'error');
          }
        });
      }

      if (replyBtn) {
        replyBtn.addEventListener('click', () => {
          const isHidden = replyFormZone.style.display === 'none';
          replyFormZone.style.display = isHidden ? 'block' : 'none';
          if (isHidden) {
            replyFormZone.querySelector('.reply-input').focus();
          }
        });
      }

      if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (isGuestState) {
            showForoAlert('Inicia sesión para responder.', 'info');
            return;
          }
          const input = replyForm.querySelector('.reply-input');
          const text = input.value.trim();
          if (!text) return;

          const submitBtn = replyForm.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.textContent = '...';

          try {
            const { error } = await supabase
              .from('forum_comments')
              .insert({
                post_id: postId,
                profile_id: currentUserState.id,
                content: text,
                parent_id: comment.id
              });

            if (error) throw error;
            await fetchCommentsAndRender(postId, listContainer);
          } catch (err) {
            console.error('Error adding reply:', err);
            showForoAlert('Error al enviar la respuesta.', 'error');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENVIAR';
          }
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!confirm('¿Borrar esta respuesta?')) return;
          try {
            const { error: delErr } = await supabase
              .from('forum_comments')
              .delete()
              .eq('id', comment.id);
            if (delErr) throw delErr;
            await fetchCommentsAndRender(postId, listContainer);
          } catch (err) {
            console.error('Error deleting comment:', err);
            showForoAlert('Error al borrar la respuesta.', 'error');
          }
        });
      }

      return el;
    }

    // Render tree to container
    rootComments.forEach(rootComment => {
      const rootEl = createCommentElement(rootComment, false);
      listContainer.appendChild(rootEl);

      if (rootComment.replies && rootComment.replies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'replies-list';
        repliesContainer.style.cssText = `
          margin-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
          border-left: 2px dashed var(--accent);
          padding-left: 0.75rem;
          margin-bottom: 0.75rem;
        `;
        
        rootComment.replies.forEach(reply => {
          const replyEl = createCommentElement(reply, true);
          repliesContainer.appendChild(replyEl);
        });

        listContainer.appendChild(repliesContainer);
      }
    });

    // Update count badge in UI
    const card = document.getElementById(`post-${postId}`);
    if (card) {
      const commentLabel = card.querySelector('.comment-label');
      if (commentLabel) {
        commentLabel.textContent = `Respuestas (${comments.length})`;
      }
    }

  } catch (err) {
    console.error('Error fetching comments:', err);
    listContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--danger); text-align: center; padding: 0.5rem;">Error al cargar las respuestas.</div>`;
  }
}

/**
 * If url query parameter ?post=uuid is found, attempts to locate the post card and scroll to it
 */
function handleDeepLinkScroll() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');
  if (postId) {
    setTimeout(() => {
      const card = document.getElementById(`post-${postId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.borderColor = 'var(--accent)';
        card.style.boxShadow = '6px 6px 0px var(--accent)';
        setTimeout(() => {
          card.style.borderColor = '#000';
          card.style.boxShadow = '4px 4px 0px #000';
        }, 3000);
      }
    }, 800);
  }
}
