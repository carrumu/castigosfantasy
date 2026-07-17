/**
 * "Guías" — a long-form, text-first resource page.
 *
 * Its job is to give Google (and AdSense) substantial, original content that is
 * genuinely useful to someone arriving from search about fantasy punishments,
 * Biwenger, the common pot, etc. One rich URL with several full articles and a
 * table of contents.
 */

const H2 = 'font-family:var(--font-display);font-weight:900;font-size:1.5rem;text-transform:uppercase;line-height:1.1;margin:2.75rem 0 0.5rem;color:var(--text-light);scroll-margin-top:90px;';
const H3 = 'font-family:var(--font-display);font-weight:800;font-size:1.05rem;text-transform:uppercase;margin:1.5rem 0 0.5rem;color:var(--accent-gold,#deed00);';
const P = 'margin:0 0 1rem;';
const UL = 'margin:0 0 1rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.45rem;';

const GUIDES = [
  {
    id: 'ideas-de-castigos',
    title: 'Ideas de castigos para el último de tu liga fantasy',
    html: `
      <p style="${P}">Aportar al bote y poco más se queda corto enseguida. El buen castigo pica sin hacer daño, da para meme en el grupo y, a ser posible, duele dentro del propio fantasy. Aquí tienes ideas concretas, ordenadas de más suave a más cruel. Puedes sortearlas con la <a href="/ruleta" class="cf-link" data-nav="ruleta" style="color:var(--accent);">Ruleta de Sentencias</a> o dejar que el <a href="/generador" class="cf-link" data-nav="generador" style="color:var(--accent);">Generador de Castigos</a> te proponga una al momento.</p>

      <h3 style="${H3}">Los que duelen dentro del fantasy (los mejores)</h3>
      <p style="${P}">Estos son los que de verdad escuecen, porque afectan a tu equipo la jornada siguiente:</p>
      <ul style="${UL}">
        <li style="${LI}"><strong>Once intervenido:</strong> la próxima alineación la decide el grupo por votación, capitán incluido. Tú solo miras.</li>
        <li style="${LI}"><strong>Capitán regalado:</strong> cedes tu capitán de la siguiente jornada al jugador que elija el ganador.</li>
        <li style="${LI}"><strong>Mercado cerrado:</strong> una semana sin fichar ni vender. Te aguantas con la plantilla que tienes.</li>
        <li style="${LI}"><strong>Cambio de nombre forzoso:</strong> tu equipo se llama lo que decida el grupo hasta que otro quede último.</li>
        <li style="${LI}"><strong>Fichaje impuesto:</strong> el resto te obliga a alinear a un jugador cualquiera de tu banquillo, sí o sí.</li>
      </ul>

      <h3 style="${H3}">Comparecencia ante la afición (el toque "juicio")</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Rueda de prensa:</strong> audio de 1 minuto al grupo "dando explicaciones" por el fracaso, con tono de entrenador cesado.</li>
        <li style="${LI}"><strong>Narración de la tragedia:</strong> nota de voz relatando tu propia derrota como si fuera el minuto 93 de una final perdida.</li>
        <li style="${LI}"><strong>Firma del acta:</strong> te declaras "farolillo rojo oficial" de la jornada y quedas en el <a href="/muro-verguenza" class="cf-link" data-nav="muro-verguenza" style="color:var(--accent);">Muro de la Vergüenza</a> hasta que otro te releve.</li>
        <li style="${LI}"><strong>Elogio obligado:</strong> escribes en el grupo tres virtudes del equipo del ganador, sin una gota de sarcasmo.</li>
      </ul>

      <h3 style="${H3}">Redes y foto de perfil (públicos y virales)</h3>
      <ul style="${UL}">
        <li style="${LI}">Foto de perfil de WhatsApp durante una semana: un montaje (cuanto más cutre, mejor) que te prepara el ganador.</li>
        <li style="${LI}">Estado de WhatsApp 48 horas: "Busco entrenador para mi Fantasy, el actual es un fraude".</li>
        <li style="${LI}">Story de Instagram enseñando el once de esa jornada con la leyenda "así se pierde una liga, tomad nota".</li>
        <li style="${LI}">Story cantando (mal) el himno del rival más odiado del grupo.</li>
      </ul>

      <h3 style="${H3}">Prendas y retos fotografiables</h3>
      <ul style="${UL}">
        <li style="${LI}">Vídeo dando 10 toques a un rollo de papel higiénico. Si fallas, se repite hasta que salga.</li>
        <li style="${LI}">Recrear un meme clásico en casa y mandar la foto al grupo.</li>
        <li style="${LI}">Grabarte imitando la celebración de gol más ridícula que se te ocurra en el salón.</li>
        <li style="${LI}">Enseñar el "desayuno del perdedor" con cara de circunstancias en un vídeo de 15 segundos.</li>
      </ul>

      <h3 style="${H3}">Para el bote común (con vuelta de tuerca)</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Impuesto de reincidencia:</strong> si eres último dos jornadas seguidas, la aportación se dobla.</li>
        <li style="${LI}">Pagar el bote de la jornada en monedas pequeñas, contadas delante del grupo.</li>
        <li style="${LI}">El último paga, pero el penúltimo decide a qué se destina esta semana.</li>
        <li style="${LI}">Costear el "premio simbólico" (un trofeo de bazar) para el ganador de la jornada.</li>
      </ul>

      <p style="${P}">Una regla de oro: el mejor castigo hace reír a todo el grupo, también al que lo cumple, y nunca cruza lo personal. Acordad un catálogo al empezar la temporada, metedlo en la ruleta y que decida el azar; así nadie puede quejarse de favoritismos.</p>
    `
  },
  {
    id: 'farolillo-rojo-biwenger',
    title: 'El farolillo rojo: quién queda último cada jornada (y cómo detectarlo)',
    html: `
      <p style="${P}">En el argot del fantasy, el "farolillo rojo" es el que va colista, el que menos puntos ha hecho en la jornada. Es el protagonista involuntario de los castigos: sobre él recae la penitencia o la aportación al bote.</p>

      <h3 style="${H3}">El problema no es la idea, es la gestión</h3>
      <p style="${P}">Saber quién ha quedado último cada semana, apuntarlo, decidir el castigo y asegurarte de que se cumple suele acabar en un Excel que nadie actualiza o en un grupo de WhatsApp donde el "eh, te toca pagar" se pierde entre memes. Ahí es donde una herramienta como Castigos Fantasy quita trabajo.</p>

      <h3 style="${H3}">Detección automática con Biwenger</h3>
      <p style="${P}">Cuando sincronizas tu liga de Biwenger, la clasificación de la jornada se importa sola y se detecta automáticamente quién ha sido el farolillo rojo, sin que tengas que revisar nada a mano. En cuanto se cierra la jornada, la app ya sabe quién es el candidato al castigo y actualiza el bote y las deudas.</p>

      <h3 style="${H3}">¿Y si juego en Comunio o LaLiga Fantasy?</h3>
      <p style="${P}">El concepto de "el último paga" es idéntico en cualquier plataforma. Hoy la sincronización automática está activa con Biwenger; si tu liga juega en Comunio, LaLiga Fantasy o Mister, puedes seguir usando la app para gestionar el bote, sortear castigos y llevar el muro de la vergüenza, confirmando tú manualmente quién ha quedado último en un par de toques.</p>
    `
  },
  {
    id: 'gestionar-el-bote',
    title: 'Cómo gestionar el bote de tu liga fantasy sin discusiones',
    html: `
      <p style="${P}">El bote común es una de las mejores tradiciones del fantasy entre amigos: cada jornada, el que pierde aporta, y al final de la temporada se hace algo con el dinero (una comida, un premio para el campeón, etc.). El problema es llevar las cuentas de forma clara para que nadie discuta.</p>

      <h3 style="${H3}">Reglas claras desde el principio</h3>
      <ul style="${UL}">
        <li style="${LI}">Definid cuánto aporta el último de cada jornada antes de empezar la temporada.</li>
        <li style="${LI}">Decidid qué pasa con el dinero al final: comida, premio al ganador, o lo que queráis.</li>
        <li style="${LI}">Acordad si hay recargos (por ejemplo, doble aportación por quedar último dos veces seguidas).</li>
      </ul>

      <h3 style="${H3}">Lleva el control automático</h3>
      <p style="${P}">En lugar de apuntar las deudas a mano, la app lleva el registro automático de quién debe qué jornada a jornada. Cada aportación queda registrada y todo el grupo puede consultarla, de forma que no dependas de la memoria de nadie ni de un documento que se pierde.</p>

      <h3 style="${H3}">Transparencia = menos discusiones</h3>
      <p style="${P}">Cuando el saldo del bote y las deudas de cada uno son visibles para toda la liga, se acaban las discusiones de "yo ya pagué" o "¿cuánto debía?". La transparencia es la mejor forma de que un bote entre amigos llegue entero al final de la temporada.</p>
    `
  },
  {
    id: 'biwenger-comunio-laliga-fantasy',
    title: 'Castigos en Biwenger, Comunio o LaLiga Fantasy: ¿es lo mismo?',
    html: `
      <p style="${P}">Una duda habitual al empezar: ¿los castigos funcionan igual en todas las plataformas de fantasy? La respuesta corta es sí. El concepto de "el último paga" existe igual en Biwenger, Comunio, LaLiga Fantasy, Mister o cualquier otra. Lo único que cambia es de dónde se importa la clasificación.</p>

      <h3 style="${H3}">Qué comparten todas</h3>
      <ul style="${UL}">
        <li style="${LI}">Cada jornada hay una clasificación y, por tanto, un último.</li>
        <li style="${LI}">El grupo decide un castigo o una aportación para ese último.</li>
        <li style="${LI}">La gracia está en el pique social, no en la plataforma concreta.</li>
      </ul>

      <h3 style="${H3}">En qué se diferencian a la hora de sincronizar</h3>
      <p style="${P}">Hoy la sincronización automática está disponible con Biwenger: la clasificación se importa sola. En Comunio, LaLiga Fantasy y otras, la gestión del bote, la ruleta y el muro funcionan igual, pero confirmas tú quién ha quedado último. En todos los casos, Castigos Fantasy es un complemento: sigues jugando tu liga exactamente donde ya lo haces.</p>

      <h3 style="${H3}">Marcas y afiliación</h3>
      <p style="${P}">Castigos Fantasy no está asociado ni patrocinado por Biwenger, Comunio, Mister ni LaLiga. Son marcas de sus respectivos titulares; nosotros solo añadimos la capa social de castigos por encima de tu liga.</p>
    `
  }
];

export function renderGuias(container, { onNavigate } = {}) {
  const toc = GUIDES.map(g => `
    <li style="${LI}"><a href="#${g.id}" class="cf-toc" data-id="${g.id}" style="color:var(--accent);">${g.title}</a></li>
  `).join('');

  const articles = GUIDES.map(g => `
    <article style="border-top:1px solid var(--border-color);padding-top:0.5rem;">
      <h2 id="${g.id}" style="${H2}">${g.title}</h2>
      ${g.html}
    </article>
  `).join('');

  container.innerHTML = `
    <div class="content-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="content-back" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Volver
      </a>

      <h1 style="font-family:var(--font-display);font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.4rem;">Guías de Castigos Fantasy</h1>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem;line-height:1.6;">Ideas de castigos, cómo detectar al farolillo rojo, cómo llevar el bote de tu liga y las diferencias entre plataformas. Todo lo que necesitas para sacarle partido a tu liga fantasy con tus amigos.</p>

      <nav style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;margin-bottom:1rem;">
        <strong style="display:block;font-family:var(--font-display);text-transform:uppercase;font-size:0.8rem;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:0.5rem;">En esta página</strong>
        <ul style="margin:0;padding-left:1.1rem;font-size:0.9rem;line-height:1.7;">${toc}</ul>
      </nav>

      <div class="content-body" style="font-size:0.95rem;line-height:1.7;color:var(--text-light);">
        ${articles}
      </div>

      <div style="border-top:1px solid var(--border-color);margin-top:2.5rem;padding-top:1.5rem;text-align:center;">
        <p style="${P}color:var(--text-muted);">¿Listo para empezar? Crea tu liga gratis y deja de perseguir a tus amigos por WhatsApp.</p>
        <button class="cf-link" data-nav="acceso" style="font-family:var(--font-display);font-weight:900;text-transform:uppercase;background:var(--accent);color:#000;border:3px solid #000;padding:0.75rem 1.75rem;cursor:pointer;box-shadow:4px 4px 0 #000;">Crea tu liga gratis</button>
      </div>
    </div>
  `;

  container.querySelector('#content-back')?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else onNavigate?.('inicio');
  });

  // Smooth-scroll for the table of contents.
  container.querySelectorAll('.cf-toc').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = container.querySelector('#' + a.dataset.id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // In-content CTAs that route into the app.
  container.querySelectorAll('.cf-link').forEach(el => {
    el.addEventListener('click', () => onNavigate?.(el.dataset.nav));
  });
}
