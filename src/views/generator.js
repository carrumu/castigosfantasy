import { supabase } from '../supabase';

/**
 * Renders the interactive public Punishment Generator.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 */
export function renderGenerator(container, callbacks) {
  // 1. Database of fun, high-quality fantasy football punishments (Emoji-free & Low-cost)
  const PUNISHMENT_IDEAS = [
    {
        id: "gen-1",
        name: "Foto de Perfil Castigada",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Ponerte una foto de perfil de WhatsApp elegida por el ganador durante 24h."
    },
    {
        id: "gen-2",
        name: "Estado de Derrota",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Poner un estado de WhatsApp que diga 'Soy el peor mánager de la historia' durante 24h."
    },
    {
        id: "gen-3",
        name: "El Baile Viral",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Aprenderse y grabar el baile o trend de TikTok más viral del momento y mandarlo al grupo de WhatsApp."
    },
    {
        id: "gen-4",
        name: "Poema al Resto",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Escribir un poema de 4 líneas dedicado al jugador que más te ha restado y pasarlo al grupo."
    },
    {
        id: "gen-5",
        name: "Recreación de Meme",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Recrear un meme clásico en casa y mandar la foto al grupo."
    },
    {
        id: "gen-6",
        name: "Celebración Falsa",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo de 15s imitando la celebración de un gol famoso en el salón de tu casa."
    },
    {
        id: "gen-7",
        name: "Close Friends",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Subir foto a 'Mejores Amigos' en Instagram llorando falsamente por la jornada."
    },
    {
        id: "gen-8",
        name: "Lip Sync de Moda",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Grabar un vídeo haciendo un playback (lip sync) súper exagerado de un audio viral de TikTok y enviarlo al grupo."
    },
    {
        id: "gen-9",
        name: "Retrato Robot",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Dibujar a mano al mánager ganador de la jornada en un papel (versión cutre) y pasar foto."
    },
    {
        id: "gen-10",
        name: "El Filtro Llorón",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Subir una historia de Instagram o mandar un vídeo al grupo usando el filtro viral de cara de asco o llorando para explicar tu derrota."
    },
    {
        id: "gen-11",
        name: "Toques de Papel",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo intentando dar 10 toques seguidos a un rollo de papel higiénico."
    },
    {
        id: "gen-12",
        name: "Locutor de Documental",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Mandar un audio narrando tu derrota como si fueras un locutor de documentales de animales."
    },
    {
        id: "gen-13",
        name: "Mímica del Fracaso",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer mímica de tu peor jugador de la jornada en un vídeo corto para que el grupo lo adivine."
    },
    {
        id: "gen-14",
        name: "Vaso Sin Manos",
        category: "food",
        categoryLabel: "Alimenticio",
        intensity: 3,
        description: "Grabar un vídeo bebiendo un poco de agua de un vaso apoyado en la mesa, sin usar las manos."
    },
    {
        id: "gen-15",
        name: "Selfie Recién Levantado",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Mandar un selfie al grupo nada más levantarte por la mañana con 'cara de perdedor'."
    },
    {
        id: "gen-16",
        name: "Nombre Ridículo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Cambiar el nombre de tu equipo fantasy por uno ridículo que elija el líder durante 1 jornada."
    },
    {
        id: "gen-17",
        name: "Desayuno Épico",
        category: "food",
        categoryLabel: "Alimenticio",
        intensity: 2,
        description: "Narrar por audio de WhatsApp cómo te preparas el desayuno usando tono épico de batalla."
    },
    {
        id: "gen-18",
        name: "Transición Fallida",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Hacer un vídeo intentando un trend de 'transición de ropa' viral de TikTok y que te salga horriblemente mal a propósito."
    },
    {
        id: "gen-19",
        name: "Tutorial de Fracaso",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 3,
        description: "Hacer un mini-tutorial en vídeo de 30s de 'Cómo NO alinear en un fantasy'."
    },
    {
        id: "gen-20",
        name: "Llantos de Audio",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Grabar un audio de 20s como si estuvieras llorando amargamente (de broma) por tu derrota."
    },
    {
        id: "gen-21",
        name: "Bailar la Macarena",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Bailar el estribillo de la Macarena en un vídeo rápido para el grupo."
    },
    {
        id: "gen-22",
        name: "Perdón al Capitán",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer un vídeo corto pidiendo perdón de rodillas a tu capitán fantasy por decepcionarle."
    },
    {
        id: "gen-23",
        name: "Gurú de Palo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Subir una historia diciendo 'Vendo consejos de Fantasy' con tono irónico."
    },
    {
        id: "gen-24",
        name: "Zoológico de Derrotas",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Enviar un audio imitando el sonido de 3 animales diferentes llorando."
    },
    {
        id: "gen-25",
        name: "El GIF Humano",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Recrear tu reacción al ver los puntos de tu equipo grabando un GIF propio de 3 segundos."
    },
    {
        id: "gen-26",
        name: "Entrenador Pensativo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Hacerte una foto en el espejo con gesto de entrenador preocupado y mandarla al grupo."
    },
    {
        id: "gen-27",
        name: "Elogios Obligados",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Escribir en el grupo 3 cosas positivas del equipo del ganador sin ningún tipo de sarcasmo."
    },
    {
        id: "gen-28",
        name: "Prensa Falsa",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Grabar un vídeo dando explicaciones a la prensa usando un cepillo de dientes como micrófono."
    },
    {
        id: "gen-29",
        name: "Minuto de Quejas",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Mandar un audio de 1 minuto cronometrado hablando sin parar de la mala suerte que tienes."
    },
    {
        id: "gen-30",
        name: "Dibujo Táctico",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer un dibujo rápido con bolígrafo de tu supuesto 'esquema táctico' y pasarlo al grupo."
    },
    {
        id: "gen-31",
        name: "Desorientado",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Ponerte una camiseta del revés y hacerte una foto con cara desorientada para el grupo."
    },
    {
        id: "gen-32",
        name: "El Fallo Técnico",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Imitar en vídeo el peor gesto técnico (ej. un tropezón) de tu peor jugador de la jornada."
    },
    {
        id: "gen-33",
        name: "Cantando Bajo la Ducha",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 3,
        description: "Grabar un audio de 15s cantando tristemente dentro de la ducha (sin agua)."
    },
    {
        id: "gen-34",
        name: "Emoji de Payaso",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Poner de estado de WhatsApp un único emoji de payaso 🤡 durante 24h."
    },
    {
        id: "gen-35",
        name: "Jeroglífico Fantasy",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Explicar tu derrota usando únicamente emojis (sin letras) en un mensaje al grupo."
    },
    {
        id: "gen-36",
        name: "Flexiones de Castigo",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo haciendo 5 flexiones como 'castigo físico' por la mala táctica."
    },
    {
        id: "gen-37",
        name: "La Llamada del Presi",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Enviar un audio simulando que estás recibiendo la llamada de despido de la directiva."
    },
    {
        id: "gen-38",
        name: "Carta de Dimisión",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Escribir a mano una carta formal de dimisión de broma, firmarla y pasar foto al grupo."
    }
];

  // 2. Active state
  let currentPunishment = null;
  let isRuffling = false;
  let hasGenerated = false;
  let isRejecting = false; // state to control rejection flow

  // Saved punishments lists loaded from localStorage
  let savedList = [];
  let rejectedList = [];
  try {
    savedList = JSON.parse(localStorage.getItem('CF_ACCEPTED_PUNISHMENTS') || '[]');
  } catch (e) {
    savedList = [];
  }
  try {
    rejectedList = JSON.parse(localStorage.getItem('CF_REJECTED_PUNISHMENTS') || '[]');
  } catch (e) {
    rejectedList = [];
  }

  // League details & members resolving
  const activeLeagueId = localStorage.getItem('CF_ACTIVE_LEAGUE_ID');
  let members = [];
  let fullMembersList = [];
  let currentUserApodo = "Entrenador Anónimo";

  async function savePunishmentEvent(punishmentName, status, targetProfileId) {
    if (isGuest || !activeLeagueId) return;
    try {
      const user = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      const finalProfileId = targetProfileId || (user ? user.id : null);
      if (finalProfileId) {
        await supabase
          .from('punishment_events')
          .insert({
            league_id: activeLeagueId,
            profile_id: finalProfileId,
            punishment_name: punishmentName,
            status: status
          });
      }
    } catch (e) {
      console.error('Error saving punishment event to Supabase:', e);
    }
  }

  // Anti-cheat auto register on page unload or reload
  function autoRegisterRejection() {
    if (hasGenerated && currentPunishment) {
      const isAlreadySaved = rejectedList.some(
        x => x.id === currentPunishment.id && Math.abs(Date.now() - x.timestamp) < 2000
      );
      if (!isAlreadySaved) {
        const rejectedItem = {
          id: currentPunishment.id,
          name: currentPunishment.name,
          player: currentUserApodo,
          timestamp: Date.now()
        };
        rejectedList.push(rejectedItem);
        localStorage.setItem('CF_REJECTED_PUNISHMENTS', JSON.stringify(rejectedList));
        savePunishmentEvent(currentPunishment.name, 'rechazado', null);
      }
    }
  }

  function handleBeforeUnload() {
    autoRegisterRejection();
  }

  // Intercept navigation to auto-register before leaving view
  const originalNavigate = callbacks.onNavigate;
  callbacks.onNavigate = (route) => {
    autoRegisterRejection();
    window.removeEventListener('beforeunload', handleBeforeUnload);
    originalNavigate(route);
  };

  async function loadLeagueMembers() {
    // Resolve logged in profile details
    try {
      const user = supabase.auth.user ? supabase.auth.user() : (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('apodo, display_name')
          .eq('id', user.id)
          .single();
        if (profile) {
          currentUserApodo = profile.apodo || profile.display_name || "Entrenador";
        }
      }
    } catch (e) {
      console.error('Error fetching profile in generator:', e);
    }

    if (activeLeagueId) {
      try {
        const { data: list, error } = await supabase
          .from('league_members')
          .select('profile_id, profiles(apodo, display_name)')
          .eq('league_id', activeLeagueId);
        
        if (!error && list) {
          fullMembersList = list.map(m => ({
            id: m.profile_id,
            name: m.profiles?.apodo || m.profiles?.display_name || 'Desconocido'
          }));
          members = fullMembersList.map(m => m.name);
        }
      } catch (e) {
        console.error('Error fetching league members for generator:', e);
      }
    }
    // Fallback if guest/demo mode or database empty
    if (members.length === 0) {
      members = ["Paco G.", "Álvaro M.", "Santi K.", "Luis T."];
    }

    // Attach unload listener
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);

    renderView();
  }

  // 3. Main render function
  function renderView() {
    container.innerHTML = `
      <div class="generator-view container fade-in-up" style="max-width: 500px; margin: 0 auto; padding-bottom: 3rem; text-align: center;">
        
        <!-- Header -->
        <div style="margin-bottom: 2rem;">
          <h1 class="gradient-text-green" style="font-family: var(--font-display); font-size: 2.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 0.5rem; line-height: 1.1;">
            Generador de Castigos
          </h1>
          <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">
            ¿El perdedor de tu liga no sabe cómo pagar su derrota? Genera ideas locas y competitivas al azar.
          </p>
        </div>

        <!-- Main Generation Card -->
        <div class="card-outer-wrapper" style="margin-bottom: 1.5rem; text-align: left;">
          <div class="generator-card" id="active-card" style="background: var(--bg-card); border: 3.5px solid #000; box-shadow: 8px 8px 0px #000; padding: 1.5rem; min-height: 250px; display: flex; flex-direction: column; position: relative; transition: transform 0.15s ease, box-shadow 0.15s ease;">
            
            <!-- Card Header (Simple, category and intensity removed) -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <span style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">
                Propuesta de Castigo
              </span>
            </div>

            <!-- Card Body -->
            <h2 id="card-title" style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.85rem; color: var(--text-light); line-height: 1.2;">
              ${hasGenerated && currentPunishment ? currentPunishment.name : "Generar Castigo"}
            </h2>
            <p id="card-desc" style="font-size: 0.88rem; line-height: 1.45; color: var(--text-muted); min-height: 4.5rem; margin-bottom: 1.5rem;">
              ${hasGenerated && currentPunishment ? currentPunishment.description : "Haz clic en 'Generar Castigo' o en 'Ruleta Rápida' para ver una propuesta aleatoria para el perdedor de tu jornada."}
            </p>

            <!-- Card Actions (Only visible when generated) -->
            ${hasGenerated && currentPunishment ? `
              
              ${isRejecting ? `
                <!-- Rejection Form inside the actions block -->
                <div style="display: flex; flex-direction: column; gap: 0.6rem; border-top: 2.5px solid #000; padding-top: 1rem; margin-top: auto;">
                  <div style="text-align: left; margin-bottom: 0.15rem;">
                    <label style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">¿Qué jugador rechaza el castigo?</label>
                    <select id="select-reject-player" style="width: 100%; background: #2a2a2a; border: 2px solid #000; border-radius: 4px; padding: 0.3rem 0.5rem; color: var(--text-light); font-family: var(--font-sans); font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-bottom: 0.4rem;">
                      ${members.map(m => `<option value="${m}">${m}</option>`).join('')}
                      <option value="custom">-- Escribir otro nombre --</option>
                    </select>
                    <input type="text" id="input-reject-custom-player" placeholder="Escribe el nombre..." style="display: none; width: 100%; background: rgba(0,0,0,0.25); border: 2px solid #000; border-radius: 4px; padding: 0.3rem 0.5rem; color: var(--text-light); font-family: var(--font-sans); font-size: 0.8rem;">
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="brutalist-btn" id="btn-confirm-reject" style="flex: 1; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: #962d2d !important; background-image: none !important; color: #fff !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      Registrar
                    </button>
                    <button class="brutalist-btn" id="btn-cancel-reject" style="flex: 1; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: #333333 !important; background-image: none !important; color: #fff !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      Cancelar
                    </button>
                  </div>
                </div>
              ` : `
                <!-- Standard Action Button Row -->
                <div style="display: flex; flex-direction: column; gap: 0.6rem; border-top: 2.5px solid #000; padding-top: 1rem; margin-top: auto;">
                  <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; justify-content: space-between;">
                    <!-- Accept (Green/Lime) & Reject (Muted Dark Red) - Same size, styling forced with !important to bypass global yellow css classes -->
                    <button class="brutalist-btn" id="btn-accept-punishment" style="flex: 1; min-width: 100px; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: var(--accent) !important; background-image: none !important; color: #000 !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      Aceptar
                    </button>
                    <button class="brutalist-btn" id="btn-reject-punishment" style="flex: 1; min-width: 100px; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: #962d2d !important; background-image: none !important; color: #fff !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      No Aceptar
                    </button>
                    
                    <div style="display: flex; gap: 0.5rem; justify-content: center; flex-shrink: 0;">
                      <!-- Copy (Icon only, dark grey background) -->
                      <button class="brutalist-btn" id="btn-copy-card" style="width: 38px; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #333333 !important; background-image: none !important; color: var(--text-light) !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important;" title="Copiar al portapapeles">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      
                      <!-- Share WhatsApp (Icon only, WhatsApp green) -->
                      <button class="brutalist-btn" id="btn-share-whatsapp" style="width: 38px; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #25d366 !important; background-image: none !important; color: #000 !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important;" title="Compartir por WhatsApp">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              `}

            ` : ''}

          </div>
        </div>

        <!-- Spin Actions -->
        ${!(hasGenerated && currentPunishment) ? `
        <div style="display: flex; gap: 0.75rem;">
          <button class="brutalist-btn" id="btn-generate-punishment" style="flex: 1; padding: 0.85rem; font-weight: 800; font-size: 0.95rem; background: var(--accent) !important; background-image: none !important; color: #000 !important; border: 3px solid #000; box-shadow: 4px 4px 0px #000; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            <span>Generar Castigo</span>
          </button>
          <button class="brutalist-btn" id="btn-slots-punishment" style="padding: 0.85rem 1.25rem; font-weight: 800; font-size: 0.95rem; background: #1e1e1e !important; background-image: none !important; color: #fff !important; border: 3px solid #000 !important; box-shadow: 4px 4px 0px #000 !important; cursor: pointer;">
            Ruleta Rápida
          </button>
        </div>
        ` : `
        <div style="text-align: center; padding: 0.75rem; background: rgba(0,0,0,0.3); border: 2.5px dashed #444; border-radius: 4px;">
          <p style="margin: 0; font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">Debes aceptar o rechazar el castigo para generar otro nuevo.</p>
        </div>
        `}

        <!-- Saved Punishments Section -->
        <div id="saved-punishments-section" style="margin-top: 2rem; display: ${savedList.length > 0 ? 'block' : 'none'};">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin: 0;">
              Castigos Aceptados
            </h3>
            <button class="brutalist-btn" id="btn-clear-all-saved" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; background: #333333 !important; background-image: none !important; color: #ccc !important; border: 2px solid #555; cursor: pointer;">
              Limpiar Todo
            </button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem;" id="saved-list-container">
            ${savedList.map((item, idx) => `
              <div class="brutalist-card" style="padding: 0.85rem; background: rgba(0,0,0,0.25); border: 2.5px solid #000; border-left: 4px solid var(--accent); display: flex; justify-content: space-between; align-items: flex-start; border-radius: 4px;">
                <div style="text-align: left; padding-right: 1rem; flex-grow: 1;">
                  <h4 style="font-size: 0.9rem; font-weight: 800; margin: 0; color: var(--text-light); line-height: 1.2;">${item.name}</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.35rem 0 0 0; line-height: 1.3;">${item.description}</p>
                </div>
                <button class="brutalist-btn btn-delete-saved" data-idx="${idx}" style="width: 28px !important; height: 28px; padding: 0; background: transparent !important; background-image: none !important; color: #888 !important; border: 1.5px solid #444; border-radius: 4px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" title="Quitar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Rejected Punishments Section (Lista de Cobardes) -->
        <div id="rejected-punishments-section" style="margin-top: 2rem; display: ${rejectedList.length > 0 ? 'block' : 'none'};">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin: 0;">
              Lista de Cobardes (Rechazados)
            </h3>
            <button class="brutalist-btn" id="btn-clear-all-rejected" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; background: #333333 !important; background-image: none !important; color: #ccc !important; border: 2px solid #555; cursor: pointer;">
              Limpiar Todo
            </button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem;" id="rejected-list-container">
            ${rejectedList.map((item, idx) => `
              <div class="brutalist-card" style="padding: 0.85rem; background: rgba(0,0,0,0.25); border: 2.5px solid #000; border-left: 4px solid #962d2d; display: flex; justify-content: space-between; align-items: flex-start; border-radius: 4px;">
                <div style="text-align: left; padding-right: 1rem; flex-grow: 1;">
                  <h4 style="font-size: 0.9rem; font-weight: 800; margin: 0; color: var(--text-light); line-height: 1.2;">${item.name}</h4>
                  <div style="font-size: 0.65rem; font-weight: 800; color: #ff6b6b; margin-top: 0.25rem; text-transform: uppercase;">
                    Rechazó: ${item.player}
                  </div>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.35rem 0 0 0; line-height: 1.3;">Rechazó cumplir este castigo.</p>
                </div>
                <button class="brutalist-btn btn-delete-rejected" data-idx="${idx}" style="width: 28px !important; height: 28px; padding: 0; background: transparent !important; background-image: none !important; color: #888 !important; border: 1.5px solid #444; border-radius: 4px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" title="Quitar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // 4. Attach layout interactive listeners
    setupListeners();
  }

  function setupListeners() {
    const cardEl = container.querySelector('#active-card');

    // Pick dynamic punishment helper
    const triggerGenerate = () => {
      if (isRuffling) return;

      // Anti-cheat: Auto-register previous if they generate again without accepting
      if (hasGenerated && currentPunishment) {
        autoRegisterRejection();
      }

      // Add shuffle/flip animation
      cardEl.classList.add('shuffling');

      setTimeout(() => {
        // Pick random element that is different if possible
        let available = PUNISHMENT_IDEAS;
        if (currentPunishment) {
          available = PUNISHMENT_IDEAS.filter(x => x.id !== currentPunishment.id);
        }
        const randomIndex = Math.floor(Math.random() * available.length);
        currentPunishment = available[randomIndex];
        hasGenerated = true;
        isRejecting = false; // reset rejection state on new spin

        renderView();
      }, 300);
    };

    const genBtn = container.querySelector('#btn-generate-punishment');
    if (genBtn) {
      genBtn.addEventListener('click', triggerGenerate);
    }

    // Accept Punishment Click
    const acceptBtn = container.querySelector('#btn-accept-punishment');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        if (!currentPunishment) return;
        
        // Push to saved list if not already there
        if (!savedList.some(x => x.id === currentPunishment.id)) {
          savedList.push(currentPunishment);
          localStorage.setItem('CF_ACCEPTED_PUNISHMENTS', JSON.stringify(savedList));
          savePunishmentEvent(currentPunishment.name, 'aceptado', null);
        }
        
        callbacks.showToast(`Castigo aceptado y guardado`, "success");
        
        // Reset card state
        currentPunishment = null;
        hasGenerated = false;
        renderView();
      });
    }

    // Reject Punishment Click (No Aceptar) - Switch to rejection form flow
    const rejectBtn = container.querySelector('#btn-reject-punishment');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        isRejecting = true;
        renderView();
      });
    }

    // Rejection Form listeners
    if (isRejecting) {
      const selectRejectPlayer = container.querySelector('#select-reject-player');
      const inputRejectCustom = container.querySelector('#input-reject-custom-player');
      
      if (selectRejectPlayer && inputRejectCustom) {
        selectRejectPlayer.addEventListener('change', (e) => {
          if (e.target.value === 'custom') {
            inputRejectCustom.style.display = 'block';
            inputRejectCustom.focus();
          } else {
            inputRejectCustom.style.display = 'none';
          }
        });
      }

      // Confirm Reject button click
      const confirmRejectBtn = container.querySelector('#btn-confirm-reject');
      if (confirmRejectBtn) {
        confirmRejectBtn.addEventListener('click', () => {
          if (!currentPunishment) return;

          let player = selectRejectPlayer.value;
          let targetProfileId = null;
          
          if (player === 'custom') {
            player = inputRejectCustom.value.trim();
          } else {
            const match = fullMembersList.find(m => m.name === player);
            if (match) {
              targetProfileId = match.id;
            }
          }
          
          if (!player) {
            player = 'Desconocido';
          }

          const rejectedItem = {
            id: currentPunishment.id,
            name: currentPunishment.name,
            player: player,
            timestamp: Date.now()
          };

          rejectedList.push(rejectedItem);
          localStorage.setItem('CF_REJECTED_PUNISHMENTS', JSON.stringify(rejectedList));
          
          savePunishmentEvent(currentPunishment.name, 'rechazado', targetProfileId);
          callbacks.showToast(`Rechazo registrado para ${player}`, "info");

          // Reset card state
          currentPunishment = null;
          hasGenerated = false;
          isRejecting = false;
          renderView();
        });
      }

      // Cancel Rejection click (Now records as rejected by the current active coach if cancelled/navigated)
      const cancelRejectBtn = container.querySelector('#btn-cancel-reject');
      if (cancelRejectBtn) {
        cancelRejectBtn.addEventListener('click', () => {
          autoRegisterRejection();
          callbacks.showToast("Castigo cancelado (se ha registrado en tu lista de cobardes)", "info");
          
          currentPunishment = null;
          hasGenerated = false;
          isRejecting = false;
          renderView();
        });
      }
    }

    // Delete Saved Punishment
    container.querySelectorAll('.btn-delete-saved').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        savedList.splice(idx, 1);
        localStorage.setItem('CF_ACCEPTED_PUNISHMENTS', JSON.stringify(savedList));
        callbacks.showToast("Castigo eliminado de aceptados", "info");
        renderView();
      });
    });

    // Delete Rejected Punishment
    container.querySelectorAll('.btn-delete-rejected').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        rejectedList.splice(idx, 1);
        localStorage.setItem('CF_REJECTED_PUNISHMENTS', JSON.stringify(rejectedList));
        callbacks.showToast("Registro de cobarde eliminado", "info");
        renderView();
      });
    });

    // Clear All Saved Punishments
    const clearAllBtn = container.querySelector('#btn-clear-all-saved');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres borrar todos los castigos aceptados?')) {
          savedList = [];
          localStorage.setItem('CF_ACCEPTED_PUNISHMENTS', JSON.stringify(savedList));
          callbacks.showToast("Todos los castigos han sido borrados", "info");
          renderView();
        }
      });
    }

    // Clear All Rejected Punishments
    const clearAllRejectedBtn = container.querySelector('#btn-clear-all-rejected');
    if (clearAllRejectedBtn) {
      clearAllRejectedBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres limpiar el historial de rechazos?')) {
          rejectedList = [];
          localStorage.setItem('CF_REJECTED_PUNISHMENTS', JSON.stringify(rejectedList));
          callbacks.showToast("Historial de rechazos limpiado", "info");
          renderView();
        }
      });
    }

    // Copy to clipboard
    const copyBtn = container.querySelector('#btn-copy-card');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!currentPunishment) return;
        const textToCopy = `CastigoFantasy: ${currentPunishment.name} - ${currentPunishment.description}`;
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            callbacks.showToast("Castigo copiado al portapapeles", "success");
          })
          .catch(() => {
            callbacks.showToast("Error al copiar al portapapeles", "error");
          });
      });
    }

    // Share directly via WhatsApp
    const shareBtn = container.querySelector('#btn-share-whatsapp');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (!currentPunishment) return;
        const shareText = encodeURIComponent(`*CastigoFantasy: ${currentPunishment.name}* \n\n_${currentPunishment.description}_ \n\nGenera más ideas en http://localhost:3000/generador`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
      });
    }

    // Slots Machine Mode (Ruleta Rápida)
    const slotsBtn = container.querySelector('#btn-slots-punishment');
    if (slotsBtn) {
      slotsBtn.addEventListener('click', () => {
        if (isRuffling) return;

        // Anti-cheat: Auto-register previous if they trigger slots again without accepting
        if (hasGenerated && currentPunishment) {
          autoRegisterRejection();
        }

        isRuffling = true;
        cardEl.classList.add('slots-spinning');

        let counter = 0;
        const intervalTime = 80;
        const totalSteps = 15;

        const timer = setInterval(() => {
          const tempIndex = Math.floor(Math.random() * PUNISHMENT_IDEAS.length);
          const temp = PUNISHMENT_IDEAS[tempIndex];

          const titleEl = container.querySelector('#card-title');
          const descEl = container.querySelector('#card-desc');

          if (titleEl) titleEl.textContent = temp.name;
          if (descEl) descEl.textContent = temp.description;

          counter++;
          if (counter >= totalSteps) {
            clearInterval(timer);
            // End of slot cycle, set the final choice
            const finalIndex = Math.floor(Math.random() * PUNISHMENT_IDEAS.length);
            currentPunishment = PUNISHMENT_IDEAS[finalIndex];
            hasGenerated = true;
            isRuffling = false;

            renderView();
            callbacks.showToast("Castigo generado con éxito", "success");
          }
        }, intervalTime);
      });
    }
  }

  // Initial load
  loadLeagueMembers();
}
