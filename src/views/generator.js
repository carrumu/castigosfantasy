/**
 * Renders the interactive public Punishment Generator.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onNavigate 
 * @param {Function} callbacks.showToast 
 */
export function renderGenerator(container, callbacks) {
  // 1. Database of fun, high-quality fantasy football punishments
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
      description: "Pagar el doble de la cuota o aportar el doble del bote común en la próxima jornada de liga debido a tu baja puntuación."
    },
    {
      id: "gen-4",
      name: "Entrenamiento de Campeón",
      category: "sports",
      categoryLabel: "Deportivo",
      intensity: 4,
      description: "Hacer 100 flexiones en videollamada grupal o grabarte en un único video continuo al acabar la jornada de liga."
    },
    {
      id: "gen-5",
      name: "El Menú del Farolillo Rojo",
      category: "food",
      categoryLabel: "Alimenticio",
      intensity: 3,
      description: "Comprar y entregar en persona una caja de donuts o bollos a los tres primeros clasificados de la liga en su propia casa o trabajo."
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
      description: "Invitar a café y postre a todos los participantes presentes en la mesa en la próxima quedada física de la liga."
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
      description: "Multa de 5€ extra directos al bote común si olvidas rellenar la alineación y juegas con algún jugador lesionado o sancionado."
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
    }
  ];

  // 2. Active state
  let currentPunishment = PUNISHMENT_IDEAS[0];
  let isRuffling = false;

  // 3. Main render function
  function renderView() {
    container.innerHTML = `
      <div class="generator-view container fade-in-up">
        <!-- Hero Header -->
        <section class="generator-header glass" style="margin-bottom: 2rem; padding: 2rem; text-align: center; position: relative; overflow: hidden;">
          <div class="hero-badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; margin: 0 auto 0.75rem auto;">🛠️ Herramienta Pública</div>
          <h1 style="font-size: 1.85rem; font-weight: 800; line-height: 1.25; margin-bottom: 0.5rem;" class="gradient-text-green">
            Generador de Castigos Fantasy
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">
            ¿El perdedor de tu liga no sabe cómo pagar su derrota? Genera ideas locas y competitivas al azar.
          </p>
        </section>

        <!-- Centered Layout -->
        <div class="generator-layout-centered" style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">

          <!-- Main Interactive Card Deck -->
          <div class="generator-deck">
            <div class="card-outer-wrapper">
              <div class="generator-card glass" id="active-card">
                <div class="card-inner-glow"></div>
                
                <!-- Category badge -->
                <div style="display: flex; align-items: center; margin-bottom: 1.25rem;">
                  <span class="card-badge-label" id="card-badge">${currentPunishment.categoryLabel}</span>
                </div>

                <!-- Title and body -->
                <h2 class="card-title-text" id="card-title" style="font-size: 1.45rem; font-weight: 800; margin-bottom: 1rem; min-height: 2.2rem; color: var(--text-light);">
                  ${currentPunishment.name}
                </h2>
                
                <p class="card-description-text" id="card-desc" style="font-size: 0.9rem; line-height: 1.5; color: var(--text-muted); min-height: 5rem; margin-bottom: 1.5rem;">
                  ${currentPunishment.description}
                </p>

                <!-- Action group at the bottom -->
                <div style="display: flex; gap: 0.75rem; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: auto;">
                  <button class="btn-secondary" id="btn-copy-card" style="padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;" title="Copiar castigo al portapapeles">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span id="copy-btn-text">Copiar</span>
                  </button>

                  <button class="btn-secondary" id="btn-share-whatsapp" style="padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; background: rgba(37, 211, 102, 0.1); border-color: rgba(37, 211, 102, 0.2); color: #25d366;" title="Enviar a WhatsApp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Trigger triggers -->
            <div style="display: flex; gap: 1rem; width: 100%; margin-top: 1.5rem;">
              <button class="btn-primary" id="btn-generate-punishment" style="flex: 1; padding: 0.9rem; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
                <span>Generar Castigo</span>
              </button>

              <button class="btn-secondary" id="btn-slots-punishment" style="padding: 0.9rem 1.25rem; font-weight: 700;" title="Búsqueda rápida estilo ruleta/tragamonedas">
                ⚡ Ruleta Rápida
              </button>
            </div>
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

      // Add shuffle/flip animation
      cardEl.classList.add('shuffling');

      setTimeout(() => {
        // Pick random element that is different if possible
        let available = PUNISHMENT_IDEAS;
        if (PUNISHMENT_IDEAS.length > 1) {
          available = PUNISHMENT_IDEAS.filter(x => x.id !== currentPunishment.id);
        }
        const randomIndex = Math.floor(Math.random() * available.length);
        currentPunishment = available[randomIndex];

        // Update DOM details directly inside the card to keep animation smooth
        const titleEl = container.querySelector('#card-title');
        const descEl = container.querySelector('#card-desc');
        const badgeEl = container.querySelector('#card-badge');

        if (titleEl) titleEl.textContent = currentPunishment.name;
        if (descEl) descEl.textContent = currentPunishment.description;
        if (badgeEl) badgeEl.textContent = currentPunishment.categoryLabel;

        cardEl.classList.remove('shuffling');
      }, 300);
    };

    const genBtn = container.querySelector('#btn-generate-punishment');
    if (genBtn) {
      genBtn.addEventListener('click', triggerGenerate);
    }

    // Copy to clipboard
    const copyBtn = container.querySelector('#btn-copy-card');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = `🏆 CastigoFantasy: ${currentPunishment.name} - ${currentPunishment.description}`;
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            const btnText = container.querySelector('#copy-btn-text');
            if (btnText) btnText.textContent = "¡Copiado!";
            callbacks.showToast("Castigo copiado al portapapeles con éxito", "success");
            setTimeout(() => {
              if (btnText) btnText.textContent = "Copiar";
            }, 2000);
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
        const shareText = encodeURIComponent(`🏆 *CastigoFantasy: ${currentPunishment.name}* \n\n_${currentPunishment.description}_ \n\nGenera más ideas en http://localhost:3000/generador`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
      });
    }

    // Slots Machine Mode (Ruleta Rápida)
    const slotsBtn = container.querySelector('#btn-slots-punishment');
    if (slotsBtn) {
      slotsBtn.addEventListener('click', () => {
        if (isRuffling) return;
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
          const badgeEl = container.querySelector('#card-badge');

          if (titleEl) titleEl.textContent = temp.name;
          if (descEl) descEl.textContent = temp.description;
          if (badgeEl) badgeEl.textContent = temp.categoryLabel;

          counter++;
          if (counter >= totalSteps) {
            clearInterval(timer);
            // End of slot cycle, set the final choice
            const finalIndex = Math.floor(Math.random() * PUNISHMENT_IDEAS.length);
            currentPunishment = PUNISHMENT_IDEAS[finalIndex];

            if (titleEl) titleEl.textContent = currentPunishment.name;
            if (descEl) descEl.textContent = currentPunishment.description;
            if (badgeEl) badgeEl.textContent = currentPunishment.categoryLabel;

            cardEl.classList.remove('slots-spinning');
            isRuffling = false;
            callbacks.showToast(`🎰 Castigo elegido: ${currentPunishment.name}`, "info");
          }
        }, intervalTime);
      });
    }
  }

  // Run first render
  renderView();
}
