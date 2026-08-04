/**
 * SEO landing shown at "/" to non-authenticated visitors.
 * Brutalist, on-brand and conversion-first: punchy hero + feature cards + a
 * 3-step how-it-works, with the keyword-rich SEO copy tucked into collapsible
 * accordions below the fold (still in the DOM, so it stays crawlable).
 * Logged-in users get the app landing (renderLanding) instead.
 */

import { setAuthIntent, clearAuthIntent, INTENT_CREATE_LEAGUE } from '../utils/auth-intent.js';
import { ruletaDemoMarkup, wireRuletaDemo } from '../utils/home-ruleta-demo.js';
import { boteSimuladorMarkup, wireBoteSimulador } from '../utils/home-bote-simulator.js';
import { pollMarkup, wirePoll } from '../utils/home-poll.js';
import { statsMarkup, wireStats } from '../utils/home-stats.js';
import { shareOnWhatsApp } from '../utils/whatsapp-share.js';

const FAQ_SCHEMA_ID = 'faq-jsonld-seo-home';

// Por sesión, no para siempre: quien la cierra hoy no quiere verla más hoy,
// pero en otra visita el contexto ya es distinto.
const STICKY_DISMISSED_KEY = 'CF_STICKY_CTA_OFF';

// GEO / FAQ pairs — shown in an accordion and emitted as FAQPage structured
// data for rich results and so LLMs can cite them.
const FAQS = [
  {
    q: '¿Qué es Castigos Fantasy?',
    a: 'Castigos Fantasy es una aplicación web gratuita que añade la parte social y de castigos a tu liga de fútbol fantasy (Biwenger, Comunio, Mister...). No gestiona tu equipo ni tus fichajes, eso lo sigues haciendo en tu app de fantasy de siempre. Lo que hace Castigos Fantasy es detectar automáticamente quién queda último cada jornada, llevar el control del bote común y darte herramientas para sortear castigos, votar al peor jugador y dejar constancia de quién cumple y quién se raja.'
  },
  {
    q: '¿Castigos Fantasy sustituye a Biwenger, Comunio o LaLiga Fantasy?',
    a: 'No, es un complemento, no un sustituto. Sigues jugando tu liga exactamente igual en Biwenger, Comunio, LaLiga Fantasy o donde juegues. Castigos Fantasy se conecta a tu liga (con sincronización automática en Biwenger y Comunio) y añade encima la capa de castigos, bote y humor que esas apps no tienen. Piensa en ello como el "módulo social" que le faltaba a tu liga.'
  },
  {
    q: '¿Es gratis Castigos Fantasy?',
    a: 'Sí, es completamente gratis. Crear tu liga, sincronizar con Biwenger, usar la Ruleta de Sentencias, el Generador de Castigos, el Bufón de la Corte y el Muro de la Vergüenza no tiene coste. La app se sostiene con publicidad, no con cuotas a los usuarios.'
  },
  {
    q: '¿Cómo detecta la app quién ha quedado último cada jornada?',
    a: 'En cuanto sincronizas tu liga de Biwenger, Castigos Fantasy importa automáticamente la clasificación de la jornada y detecta quién es el "farolillo rojo" (el que va colista). No tienes que revisarlo tú a mano ni apuntarlo en ningún sitio: la app ya lo sabe en cuanto se cierra la jornada.'
  },
  {
    q: '¿Cómo decido qué castigo le toca al que queda último?',
    a: 'Tienes dos formas. Puedes usar el Generador de Castigos, que te propone castigos personalizados al instante, o la Ruleta de Sentencias, que sortea el castigo entre las opciones que decida el grupo. Esta segunda opción es especialmente útil cuando nadie se pone de acuerdo, porque deja la decisión al azar y nadie puede quejarse de favoritismos.'
  },
  {
    q: '¿Qué pasa si alguien no cumple su castigo?',
    a: 'Queda registrado en el Muro de la Vergüenza, un espacio visible para todo el grupo donde se lleva constancia de quién cumple su castigo y quién se raja. No hay una "sanción" automática más allá de eso: la idea es que la presión social del propio grupo haga el resto, porque a nadie le gusta ser el que siempre se escaquea delante de sus amigos.'
  },
  {
    q: '¿Necesito que todos mis amigos se registren para que funcione?',
    a: 'Para sacarle todo el partido sí conviene que el grupo se una, porque las herramientas como la votación al Bufón de la Corte o los Retos de la Semana funcionan mejor cuantos más participáis. Pero el flujo normal es que una persona (el admin de la liga) cree el grupo en Castigos Fantasy y comparta la invitación por WhatsApp, igual que ya se comparte cualquier otra cosa en el grupo de la liga.'
  },
  {
    q: '¿Qué diferencia hay entre castigos de Biwenger, Comunio o LaLiga Fantasy?',
    a: 'Ninguna a nivel de concepto: el "el último paga" existe igual en cualquier plataforma de fantasy. Lo único que cambia es de dónde se importa la clasificación. La sincronización automática está activa con Biwenger y con Comunio: la clasificación se importa sola y la app sabe quién ha quedado último. Si tu liga juega en LaLiga Fantasy, Mister u otra plataforma, puedes seguir usando la app para gestionar el bote, sortear castigos y llevar el muro de la vergüenza, solo que tendrás que confirmar tú manualmente quién ha quedado último.'
  },
  {
    q: '¿Sirve Castigos Fantasy para gestionar el bote común de la liga, no solo los castigos?',
    a: 'Sí. De hecho es una de las funciones principales: la app lleva el control automático de las deudas y de quién es moroso jornada a jornada, para que no dependas de un Excel o de ir apuntando en el grupo de WhatsApp quién debe qué.'
  },
  {
    q: '¿Qué tipo de castigos se pueden poner en Castigos Fantasy?',
    a: 'Los que decida cada grupo, desde aportaciones económicas al bote hasta prendas o retos sin dinero de por medio. La app no impone un catálogo cerrado: el Generador de Castigos te da ideas al instante y tú y tu grupo decidís cuál aplicar, o lo dejáis en manos de la Ruleta de Sentencias si preferís que sea el azar quien decida.'
  }
];

function injectFaqSchema() {
  removeFaqSchema();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = FAQ_SCHEMA_ID;
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });
  document.head.appendChild(script);
}

function removeFaqSchema() {
  document.getElementById(FAQ_SCHEMA_ID)?.remove();
}

const FEATURES = [
  {
    // Única tarjeta que exige cuenta: sin liga no hay morosos que listar. Lleva
    // la intención para que abra el registro y no un login a secas.
    icon: 'trending_down', bg: 'var(--danger)', color: '#fff', nav: 'acceso', intent: INTENT_CREATE_LEAGUE,
    title: 'Lista de Morosos',
    desc: 'El farolillo rojo de cada jornada va directo a la lista, sin Excel. Automático con Biwenger; compatible con Comunio, LaLiga Fantasy y más.'
  },
  {
    // La Ruleta salió de aquí: se puede usar sin cuenta, así que vive arriba
    // con lo gratis. Esta lista es solo lo que de verdad exige tener liga.
    icon: 'emoji_events', bg: 'var(--accent)', color: '#000', nav: 'retos',
    title: 'Retos de la Semana',
    desc: 'La liga vota los castigos exclusivos de cada semana. Un voto por cabeza y sin vuelta atrás.'
  },
  {
    icon: 'theater_comedy', bg: 'var(--bg-obsidian)', color: 'var(--accent)', border: '1.5px solid rgba(var(--accent-rgb), 0.55)', nav: 'bufon',
    title: 'El Bufón de la Corte',
    desc: 'Votad al peor jugador de la jornada. El que menos puntúe, paga.'
  },
  {
    icon: 'photo_camera', bg: '#ffffff', color: '#000', nav: 'muro-verguenza',
    title: 'Muro de la Vergüenza',
    desc: 'Queda constancia de quién cumple su castigo y quién se raja.'
  }
];

// Lo que un visitante puede usar AHORA, sin registrarse. No son promesas: la
// ruleta corre en modo local, el generador propone castigos igual (solo no los
// guarda en ninguna liga), los juegos son abiertos y las guías son contenido.
// Estaban escondidas detrás del CTA, así que quien llegaba solo veía un muro.
const FREE_TOOLS = [
  {
    icon: 'casino', bg: 'var(--danger)', color: '#ffffff', nav: 'ruleta',
    title: 'Ruleta de Sentencias',
    desc: 'Gírala ahora mismo y mira qué castigo sale.'
  },
  {
    icon: 'bolt', bg: 'var(--accent)', color: '#000000', nav: 'generador',
    title: 'Generador de Castigos',
    desc: 'Pídele ideas de castigo para tu liga sin dar tu email.'
  },
  {
    icon: 'sports_esports', bg: 'var(--primary-green)', color: '#000000', nav: 'juegos',
    title: 'Juegos de fantasy',
    desc: 'Adivina el jugador, Top 10, Duelo y el Once del día.'
  },
  {
    icon: 'menu_book', bg: '#ffffff', color: '#000000', nav: 'guias',
    title: 'Guías de la liga',
    desc: 'Ideas de castigos, cómo llevar el bote y no morir en el intento.'
  }
];

// El contraste que todo el mundo reconoce: así se lleva hoy una liga de
// castigos, y así queda cuando la lleva la app. Nada de esto es una promesa de
// futuro; las cuatro de la derecha existen y se pueden probar en esta misma web.
const ANTES = [
  'Un Excel que actualiza uno solo y que nadie más abre.',
  'Discusiones en el grupo sobre quién debe qué desde noviembre.',
  'El castigo se decide a gritos y gana el que más insiste.',
  'Las bromas se olvidan a los tres días y nadie cumple nada.'
];

const DESPUES = [
  'El colista de cada jornada sale solo, sincronizado con Biwenger.',
  'El bote y las deudas de cada uno, a la vista de todos.',
  'La Ruleta de Sentencias decide el castigo y no hay a quién protestar.',
  'El Muro de la Vergüenza guarda quién cumplió y quién se rajó.'
];

const STEPS = [
  { n: '1', icon: 'link', bg: '#ffffff', color: '#000', title: 'Ficha tu liga', desc: 'Biwenger y Comunio se sincronizan solos y ya saben quién va último. ¿LaLiga Fantasy, Mister u otra? Lo marcas tú en un toque.' },
  { n: '2', icon: 'campaign', bg: 'var(--accent)', color: '#000', title: 'Corre la voz', desc: 'Manda el enlace al grupo y deja que la Ruleta de Sentencias reparta el primer castigo.' },
  { n: '3', icon: 'gavel', bg: 'var(--danger)', color: '#fff', title: 'Que no haya escapatoria', desc: 'Quién quedó último, qué castigo le tocó y si lo cumplió: todo queda anotado en el Muro, jornada tras jornada.' }
];

export function renderSeoHome(container, { onNavigate } = {}) {
  // data-intent: el clic dice "quiero crear mi liga". La pantalla de acceso lo
  // usa para abrir directamente el registro (no el login) y, una vez dentro,
  // para llevar al usuario a crear la liga en vez de soltarlo en la portada.
  const heroCta = `
    <button class="seo-nav cf-lift" data-nav="acceso" data-intent="${INTENT_CREATE_LEAGUE}" style="
      font-family:var(--font-display);font-weight:900;font-size:1.05rem;text-transform:uppercase;
      letter-spacing:-0.5px;background:var(--accent);color:#000;border:3px solid #000;
      padding:0.85rem 2rem;cursor:pointer;box-shadow:5px 5px 0 #000;
      transition:transform 0.1s ease, box-shadow 0.1s ease;">Conectar mi liga gratis →</button>`;

  const loginNudge = `
    <p class="seo-login-nudge">
      ¿Tu grupo ya está en Castigos Fantasy?
      <button class="seo-nav" data-nav="acceso" data-intent="login" style="background:transparent;border:none;padding:0;margin-left:0.25rem;color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;cursor:pointer;font-size:inherit;font-family:inherit;">Inicia sesión →</button>
    </p>`;

  // Microcopy bajo el CTA del hero: baja la fricción y remata con el chiste de marca.
  // La bandera va en SVG y no como emoji: Chrome en Windows no tiene glifos de
  // banderas y pintaba un "ᴱˢ" suelto delante del texto.
  const banderaES = `
    <svg class="seo-chip-flag" viewBox="0 0 9 6" aria-hidden="true">
      <rect width="9" height="6" fill="#c60b1e"/>
      <rect y="1.5" width="9" height="3" fill="#ffc400"/>
    </svg>`;

  // Salida para quien todavía no quiere dar su email. Apunta al demo, que está
  // justo debajo: la primera acción posible en esta web es jugar, no registrarse.
  const heroSecondary = `
    <button type="button" class="seo-try-free" data-scroll="ruleta-demo">
      Probar la Ruleta de Sentencias ↓
    </button>`;

  container.innerHTML = `
    <div class="seo-home fade-in-up" style="max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:2.5rem;">

      <!-- HERO -->
      <section class="brutalist-hero" style="margin-bottom:0;">
        <div class="seo-hero-copy">
          <h1 class="brutalist-hero-title" style="margin-bottom:0.75rem;">Que el último de tu liga no se escape</h1>
          <p class="brutalist-hero-subtitle" style="margin-bottom:1.75rem;">
            Tú sigues jugando en Biwenger, Comunio o LaLiga Fantasy. Nosotros nos encargamos de que <strong style="color:var(--accent-gold);font-weight:800;">el último pague</strong>.
          </p>
          ${heroCta}
          ${heroSecondary}
          <!-- Aligerado a propósito. Aquí había además una microcopia
               ("Gratis y sin tarjeta...") que repetía el GRATIS del botón, y un
               "¿ya estás? inicia sesión" que duplica el ENTRAR de la cabecera y
               vuelve a salir en la banda de cierre. Siete bloques apilados antes
               del mockup era demasiado para una primera pantalla. -->
          <div class="seo-hero-chips">
            <span class="seo-chip">Sin Excel ni WhatsApp</span>
            <span class="seo-chip">Biwenger y Comunio en automático</span>
            <span class="seo-chip seo-chip-es">${banderaES} Hecho en España</span>
          </div>
        </div>

        <!-- Mini-mockup del producto: la Lista de Morosos con el colista resaltado.
             Datos de ejemplo, puramente ilustrativos (no son usuarios reales). -->
        <div class="seo-hero-mockup" role="img" aria-label="Ejemplo de la Lista de Morosos: Carlos va colista de la jornada y le toca castigo">
          <div class="seo-mock-head">
            <span class="seo-mock-title">Lista de Morosos</span>
            <span class="seo-mock-jornada">Jornada 24</span>
          </div>
          <ul class="seo-mock-list">
            <li class="seo-mock-row"><span class="seo-mock-pos">8º</span><span class="seo-mock-name">Dani</span><span class="seo-mock-pts">41 pts</span></li>
            <li class="seo-mock-row"><span class="seo-mock-pos">9º</span><span class="seo-mock-name">Marta</span><span class="seo-mock-pts">38 pts</span></li>
            <li class="seo-mock-row seo-mock-colista"><span class="seo-mock-pos">10º</span><span class="seo-mock-name">Carlos</span><span class="seo-mock-tag">Colista · paga</span></li>
          </ul>
        </div>
      </section>

      <!-- DEMO JUGABLE: lo primero que puede hacer el visitante -->
      ${ruletaDemoMarkup()}

      <!-- CIFRAS REALES (se oculta sola si no hay nada presentable) -->
      ${statsMarkup()}

      <!-- SIMULADOR DE BOTE -->
      ${boteSimuladorMarkup()}

      <!-- ANTES vs DESPUÉS -->
      <section class="landing-tier" id="antes-despues">
        <div class="tier-header">
          <h2 class="tier-title">Cómo va tu liga hoy y cómo quedaría</h2>
          <span class="tier-sub">El mismo grupo, con y sin la app</span>
        </div>
        <div class="vs-grid">
          <div class="vs-col vs-antes">
            <h3 class="vs-col-title"><span class="vs-tag vs-tag-bad">Ahora</span> A pelo</h3>
            <ul class="vs-list">
              ${ANTES.map(t => `<li><span class="vs-icon" aria-hidden="true">✕</span>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="vs-col vs-despues">
            <h3 class="vs-col-title"><span class="vs-tag vs-tag-good">Después</span> Con Castigos Fantasy</h3>
            <ul class="vs-list">
              ${DESPUES.map(t => `<li><span class="vs-icon" aria-hidden="true">✓</span>${t}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>

      <!-- ENCUESTA (se oculta sola si la base de datos no responde) -->
      ${pollMarkup()}

      <!-- PRUÉBALO SIN CUENTA -->
      <section class="landing-tier" id="probar-gratis">
        <div class="tier-header">
          <h2 class="tier-title">Pruébalo ahora, sin cuenta</h2>
          <span class="tier-sub">Sin registro, sin email, sin tarjeta</span>
        </div>
        <p class="seo-free-intro">
          No hace falta que te fíes de nosotros: entra y usa estas cuatro cosas antes de decidir nada.
        </p>
        <div class="landing-tools-grid">
          ${FREE_TOOLS.map(t => `
            <button class="tool-card-btn seo-nav" data-nav="${t.nav}">
              <div class="tool-card-inner">
                <div class="tool-card-icon-wrap" style="background:${t.bg};">
                  <span class="material-symbols-outlined" style="font-size:1.9rem;color:${t.color};" aria-hidden="true">${t.icon}</span>
                </div>
                <div class="tool-card-text">
                  <h3 class="tool-card-title">${t.title}</h3>
                  <p class="tool-card-desc">${t.desc}</p>
                </div>
                <span class="material-symbols-outlined tool-card-arrow" aria-hidden="true">arrow_forward</span>
              </div>
            </button>
          `).join('')}
        </div>
      </section>

      <!-- FEATURES -->
      <section class="landing-tier">
        <div class="tier-header">
          <h2 class="tier-title">Todo lo que tu liga necesita</h2>
          <span class="tier-sub">Lo que se desbloquea al montar tu liga</span>
        </div>
        <div class="seo-features">
          ${FEATURES.map(f => `
            <button class="seo-feature seo-nav" data-nav="${f.nav}"${f.intent ? ` data-intent="${f.intent}"` : ''}>
              <span class="seo-feature-icon" style="background:${f.bg};${f.border ? `border:${f.border};` : ''}">
                <span class="material-symbols-outlined" style="font-size:1.6rem;color:${f.color};" aria-hidden="true">${f.icon}</span>
              </span>
              <span class="seo-feature-text">
                <h3 class="seo-feature-title">${f.title}</h3>
                <p class="seo-feature-desc">${f.desc}</p>
              </span>
            </button>
          `).join('')}
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="landing-tier">
        <div class="tier-header">
          <h2 class="tier-title">Cómo funciona</h2>
          <span class="tier-sub">En 3 pasos y menos de 2 minutos</span>
        </div>
        <div class="seo-steps-flow">
          ${STEPS.map((s, i) => `
            <div class="seo-step">
              <span class="seo-step-bignum">${s.n}</span>
              <span class="seo-step-icon-wrap" style="background:${s.bg};">
                <span class="material-symbols-outlined" style="color:${s.color};" aria-hidden="true">${s.icon}</span>
              </span>
              <h3 class="seo-step-title">${s.title}</h3>
              <p class="seo-step-desc">${s.desc}</p>
            </div>
            ${i < STEPS.length - 1 ? `<span class="seo-step-connector material-symbols-outlined" aria-hidden="true">arrow_forward</span>` : ''}
          `).join('')}
        </div>
      </section>

      <!-- FINAL CTA (banda de cierre, único CTA además del hero) -->
      <section class="seo-final-cta">
        <h2 class="seo-final-cta-title">Crea tu liga y deja de perseguir a tus amigos por WhatsApp</h2>
        <p class="seo-final-cta-sub">Gratis, en menos de 2 minutos. Sincroniza Biwenger o empieza a mano y que empiece el juicio.</p>
        ${heroCta}
        ${loginNudge}
      </section>

      <!-- GUÍAS: enlace limpio al contenido (antes había un FAQ que duplicaba /guias) -->
      <section class="landing-tier">
        <button class="seo-nav seo-guias-card" data-nav="guias">
          <span class="seo-guias-card-text">
            <span class="seo-guias-card-eyebrow">Guías y consejos</span>
            <span class="seo-guias-card-title">Ideas de castigos para tu liga</span>
            <span class="seo-guias-card-desc">Ideas para el último de la jornada, cómo gestionar el bote y trucos para que la liga no se apague en toda la temporada.</span>
          </span>
          <span class="seo-guias-card-arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </section>

      <!-- CIERRE VIRAL: el grupo de WhatsApp es de donde salen los demás -->
      <section class="landing-tier seo-nudge-wa">
        <p class="seo-nudge-wa-text">¿Tu colista lleva tres jornadas sin pagar y nadie se lo dice?</p>
        <button type="button" class="wa-share-btn wa-share-btn-lg" id="seo-wa-indirecta">
          <span class="material-symbols-outlined" aria-hidden="true">forward_to_inbox</span>
          <span>Mandar la indirecta al grupo</span>
        </button>
      </section>

      <!-- BARRA STICKY: vive dentro del contenedor, así desaparece sola al
           cambiar de vista sin necesidad de limpiarla a mano. -->
      <div class="seo-sticky-cta" id="seo-sticky-cta" hidden>
        <span class="seo-sticky-text">🔥 ¿Tu colista no paga? Monta la liga en 30 segundos.</span>
        <div class="seo-sticky-actions">
          <button class="seo-nav seo-sticky-btn" data-nav="acceso" data-intent="${INTENT_CREATE_LEAGUE}">Empezar gratis</button>
          <button type="button" class="seo-sticky-close" id="seo-sticky-close" aria-label="Cerrar aviso">✕</button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.seo-nav').forEach(el => {
    el.addEventListener('click', () => {
      const intent = el.dataset.intent;
      // "Inicia sesión" borra cualquier intención anterior: si no, un usuario
      // que antes tanteó el CTA acabaría en el registro al querer entrar.
      if (intent === INTENT_CREATE_LEAGUE) setAuthIntent(INTENT_CREATE_LEAGUE);
      else if (intent === 'login') clearAuthIntent();
      onNavigate?.(el.dataset.nav);
    });
  });

  container.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelector(`#${el.dataset.scroll}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Demos jugables. Se enganchan sobre el HTML que ya está pintado.
  wireRuletaDemo(container, onNavigate);
  wireBoteSimulador(container);

  // Estas dos van a la base de datos: si falla, cada una se esconde sola y la
  // página sigue entera. Por eso no se esperan (`await`) ni se bloquea el render.
  wireStats(container);
  wirePoll(container);

  container.querySelector('#seo-wa-indirecta')?.addEventListener('click', () => {
    shareOnWhatsApp(
      '⚖️ He encontrado dónde llevar el bote, los castigos y el muro de la vergüenza de nuestra liga.\n\n' +
      'El último de cada jornada lo saca solo, sin que nadie tenga que apuntar nada. ' +
      'Yo me apunto, ¿quién más?'
    );
  });

  wireStickyCta(container);

  injectFaqSchema();
}

/**
 * Barra fija que aparece cuando el visitante ya ha bajado del hero, es decir,
 * cuando ya ha visto algo y el CTA de arriba le queda lejos. Se puede cerrar, y
 * cerrada se queda: insistir después de un "no" solo molesta.
 *
 * No se muestra mientras esté el banner de cookies, para no apilar dos barras
 * fijas sobre el mismo borde de la pantalla.
 */
function wireStickyCta(container) {
  const bar = container.querySelector('#seo-sticky-cta');
  if (!bar) return;

  try {
    if (sessionStorage.getItem(STICKY_DISMISSED_KEY) === '1') return;
  } catch (err) { /* sin sessionStorage, la barra simplemente vuelve a salir */ }

  const cookiesPendientes = () => !localStorage.getItem('CF_COOKIE_CONSENT');

  const onScroll = () => {
    // Al cambiar de vista el contenedor se reescribe y esta barra queda
    // huérfana; sin esto el listener seguiría vivo y se acumularía uno nuevo
    // por cada visita a la home.
    if (!bar.isConnected) {
      window.removeEventListener('scroll', onScroll);
      return;
    }
    if (cookiesPendientes()) {
      bar.hidden = true;
      return;
    }
    // Un pantallazo largo: suficiente para saber que ha pasado del hero.
    bar.hidden = window.scrollY < window.innerHeight * 0.9;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  container.querySelector('#seo-sticky-close')?.addEventListener('click', () => {
    bar.hidden = true;
    window.removeEventListener('scroll', onScroll);
    try {
      sessionStorage.setItem(STICKY_DISMISSED_KEY, '1');
    } catch (err) { /* incógnito: volverá a salir, tampoco pasa nada */ }
  });
}

export { removeFaqSchema };
