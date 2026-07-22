/**
 * SEO landing shown at "/" to non-authenticated visitors.
 * Brutalist, on-brand and conversion-first: punchy hero + feature cards + a
 * 3-step how-it-works, with the keyword-rich SEO copy tucked into collapsible
 * accordions below the fold (still in the DOM, so it stays crawlable).
 * Logged-in users get the app landing (renderLanding) instead.
 */

const FAQ_SCHEMA_ID = 'faq-jsonld-seo-home';

// GEO / FAQ pairs — shown in an accordion and emitted as FAQPage structured
// data for rich results and so LLMs can cite them.
const FAQS = [
  {
    q: '¿Qué es Castigos Fantasy?',
    a: 'Castigos Fantasy es una aplicación web gratuita que añade la parte social y de castigos a tu liga de fútbol fantasy (Biwenger, Comunio, Mister...). No gestiona tu equipo ni tus fichajes, eso lo sigues haciendo en tu app de fantasy de siempre. Lo que hace Castigos Fantasy es detectar automáticamente quién queda último cada jornada, llevar el control del bote común y darte herramientas para sortear castigos, votar al peor jugador y dejar constancia de quién cumple y quién se raja.'
  },
  {
    q: '¿Castigos Fantasy sustituye a Biwenger, Comunio o LaLiga Fantasy?',
    a: 'No, es un complemento, no un sustituto. Sigues jugando tu liga exactamente igual en Biwenger, Comunio, LaLiga Fantasy o donde juegues. Castigos Fantasy se conecta a tu liga (con sincronización automática en Biwenger) y añade encima la capa de castigos, bote y humor que esas apps no tienen. Piensa en ello como el "módulo social" que le faltaba a tu liga.'
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
    a: 'Ninguna a nivel de concepto: el "el último paga" existe igual en cualquier plataforma de fantasy. Lo único que cambia es de dónde se importa la clasificación. Hoy la sincronización automática está activa con Biwenger; si tu liga juega en Comunio, LaLiga Fantasy, Mister u otra plataforma, puedes seguir usando la app para gestionar el bote, sortear castigos y llevar el muro de la vergüenza, solo que tendrás que confirmar tú manualmente quién ha quedado último.'
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
    icon: 'trending_down', bg: 'var(--danger)', color: '#fff', nav: 'acceso',
    title: 'Lista de Morosos',
    desc: 'El farolillo rojo de cada jornada va directo a la lista, sin Excel. Automático con Biwenger; compatible con Comunio, LaLiga Fantasy y más.'
  },
  {
    icon: 'casino', bg: 'var(--accent)', color: '#000', nav: 'ruleta',
    title: 'Ruleta de Sentencias',
    desc: 'Sortea el castigo del perdedor. Que decida el azar, sin favoritismos.'
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

const STEPS = [
  { n: '1', icon: 'link', bg: '#ffffff', color: '#000', title: 'Ficha tu liga', desc: 'Biwenger se sincroniza solo y ya sabe quién va último. ¿Comunio, LaLiga Fantasy u otra? Lo marcas tú en un toque.' },
  { n: '2', icon: 'campaign', bg: 'var(--accent)', color: '#000', title: 'Corre la voz', desc: 'Manda el enlace al grupo y deja que la Ruleta de Sentencias reparta el primer castigo.' },
  { n: '3', icon: 'gavel', bg: 'var(--danger)', color: '#fff', title: 'Que no haya escapatoria', desc: 'Quién quedó último, qué castigo le tocó y si lo cumplió: todo queda anotado en el Muro, jornada tras jornada.' }
];

export function renderSeoHome(container, { onNavigate } = {}) {
  const heroCta = `
    <button class="seo-nav" data-nav="acceso" style="
      font-family:var(--font-display);font-weight:900;font-size:1.05rem;text-transform:uppercase;
      letter-spacing:-0.5px;background:var(--accent);color:#000;border:3px solid #000;
      padding:0.85rem 2rem;cursor:pointer;box-shadow:5px 5px 0 #000;
      transition:transform 0.1s ease, box-shadow 0.1s ease;"
      onmouseover="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='7px 7px 0 #000';"
      onmouseout="this.style.transform='';this.style.boxShadow='5px 5px 0 #000';">Crea tu liga gratis →</button>`;

  const loginNudge = `
    <p class="seo-login-nudge">
      ¿Tu grupo ya está en Castigos Fantasy?
      <button class="seo-nav" data-nav="acceso" style="background:transparent;border:none;padding:0;margin-left:0.25rem;color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;cursor:pointer;font-size:inherit;font-family:inherit;">Inicia sesión →</button>
    </p>`;

  // Microcopy bajo el CTA del hero: baja la fricción y remata con el chiste de marca.
  const heroMicro = `<p class="seo-cta-micro">Gratis y sin tarjeta. Aquí el único que paga es el colista.</p>`;

  container.innerHTML = `
    <div class="seo-home fade-in-up" style="max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:2.5rem;">

      <!-- HERO -->
      <section class="brutalist-hero" style="margin-bottom:0;">
        <div class="seo-hero-copy">
          <h1 class="brutalist-hero-title" style="margin-bottom:0.75rem;">Que el último de tu liga no se escape</h1>
          <p class="brutalist-hero-subtitle" style="margin-bottom:0.5rem;font-weight:700;color:var(--accent-gold);">Cada jornada hay un último. La pregunta es qué pasa después.</p>
          <p class="brutalist-hero-subtitle" style="margin-bottom:1.75rem;">
            Tú sigues jugando en Biwenger o Comunio. Nosotros nos encargamos de que el último pague.
          </p>
          ${heroCta}
          ${heroMicro}
          ${loginNudge}
          <div class="seo-hero-chips">
            <span class="seo-chip">Sin Excel ni WhatsApp</span>
            <span class="seo-chip">Biwenger automático</span>
            <span class="seo-chip">Comunio y LaLiga Fantasy</span>
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

      <!-- FEATURES -->
      <section class="landing-tier">
        <div class="tier-header">
          <h2 class="tier-title">Todo lo que tu liga necesita</h2>
          <span class="tier-sub">Y que tu app de fantasy no te da</span>
        </div>
        <div class="seo-features">
          ${FEATURES.map(f => `
            <button class="seo-feature seo-nav" data-nav="${f.nav}">
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
    </div>
  `;

  container.querySelectorAll('.seo-nav').forEach(el => {
    el.addEventListener('click', () => onNavigate?.(el.dataset.nav));
  });

  injectFaqSchema();
}

export { removeFaqSchema };
