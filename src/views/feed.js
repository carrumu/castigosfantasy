import { supabase, isConfigured } from '../supabase';

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
      title: "Dinosaurio en el supermercado",
      nickname: "Paco G.",
      league: "Liga de los Vagos",
      platform: "tiktok",
      url: "https://www.tiktok.com/@biwenger/video/123456789",
      description: "Cumpliendo el castigo de la jornada 12. Me tocó ir al supermercado vestido de dinosaurio inflable a comprar pepinillos y cantando el himno de la Champions League. ¡Cumplido!",
      likes: 24,
      createdAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(), // 1.5 days ago
      comments: [
        { id: "c-1", nickname: "Álvaro M.", text: "¡Vaya cara pusiste al ver a la cajera!", createdAt: new Date(Date.now() - 3600000 * 24 * 1.2).toISOString() },
        { id: "c-2", nickname: "Santi K.", text: "Ese dinosaurio ya es leyenda en el grupo de WhatsApp.", createdAt: new Date(Date.now() - 3600000 * 24 * 1.1).toISOString() }
      ]
    },
    {
      id: "feed-mock-2",
      title: "Camarero por un día vistiendo los colores del eterno rival",
      nickname: "Santi K.",
      league: "Liga Astures",
      platform: "instagram",
      url: "https://www.instagram.com/p/C_abc123/",
      description: "Cena de la liga pagada por mí por quedar último. Obligado a llevar la camiseta del rival firmada por todos y servirles las copas como si fuera el camarero oficial. Risas aseguradas.",
      likes: 42,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3.2).toISOString(), // 3.2 days ago
      comments: [
        { id: "c-3", nickname: "Paco G.", text: "¡Y qué buen servicio diste, camarero! Cinco estrellas.", createdAt: new Date(Date.now() - 3600000 * 24 * 2.8).toISOString() }
      ]
    },
    {
      id: "feed-mock-3",
      title: "Himno del Sevilla FC a capela en el metro de Madrid",
      nickname: "Marta R.",
      league: "Liga Super Mánagers",
      platform: "instagram",
      url: "https://www.instagram.com/p/C_xyz789/",
      description: "Subiendo el vídeo cantando el himno del Sevilla FC a capela en el vagón del metro de Madrid con el megáfono que me compraron. Qué vergüenza pasé. Nunca más confío en mis delanteros.",
      likes: 53,
      createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(), // 6 days ago
      comments: [
        { id: "c-4", nickname: "Álvaro M.", text: "La gente del metro no entendía nada jajaja ¡Brutal!", createdAt: new Date(Date.now() - 3600000 * 24 * 5.5).toISOString() }
      ]
    },
    {
      id: "feed-mock-4",
      title: "Árbitro profesional sancionando a mi gato en vivo",
      nickname: "Álvaro M.",
      league: "Liga La Pachanga",
      platform: "tiktok",
      url: "https://www.tiktok.com/@laliga/video/987654321",
      description: "Castigo pagado. Una hora completa transmitiendo en directo en TikTok vestido con equipación de árbitro profesional, silbato en mano, y sacándole tarjetas amarillas y rojas a mi gato cada vez que maullaba.",
      likes: 31,
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      comments: []
    }
  ];

  // State variables for cache
  let posts = [];
  let likedIds = [];

  // Helper to retrieve liked posts
  async function loadLikedPosts() {
    let ids = JSON.parse(localStorage.getItem('CF_LIKED_POSTS') || '[]');
    if (isConfigured) {
      try {
        const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const { data: likesData } = await supabase
            .from('feed_likes')
            .select('post_id')
            .eq('profile_id', currentUser.id);
          
          if (likesData) {
            const dbLikedIds = likesData.map(l => l.post_id);
            ids = [...new Set([...ids, ...dbLikedIds])];
            localStorage.setItem('CF_LIKED_POSTS', JSON.stringify(ids));
          }
        }
      } catch (err) {
        console.warn("Could not load liked posts from Supabase:", err);
      }
    }
    likedIds = ids;
    return ids;
  }

  // Helper to save liked posts
  function saveLikedPosts(likedIdsVal) {
    likedIds = likedIdsVal;
    localStorage.setItem('CF_LIKED_POSTS', JSON.stringify(likedIds));
  }

  async function loadPosts() {
    if (isConfigured) {
      try {
        const { data: postsData, error: postsErr } = await supabase
          .from('feed_posts')
          .select(`
            *,
            comments:feed_comments(id, nickname, text, created_at)
          `)
          .order('created_at', { ascending: false });

        if (postsErr) throw postsErr;

        if (postsData && postsData.length > 0) {
          posts = postsData.map(p => ({
            id: p.id,
            title: p.title,
            nickname: p.nickname,
            league: p.league,
            platform: p.platform,
            url: p.url,
            description: p.description,
            likes: p.likes,
            createdAt: p.created_at,
            comments: (p.comments || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(c => ({
              id: c.id,
              nickname: c.nickname,
              text: c.text,
              createdAt: c.created_at
            })),
            visibility: p.visibility
          }));
        } else {
          // Seed mock posts
          const insertList = DEFAULT_FEED.map(p => ({
            title: p.title,
            nickname: p.nickname,
            league: p.league,
            platform: p.platform,
            url: p.url,
            description: p.description,
            likes: p.likes,
            visibility: p.visibility || 'public'
          }));

          const { data: insertedData, error: insErr } = await supabase
            .from('feed_posts')
            .insert(insertList)
            .select();

          if (insErr) throw insErr;
          
          for (const post of insertedData) {
            const originalPost = DEFAULT_FEED.find(x => x.title === post.title);
            if (originalPost && originalPost.comments && originalPost.comments.length > 0) {
              const commentsInsert = originalPost.comments.map(c => ({
                post_id: post.id,
                nickname: c.nickname,
                text: c.text
              }));
              await supabase.from('feed_comments').insert(commentsInsert);
            }
          }

          await loadPosts();
        }
      } catch (err) {
        console.error("Error loading/seeding posts on Supabase:", err);
        loadLocalPosts();
      }
    } else {
      loadLocalPosts();
    }
  }

  function loadLocalPosts() {
    let localPosts = JSON.parse(localStorage.getItem('CF_COMMUNITY_FEED') || 'null');
    if (!localPosts) {
      localPosts = DEFAULT_FEED;
      localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(localPosts));
    }
    posts = localPosts;
  }

  // State variables
  let searchQuery = "";
  let isFormExpanded = false;
  let currentSort = "new"; // "new" or "popular"
  let expandedComments = {}; // Map of post.id -> boolean
  let currentFeedFilter = "public"; // "public" or "league" (private)
  let userNickname = "Tú";
  let userLeagues = [];
  let selectedLeague = "";
  let activeLeagueName = "";

  // Load active demo league details initially as fallbacks
  const activeDemoId = localStorage.getItem('CF_ACTIVE_DEMO_LEAGUE_ID') || 'DEMO-ASTURES';
  const activeDemoName = localStorage.getItem(`CF_DEMO_LEAGUE_NAME_${activeDemoId}`) || "Liga Demo Astures";
  userNickname = "Tú";
  userLeagues = [activeDemoName];
  selectedLeague = activeDemoName;
  activeLeagueName = activeDemoName;

  // Helper to fetch user profile and leagues asynchronously
  async function getCurrentUserProfile() {
    let nickname = "Tú";
    let leagues = [];

    if (isConfigured) {
      try {
        const session = supabase.auth.session ? supabase.auth.session() : null;
        const currentUser = session?.user || (supabase.auth.getUser ? (await supabase.auth.getUser()).data?.user : null);
        if (currentUser) {
          nickname = currentUser.user_metadata?.display_name || currentUser.email.split('@')[0];
          
          const { data: memberRows } = await supabase
            .from('league_members')
            .select('league_id')
            .eq('profile_id', currentUser.id);
            
          if (memberRows && memberRows.length > 0) {
            const leagueIds = memberRows.map(r => r.league_id);
            const { data: leagueRows } = await supabase
              .from('leagues')
              .select('name')
              .in('id', leagueIds);
            if (leagueRows) {
              leagues = leagueRows.map(r => r.name);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load user profile, using guest details:", err);
      }
    } else {
      // Demo / Local Mode
      const storedUser = localStorage.getItem('sb-giieisavasjbijnvpsnw-auth-token');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const email = parsed?.user?.email || "";
          if (email) nickname = email.split('@')[0];
        } catch {}
      }
      
      const savedDemoLeagues = JSON.parse(localStorage.getItem('CF_SAVED_DEMO_LEAGUES') || '[]');
      if (savedDemoLeagues.length > 0) {
        leagues = savedDemoLeagues.map(l => l.name);
      }
    }

    if (leagues.length === 0) {
      leagues = [activeDemoName];
    }

    return { nickname, leagues };
  }

  // Async loader
  async function loadProfile() {
    try {
      const profile = await getCurrentUserProfile();
      userNickname = profile.nickname;
      userLeagues = profile.leagues;
      if (userLeagues.length > 0) {
        selectedLeague = userLeagues[0];
        activeLeagueName = userLeagues[0];
      }
      await loadLikedPosts();
      await loadPosts();
      renderView();
    } catch (err) {
      console.error("Failed loading user profile:", err);
    }
  }
  loadProfile();

  function renderView() {
    // Filter posts
    let processedPosts = posts.filter(post => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (
        (post.title && post.title.toLowerCase().includes(q)) ||
        post.nickname.toLowerCase().includes(q) ||
        post.league.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.platform.toLowerCase().includes(q)
      );

      if (!matchesSearch) return false;

      // If a post is private to a league, show it only if the user belongs to that league.
      // Otherwise, it is a public post and visible to all.
      if (post.visibility === 'league') {
        if (!post.league) return false;
        const cleanPostLeague = post.league.toLowerCase().replace('demo', '').replace(/\s+/g, '').trim();
        return userLeagues.some(l => {
          const cleanUserLeague = l.toLowerCase().replace('demo', '').replace(/\s+/g, '').trim();
          return cleanPostLeague.includes(cleanUserLeague) || cleanUserLeague.includes(cleanPostLeague);
        });
      }

      return true;
    });

    // Sort posts
    if (currentSort === 'new') {
      processedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (currentSort === 'popular') {
      processedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    const likedIds = getLikedPosts();

    container.innerHTML = `
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: 2rem; text-align: center;">
          <h1 class="gradient-text-green" style="font-size: 1.85rem; font-weight: 900; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            Comunidad de Castigos
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">
            La diversión de las ligas fantasy. Descubre cómo pagan sus castigos los mánagers de toda España. Dale me gusta a las mejores humillaciones y comparte la tuya.
          </p>
        </div>

        <!-- Acciones Principales (Buscador y botón de compartir) -->
        <div class="feed-controls" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="position: relative; flex-grow: 1; min-width: 280px;">
            <input type="text" id="feed-search" class="input-field" placeholder="Buscar por título, liga o castigo..." value="${searchQuery}" style="margin-bottom: 0; padding-left: 2.5rem;" />
          </div>

          <button id="toggle-form-btn" class="btn-primary" style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            Compartir mi Castigo
          </button>
        </div>

        <!-- Sort Bar Tabs -->
        <div style="display: flex; justify-content: flex-start; margin-bottom: 1.5rem;">
          <div class="feed-sort-tabs" style="display: flex; gap: 0.5rem; background: rgba(0, 0, 0, 0.2); padding: 0.25rem; border-radius: 10px; border: 1px solid var(--border-color);">
            <button class="sort-tab ${currentSort === 'new' ? 'active' : ''}" data-sort="new" style="background: ${currentSort === 'new' ? 'rgba(var(--primary-rgb), 0.12)' : 'transparent'}; color: ${currentSort === 'new' ? 'var(--primary)' : 'var(--text-muted)'}; border: ${currentSort === 'new' ? '1px solid rgba(var(--primary-rgb), 0.2)' : 'none'}; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
              Nuevos
            </button>
            <button class="sort-tab ${currentSort === 'popular' ? 'active' : ''}" data-sort="popular" style="background: ${currentSort === 'popular' ? 'rgba(var(--primary-rgb), 0.12)' : 'transparent'}; color: ${currentSort === 'popular' ? 'var(--primary)' : 'var(--text-muted)'}; border: ${currentSort === 'popular' ? '1px solid rgba(var(--primary-rgb), 0.2)' : 'none'}; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
              Populares
            </button>
          </div>
        </div>

        <!-- Formulario para compartir un nuevo castigo (Cajón Desplegable) -->
        <div id="new-post-card" class="card glass shadow-lg" style="margin-bottom: 2rem; display: ${isFormExpanded ? 'block' : 'none'}; border-color: var(--primary-glow); animation: slideDown 0.3s ease-out;">
          <h2 class="card-title gradient-text-gold" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Comparte tu Castigo Cumplido</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Introduce el enlace de tu publicación para que el resto de managers de la liga puedan verlo.
          </p>
          
          <div class="alert-info-banner" style="background: rgba(var(--primary-rgb), 0.08); border: 1px solid rgba(var(--primary-rgb), 0.2); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.8rem; color: var(--text-light); line-height: 1.4;">
            <strong>Política de Seguridad:</strong> Por seguridad y control de contenidos, solo permitimos enlaces públicos procedentes de <strong>Instagram</strong>, <strong>TikTok</strong> y <strong>YouTube</strong>.
          </div>

          <form id="add-feed-form">
            <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;">
              ${userLeagues.length > 1 ? `
                <div class="form-group">
                  <label for="feed-league">Selecciona la Liga del Castigo</label>
                  <select id="feed-league" class="input-field" required>
                    ${userLeagues.map(l => `<option value="${escapeHTML(l)}" ${l === selectedLeague ? 'selected' : ''}>${escapeHTML(l)}</option>`).join('')}
                  </select>
                </div>
              ` : `
                <div class="form-group">
                  <label>Liga del Castigo</label>
                  <div class="input-field" style="background: rgba(255,255,255,0.02); display: flex; align-items: center; border-color: rgba(255,255,255,0.05); color: var(--text-muted); cursor: not-allowed;">
                    ${escapeHTML(selectedLeague)}
                  </div>
                  <input type="hidden" id="feed-league" value="${escapeHTML(selectedLeague)}" />
                </div>
              `}

              <div class="form-group">
                <label for="feed-visibility">Visibilidad del Castigo</label>
                <select id="feed-visibility" class="input-field" required>
                  <option value="public">Foro Público</option>
                  <option value="league">${escapeHTML(activeLeagueName)}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="feed-url">Enlace de la Publicación (URL)</label>
                <input type="url" id="feed-url" class="input-field" placeholder="https://www.instagram.com/p/... o TikTok/YouTube" required style="margin-bottom: 0;" />
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Se detectará automáticamente si es Instagram, TikTok o YouTube.
                </p>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label for="feed-description">Descripción / ¿Qué castigo cumpliste?</label>
              <textarea id="feed-description" class="input-field" rows="3" placeholder="Ej: Fui al mercado en taparrabos cantando ópera por quedar último en la jornada de Biwenger..." required style="resize: vertical; min-height: 80px;"></textarea>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button type="button" id="cancel-form-btn" class="btn-secondary" style="padding: 0.6rem 1.25rem;">Cerrar</button>
              <button type="submit" class="btn-primary" style="padding: 0.6rem 1.75rem;">Publicar en el Muro</button>
            </div>
          </form>
        </div>

        <!-- Muro de Posts -->
        <div id="posts-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          ${processedPosts.length === 0 ? `
            <div class="card glass text-center" style="padding: 3rem 1rem;">
              <span style="display: block; margin-bottom: 1rem;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <h3 style="font-weight: 700; margin-bottom: 0.5rem;">No se encontraron castigos</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Prueba a buscar con otros términos o sé el primero en compartir tu vídeo.</p>
            </div>
          ` : processedPosts.map(post => {
            const isLiked = likedIds.includes(post.id);
            const timeAgo = formatTimeAgo(post.createdAt || new Date().toISOString(), post.id);

            // Icon markup for platforms
            let platformBadge = '';
            if (post.platform === 'instagram') {
              platformBadge = `<span class="platform-badge ig-badge">Instagram</span>`;
            } else if (post.platform === 'tiktok') {
              platformBadge = `<span class="platform-badge tt-badge">TikTok</span>`;
            } else if (post.platform === 'youtube') {
              platformBadge = `<span class="platform-badge yt-badge">YouTube</span>`;
            }

            const isOwnPost = (post.nickname === 'Tú' || post.nickname === userNickname || post.id.startsWith('feed-user-'));

            return `
              <div class="card glass feed-card" data-id="${post.id}" style="margin: 0; padding: 1.5rem; transition: transform var(--transition-normal), border-color var(--transition-normal); border: 1px solid var(--border-color); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                      <span style="color: var(--primary); font-weight: 800; background: rgba(var(--primary-rgb), 0.08); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(var(--primary-rgb), 0.15);">
                        ${escapeHTML(post.league || "General")}
                      </span>
                      <span>•</span>
                      <span style="color: var(--accent); font-weight: 700;">
                        @${escapeHTML(post.nickname)}
                      </span>
                      <span>•</span>
                      <span>${timeAgo}</span>
                    </div>
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-light); margin-bottom: 0.15rem;">
                      ${escapeHTML(post.title || "¡Castigo pagado!")}
                    </h3>
                  </div>
                  <div>
                    ${platformBadge}
                  </div>
                </div>

                <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-light); margin-bottom: 1.25rem; white-space: pre-wrap;">${escapeHTML(post.description)}</p>

                <div style="display: flex; align-items: center; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap;">
                  <button class="btn-like-post ${isLiked ? 'liked' : ''}" data-id="${post.id}" style="
                    background: transparent;
                    border: none;
                    color: ${isLiked ? 'var(--danger)' : 'var(--text-muted)'};
                    font-family: var(--font-sans);
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.65rem;
                    border-radius: 8px;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s;
                  ">
                    <span class="heart-icon" style="display: inline-flex; align-items: center; justify-content: center; transition: transform 0.2s;">
                      ${isLiked ? `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--danger)" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      ` : `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      `}
                    </span>
                    <span class="likes-count" style="color: ${isLiked ? 'var(--text-light)' : 'var(--text-muted)'}; margin-left: 0.25rem;">${post.likes}</span> Me Gusta
                  </button>

                  <button class="btn-comments-toggle" data-id="${post.id}" style="
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-family: var(--font-sans);
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.65rem;
                    border-radius: 8px;
                    transition: color 0.2s;
                  ">
                    <span style="display: inline-flex; align-items: center; justify-content: center;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </span>
                    <span style="margin-left: 0.25rem;">${post.comments ? post.comments.length : 0}</span> Comentarios
                  </button>

                  ${isOwnPost ? `
                    <button class="btn-delete-post" data-id="${post.id}" style="
                      background: transparent;
                      border: none;
                      color: var(--danger);
                      font-family: var(--font-sans);
                      font-weight: 700;
                      font-size: 0.85rem;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      gap: 0.35rem;
                      padding: 0.4rem 0.65rem;
                      border-radius: 8px;
                      transition: color 0.2s;
                      opacity: 0.8;
                    ">
                      <span style="display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </span>
                      <span style="margin-left: 0.25rem;">Borrar</span>
                    </button>
                  ` : ''}

                  <a href="${escapeHTML(post.url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="
                    padding: 0.45rem 1.1rem; 
                    font-size: 0.8rem; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.35rem; 
                    margin: 0;
                    text-decoration: none;
                    border-color: rgba(255, 255, 255, 0.1);
                    margin-left: auto;
                  ">
                    Ver Castigo ↗
                  </a>
                </div>

                <!-- Comments Accordion -->
                ${expandedComments[post.id] ? `
                  <div class="comments-container" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <div class="comments-list" style="margin-bottom: 1rem;">
                      ${(!post.comments || post.comments.length === 0) ? `
                        <div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 0.75rem 0;">
                          Sin comentarios aún. Sé el primero en comentar.
                        </div>
                      ` : post.comments.map(c => `
                        <div class="comment-item" style="margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          <div class="comment-header" style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                            <span class="comment-author" style="color: var(--accent); font-weight: 700;">@${escapeHTML(c.nickname)}</span>
                            <span class="comment-date">${formatTimeAgo(c.createdAt)}</span>
                          </div>
                          <div class="comment-text" style="font-size: 0.85rem;">${escapeHTML(c.text)}</div>
                        </div>
                      `).join('')}
                    </div>
                    
                    <form class="add-comment-form" data-id="${post.id}">
                      <div class="comment-form-row" style="display: flex; gap: 0.5rem;">
                        <input type="text" class="input-field comment-input" placeholder="Escribe un comentario..." maxlength="120" required style="padding: 0.5rem; font-size: 0.8rem; flex-grow: 1;" />
                        <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.8rem; font-weight: 700; white-space: nowrap;">Enviar</button>
                      </div>
                      <div class="comment-char-counter" style="font-size: 0.7rem; color: var(--text-muted); text-align: right; margin-top: 0.25rem;">
                        0 / 120 caracteres
                      </div>
                    </form>
                  </div>
                ` : ''}
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
        renderView();
      });
      searchInput.focus();
      searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    }

    // Hook Sort Tabs
    const sortTabs = container.querySelectorAll('.sort-tab');
    sortTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        currentSort = tab.getAttribute('data-sort');
        renderView();
      });
    });



    // Hook Delete Post Buttons
    const deletePostBtns = container.querySelectorAll('.btn-delete-post');
    deletePostBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        if (confirm('¿Estás seguro de que quieres borrar tu castigo compartido? Esta acción no se puede deshacer.')) {
          if (isConfigured) {
            try {
              const { error } = await supabase
                .from('feed_posts')
                .delete()
                .eq('id', id);
              if (error) throw error;
              showToast('Castigo eliminado', 'info');
              await loadPosts();
              renderView();
            } catch (err) {
              console.error(err);
              showToast('Error al eliminar de Supabase', 'error');
            }
          } else {
            posts = posts.filter(p => p.id !== id);
            localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
            showToast('Castigo eliminado', 'info');
            renderView();
          }
        }
      });
    });

    // Hook comments toggle button
    const commentToggleBtns = container.querySelectorAll('.btn-comments-toggle');
    commentToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        expandedComments[id] = !expandedComments[id];
        renderView();
      });
    });

    // Hook comments form submission
    const commentForms = container.querySelectorAll('.add-comment-form');
    commentForms.forEach(cForm => {
      cForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = cForm.getAttribute('data-id');
        const input = cForm.querySelector('.comment-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;

        const newComment = {
          id: "c-user-" + Date.now(),
          nickname: userNickname,
          text: text,
          createdAt: new Date().toISOString()
        };

        if (isConfigured) {
          try {
            const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
            const { data: dbComment, error: commentErr } = await supabase
              .from('feed_comments')
              .insert({
                post_id: id,
                nickname: userNickname,
                profile_id: currentUser ? currentUser.id : null,
                text: text
              })
              .select()
              .single();

            if (commentErr) throw commentErr;
            newComment.id = dbComment.id;
            newComment.createdAt = dbComment.created_at;
            await loadPosts();
          } catch (err) {
            console.error(err);
            showToast("Error al añadir comentario", "error");
            return;
          }
        } else {
          if (!posts[postIndex].comments) posts[postIndex].comments = [];
          posts[postIndex].comments.push(newComment);
          localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
        }

        showToast("Comentario añadido", "success");
        renderView();
        simulateBotReply(id);
      });
    });

    // Hook comments input char counters
    const commentInputs = container.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
      input.addEventListener('input', () => {
        const form = input.closest('.add-comment-form');
        const counter = form ? form.querySelector('.comment-char-counter') : null;
        if (counter) {
          counter.textContent = `${input.value.length} / 120 caracteres`;
        }
      });
    });

    // Hook autocomplete for comments
    commentInputs.forEach(input => {
      const formRow = input.closest('.comment-form-row');
      if (formRow) {
        formRow.style.position = 'relative';
        setupAutocomplete(input, formRow);
      }
    });

    // Hook autocomplete for description
    const descInput = container.querySelector('#feed-description');
    const descGroup = descInput ? descInput.closest('.form-group') : null;
    if (descInput && descGroup) {
      descGroup.style.position = 'relative';
      setupAutocomplete(descInput, descGroup);
    }

    // Hook toggle expand button
    const toggleFormBtn = container.querySelector('#toggle-form-btn');
    if (toggleFormBtn) {
      toggleFormBtn.addEventListener('click', () => {
        isFormExpanded = !isFormExpanded;
        renderView();
      });
    }

    // Hook cancel button inside form
    const cancelFormBtn = container.querySelector('#cancel-form-btn');
    if (cancelFormBtn) {
      cancelFormBtn.addEventListener('click', () => {
        isFormExpanded = false;
        renderView();
      });
    }

    // Hook feed league selection change
    const leagueSelect = container.querySelector('#feed-league');
    if (leagueSelect) {
      leagueSelect.addEventListener('change', (e) => {
        const newLeague = e.target.value;
        selectedLeague = newLeague;
        activeLeagueName = newLeague;
        
        // Dynamically update the option text in the visibility dropdown if it exists
        const visSelect = container.querySelector('#feed-visibility');
        if (visSelect) {
          const leagueOption = visSelect.querySelector('option[value="league"]');
          if (leagueOption) {
            leagueOption.textContent = newLeague;
          }
        }
      });
    }

    // Handle form submission
    const form = container.querySelector('#add-feed-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = form.querySelector('#feed-url').value.trim();
        const description = form.querySelector('#feed-description').value.trim();
        const leagueInput = form.querySelector('#feed-league');
        const league = leagueInput ? leagueInput.value.trim() : selectedLeague;
        const visibility = form.querySelector('#feed-visibility').value;

        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
          showToast("Twitter/X no está permitido por política de seguridad.", "error");
          return;
        }

        let platform = "";
        if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
          platform = "instagram";
        } else if (lowerUrl.includes("tiktok.com")) {
          platform = "tiktok";
        } else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
          platform = "youtube";
        } else {
          showToast("Enlace no reconocido. Solo se admiten Instagram, TikTok o YouTube.", "error");
          return;
        }

        // Auto-generate title from description
        let title = "Castigo cumplido";
        if (description) {
          const cleanDesc = description.replace(/[^\w\sñáéíóúü]/gi, '').trim();
          const words = cleanDesc.split(/\s+/).slice(0, 5);
          if (words.length > 0 && words[0]) {
            title = words.join(' ') + '...';
          }
        }

        const newPost = {
          id: "feed-user-" + Date.now(),
          title,
          nickname: userNickname,
          league,
          platform,
          url,
          description,
          likes: 0,
          createdAt: new Date().toISOString(),
          comments: [],
          visibility
        };

        if (isConfigured) {
          try {
            const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
            const { data: dbPost, error: insertErr } = await supabase
              .from('feed_posts')
              .insert({
                title,
                nickname: userNickname,
                profile_id: currentUser ? currentUser.id : null,
                league,
                platform,
                url,
                description,
                visibility,
                likes: 0
              })
              .select()
              .single();

            if (insertErr) throw insertErr;
            newPost.id = dbPost.id;
            newPost.createdAt = dbPost.created_at;
            await loadPosts();
          } catch (err) {
            console.error(err);
            showToast("Error al publicar en Supabase", "error");
            return;
          }
        } else {
          posts.unshift(newPost);
          localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
        }

        isFormExpanded = false;
        showToast("Publicado en la comunidad", "success");
        renderView();
        simulateBotReply(newPost.id);
      });
    }

    // Hook likes
    const postsContainer = container.querySelector('#posts-grid');
    if (postsContainer) {
      hookLikeButtons(postsContainer);
    }
  }

  // Hook event handlers to Me Gusta buttons
  function hookLikeButtons(parent) {
    const likeButtons = parent.querySelectorAll('.btn-like-post');
    likeButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;

        let currentLikes = posts[postIndex].likes;
        if (likedIds.includes(id)) {
          likedIds = likedIds.filter(x => x !== id);
          currentLikes = Math.max(0, currentLikes - 1);
        } else {
          likedIds.push(id);
          currentLikes += 1;
        }

        if (isConfigured) {
          try {
            const currentUser = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
            if (currentUser) {
              if (likedIds.includes(id)) {
                await supabase
                  .from('feed_likes')
                  .insert({
                    post_id: id,
                    profile_id: currentUser.id
                  });
              } else {
                await supabase
                  .from('feed_likes')
                  .delete()
                  .eq('post_id', id)
                  .eq('profile_id', currentUser.id);
              }
            }
            await supabase
              .from('feed_posts')
              .update({ likes: currentLikes })
              .eq('id', id);

            await loadPosts();
          } catch (err) {
            console.error(err);
          }
        } else {
          posts[postIndex].likes = currentLikes;
          localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(posts));
        }

        saveLikedPosts(likedIds);
        renderView();
      });
    });
  }

  // Formatter helper for friendly timestamps
  function formatTimeAgo(isoString, postId) {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (postId && postId.startsWith("feed-mock-")) {
        if (postId === "feed-mock-1") return "Hace 2 días";
        if (postId === "feed-mock-2") return "Hace 3 días";
        if (postId === "feed-mock-3") return "Hace 1 semana";
        if (postId === "feed-mock-4") return "Hace 5 días";
      }

      if (diffMin < 1) return "Ahora mismo";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHr < 24) return `Hace ${diffHr} hora${diffHr > 1 ? 's' : ''}`;
      if (diffDay < 7) return `Hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
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

  // Helper to detect current mention handle being typed at cursor position
  function getMentionQuery(inputElement) {
    const value = inputElement.value;
    const cursor = inputElement.selectionStart;
    
    const lastAt = value.lastIndexOf('@', cursor - 1);
    if (lastAt === -1) return null;
    
    const textBetween = value.substring(lastAt + 1, cursor);
    if (/\s/.test(textBetween)) return null;
    
    if (lastAt > 0 && !/\s/.test(value[lastAt - 1])) return null;
    
    return {
      query: textBetween.toLowerCase(),
      start: lastAt,
      end: cursor
    };
  }

  // Helper to set up mention autocomplete dropdown
  function setupAutocomplete(inputElement, parentContainer) {
    let suggestionsContainer = null;
    const MANAGERS = ["Paco G.", "Álvaro M.", "Santi K.", "Marta R.", "Luis T.", "Tú"];
    const allManagers = [...new Set([userNickname, ...MANAGERS])].filter(Boolean);
    
    function removeDropdown() {
      if (suggestionsContainer) {
        suggestionsContainer.remove();
        suggestionsContainer = null;
      }
    }
    
    inputElement.addEventListener('input', () => {
      const mentionData = getMentionQuery(inputElement);
      if (!mentionData) {
        removeDropdown();
        return;
      }
      
      const query = mentionData.query;
      const matches = allManagers.filter(name => name.toLowerCase().includes(query));
      if (matches.length === 0) {
        removeDropdown();
        return;
      }
      
      if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'mention-suggestions glass shadow-lg';
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.left = '0';
        suggestionsContainer.style.right = '0';
        suggestionsContainer.style.zIndex = '1000';
        suggestionsContainer.style.background = '#0d1114';
        suggestionsContainer.style.border = '1px solid var(--border-color-glow)';
        suggestionsContainer.style.borderRadius = '8px';
        suggestionsContainer.style.maxHeight = '150px';
        suggestionsContainer.style.overflowY = 'auto';
        suggestionsContainer.style.marginTop = '4px';
        suggestionsContainer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.7)';
        parentContainer.appendChild(suggestionsContainer);
      }
      
      suggestionsContainer.innerHTML = matches.map(name => `
        <button type="button" class="mention-item" data-name="${escapeHTML(name)}" style="
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.6rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-light);
          text-align: left;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 700;
          transition: background 0.2s, color 0.2s;
        ">
          <span style="color: var(--accent); font-weight: 800;">@</span>
          <span style="color: var(--text-light);">${escapeHTML(name)}</span>
        </button>
      `).join('');
      
      suggestionsContainer.querySelectorAll('.mention-item').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.background = 'rgba(var(--primary-rgb), 0.12)';
          btn.style.color = 'var(--primary)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--text-light)';
        });
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = btn.getAttribute('data-name');
          const value = inputElement.value;
          
          const before = value.substring(0, mentionData.start);
          const after = value.substring(mentionData.end);
          inputElement.value = before + '@' + name + ' ' + after;
          
          const newCursorPos = mentionData.start + name.length + 2; // @ and space
          inputElement.focus();
          inputElement.setSelectionRange(newCursorPos, newCursorPos);
          
          removeDropdown();
          inputElement.dispatchEvent(new Event('input'));
        });
      });
    });
    
    document.addEventListener('click', (e) => {
      if (suggestionsContainer && !inputElement.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        removeDropdown();
      }
    });
  }

  // Simulates a bot reply after 3 seconds, mentioning the active user
  function simulateBotReply(postId) {
    setTimeout(async () => {
      const managersList = ["Paco G.", "Álvaro M.", "Santi K.", "Marta R.", "Luis T."].filter(m => m !== userNickname);
      const randomManager = managersList[Math.floor(Math.random() * managersList.length)];
      
      const botPhrases = [
        `Jajaja @${userNickname} ¡qué locura de castigo! 🤣`,
        `¡Qué grande @${userNickname}! Cumpliendo a rajatabla.`,
        `Espectacular vídeo @${userNickname}. Mis dieces.`,
        `¡Por fin lo subes, @${userNickname}! Todos queríamos verlo.`,
        `Jajaja @${userNickname} te pasaste el juego.`
      ];
      const randomPhrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
      
      const newComment = {
        id: "c-bot-" + Date.now(),
        nickname: randomManager,
        text: randomPhrase,
        createdAt: new Date().toISOString()
      };
      
      if (isConfigured) {
        try {
          const { data: postExists } = await supabase
            .from('feed_posts')
            .select('id')
            .eq('id', postId)
            .maybeSingle();

          if (!postExists) return;

          const { data: dbComment } = await supabase
            .from('feed_comments')
            .insert({
              post_id: postId,
              nickname: randomManager,
              text: randomPhrase
            })
            .select()
            .single();

          if (dbComment) {
            newComment.id = dbComment.id;
            newComment.createdAt = dbComment.created_at;
          }
          await loadPosts();
        } catch (err) {
          console.error("Error inserting bot reply on Supabase:", err);
        }
      } else {
        let currentPosts = JSON.parse(localStorage.getItem('CF_COMMUNITY_FEED') || '[]');
        const postIndex = currentPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        if (!currentPosts[postIndex].comments) currentPosts[postIndex].comments = [];
        currentPosts[postIndex].comments.push(newComment);
        localStorage.setItem('CF_COMMUNITY_FEED', JSON.stringify(currentPosts));
        posts = currentPosts;
      }
      
      let count = parseInt(localStorage.getItem('CF_COMMUNITY_NOTIFICATIONS_COUNT') || '0', 10);
      localStorage.setItem('CF_COMMUNITY_NOTIFICATIONS_COUNT', (count + 1).toString());
      
      showToast(`${randomManager} te ha mencionado en un comentario`, "info");
      window.dispatchEvent(new CustomEvent('cf-notification-update'));
      renderView();
    }, 3000);
  }

  // Initial display call
  renderView();
}
