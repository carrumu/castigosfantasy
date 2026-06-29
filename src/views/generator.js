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
      name: "La Camiseta de la Vergüenza",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 4,
      description: "Vestir la camiseta del rival histórico de la liga durante todo el fin de semana, incluyendo salidas con amigos o ir a comprar."
    },
    {
      id: "gen-2",
      name: "El Comentarista Pelma",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 3,
      description: "Comentar todas y cada una de las publicaciones de Instagram o X del líder con frases de alabanza obligatorias durante 5 días seguidos."
    },
    {
      id: "gen-3",
      name: "El Doble o Nada",
      category: "money",
      categoryLabel: "Económico",
      intensity: 5,
      description: "Pagar una pequeña penalización simbólica de 1€ extra al bote común de la liga."
    },
    {
      id: "gen-5",
      name: "El Menú del Farolillo Rojo",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 3,
      description: "Comprar un donut o bollo para el ganador de la jornada y entregárselo en mano en la próxima quedada."
    },
    {
      id: "gen-6",
      name: "El Avatar del Bufón",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 3,
      description: "Cambiar tu foto de perfil de WhatsApp por una imagen vergonzosa elegida democráticamente por los miembros de la liga durante 7 días."
    },
    {
      id: "gen-7",
      name: "El Poeta de la Jornada",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 2,
      description: "Escribir un poema lírico de al menos 4 estrofas en honor al ganador de la jornada y recitarlo mediante nota de voz en el chat de la liga."
    },
    {
      id: "gen-8",
      name: "La Declaración Pública",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 5,
      description: "Subir una historia de Instagram declarando tu fanatismo incondicional hacia el jugador o club de fútbol que más detestas en la vida real."
    },
    {
      id: "gen-9",
      name: "El Mayordomo del Grupo",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 4,
      description: "Servir las bebidas, aperitivos y limpiar la mesa de todo el grupo de amigos durante la próxima quedada para ver el fútbol."
    },
    {
      id: "gen-10",
      name: "Pachanga de Cera",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 3,
      description: "Jugar el próximo partido informal del grupo de amigos vistiendo obligatoriamente un chaleco reflectante rosa de tráfico."
    },
    {
      id: "gen-11",
      name: "Monólogo Autocrítico",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 4,
      description: "Enviar un audio continuo de 3 minutos analizando minuciosamente por qué tu estrategia fantasy ha sido un fracaso estrepitoso esta jornada."
    },
    {
      id: "gen-12",
      name: "Cafés Dorados",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 2,
      description: "Invitar a un café (solo uno) al ganador de la jornada en la próxima quedada física de la liga."
    },
    {
      id: "gen-13",
      name: "Unboxing de Risa",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 4,
      description: "Hacer un vídeo de 'unboxing' premium de un objeto absurdo de tu casa (ej. un calcetín viejo) explicándolo como si fuera un producto de lujo."
    },
    {
      id: "gen-14",
      name: "Sin Alineación no hay Paraíso",
      category: "money",
      categoryLabel: "Económico",
      intensity: 4,
      description: "Multa de 1€ extra directo al bote común si olvidas rellenar la alineación y juegas con algún jugador lesionado o sancionado."
    },
    {
      id: "gen-15",
      name: "Serenata de Medianoche",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 5,
      description: "Grabar un audio cantando apasionadamente el himno del equipo rival a capela a medianoche en punto y enviarlo al grupo de WhatsApp."
    },
    {
      id: "gen-16",
      name: "Ley del Silencio Futbolístico",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Prohibición absoluta de hablar sobre fútbol, fichajes o quejarte del arbitraje en el grupo de WhatsApp durante 72 horas completas."
    },
    {
      id: "gen-17",
      name: "Peluquería Atrevida",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 5,
      description: "Dejarte teñir o pintar un mechón de pelo con cera lavable de los colores del equipo que decida el líder durante 3 días enteros."
    },
    {
      id: "gen-18",
      name: "Batido Explosivo",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 4,
      description: "Beber un vaso pequeño de un batido preparado al azar por tus compañeros de liga (con ingredientes alimenticios reales y aptos, pero combinados maliciosamente)."
    },
    {
      id: "gen-19",
      name: "El Árbitro de la Mesa",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Llevar un silbato y tarjetas oficiales al bar y pitar faltas y sacar tarjetas amarillas reales cada vez que un amigo levante la voz o discuta."
    },
    {
      id: "gen-20",
      name: "Patrocinio Involuntario",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 4,
      description: "Llevar puesta una gorra de béisbol o camiseta personalizada con el texto 'Soy el Farolillo Rojo' durante toda una cena o salida grupal."
    },
    {
      id: "gen-22",
      name: "El Himno en la Ducha",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 4,
      description: "Grabar un video cantando el himno del club rival en la ducha con agua fría vistiendo ropa de baño o impermeable."
    },
    {
      id: "gen-23",
      name: "La Invitación del Colista",
      category: "money",
      categoryLabel: "Económico",
      intensity: 3,
      description: "Pagar un único refresco o cerveza al ganador de la jornada la próxima vez que quedéis."
    },
    {
      id: "gen-24",
      name: "El Lustrador de Botas",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 3,
      description: "Limpiar y abrillantar las zapatillas de deporte de todos los miembros de la liga antes del próximo partido de fútbol del grupo."
    },
    {
      id: "gen-25",
      name: "El Chef del Bote",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 4,
      description: "Cocinar una paella o tortilla de patatas gigante para todo el grupo en la próxima quedada de la jornada de liga."
    },
    {
      id: "gen-27",
      name: "El Limpiador de Coches",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 4,
      description: "Lavar a mano y dejar impecable el coche del líder de la clasificación antes del siguiente fin de semana."
    },
    {
      id: "gen-28",
      name: "El Portavoz del Líder",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 2,
      description: "Escribir todos tus mensajes en el chat de la liga en tercera persona y refiriéndote al líder como 'Su Majestad' durante una semana completa."
    },
    {
      id: "gen-29",
      name: "El Disfraz del Supermercado",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 4,
      description: "Ir a hacer la compra semanal al supermercado vestido con un traje de gala (esmoquin o vestido de fiesta) y subir una foto en los pasillos."
    },
    {
      id: "gen-31",
      name: "El Desayuno a Domicilio",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 3,
      description: "Traerle una napolitana de chocolate o un cruasán recién hecho al ganador de la jornada el próximo día que quedéis."
    },
    {
      id: "gen-32",
      name: "El Comprador del Pan",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 4,
      description: "Ir a comprar el pan el domingo por la mañana vistiendo solo un pijama de una pieza o un disfraz de animal."
    },
    {
      id: "gen-33",
      name: "El Crítico de Arte",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 2,
      description: "Grabar un audio de 2 minutos analizando de forma absurdamente poética y filosófica el peor gol que se haya marcado en la jornada."
    },
    {
      id: "gen-34",
      name: "La Multa por Tarjeta Roja",
      category: "money",
      categoryLabel: "Económico",
      intensity: 2,
      description: "Pagar 1€ extra al bote común por cada tarjeta roja que reciba algún jugador de tu alineación titular en la jornada."
    },
    {
      id: "gen-35",
      name: "El DJ Castigado",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Dejar que el ganador de la jornada elija la lista de reproducción musical de tu coche durante todo el siguiente viaje grupal."
    },
    {
      id: "gen-36",
      name: "La Mascota de la Liga",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 3,
      description: "Llevar puestas unas orejas de conejo o una diadema divertida decidida por el líder durante toda la próxima cena del grupo."
    },
    {
      id: "gen-37",
      name: "El Entrenador Personal",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 2,
      description: "Organizar y dirigir una sesión de estiramientos y calentamiento de 20 minutos para el grupo al acabar el próximo partido informal."
    },
    {
      id: "gen-38",
      name: "El Mensaje al Streamer",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 3,
      description: "Escribir en el chat en vivo de un streamer de fútbol famoso una frase graciosa de disculpa decidida por la liga y mandar captura de pantalla."
    },
    {
      id: "gen-39",
      name: "La Cena de los Campeones",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Servir la mesa con un trapo al hombro y actuar como camarero profesional y servicial para tus amigos durante toda una cena grupal."
    },
    {
      id: "gen-40",
      name: "El Picoteo del Colista",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 2,
      description: "Traer una bolsa de patatas fritas (tamaño estándar) para compartir en la próxima quedada para ver el fútbol."
    },
    {
      id: "gen-41",
      name: "El Vídeo de Disculpas",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Grabar un vídeo imitando las ruedas de prensa formales de disculpa de los entrenadores tras una derrota dura, asumiendo la culpa de tu alineación."
    },
    {
      id: "gen-42",
      name: "La Tasa de Traspaso",
      category: "money",
      categoryLabel: "Económico",
      intensity: 3,
      description: "Pagar una tasa de 2€ extra directos al bote común por cada fichaje que realices durante el mercado de fichajes."
    },
    {
      id: "gen-43",
      name: "El Portador de la Bolsa",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 3,
      description: "Cargar con todas las bolsas de deporte, balones y petos del grupo al ir y volver del próximo partido informal."
    },
    {
      id: "gen-44",
      name: "El Elogio del Rival",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 2,
      description: "Escribir una carta formal a mano elogiando la gran visión futbolística y astucia de tu rival directo en la clasificación."
    },
    {
      id: "gen-45",
      name: "El Menú de Picante",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 4,
      description: "Comer una cucharada de salsa picante extrema o un chile delante de la cámara en la videollamada semanal de la liga."
    },
    {
      id: "gen-46",
      name: "El Perfil del Meme",
      category: "public",
      categoryLabel: "Vergonzoso",
      intensity: 3,
      description: "Cambiar tu descripción de WhatsApp por una frase de disculpa impuesta por la liga durante una semana (ej. 'No sé alinear y pido perdón a España')."
    },
    {
      id: "gen-47",
      name: "El Guardián del Trofeo",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 3,
      description: "Custodiar y limpiar un objeto absurdo que actúe de 'Trofeo del Colista' en tu salón en un lugar visible hasta la próxima jornada."
    },
    {
      id: "gen-48",
      name: "La Sentencia del Karaoke",
      category: "creative",
      categoryLabel: "Creativo",
      intensity: 4,
      description: "Cantar una canción elegida por tus compañeros en un karaoke local o grabar una nota de voz cantando el estribillo de un tema cursi."
    },
    {
      id: "gen-49",
      name: "El Árbitro Asistente",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 4,
      description: "Correr la banda durante el partido informal de tus amigos llevando una bandera improvisada y señalando fueras de juego imaginarios."
    },
    {
      id: "gen-50",
      name: "El Bote de los Lloros",
      category: "money",
      categoryLabel: "Económico",
      intensity: 2,
      description: "Pagar 0,50€ al bote de la liga por cada queja explícita sobre el VAR o los puntos recibidos en el chat grupal de WhatsApp."
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
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <!-- Accept (Green/Lime) & Reject (Muted Dark Red) - Same size, styling forced with !important to bypass global yellow css classes -->
                    <button class="brutalist-btn" id="btn-accept-punishment" style="flex: 1; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: var(--accent) !important; background-image: none !important; color: #000 !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      Aceptar
                    </button>
                    <button class="brutalist-btn" id="btn-reject-punishment" style="flex: 1; padding: 0.65rem 0; font-weight: 800; font-size: 0.85rem; background: #962d2d !important; background-image: none !important; color: #fff !important; border: 2.5px solid #000 !important; box-shadow: 2px 2px 0px #000 !important; cursor: pointer; text-transform: uppercase; text-align: center;">
                      No Aceptar
                    </button>
                    
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
              `}

            ` : ''}

          </div>
        </div>

        <!-- Spin Actions -->
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

        <!-- Saved Punishments Section -->
        <div id="saved-punishments-section" style="margin-top: 2rem; display: ${savedList.length > 0 ? 'block' : 'none'};">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); margin: 0;">
              Castigos Aceptados
            </h3>
            <button class="brutalist-btn" id="btn-clear-all-saved" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; background: #962d2d !important; background-image: none !important; color: #fff !important; border: 2px solid #000; cursor: pointer;">
              Limpiar Todo
            </button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="saved-list-container">
            ${savedList.map((item, idx) => `
              <div class="brutalist-card" style="padding: 0.85rem; background: rgba(0,0,0,0.25); border: 2.5px solid #000; display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
                <div style="text-align: left; padding-right: 1rem;">
                  <h4 style="font-size: 0.9rem; font-weight: 800; margin: 0; color: var(--text-light);">${item.name}</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0; line-height: 1.3;">${item.description}</p>
                </div>
                <button class="brutalist-btn btn-delete-saved" data-idx="${idx}" style="padding: 0.35rem 0.6rem; background: #962d2d !important; background-image: none !important; color: #fff !important; font-size: 0.7rem; font-weight: 800; border: 2px solid #000; cursor: pointer; flex-shrink: 0;">
                  Quitar
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
            <button class="brutalist-btn" id="btn-clear-all-rejected" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; background: #962d2d !important; background-image: none !important; color: #fff !important; border: 2px solid #000; cursor: pointer;">
              Limpiar Todo
            </button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="rejected-list-container">
            ${rejectedList.map((item, idx) => `
              <div class="brutalist-card" style="padding: 0.85rem; background: rgba(150, 45, 45, 0.08); border: 2.5px solid #962d2d; display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
                <div style="text-align: left; padding-right: 1rem;">
                  <span style="font-size: 0.65rem; font-weight: 900; background: #962d2d; color: #fff; padding: 0.15rem 0.4rem; border: 1.5px solid #000; text-transform: uppercase; display: inline-block; margin-bottom: 0.35rem;">
                    Rechazó: ${item.player}
                  </span>
                  <h4 style="font-size: 0.9rem; font-weight: 800; margin: 0; color: var(--text-light);">${item.name}</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0; line-height: 1.3;">Rechazó cumplir este castigo.</p>
                </div>
                <button class="brutalist-btn btn-delete-rejected" data-idx="${idx}" style="padding: 0.35rem 0.6rem; background: #962d2d !important; background-image: none !important; color: #fff !important; font-size: 0.7rem; font-weight: 800; border: 2px solid #000; cursor: pointer; flex-shrink: 0;">
                  Quitar
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
