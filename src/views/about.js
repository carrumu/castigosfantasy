/**
 * Content/trust pages that Google (and AdSense) expect on a real site:
 *  - "Sobre nosotros"  (about)
 *  - "Contacto"        (contact)
 * Kept text-first and substantial on purpose: these pages exist to give
 * genuine, original information to a visitor arriving from search.
 */

const EMAIL = 'soporte@castigosfantasy.com';
const SITE = 'castigosfantasy.com';

const H = 'font-family:var(--font-display);font-weight:800;font-size:1.15rem;text-transform:uppercase;margin:2rem 0 0.7rem;color:var(--text-light);';
const P = 'margin:0 0 1rem;';
const UL = 'margin:0 0 1rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.45rem;';

function pageShell(title, subtitle, bodyHtml) {
  return `
    <div class="content-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="content-back" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Volver
      </a>
      <h1 style="font-family:var(--font-display);font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.4rem;">${title}</h1>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.5rem;">${subtitle}</p>
      <div class="content-body" style="font-size:0.95rem;line-height:1.7;color:var(--text-light);">
        ${bodyHtml}
      </div>
    </div>
  `;
}

function hookBack(container, onNavigate) {
  container.querySelector('#content-back')?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else onNavigate?.('inicio');
  });
}

export function renderAbout(container, { onNavigate } = {}) {
  const body = `
    <p style="${P}">Castigos Fantasy es una aplicación web gratuita que le añade a tu liga de fútbol fantasy la parte que las apps oficiales no cubren: la social. No sustituye a Biwenger, Comunio ni LaLiga Fantasy; se conecta por encima para gestionar los castigos, el bote común y los piques de cada jornada, sin depender de un Excel ni de perseguir a nadie por WhatsApp.</p>

    <h2 style="${H}">Quiénes somos</h2>
    <p style="${P}">Somos un grupo de amigos de Sevilla, aficionados al fútbol y al fantasy, que pusimos en marcha el proyecto en <strong>junio de 2026</strong>. Nació de un problema que teníamos nosotros mismos: cada jornada alguien quedaba último, nadie apuntaba bien quién debía pagar el bote y los castigos se olvidaban a los dos días. Buscábamos una forma más divertida y ordenada de vivir la liga con el grupo, no la encontramos, y decidimos construirla.</p>

    <h2 style="${H}">Por qué lo hacemos</h2>
    <p style="${P}">Nuestro objetivo es sencillo: <strong>mejorar la experiencia de la comunidad fantasy</strong>. Creemos que lo mejor del fantasy no es solo ganar la liga, sino los piques, las apuestas absurdas y el pique sano entre amigos que vienen después de cada jornada. Castigos Fantasy quiere darle a todo eso un sitio, con herramientas que hagan reír al grupo y que quiten trabajo al administrador de la liga.</p>

    <h2 style="${H}">Qué ofrecemos</h2>
    <ul style="${UL}">
      <li style="${LI}"><strong>Detección automática del último</strong> de cada jornada (sincronización con Biwenger) para llevar el bote y las deudas sin llevar cuentas a mano.</li>
      <li style="${LI}"><strong>Ruleta de Sentencias</strong> para sortear el castigo del perdedor cuando el grupo no se pone de acuerdo.</li>
      <li style="${LI}"><strong>Generador de Castigos</strong> con ideas al instante, del bote a las prendas más ridículas.</li>
      <li style="${LI}"><strong>Bufón de la Corte</strong> para votar al peor jugador de la jornada.</li>
      <li style="${LI}"><strong>Muro de la Vergüenza</strong> donde queda constancia de quién cumple su castigo y quién se raja.</li>
    </ul>

    <h2 style="${H}">Nuestro compromiso</h2>
    <p style="${P}">La aplicación es y seguirá siendo gratuita para los usuarios. Nos tomamos en serio la privacidad de cada liga: los datos de un grupo solo son visibles para sus miembros. Puedes leer más en nuestra <a href="/privacidad" class="legal-link" data-page="privacidad" style="color:var(--accent);">Política de Privacidad</a> y en los <a href="/terminos" class="legal-link" data-page="terminos" style="color:var(--accent);">Términos y Condiciones</a>.</p>

    <h2 style="${H}">Hablemos</h2>
    <p style="${P}">¿Tienes una idea, una sugerencia o has encontrado un fallo? Nos encanta escuchar a la comunidad. Escríbenos a <a href="mailto:${EMAIL}" style="color:var(--accent);">${EMAIL}</a> o visita nuestra página de <a href="/contacto" class="legal-link" data-page="contacto" style="color:var(--accent);">Contacto</a>.</p>
  `;
  container.innerHTML = pageShell(
    'Sobre nosotros',
    'Unos chavales de Sevilla mejorando la comunidad fantasy desde 2026.',
    body
  );
  hookBack(container, onNavigate);
}

export function renderContacto(container, { onNavigate } = {}) {
  const body = `
    <p style="${P}">¿Necesitas ayuda, quieres proponernos una mejora o reportar un problema? Estamos encantados de leerte. Somos un equipo pequeño, así que respondemos personalmente cada mensaje lo antes posible.</p>

    <h2 style="${H}">Correo de contacto</h2>
    <p style="${P}">Escríbenos a:<br/>
      <a href="mailto:${EMAIL}" style="color:var(--accent);font-weight:800;font-size:1.1rem;">${EMAIL}</a>
    </p>

    <h2 style="${H}">¿En qué podemos ayudarte?</h2>
    <ul style="${UL}">
      <li style="${LI}"><strong>Soporte:</strong> problemas al crear o unirte a una liga, sincronización con Biwenger o Comunio, o cualquier fallo que encuentres.</li>
      <li style="${LI}"><strong>Sugerencias:</strong> ideas de nuevas funciones o castigos que te gustaría ver.</li>
      <li style="${LI}"><strong>Privacidad y datos:</strong> para ejercer tus derechos sobre tus datos personales (acceso, rectificación o supresión), tal y como se explica en la <a href="/privacidad" class="legal-link" data-page="privacidad" style="color:var(--accent);">Política de Privacidad</a>.</li>
      <li style="${LI}"><strong>Colaboraciones:</strong> si tienes una comunidad fantasy y quieres proponernos algo, cuéntanoslo.</li>
    </ul>

    <h2 style="${H}">Tiempo de respuesta</h2>
    <p style="${P}">Solemos responder en un plazo de 24 a 72 horas. Si tu consulta es sobre un fallo, incluye todos los detalles que puedas (qué hacías, en qué pantalla y qué esperabas que ocurriera); así lo resolvemos mucho más rápido.</p>

    <h2 style="${H}">Redes sociales</h2>
    <p style="${P}">También puedes seguirnos en Instagram en <a href="https://www.instagram.com/castigosfantasyy.__/" target="_blank" rel="noopener" style="color:var(--accent);">@castigosfantasyy.__</a> para novedades y sorteos.</p>
  `;
  container.innerHTML = pageShell(
    'Contacto',
    `Escríbenos a ${EMAIL} — respondemos a todo.`,
    body
  );
  hookBack(container, onNavigate);
}
