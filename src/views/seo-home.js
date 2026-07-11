/**
 * SEO landing shown at "/" to non-authenticated visitors.
 * Keyword-optimised content page for "castigos fantasy" (see the SEO brief).
 * Logged-in users get the app landing (renderLanding) instead.
 */

const FAQ_SCHEMA_ID = 'faq-jsonld-seo-home';

// GEO / FAQ pairs — also emitted as FAQPage structured data for rich results
// and so LLMs can cite them.
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

export function renderSeoHome(container, { onNavigate } = {}) {
  const cta = (label) => `
    <button class="seo-cta" style="
      font-family:var(--font-display);font-weight:900;font-size:1rem;text-transform:uppercase;
      letter-spacing:-0.3px;background:var(--accent);color:#000;border:3px solid #000;
      padding:0.85rem 1.75rem;cursor:pointer;box-shadow:5px 5px 0 #000;
      transition:transform 0.1s ease, box-shadow 0.1s ease;">${label}</button>`;

  container.innerHTML = `
    <article class="seo-home" style="max-width:820px;margin:0 auto;padding:0.5rem 0 1rem;">

      <header style="padding:1.5rem 0 2rem;border-bottom:1px solid var(--border-color);margin-bottom:2rem;">
        <h1 style="font-family:var(--font-display);font-weight:900;font-size:clamp(1.8rem,6vw,2.8rem);line-height:1.02;text-transform:uppercase;margin-bottom:1rem;">
          Castigos Fantasy: organiza los castigos de tu liga y que nadie se escape
        </h1>
        <p style="font-size:1.05rem;color:var(--accent-gold);font-weight:700;margin-bottom:1rem;">Cada jornada hay un último. La pregunta es qué pasa después.</p>
        <p style="font-size:1rem;color:var(--text-light);line-height:1.6;margin-bottom:1.5rem;">
          Si tu liga de Biwenger o Comunio tiene un bote común, un "el último paga" o una lista interminable de castigos pendientes en un grupo de WhatsApp, esto es para ti. Castigos Fantasy sincroniza tu liga, detecta automáticamente quién ha quedado último y te da las herramientas para sortear, votar y dejar constancia del castigo. Sin Excel, sin perseguir a nadie, sin que se te olvide.
        </p>
        ${cta('Sincroniza tu liga gratis →')}
      </header>

      <section>
        <h2 style="${H2}">Qué son los castigos fantasy y cómo funcionan</h2>
        <p style="${P}">Un castigo fantasy es la consecuencia que le toca al jugador que queda último en la clasificación de la jornada de tu liga de fútbol fantasy. Puede ser pagar al bote común, cumplir una prenda, o las dos cosas. Es una tradición tan vieja como el propio fantasy: alguien pierde, alguien paga.</p>
        <p style="${P}">El problema no es la idea. El problema es la gestión: saber quién ha quedado último cada semana, apuntarlo en algún sitio, decidir el castigo y asegurarte de que se cumple. Normalmente esto acaba en un Excel que nadie actualiza o en un grupo de WhatsApp donde el mensaje de "eh, te toca pagar" se pierde entre memes.</p>
        <p style="${P}">Castigos Fantasy automatiza toda esa parte. Tú pones la liga y los amigos, nosotros nos encargamos de que quede registrado quién debe qué y a quién le toca cumplir.</p>

        <h3 style="${H3}">El farolillo rojo: quién queda último cada jornada</h3>
        <p style="${P}">En el argot del fantasy, el "farolillo rojo" es el que va colista. Castigos Fantasy sincroniza tu clasificación de Biwenger y detecta automáticamente quién ha sido el farolillo rojo de la jornada, sin que tengas que revisar nada a mano.</p>
        <p style="${P}">En cuanto se cierra la jornada, la app ya sabe quién es el candidato al castigo. Tú solo tienes que decidir cuál le toca.</p>

        <h3 style="${H3}">Castigos Biwenger vs. castigos Comunio: ¿es lo mismo?</h3>
        <p style="${P}">Sí. El concepto de "el último paga" existe igual en Biwenger, Comunio, Mister o cualquier otra plataforma de fantasy. Lo único que cambia es de dónde importamos tu clasificación.</p>
        <p style="${P}">Hoy tenemos sincronización activa con Biwenger. Si tu liga juega en otra plataforma, puedes seguir usando Castigos Fantasy para gestionar el bote, sortear castigos y llevar el muro de la vergüenza, solo que la detección del último tendrás que confirmarla tú manualmente.</p>
      </section>

      <section>
        <h2 style="${H2}">Ideas de castigos para el último de la liga fantasy</h2>
        <p style="${P}">Si todavía no tienes claro qué castigo ponerle al farolillo rojo de tu liga, aquí tienes ideas reales que otros grupos ya usan. Puedes sortearlas directamente con la Ruleta de Sentencias o dejar que el Generador de Castigos te proponga una al momento.</p>

        <h3 style="${H3}">Castigos económicos para el bote común</h3>
        <p style="${P}">La opción clásica: el último paga una cantidad fija que va directa al bote de la liga, normalmente para gastarlo todos juntos a final de temporada.</p>
        <ul style="${UL}">
          <li style="${LI}">Aportar una cuota fija a la caja común de la jornada.</li>
          <li style="${LI}">Pagar la próxima ronda cuando quedéis en persona.</li>
          <li style="${LI}">Invitar a cenar o a comer al resto del grupo.</li>
          <li style="${LI}">Aportar el doble si queda último dos jornadas seguidas.</li>
        </ul>

        <h3 style="${H3}">Castigos graciosos y virales para el grupo de WhatsApp</h3>
        <p style="${P}">Estos son los que generan más piques y más contenido para compartir. No cuestan dinero, pero sí un poco de orgullo.</p>
        <ul style="${UL}">
          <li style="${LI}">Cambiar la foto de perfil del grupo por la que decida el resto durante una semana.</li>
          <li style="${LI}">Subir una foto o vídeo cumpliendo una prenda decidida por votación.</li>
          <li style="${LI}">Llevar el nombre del grupo con un apodo humillante hasta la siguiente jornada.</li>
          <li style="${LI}">Hacer de "secretario" del grupo: redactar el resumen de la jornada con memes incluidos.</li>
        </ul>

        <h3 style="${H3}">Castigos sin dinero de por medio</h3>
        <p style="${P}">Si en tu grupo preferís no mover dinero, estos castigos mantienen la tensión competitiva sin tocar la cartera.</p>
        <ul style="${UL}">
          <li style="${LI}">Renunciar a hacer cambios en su equipo la próxima jornada.</li>
          <li style="${LI}">Dejar que el resto del grupo le fiche un jugador random.</li>
          <li style="${LI}">Cumplir una prenda física acordada por el grupo (típicamente algo ridículo y fotografiable).</li>
          <li style="${LI}">Quedar "señalado" en el Muro de la Vergüenza hasta que otro ocupe su lugar.</li>
        </ul>
        <p style="${P}">Cualquiera de estas ideas la puedes cargar en el Generador de Castigos o dejar que la Ruleta de Sentencias decida por sorteo, para que nadie diga que hay favoritismos.</p>
      </section>

      <section>
        <h2 style="${H2}">Cómo montar los castigos de tu liga fantasy en 3 pasos</h2>
        <p style="${P}">Configurar tu liga en Castigos Fantasy lleva menos de lo que tardas en escribir el resumen de la jornada en el grupo.</p>

        <h3 style="${H3}">1. Sincroniza tu liga de Biwenger en segundos</h3>
        <p style="${P}">Conecta tu cuenta de Biwenger y la app importa automáticamente la clasificación de tu liga. No hace falta que metas datos a mano ni que actualices nada jornada a jornada: en cuanto se cierra la jornada en Biwenger, Castigos Fantasy ya sabe quién ha quedado último.</p>

        <h3 style="${H3}">2. Invita a tus amigos y sortea el primer castigo</h3>
        <p style="${P}">Comparte el enlace de tu liga por WhatsApp, tal y como ya compartes cualquier otra cosa con tu grupo. En cuanto se unan, tenéis acceso a la Ruleta de Sentencias y al Generador de Castigos para decidir juntos qué le toca al farolillo rojo de la semana.</p>

        <h3 style="${H3}">3. Deja que la app lleve el registro por ti</h3>
        <p style="${P}">A partir de aquí, cada jornada se registra sola: quién quedó último, qué castigo le tocó, si lo cumplió o no. Todo queda guardado en el Muro de la Vergüenza, así que el historial de la temporada no se pierde en el scroll infinito de WhatsApp.</p>
        <div style="margin:1.5rem 0 0.5rem;">${cta('Crear mi liga gratis →')}</div>
      </section>

      <section>
        <h2 style="${H2}">Herramientas para hacer tu liga más divertida</h2>
        <p style="${P}">Más allá de detectar al último, Castigos Fantasy tiene herramientas pensadas para meter más pique y más humor en tu liga durante toda la temporada.</p>

        <h3 style="${H3}">Ruleta de Sentencias</h3>
        <p style="${P}">Sortea el castigo del perdedor entre las opciones que decida el grupo. Ideal para cuando nadie se pone de acuerdo o simplemente queréis dejarlo en manos del azar, para que nadie pueda quejarse de que ha sido "manía".</p>

        <h3 style="${H3}">El Bufón de la Corte</h3>
        <p style="${P}">Votación semanal al peor jugador de la jornada, más allá de quién queda último en la general. Perfecto para señalar esa alineación desastrosa que todos vieron venir.</p>

        <h3 style="${H3}">Muro de la Vergüenza</h3>
        <p style="${P}">Registro público de quién cumple su castigo y quién se raja. Con el tiempo se convierte en el historial de la liga: quién es un moroso reincidente y quién siempre cumple, con pruebas.</p>
      </section>

      <section>
        <h2 style="${H2}">Preguntas frecuentes sobre castigos fantasy</h2>
        ${FAQS.slice(0, 6).map(f => `
          <h3 style="${H3}">${f.q}</h3>
          <p style="${P}">${f.a}</p>
        `).join('')}
      </section>

      <div style="text-align:center;padding:2.5rem 0 1rem;border-top:1px solid var(--border-color);margin-top:2rem;">
        <p style="font-size:1.05rem;font-weight:700;color:var(--text-light);margin-bottom:1.25rem;">Crea tu liga y deja de perseguir a tus amigos por WhatsApp</p>
        ${cta('Empezar gratis →')}
      </div>
    </article>
  `;

  container.querySelectorAll('.seo-cta').forEach(btn => {
    btn.addEventListener('click', () => onNavigate?.('acceso'));
  });

  injectFaqSchema();
}

export { removeFaqSchema };

// Shared inline styles
const H2 = 'font-family:var(--font-display);font-weight:900;font-size:clamp(1.4rem,4.5vw,1.9rem);text-transform:uppercase;line-height:1.05;margin:2.25rem 0 0.85rem;';
const H3 = 'font-family:var(--font-display);font-weight:800;font-size:1.1rem;margin:1.6rem 0 0.5rem;color:var(--accent-gold);';
const P = 'font-size:0.97rem;line-height:1.65;color:var(--text-light);margin:0 0 0.9rem;';
const UL = 'margin:0 0 0.9rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.4rem;line-height:1.55;color:var(--text-light);';
