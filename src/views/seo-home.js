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
    q: '¿Castigos Fantasy sustituye a Biwenger o a Comunio?',
    a: 'No, es un complemento, no un sustituto. Sigues jugando tu liga exactamente igual en Biwenger o Comunio. Castigos Fantasy se conecta a tu liga (por ahora con sincronización activa con Biwenger) y añade encima la capa de castigos, bote y humor que esas apps no tienen. Piensa en ello como el "módulo social" que le faltaba a tu liga.'
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
    q: '¿Qué diferencia hay entre castigos de Biwenger y castigos de Comunio?',
    a: 'Ninguna a nivel de concepto: el "el último paga" existe igual en cualquier plataforma de fantasy. Lo único que cambia es de dónde se importa la clasificación. Hoy la sincronización automática está activa con Biwenger; si tu liga juega en Comunio, Mister u otra plataforma, puedes seguir usando la app para gestionar el bote, sortear castigos y llevar el muro de la vergüenza, solo que tendrás que confirmar tú manualmente quién ha quedado último.'
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
    title: 'Detector de Perdedor',
    desc: 'Sincroniza Biwenger y detecta al farolillo rojo de la jornada. Sin Excel.'
  },
  {
    icon: 'casino', bg: 'var(--accent)', color: '#000', nav: 'ruleta',
    title: 'Ruleta de Sentencias',
    desc: 'Sortea el castigo del perdedor. Que decida el azar, sin favoritismos.'
  },
  {
    icon: 'theater_comedy', bg: 'var(--primary-green)', color: '#000', nav: 'bufon',
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
  { n: '1', title: 'Sincroniza tu liga', desc: 'Conecta tu cuenta de Biwenger y la app importa la clasificación sola.' },
  { n: '2', title: 'Invita y sortea', desc: 'Comparte el enlace por WhatsApp y sortea el primer castigo con el grupo.' },
  { n: '3', title: 'Deja que registre', desc: 'Cada jornada se guarda sola: quién perdió, qué castigo y si lo cumplió.' }
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

  container.innerHTML = `
    <div class="seo-home fade-in-up" style="max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:2.5rem;">

      <!-- HERO -->
      <section class="brutalist-hero" style="margin-bottom:0;">
        <h1 class="brutalist-hero-title" style="margin-bottom:0.75rem;">Castigos Fantasy: que el último de tu liga no se escape</h1>
        <p class="brutalist-hero-subtitle" style="margin-bottom:0.5rem;font-weight:700;color:var(--accent-gold);">Cada jornada hay un último. La pregunta es qué pasa después.</p>
        <p class="brutalist-hero-subtitle" style="margin-bottom:1.75rem;">
          Sincroniza tu liga de Biwenger o Comunio, detecta al farolillo rojo automáticamente y organiza los castigos, el bote y los piques. Sin Excel y sin perseguir a nadie por WhatsApp.
        </p>
        ${heroCta}
      </section>

      <!-- FEATURES -->
      <section class="landing-tier">
        <div class="tier-header">
          <h2 class="tier-title">Todo lo que tu liga necesita</h2>
          <span class="tier-sub">Y que Biwenger no te da</span>
        </div>
        <div class="seo-features">
          ${FEATURES.map(f => `
            <button class="seo-feature seo-nav" data-nav="${f.nav}">
              <span class="seo-feature-icon" style="background:${f.bg};">
                <span class="material-symbols-outlined" style="font-size:1.6rem;color:${f.color};">${f.icon}</span>
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
        <div class="seo-steps">
          ${STEPS.map(s => `
            <div class="seo-step">
              <span class="seo-step-num">${s.n}</span>
              <h3 class="seo-step-title">${s.title}</h3>
              <p class="seo-step-desc">${s.desc}</p>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-top:1.75rem;">${heroCta}</div>
      </section>

      <!-- SEO CONTENT (collapsible) -->
      <section class="landing-tier">
        <div class="tier-header">
          <h2 class="tier-title">Aprende más sobre los castigos fantasy</h2>
          <span class="tier-sub">Ideas, cómo funciona y dudas</span>
        </div>

        <details class="seo-acc">
          <summary>¿Qué son los castigos fantasy y cómo funcionan?</summary>
          <div class="seo-acc-body">
            <p>Un castigo fantasy es la consecuencia que le toca al jugador que queda último en la clasificación de la jornada de tu liga de fútbol fantasy. Puede ser pagar al bote común, cumplir una prenda, o las dos cosas. Es una tradición tan vieja como el propio fantasy: alguien pierde, alguien paga.</p>
            <p>El problema no es la idea, es la gestión: saber quién ha quedado último cada semana, apuntarlo, decidir el castigo y asegurarte de que se cumple. Normalmente acaba en un Excel que nadie actualiza o en un grupo de WhatsApp donde el "eh, te toca pagar" se pierde entre memes. Castigos Fantasy automatiza toda esa parte.</p>
            <h3>El farolillo rojo: quién queda último cada jornada</h3>
            <p>En el argot del fantasy, el "farolillo rojo" es el que va colista. Castigos Fantasy sincroniza tu clasificación de Biwenger y detecta automáticamente quién ha sido el farolillo rojo de la jornada, sin que tengas que revisar nada a mano. En cuanto se cierra la jornada, la app ya sabe quién es el candidato al castigo.</p>
            <h3>Castigos Biwenger vs. castigos Comunio: ¿es lo mismo?</h3>
            <p>Sí. El concepto de "el último paga" existe igual en Biwenger, Comunio, Mister o cualquier otra plataforma de fantasy. Lo único que cambia es de dónde importamos tu clasificación. Hoy la sincronización automática está activa con Biwenger; en otras plataformas puedes gestionar el bote y los castigos confirmando tú quién ha quedado último.</p>
          </div>
        </details>

        <details class="seo-acc">
          <summary>Ideas de castigos para el último de la liga fantasy</summary>
          <div class="seo-acc-body">
            <p>Si no tienes claro qué castigo ponerle al farolillo rojo, aquí tienes ideas reales que otros grupos ya usan. Puedes sortearlas con la Ruleta de Sentencias o dejar que el Generador de Castigos te proponga una al momento.</p>
            <h3>Castigos económicos para el bote común</h3>
            <ul>
              <li>Aportar una cuota fija a la caja común de la jornada.</li>
              <li>Pagar la próxima ronda cuando quedéis en persona.</li>
              <li>Invitar a cenar o a comer al resto del grupo.</li>
              <li>Aportar el doble si queda último dos jornadas seguidas.</li>
            </ul>
            <h3>Castigos graciosos y virales para el grupo de WhatsApp</h3>
            <ul>
              <li>Cambiar la foto de perfil del grupo por la que decida el resto durante una semana.</li>
              <li>Subir una foto o vídeo cumpliendo una prenda decidida por votación.</li>
              <li>Llevar el nombre del grupo con un apodo humillante hasta la siguiente jornada.</li>
              <li>Hacer de "secretario" del grupo: redactar el resumen de la jornada con memes.</li>
            </ul>
            <h3>Castigos sin dinero de por medio</h3>
            <ul>
              <li>Renunciar a hacer cambios en su equipo la próxima jornada.</li>
              <li>Dejar que el resto del grupo le fiche un jugador random.</li>
              <li>Cumplir una prenda física acordada por el grupo (ridícula y fotografiable).</li>
              <li>Quedar "señalado" en el Muro de la Vergüenza hasta que otro ocupe su lugar.</li>
            </ul>
          </div>
        </details>

        <details class="seo-acc">
          <summary>Preguntas frecuentes sobre castigos fantasy</summary>
          <div class="seo-acc-body">
            ${FAQS.slice(0, 6).map(f => `
              <h3>${f.q}</h3>
              <p>${f.a}</p>
            `).join('')}
          </div>
        </details>
      </section>

      <!-- FINAL CTA -->
      <section style="text-align:center;padding:1rem 0 0.5rem;">
        <p style="font-family:var(--font-display);font-weight:900;font-size:1.3rem;text-transform:uppercase;letter-spacing:-0.5px;color:var(--text-light);margin-bottom:1.25rem;line-height:1.1;">
          Crea tu liga y deja de perseguir<br/>a tus amigos por WhatsApp
        </p>
        ${heroCta}
      </section>
    </div>
  `;

  container.querySelectorAll('.seo-nav').forEach(el => {
    el.addEventListener('click', () => onNavigate?.(el.dataset.nav));
  });

  injectFaqSchema();
}

export { removeFaqSchema };
