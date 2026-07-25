/**
 * "Guías" — recurso de contenido, orientado a texto y SEO.
 *
 * Antes era UNA sola URL (/guias) con todas las guías apiladas. Ahora es un
 * hub: /guias lista las guías y cada una vive en su propia URL
 * (/guias/<slug>). Esto multiplica el contenido rastreable (una página por
 * tema, cada una enfocada a su keyword) en vez de tener un único documento
 * gigante, que es justo lo que buscan Google y AdSense.
 *
 * El enrutado (src/main.js) pasa `slug`:
 *   - sin slug  -> render del índice (hub)
 *   - con slug  -> render del artículo individual
 * El SEO por artículo (título + meta) lo aplica setSEO() en main.js leyendo
 * getGuideBySlug().
 */

const H2 = 'font-family:var(--font-display);font-weight:900;font-size:1.5rem;text-transform:uppercase;line-height:1.1;margin:2.25rem 0 0.5rem;color:var(--text-light);scroll-margin-top:90px;';
const H3 = 'font-family:var(--font-display);font-weight:800;font-size:1.05rem;text-transform:uppercase;margin:1.5rem 0 0.5rem;color:var(--accent-gold,#deed00);';
const P = 'margin:0 0 1rem;';
const UL = 'margin:0 0 1rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.45rem;';

export const GUIDES = [
  {
    id: 'ideas-de-castigos',
    title: 'Ideas de castigos para el último de tu liga fantasy',
    description: 'Más de 20 ideas de castigos para el farolillo rojo de tu liga fantasy: dentro del juego, en redes, prendas y para el bote común. De lo más suave a lo más cruel.',
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
    description: 'Qué es el farolillo rojo en el fantasy, por qué gestionarlo a mano es un lío y cómo detectar automáticamente al colista de cada jornada en Biwenger.',
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
    description: 'Cómo llevar el bote común de tu liga fantasy con reglas claras, control automático de deudas y transparencia para que nadie discuta y el dinero llegue entero a final de temporada.',
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
    description: '¿Funcionan igual los castigos en Biwenger, Comunio y LaLiga Fantasy? Qué comparten todas las plataformas y en qué se diferencian a la hora de sincronizar tu liga.',
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
  },
  {
    id: 'como-elegir-capitan',
    title: 'Cómo elegir capitán en tu liga fantasy (y no fallar cada jornada)',
    description: 'La capitanía dobla puntos y decide tu jornada. Cómo elegir capitán mirando el rival, la titularidad y el calendario, y cuándo arriesgar con un diferencial.',
    html: `
      <p style="${P}">La capitanía dobla los puntos de un jugador, así que es la decisión que más pesa cada jornada. Acertar con el capitán es, muchas veces, la diferencia entre ser el líder o acabar de farolillo rojo pagando el bote.</p>

      <h3 style="${H3}">Mira el partido, no solo el nombre</h3>
      <p style="${P}">La tentación es capitanear siempre a tu estrella, pero el rival importa tanto como el jugador. Un delantero top contra un equipo que encaja pocos goles rendirá menos que un jugador en forma con un partido asequible en casa. Revisa el calendario: local o visitante, rival de la zona baja y descanso reciente son buenas señales.</p>

      <h3 style="${H3}">Titularidad y minutos garantizados</h3>
      <p style="${P}">De poco sirve un capitán que se queda en el banquillo. Antes de cerrar la jornada, comprueba alineaciones probables, sanciones y rotaciones, sobre todo en semanas de dos partidos o competiciones europeas de por medio.</p>

      <h3 style="${H3}">Diferénciate del grupo</h3>
      <p style="${P}">Si todos capitanean al mismo, acertar solo te mantiene a la par. Cuando vas por detrás en la clasificación, una capitanía diferencial (un jugador menos evidente con buen partido) es la forma de recuperar terreno. Si vas líder, cubrirte con la opción segura suele ser lo más sensato.</p>
    `
  },
  {
    id: 'encontrar-chollos',
    title: 'Chollos en el fantasy: cómo encontrar jugadores baratos que puntúan',
    description: 'Cómo encontrar chollos en el fantasy: recién ascendidos, titularidad por encima del nombre, defensas de equipos sólidos y por qué hay que reaccionar rápido.',
    html: `
      <p style="${P}">Un chollo es ese jugador barato que rinde muy por encima de su precio y te libera dinero para reforzar el resto del equipo. Encontrarlos a tiempo es lo que separa a los mánagers que pelean arriba de los que se quedan enganchados a fichajes caros que no rinden.</p>

      <h3 style="${H3}">Fíjate en los recién ascendidos y los cambios de equipo</h3>
      <p style="${P}">Los jugadores de equipos modestos suelen empezar baratos. Si uno se hace titular indiscutible y su equipo compite, su precio tardará en subir mientras tú ya sumas puntos. Los que cambian de club en verano también arrancan a precios que aún no reflejan su nuevo rol.</p>

      <h3 style="${H3}">Titularidad por encima de talento</h3>
      <p style="${P}">Un crack que juega media hora puntúa menos que un jugador correcto que disputa los 90 minutos cada jornada. Para chollos, prioriza minutos asegurados y un rol claro en el equipo por delante del nombre.</p>

      <h3 style="${H3}">Defensas y porteros de equipos sólidos</h3>
      <p style="${P}">Los defensas y porteros de equipos que encajan poco acumulan puntos por portería a cero de forma constante y suelen ser mucho más baratos que los centrocampistas y delanteros. Son la base perfecta para un equipo equilibrado sin arruinarte.</p>

      <h3 style="${H3}">Reacciona rápido</h3>
      <p style="${P}">El valor de un chollo dura poco: en cuanto rinde, su precio sube y todos lo quieren. Revisa el mercado cada jornada y no esperes a estar seguro del todo, porque para entonces ya no será un chollo.</p>
    `
  },
  {
    id: 'clausulas-de-rescision',
    title: 'Cláusulas de rescisión: cómo usarlas (y cómo protegerte)',
    description: 'Cómo usar las cláusulas de rescisión en el fantasy: cuándo lanzar una, cómo proteger a tus mejores jugadores y por qué vigilar el saldo del resto del grupo.',
    html: `
      <p style="${P}">En muchas ligas fantasy puedes fichar a un jugador de otro mánager pagando su cláusula de rescisión, aunque no esté en venta. Es una de las mecánicas más divertidas y polémicas, y saber manejarla te da ventaja tanto para atacar como para defender tu plantilla.</p>

      <h3 style="${H3}">Cuándo lanzar una cláusula</h3>
      <p style="${P}">Tiene sentido pagar una cláusula cuando el jugador vale claramente más de lo que te cuesta, cuando resuelve una carencia de tu equipo o cuando quieres debilitar a un rival directo por el título. Echa cuentas: no te descapitalices por un fichaje impulsivo que te deje sin margen el resto de la temporada.</p>

      <h3 style="${H3}">Protege a tus mejores jugadores</h3>
      <p style="${P}">Si tu liga lo permite, sube la cláusula de tus intocables para que a los demás les salga carísimo llevárselos. Cuidado con dejar a un crack con la cláusula baja justo después de una gran jornada: es cuando más papeletas tiene de que te lo quiten.</p>

      <h3 style="${H3}">Vigila tu saldo y el mercado</h3>
      <p style="${P}">Las cláusulas suelen poder ejecutarse en ventanas concretas. Mantén algo de liquidez si temes un ataque y presta atención a los movimientos del grupo: cuando alguien acumula dinero de golpe, casi siempre es que va a por la estrella de otro.</p>
    `
  },
  {
    id: 'errores-manager-novato',
    title: '7 errores típicos del mánager novato en el fantasy',
    description: 'Los 7 errores más comunes del mánager novato en el fantasy: gastar en tres cracks, fichar por nombre, olvidar alinear, ignorar el calendario y más.',
    html: `
      <p style="${P}">Todos hemos empezado cometiendo los mismos fallos. Si es tu primera temporada (o quieres dejar de ser el farolillo rojo del grupo), evita estos errores clásicos y notarás la diferencia enseguida.</p>

      <h3 style="${H3}">Los fallos que más caros se pagan</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Gastar todo el presupuesto en tres cracks:</strong> te quedas con un banquillo de relleno y cualquier lesión te hunde la jornada.</li>
        <li style="${LI}"><strong>Fichar por nombre y no por momento de forma:</strong> una estrella lesionada o sin ritmo puntúa menos que un jugador en racha.</li>
        <li style="${LI}"><strong>Olvidarte de alinear:</strong> el error más tonto y más común. Un jugador en el banquillo suma cero por muy bueno que sea.</li>
        <li style="${LI}"><strong>Ignorar el calendario:</strong> no es lo mismo jugar en casa contra un colista que fuera contra un grande.</li>
        <li style="${LI}"><strong>No tener portero ni defensa fiables:</strong> las porterías a cero son puntos baratos y constantes que muchos novatos desprecian.</li>
        <li style="${LI}"><strong>Vender a lo loco tras una mala jornada:</strong> un solo partido flojo no convierte a un buen jugador en malo.</li>
        <li style="${LI}"><strong>No usar la capitanía con cabeza:</strong> doblar puntos al jugador equivocado tira por la borda una buena jornada.</li>
      </ul>

      <p style="${P}">La clave está en la constancia: revisa alineaciones, aprovecha el calendario y no tomes decisiones en caliente. El fantasy es una carrera larga, no una jornada suelta.</p>
    `
  },
  {
    id: 'mantener-viva-la-liga',
    title: 'Cómo mantener viva tu liga fantasy hasta la última jornada',
    description: 'Ideas para que tu liga fantasy no se apague: castigos al último, premios paralelos, minirretos y mantener vivo el grupo de WhatsApp hasta la última jornada.',
    html: `
      <p style="${P}">El mayor enemigo de una liga entre amigos no es el rival: es el abandono. Cuando alguien se descuelga en la clasificación, deja de alinear, y poco a poco la liga pierde chispa. Estas ideas mantienen a todo el grupo enganchado hasta el final.</p>

      <h3 style="${H3}">Que perder también tenga premio (o castigo)</h3>
      <p style="${P}">Si solo importa quedar primero, el que va último se rinde. Con los castigos al farolillo rojo de cada jornada, el pique se mantiene aunque no pelees por el título: nadie quiere ser el que paga el bote o cumple la prenda de la semana.</p>

      <h3 style="${H3}">Premios paralelos y minirretos</h3>
      <ul style="${UL}">
        <li style="${LI}">Premio al mejor de cada mes, no solo al campeón final.</li>
        <li style="${LI}">Retos semanales votados por el grupo para dar salseo a cada jornada.</li>
        <li style="${LI}">Un "pichichi" de la liga: quien más puntúe una jornada elige el castigo del último.</li>
      </ul>

      <h3 style="${H3}">Mantén vivo el grupo de WhatsApp</h3>
      <p style="${P}">La liga vive en las conversaciones: los piques, los memes de las derrotas y el resumen de la jornada. Herramientas como el Bufón de la Corte (votar al peor jugador) o el Muro de la Vergüenza dan temas de conversación cada semana y evitan que el grupo se apague.</p>

      <h3 style="${H3}">Cierra bien la temporada</h3>
      <p style="${P}">Un buen final anima a repetir el año siguiente: una comida pagada con el bote, un trofeo simbólico para el campeón y una última humillación reservada para el que haya quedado último de la clasificación general. Así la liga no termina, solo descansa hasta la próxima.</p>
    `
  }
];

export function getGuideBySlug(slug) {
  return GUIDES.find(g => g.id === slug) || null;
}

const BACK_ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

const CTA_BLOCK = `
  <div style="border-top:1px solid var(--border-color);margin-top:2.5rem;padding-top:1.5rem;text-align:center;">
    <p style="${P}color:var(--text-muted);">¿Listo para empezar? Crea tu liga gratis y deja de perseguir a tus amigos por WhatsApp.</p>
    <button class="cf-link" data-nav="acceso" style="font-family:var(--font-display);font-weight:900;text-transform:uppercase;background:var(--accent);color:#000;border:3px solid #000;padding:0.75rem 1.75rem;cursor:pointer;box-shadow:4px 4px 0 #000;">Crea tu liga gratis</button>
  </div>
`;

function renderHub(container) {
  const cards = GUIDES.map(g => `
    <a href="/guias/${g.id}" class="cf-guide-card cf-link" data-nav="guias/${g.id}" style="display:block;text-decoration:none;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem 1.35rem;transition:transform 0.15s ease,border-color 0.15s ease;">
      <h2 style="font-family:var(--font-display);font-weight:800;font-size:1.15rem;text-transform:uppercase;line-height:1.15;margin:0 0 0.4rem;color:var(--text-light);">${g.title}</h2>
      <p style="margin:0 0 0.6rem;font-size:0.9rem;line-height:1.55;color:var(--text-muted);">${g.description}</p>
      <span style="font-family:var(--font-display);font-weight:800;font-size:0.85rem;text-transform:uppercase;color:var(--accent);">Leer guía →</span>
    </a>
  `).join('');

  container.innerHTML = `
    <div class="content-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="content-back" data-nav="inicio" class="cf-link" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        ${BACK_ARROW} Volver al inicio
      </a>

      <h1 style="font-family:var(--font-display);font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.4rem;">Guías de Castigos Fantasy</h1>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.75rem;line-height:1.6;">Ideas de castigos, capitanías, chollos, cláusulas, errores de novato y cómo llevar el bote de tu liga. Guías prácticas para dominar tu liga fantasy de Biwenger, Comunio o LaLiga Fantasy y mantener a tus amigos enganchados hasta la última jornada.</p>

      <div class="cf-guides-grid" style="display:grid;grid-template-columns:1fr;gap:1rem;">
        ${cards}
      </div>

      ${CTA_BLOCK}
    </div>
  `;
}

function renderArticle(container, guide) {
  // Otras guías (para enlazado interno): todas menos la actual.
  const related = GUIDES.filter(g => g.id !== guide.id).slice(0, 4).map(g => `
    <li style="${LI}"><a href="/guias/${g.id}" class="cf-link" data-nav="guias/${g.id}" style="color:var(--accent);">${g.title}</a></li>
  `).join('');

  container.innerHTML = `
    <div class="content-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="content-back" data-nav="guias" class="cf-link" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        ${BACK_ARROW} Todas las guías
      </a>

      <article>
        <h1 style="font-family:var(--font-display);font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.08;margin-bottom:1rem;">${guide.title}</h1>
        <div class="content-body" style="font-size:0.98rem;line-height:1.75;color:var(--text-light);">
          ${guide.html}
        </div>
      </article>

      <div style="border-top:1px solid var(--border-color);margin-top:2.5rem;padding-top:1.5rem;">
        <h2 style="${H2}margin-top:0;">Sigue leyendo</h2>
        <ul style="${UL}font-size:0.95rem;line-height:1.7;">${related}</ul>
      </div>

      ${CTA_BLOCK}
    </div>
  `;
}

export function renderGuias(container, { onNavigate, slug } = {}) {
  const guide = slug ? getGuideBySlug(slug) : null;

  if (guide) {
    renderArticle(container, guide);
  } else {
    renderHub(container);
  }

  // Todos los enlaces/CTAs internos usan .cf-link con data-nav (incluye
  // "guias/<slug>" para navegar entre artículos).
  container.querySelectorAll('.cf-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate?.(el.dataset.nav);
    });
  });

  // Al entrar en un artículo o cambiar de guía, subir arriba del todo.
  window.scrollTo({ top: 0, behavior: 'auto' });
}
