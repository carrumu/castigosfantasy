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

import { PUNISHMENT_IDEAS } from '../utils/punishments-catalog.js';

const H2 = 'font-family:var(--font-display);font-weight:900;font-size:1.5rem;text-transform:uppercase;line-height:1.1;margin:2.25rem 0 0.5rem;color:var(--text-light);scroll-margin-top:90px;';
const H3 = 'font-family:var(--font-display);font-weight:800;font-size:1.05rem;text-transform:uppercase;margin:1.5rem 0 0.5rem;color:var(--accent-gold,#deed00);';
const P = 'margin:0 0 1rem;';
const UL = 'margin:0 0 1rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.45rem;';

// Construye el HTML del catálogo de castigos a partir de los datos del
// Generador (agrupados por tipo). Así esta guía indexable muestra exactamente
// los mismos castigos que ofrece la herramienta (sin cloaking).
function buildPunishmentCatalogHtml() {
  const order = [];
  const byCat = {};
  for (const p of PUNISHMENT_IDEAS) {
    if (!byCat[p.categoryLabel]) { byCat[p.categoryLabel] = []; order.push(p.categoryLabel); }
    byCat[p.categoryLabel].push(p);
  }
  const intro = `<p style="${P}">Estos son los ${PUNISHMENT_IDEAS.length} castigos del <a href="/generador" class="cf-link" data-nav="generador" style="color:var(--accent);">Generador de Castigos</a>, ordenados por tipo. Puedes sortear cualquiera con la <a href="/ruleta" class="cf-link" data-nav="ruleta" style="color:var(--accent);">Ruleta de Sentencias</a> o dejar que el generador te proponga uno al azar. De lo más suave a lo más bestia.</p>`;
  const sections = order.map(cat => `
      <h3 style="${H3}">${cat}</h3>
      <ul style="${UL}">
        ${byCat[cat].map(i => `<li style="${LI}"><strong>${i.name}:</strong> ${i.description}</li>`).join('')}
      </ul>`).join('');
  return intro + sections;
}

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
    id: 'catalogo-de-castigos',
    title: 'Catálogo de 60 castigos para tu liga fantasy',
    description: 'Catálogo completo de castigos para el último de tu liga fantasy: vergonzosos, creativos, deportivos y físicos. 60 ideas listas para sortear con la ruleta o generar al azar.',
    html: buildPunishmentCatalogHtml()
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

      <h3 style="${H3}">Por qué conviene darle bombo al farolillo rojo</h3>
      <p style="${P}">Un farolillo rojo sin consecuencias es un farolillo rojo que pasa desapercibido, y ahí empieza el desinterés. Cuando quedar último tiene premio (un castigo, una prenda o una aportación al bote), el colista deja de ser una fila más de la tabla y se convierte en el protagonista de la semana. Ese pique es, muchas veces, lo que engancha más que la propia pelea por el título.</p>

      <h3 style="${H3}">Farolillo rojo de la jornada vs. de la temporada</h3>
      <p style="${P}">Conviene distinguir dos cosas. El farolillo rojo de la jornada es el que menos puntúa esa semana concreta: sobre él caen los castigos semanales. El farolillo rojo de la temporada es el que acaba último en la clasificación general, y suele reservarse para la humillación final del año. Muchas ligas premian (o castigan) los dos por separado para que nadie se relaje ni al principio ni al final.</p>

      <h3 style="${H3}">Que no se pierda la cuenta</h3>
      <p style="${P}">El clásico problema es que, tres jornadas después, ya nadie recuerda quién quedó último ni si cumplió. Llevar un registro (automático con Biwenger, o confirmado a mano en el resto) evita que el castigo quede en nada. Un farolillo rojo que sabe que va a quedar por escrito en el Muro de la Vergüenza se lo piensa dos veces antes de escaquearse.</p>
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

      <h3 style="${H3}">Decide qué hacer con el bote antes de discutirlo</h3>
      <p style="${P}">La mayoría de las broncas por el bote no son por el dinero, sino por no haber acordado antes qué se hacía con él. Comida de fin de temporada, premio para el campeón, o repartir entre los tres primeros: da igual la fórmula, pero pactadla en la primera jornada y dejadla por escrito. Así, cuando llegue mayo, no hay debate.</p>

      <h3 style="${H3}">El moroso: el gran enemigo del bote</h3>
      <p style="${P}">En toda liga hay uno que siempre "ya te lo paso" y nunca lo pasa. La mejor defensa contra el moroso es la transparencia: si todo el grupo ve quién debe qué y desde cuándo, la presión social hace el trabajo sola. Nadie quiere ser el que aparece en rojo jornada tras jornada delante de sus amigos.</p>

      <h3 style="${H3}">Aportaciones pequeñas y constantes</h3>
      <p style="${P}">Un bote funciona mejor con cantidades pequeñas cada jornada que con multas grandes de vez en cuando. Un euro o dos por quedar último es asumible, mantiene el pique semanal y, sumado a lo largo de la temporada, da para un buen cierre. Las multas enormes solo consiguen que la gente se enfade y deje de pagar.</p>
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

      <h3 style="${H3}">Elige la plataforma por tu grupo, no al revés</h3>
      <p style="${P}">Si todavía estás decidiendo dónde montar la liga, la mejor plataforma es aquella en la que ya juegan la mayoría de tus amigos. La comodidad de que todos entren sin aprender una app nueva vale más que cualquier función concreta. Los castigos funcionan igual de bien en todas, así que ese no debe ser el factor decisivo.</p>

      <h3 style="${H3}">Qué gana la liga con la capa de castigos</h3>
      <p style="${P}">Biwenger, Comunio y LaLiga Fantasy gestionan de maravilla la parte deportiva: fichajes, puntos, clasificación. Lo que ninguna hace bien es la parte social: el bote, quién paga, quién se raja y el pique de cada jornada. Esa es justo la capa que se añade por encima, sin tocar tu liga de siempre.</p>

      <h3 style="${H3}">No hace falta que todos migren de golpe</h3>
      <p style="${P}">El flujo natural es que una persona monte el grupo de castigos y comparta el enlace por WhatsApp, igual que se comparte cualquier otra cosa. No tienes que convencer a nadie de cambiar de plataforma ni de aprender nada nuevo: seguís jugando donde jugáis, solo que ahora el último de la jornada tiene consecuencias.</p>
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

      <h3 style="${H3}">Aprovecha las jornadas dobles</h3>
      <p style="${P}">En las semanas en las que un equipo juega dos partidos, su jugador puede puntuar el doble de veces. Si además tu liga dobla los puntos del capitán, capitanear a alguien con jornada doble y buenos rivales es de las jugadas más rentables que existen. Míralo siempre antes de cerrar: una jornada doble bien capitaneada te puede sacar del pozo de un plumazo.</p>

      <h3 style="${H3}">No te comas la cabeza a última hora</h3>
      <p style="${P}">Uno de los errores más caros es cambiar el capitán treinta segundos antes del cierre por una corazonada. Casi siempre, la primera elección razonada es la buena. Decide con criterio a principio de semana, ajusta solo si hay una lesión o una novedad real, y no te dejes llevar por el último tuit que hayas leído.</p>

      <h3 style="${H3}">Un método rápido para decidir</h3>
      <p style="${P}">Si no quieres complicarte, responde a tres preguntas y capitanea al que más veces diga que sí: ¿juega seguro los 90 minutos?, ¿su rival es asequible y juega en casa?, ¿está en buena racha? Un jugador que cumple los tres es tu capitán; si ninguno lo cumple del todo, tira por el más fiable antes que por el más vistoso.</p>
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

      <h3 style="${H3}">Vigila las rachas de partidos asequibles</h3>
      <p style="${P}">Un chollo se multiplica si además tiene un calendario amable por delante. Un jugador barato de un equipo que encadena tres o cuatro rivales flojos puede darte puntos constantes durante varias jornadas seguidas. Cruzar precio bajo con buen calendario es la fórmula que de verdad marca la diferencia.</p>

      <h3 style="${H3}">Cuidado con los chollos de una sola jornada</h3>
      <p style="${P}">No todo lo que puntúa mucho una semana es un chollo. Un jugador que hace un partidazo aislado y vuelve a desaparecer no te sirve: te habrás gastado el dinero justo cuando su precio estaba más alto. Busca regularidad, no fuegos artificiales.</p>

      <h3 style="${H3}">El banquillo también cuenta</h3>
      <p style="${P}">Los mejores gestores no solo fichan chollos para el once: llenan el banquillo de jugadores baratos con minutos, para que una lesión o una rotación no les deje la jornada a medias. Un banquillo de chollos titulares es un seguro barato contra los imprevistos.</p>
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

      <h3 style="${H3}">El farol de la cláusula</h3>
      <p style="${P}">A veces, la amenaza vale más que el fichaje. Dejar caer en el grupo que "igual pago la cláusula de fulano" puede hacer que su dueño se ponga nervioso y suba cláusulas a lo loco, gastando dinero que luego le falta en el mercado. En una liga entre amigos, la guerra psicológica es medio juego.</p>

      <h3 style="${H3}">Cuidado con quedarte sin fondo de armario</h3>
      <p style="${P}">Pagar una cláusula alta puede dejarte con un equipo de dos estrellas y nueve rellenos. Antes de lanzarte, piensa si el fichaje te compensa o si te deja vendido ante la primera lesión. A veces es más rentable reforzar tres posiciones flojas que gastarlo todo en un solo nombre.</p>

      <h3 style="${H3}">Revisa las reglas de tu liga</h3>
      <p style="${P}">No todas las ligas manejan las cláusulas igual: algunas las bloquean las primeras jornadas, otras limitan cuántas puedes lanzar por temporada, y otras las desactivan del todo. Antes de montar una estrategia alrededor de las cláusulas, asegúrate de saber exactamente cómo funcionan en tu competición.</p>
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

      <h3 style="${H3}">El error de mirar solo tu equipo</h3>
      <p style="${P}">Muchos novatos juegan como si estuvieran solos: fichan a su gusto sin mirar qué hace el resto. En una liga, ir a rebufo del líder o cubrir sus jugadores clave a veces importa más que tu propia alineación. Vigila el mercado del grupo tanto como el tuyo.</p>

      <h3 style="${H3}">No te obsesiones con una sola jornada</h3>
      <p style="${P}">Una mala jornada no hunde una temporada, y una buena no la gana. El error emocional más común es reconstruir el equipo entero tras un domingo flojo. Los que pelean arriba son casi siempre los que mantienen la calma y confían en un plan a largo plazo.</p>

      <h3 style="${H3}">Aprende de tu farolillo rojo</h3>
      <p style="${P}">Si te toca pagar el bote una semana, aprovecha para mirar por qué: ¿fallaste el capitán?, ¿tenías medio equipo en el banquillo?, ¿ignoraste el calendario? El farolillo rojo de hoy, si aprende del castigo, es el que pelea por el título el mes que viene.</p>
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

      <h3 style="${H3}">Da voz a los que van últimos</h3>
      <p style="${P}">La liga se apaga cuando los de abajo se rinden. Por eso los castigos, los minirretos y los premios paralelos están pensados sobre todo para ellos: si el que va decimoquinto tiene algo por lo que pelear cada jornada, sigue alineando y sigue picándose. Una liga viva es una liga donde también importa no ser el último.</p>

      <h3 style="${H3}">Rituales que enganchan</h3>
      <p style="${P}">Las ligas que duran tienen sus rituales: el resumen de la jornada, el meme del que ha quedado último, la votación al peor jugador. No hace falta que sea nada elaborado; basta con que sea fijo. Cuando el grupo espera cada semana su dosis de salseo, nadie se descuelga.</p>

      <h3 style="${H3}">Renueva las apuestas a mitad de temporada</h3>
      <p style="${P}">Si a la vuelta de Navidad la liga pierde fuelle, mete algo nuevo: un premio al mejor de la segunda vuelta, un castigo especial para el colista del mes o un minitorneo paralelo. Un pequeño reinicio de objetivos vuelve a enganchar a los que ya daban la temporada por perdida.</p>
    `
  },
  {
    id: 'reglas-para-liga-de-castigos',
    title: 'Cómo montar las reglas de tu liga de castigos (sin líos)',
    description: 'Guía para montar las reglas de una liga de castigos: qué se castiga, cuánto se aporta, qué pasa con los morosos y cómo cerrar la temporada. Con una plantilla base para copiar.',
    html: `
      <p style="${P}">Una liga de castigos que no acuerda las reglas al principio acaba en discusiones a mitad de temporada. La clave es dejarlas claras y por escrito antes de la primera jornada, cuando todavía nadie va último y todos las aceptan de buen rollo. Aquí tienes cómo montarlas paso a paso.</p>

      <h3 style="${H3}">Define qué se castiga</h3>
      <p style="${P}">Lo más habitual es castigar al farolillo rojo de cada jornada, el que menos puntúa. Pero puedes añadir supuestos: al que se olvide de alinear, al que no pague a tiempo o al que quede último de un mes entero. Cuantos más frentes, más salseo, pero no te pases el primer año: empieza con el castigo al colista de la jornada y ve ampliando.</p>

      <h3 style="${H3}">Pon cifras claras al bote</h3>
      <p style="${P}">Si vais a jugar con dinero, decidid una cantidad fija y pequeña por quedar último (uno o dos euros suele bastar). Acordad también si hay recargos, por ejemplo doblar la aportación si eres último dos jornadas seguidas. Lo importante es que la cifra sea asumible para todos: una multa demasiado alta solo consigue que la gente deje de pagar.</p>

      <h3 style="${H3}">Decide quién elige el castigo</h3>
      <p style="${P}">Hay tres fórmulas y todas valen: que lo elija el ganador de la jornada, que lo vote el grupo, o que lo decida el azar con una ruleta. La ruleta es la que menos discusiones genera, porque nadie puede acusar a nadie de tenerle manía. Sea cual sea, pactad el catálogo de castigos posibles al principio para que no haya sorpresas.</p>

      <h3 style="${H3}">Reglas para el moroso y el que se raja</h3>
      <p style="${P}">Todo grupo tiene un moroso y alguien que se raja del castigo. Deja claro qué pasa con ellos: normalmente basta con dejar constancia pública en un muro de la vergüenza para que la presión social haga el resto. Si quieres apretar más, el que no cumpla puede acumular el castigo para la jornada siguiente.</p>

      <h3 style="${H3}">Una plantilla base para empezar</h3>
      <p style="${P}">Si no quieres complicarte, copia estas reglas y ajústalas a tu grupo:</p>
      <ul style="${UL}">
        <li style="${LI}">El último de cada jornada aporta 2 euros al bote y cumple el castigo que salga en la ruleta.</li>
        <li style="${LI}">Quien quede último dos jornadas seguidas, dobla la aportación.</li>
        <li style="${LI}">Quien no alinee, cuenta como último automáticamente.</li>
        <li style="${LI}">El que se raje del castigo queda en el muro de la vergüenza hasta cumplirlo.</li>
        <li style="${LI}">El bote se gasta en una comida de fin de temporada; el campeón no paga su parte.</li>
        <li style="${LI}">El último de la clasificación general cumple una humillación final pactada.</li>
      </ul>

      <p style="${P}">Con esto tienes una liga de castigos montada en cinco minutos. A partir de ahí, cada temporada podéis ir afinando lo que funcione y quitando lo que no.</p>
    `
  },
  {
    id: 'glosario-fantasy',
    title: 'Glosario del fantasy: los términos que tienes que conocer',
    description: 'Diccionario del fantasy de fútbol: farolillo rojo, chollo, cláusula, portería a cero, diferencial, mister y más términos que se usan en Biwenger, Comunio y LaLiga Fantasy.',
    html: `
      <p style="${P}">El fantasy tiene su propia jerga, y si acabas de empezar es fácil perderse entre chollos, cláusulas y farolillos rojos. Aquí tienes los términos más usados en Biwenger, Comunio y LaLiga Fantasy explicados en una línea, para que no te pierdas en el grupo.</p>

      <h3 style="${H3}">Clasificación y castigos</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Farolillo rojo:</strong> el que va último, el que menos puntúa. El candidato al castigo de la jornada.</li>
        <li style="${LI}"><strong>Colista:</strong> lo mismo que farolillo rojo, el último de la tabla.</li>
        <li style="${LI}"><strong>Bote:</strong> el dinero común que se junta con las aportaciones de los que pierden.</li>
        <li style="${LI}"><strong>Moroso:</strong> el que debe dinero al bote y no lo paga.</li>
        <li style="${LI}"><strong>Rajarse:</strong> no cumplir el castigo que te ha tocado.</li>
      </ul>

      <h3 style="${H3}">Fichajes y mercado</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Chollo:</strong> jugador barato que puntúa mucho más de lo que cuesta.</li>
        <li style="${LI}"><strong>Cláusula de rescisión:</strong> lo que pagas para fichar a un jugador de otro mánager aunque no esté en venta.</li>
        <li style="${LI}"><strong>Clausulazo:</strong> pagar una cláusula alta para robarle la estrella a un rival.</li>
        <li style="${LI}"><strong>Puja:</strong> la cantidad que ofreces por un jugador del mercado; se lo lleva la más alta.</li>
        <li style="${LI}"><strong>Subida/bajada de valor:</strong> cómo cambia el precio de un jugador según su rendimiento y la demanda.</li>
      </ul>

      <h3 style="${H3}">Puntos y alineación</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Portería a cero:</strong> cuando tu equipo no encaja gol; suma puntos extra a porteros y defensas.</li>
        <li style="${LI}"><strong>Capitán:</strong> el jugador cuyos puntos se doblan esa jornada.</li>
        <li style="${LI}"><strong>Diferencial:</strong> un jugador que casi nadie tiene; si puntúa, te separa del grupo.</li>
        <li style="${LI}"><strong>Once tipo:</strong> tu alineación habitual, la que pones si no hay novedades.</li>
        <li style="${LI}"><strong>Rotación:</strong> cuando un entrenador da descanso a un titular; ojo, porque puede dejarte sin puntos.</li>
      </ul>

      <h3 style="${H3}">Otros términos habituales</h3>
      <ul style="${UL}">
        <li style="${LI}"><strong>Mánager:</strong> cada participante de la liga; tú eres el mánager de tu equipo.</li>
        <li style="${LI}"><strong>Mister:</strong> otra forma de llamar al mánager o entrenador; también es el nombre de una app de fantasy.</li>
        <li style="${LI}"><strong>Jornada doble:</strong> semana en la que un equipo juega dos partidos y sus jugadores pueden puntuar el doble.</li>
      </ul>

      <p style="${P}">Con estos términos ya puedes seguir cualquier conversación de tu liga sin quedarte fuera. Y si te toca ser el farolillo rojo, al menos sabrás exactamente cómo se llama tu desgracia.</p>
    `
  },
  {
    id: 'repartir-el-bote-final-temporada',
    title: 'Cómo repartir el bote al final de la temporada',
    description: 'Ideas para repartir el bote de tu liga fantasy a final de temporada: comida de grupo, premios al podio, sorteos y fórmulas para que nadie acabe enfadado.',
    html: `
      <p style="${P}">Llega el final de temporada, el bote está lleno y toca decidir qué hacer con él. Este es justo el momento en el que más ligas discuten, porque muchas no acordaron nada al principio. Aquí tienes las fórmulas más habituales para repartirlo sin que nadie acabe mosqueado.</p>

      <h3 style="${H3}">La comida de grupo (la clásica)</h3>
      <p style="${P}">La opción más socorrida y la que mejor sienta: el bote se gasta en una comida o cena de todos al terminar la liga. Es la que más une al grupo, porque el dinero vuelve a todos por igual y se cierra la temporada con buen rollo. Muchas ligas hacen que el campeón no pague su parte como premio simbólico.</p>

      <h3 style="${H3}">Premios al podio</h3>
      <p style="${P}">Si preferís que ganar tenga recompensa económica, repartid el bote entre los primeros: por ejemplo, 60% para el campeón, 30% para el segundo y 10% para el tercero. Funciona bien en ligas competitivas, pero tiene un riesgo: los que van por abajo pueden desengancharse si ven que no van a oler el dinero.</p>

      <h3 style="${H3}">Fórmula mixta</h3>
      <p style="${P}">La solución intermedia que contenta a casi todos: una parte del bote va a una comida de grupo y otra parte, más pequeña, se la lleva el campeón. Así se premia ganar sin dejar fuera a los que han pagado todo el año sin opciones de podio.</p>

      <h3 style="${H3}">El sorteo sorpresa</h3>
      <p style="${P}">Para grupos que se lo toman con humor: una parte del bote se sortea entre todos los que hayan cumplido sus castigos durante la temporada. Es una forma de premiar que la gente no se raje y de que hasta el último tenga un motivo para seguir participando.</p>

      <h3 style="${H3}">Deja el reparto por escrito desde el principio</h3>
      <p style="${P}">Sea cual sea la fórmula, el consejo es siempre el mismo: pactadla en la primera jornada, no en la última. Cuando el reparto está claro desde el inicio, nadie puede sentirse engañado al final, y el bote cumple su función: dar emoción a la temporada, no romper amistades.</p>
    `
  },
  {
    id: 'mercado-de-fichajes-fantasy',
    title: 'Cómo dominar el mercado de fichajes en el fantasy',
    description: 'Trucos para el mercado del fantasy: cuándo comprar y vender, aprovechar las subidas y bajadas de valor, ganar pujas y no quedarte pillado con jugadores caros.',
    html: `
      <p style="${P}">En el fantasy no solo se gana en el campo: buena parte de la ventaja se construye en el mercado. Saber cuándo comprar, cuándo vender y cómo aprovechar los cambios de precio es lo que separa a los que suben en la tabla de los que se quedan estancados. Estas son las claves.</p>

      <h3 style="${H3}">Compra antes de que suba, vende antes de que baje</h3>
      <p style="${P}">El precio de un jugador sube cuando rinde y todos lo quieren, y baja cuando falla o se lesiona. El truco está en adelantarte: ficha al jugador en forma antes de que su precio se dispare, y suéltalo cuando notes que su rendimiento va a caer. Comprar caro y vender barato es la forma más rápida de arruinarte.</p>

      <h3 style="${H3}">Aprovecha las subidas de valor para hacer caja</h3>
      <p style="${P}">Un jugador que compraste barato y ahora vale mucho más es dinero en el banco. No tengas miedo de venderlo si su precio está inflado: con ese beneficio puedes fichar a dos jugadores que te den más puntos totales. Muchos gestores buenos van rotando la plantilla para exprimir cada subida de valor.</p>

      <h3 style="${H3}">Gana las pujas sin pasarte</h3>
      <p style="${P}">Cuando varios vais a por el mismo jugador, gana la puja más alta. La tentación es ofrecer de más para asegurar, pero eso te deja sin dinero para el resto. Calcula cuánto vale de verdad ese jugador para ti y no te dejes llevar por la guerra de pujas: casi siempre hay una alternativa parecida más barata.</p>

      <h3 style="${H3}">No te quedes pillado con jugadores caros que no rinden</h3>
      <p style="${P}">El error más caro es enamorarte de un fichaje. Si esa estrella por la que pagaste un dineral lleva jornadas sin puntuar, cada semana que la mantienes pierdes puntos y valor. Asume la pérdida, véndelo y reinvierte: en el fantasy, como en la bolsa, aguantar una mala inversión solo la hace peor.</p>

      <h3 style="${H3}">Ten siempre algo de liquidez</h3>
      <p style="${P}">Guardar un poco de dinero sin gastar te permite reaccionar: fichar un chollo que aparece de repente, lanzar una cláusula o cubrir una lesión de última hora. Los que van con todo el presupuesto gastado siempre llegan tarde a las oportunidades.</p>
    `
  },
  {
    id: 'castigos-sin-dinero',
    title: 'Castigos sin dinero: prendas y retos para ligas sin bote',
    description: 'Ideas de castigos sin dinero para tu liga fantasy: prendas, retos, vídeos y humillaciones para grupos que prefieren jugarse el orgullo en vez del bolsillo.',
    html: `
      <p style="${P}">No todas las ligas quieren jugar con dinero, y está bien: a veces el orgullo pica más que la cartera. Si tu grupo prefiere castigos sin bote, aquí tienes ideas que funcionan igual de bien (o mejor), ordenadas por lo mucho que escuecen.</p>

      <h3 style="${H3}">Prendas y retos rápidos</h3>
      <ul style="${UL}">
        <li style="${LI}">Foto de perfil de WhatsApp durante una semana con un montaje que le prepare el ganador.</li>
        <li style="${LI}">Estado de WhatsApp reconociendo por escrito que ha sido el peor de la jornada.</li>
        <li style="${LI}">Nota de voz al grupo "dando explicaciones" por el fracaso, con tono de entrenador cesado.</li>
        <li style="${LI}">Vídeo imitando una celebración de gol ridícula en el salón de su casa.</li>
      </ul>

      <h3 style="${H3}">Castigos dentro del propio fantasy</h3>
      <p style="${P}">Los que más duelen son los que afectan a la jornada siguiente, y no cuestan un euro:</p>
      <ul style="${UL}">
        <li style="${LI}">La próxima alineación la decide el grupo por votación, capitán incluido.</li>
        <li style="${LI}">Cede tu capitán de la siguiente jornada al jugador que elija el ganador.</li>
        <li style="${LI}">Una semana sin poder fichar ni vender: te aguantas con lo que tienes.</li>
        <li style="${LI}">Tu equipo se llama lo que decida el grupo hasta que otro quede último.</li>
      </ul>

      <h3 style="${H3}">Castigos de exposición pública</h3>
      <p style="${P}">Cuando el grupo se lo toma con humor, la vergüenza es el mejor castigo:</p>
      <ul style="${UL}">
        <li style="${LI}">Story de Instagram enseñando el once de esa jornada con la leyenda "así se pierde una liga".</li>
        <li style="${LI}">Cantar (mal) el himno del rival más odiado del grupo en un vídeo.</li>
        <li style="${LI}">Quedar registrado en el muro de la vergüenza hasta que otro lo releve.</li>
      </ul>

      <h3 style="${H3}">La clave: que decida el azar</h3>
      <p style="${P}">Igual que con los castigos de dinero, lo mejor es acordar un catálogo al empezar la temporada y sortear el castigo con una ruleta. Así nadie se queja de que le tienen manía, y el que pierde no puede discutir: le ha tocado, y punto.</p>
    `
  },
  {
    id: 'como-remontar-clasificacion',
    title: 'Cómo remontar cuando vas último en el fantasy',
    description: 'Vas colista de la liga fantasy y quieres remontar: estrategia de fichajes, capitanías diferenciales, calendario y paciencia para escalar puestos antes de fin de temporada.',
    html: `
      <p style="${P}">Vas último, pagas el bote cada jornada y empiezas a plantearte tirar la toalla. Antes de rendirte: remontar en el fantasy es más habitual de lo que parece, porque la temporada es larga y casi todos cometen errores. Estas son las palancas para escalar puestos.</p>

      <h3 style="${H3}">Arriesga con capitanías diferenciales</h3>
      <p style="${P}">Si vas por detrás, jugar seguro solo te mantiene donde estás. Necesitas puntos que los de arriba no tengan: capitanea a jugadores menos evidentes con buen partido, en vez de al mismo crack que lleva medio grupo. Cuando aciertas un diferencial, recuperas terreno de golpe; cuando fallas, tampoco perdías nada estando ya último.</p>

      <h3 style="${H3}">Mira el calendario más que los nombres</h3>
      <p style="${P}">Una de las mejores formas de remontar es fichar jugadores con un calendario amable por delante. Un jugador correcto con tres rivales flojos seguidos te dará más puntos que una estrella con un calendario duro. Adelántate a esas rachas antes de que suban de precio.</p>

      <h3 style="${H3}">Reconstruye con cabeza, no en caliente</h3>
      <p style="${P}">La tentación cuando vas último es vender medio equipo tras una mala jornada. Error: eso suele hacerte comprar caro y vender barato. Cambia una o dos piezas por jornada, prioriza titularidad y minutos, y da tiempo a que los fichajes cuajen. Remontar es una carrera, no un pelotazo.</p>

      <h3 style="${H3}">Aprovecha que los de arriba se relajan</h3>
      <p style="${P}">El líder que va cómodo empieza a descuidar alineaciones, a no vigilar el mercado y a jugar seguro. Ahí es donde el que va último, con hambre y sin nada que perder, puede recortar semana a semana. La constancia del de abajo suele comerse la relajación del de arriba.</p>

      <h3 style="${H3}">Y si no remontas, que no te pillen de farolillo rojo final</h3>
      <p style="${P}">A veces no da para el título, pero sí para no acabar último del todo y librarte de la humillación final. Pelea cada puesto: en una liga de castigos, subir del último al penúltimo ya es una pequeña victoria (y un castigo menos).</p>
    `
  },
  {
    id: 'conectar-biwenger',
    title: 'Cómo conectar tu liga de Biwenger a Castigos Fantasy',
    description: 'Guía paso a paso para sincronizar tu liga de Biwenger con Castigos Fantasy: crear la liga, meter el código y tus credenciales, y que detecte al farolillo rojo solo cada jornada.',
    html: `
      <p style="${P}">Si tu liga juega en Biwenger, puedes conectarla a Castigos Fantasy para que detecte solo quién queda último cada jornada y lleve el bote y los castigos sin que apuntes nada a mano. Sigues jugando tu liga en Biwenger exactamente igual: esto se conecta por encima, no lo sustituye. Así se hace, paso a paso.</p>

      <h3 style="${H3}">1. Crea tu liga y elige el tipo Biwenger</h3>
      <p style="${P}">Entra en <strong>Mis Ligas</strong> y crea una liga nueva. Al crearla, en el tipo de liga elige <strong>Biwenger</strong> (en lugar de Fantasy manual o Comunio). Con esto le dices a la app que tu clasificación viene de Biwenger.</p>

      <h3 style="${H3}">2. Copia el código de tu liga de Biwenger</h3>
      <p style="${P}">Abre tu liga en Biwenger y copia el <strong>código que la identifica</strong>, el que aparece en el enlace de tu liga (tiene una pinta parecida a <span class="hl">cwRzHsqCc6nx</span>). Ese código es el que usa Castigos Fantasy para saber de qué liga tiene que leer la clasificación.</p>

      <h3 style="${H3}">3. Pega el código y tus credenciales en Ajustes</h3>
      <p style="${P}">Entra en <strong>Opciones de la liga</strong> en Castigos Fantasy. Con Biwenger seleccionado como tipo de sincronización, pega el código de liga y añade el <strong>correo y la contraseña</strong> con los que entras a Biwenger. La app los necesita para poder leer la clasificación de tu liga; se guardan de forma privada y la contraseña no se vuelve a mostrar.</p>

      <h3 style="${H3}">¿Entras a Biwenger con Google, Facebook o Apple?</h3>
      <p style="${P}">Este es el fallo más habitual. Si entras a Biwenger con Google, Facebook o Apple, <strong>no tienes una contraseña propia de Biwenger</strong>, así que el correo y la contraseña de Google no funcionan aquí (verás un error de "credenciales no válidas"). La solución es rápida y solo se hace una vez: abre Biwenger, pulsa <span class="hl">"¿Olvidaste tu contraseña?"</span> con tu correo, créate una contraseña, y usa <strong>ese mismo correo y esa contraseña nueva</strong> en Castigos Fantasy.</p>

      <h3 style="${H3}">4. Guarda y deja que sincronice</h3>
      <p style="${P}">Guarda los ajustes. A partir de ahí, Castigos Fantasy importa sola la clasificación de cada jornada y detecta automáticamente al <strong>farolillo rojo</strong> (el que queda último), actualizando el bote y las deudas. Ya no tienes que revisarlo ni apuntarlo en el grupo.</p>

      <h3 style="${H3}">Que cada miembro vincule su participante</h3>
      <p style="${P}">Para que las estadísticas de cada uno cuadren, cada miembro de la liga debería entrar en Opciones de la liga y vincular su <strong>participante de Biwenger</strong>, eligiendo su nombre de la lista. Así el sistema sabe quién es quién y reparte los castigos a la persona correcta.</p>

      <h3 style="${H3}">¿Y si mi liga no es de Biwenger?</h3>
      <p style="${P}">La sincronización automática está disponible con Biwenger. Si juegas en Comunio, LaLiga Fantasy, Mister u otra, puedes usar Castigos Fantasy igual: la ruleta, el bote y el muro de la vergüenza funcionan lo mismo, solo que confirmas tú quién ha quedado último en un par de toques. Tienes más detalle en la guía de <a href="/guias/biwenger-comunio-laliga-fantasy" class="cf-link" data-nav="guias/biwenger-comunio-laliga-fantasy" style="color:var(--accent);">castigos en Biwenger, Comunio o LaLiga Fantasy</a>.</p>
    `
  },
  {
    id: 'conectar-comunio',
    title: 'Cómo conectar tu liga de Comunio a Castigos Fantasy',
    description: 'Guía paso a paso para sincronizar tu liga de Comunio con Castigos Fantasy: solo tu usuario y contraseña, y la comunidad se detecta sola para llevar el bote y los castigos al farolillo rojo.',
    html: `
      <p style="${P}">Si tu liga juega en Comunio, puedes conectarla a Castigos Fantasy para que lleve el bote y los castigos sin que apuntes nada a mano. Sigues jugando en Comunio exactamente igual: esto se conecta por encima, no lo sustituye. Y lo mejor: tu comunidad <strong>se detecta sola</strong>, no necesitas buscar ningún código.</p>

      <h3 style="${H3}">1. Crea tu liga y elige el tipo Comunio</h3>
      <p style="${P}">Entra en <strong>Mis Ligas</strong> y crea una liga nueva. Al crearla, elige el tipo <strong>Comunio</strong> (en lugar de Fantasy manual o Biwenger).</p>

      <h3 style="${H3}">2. Pon tu usuario y contraseña de Comunio</h3>
      <p style="${P}">Entra en <strong>Opciones de la liga</strong> y, con Comunio seleccionado, escribe el <strong>usuario</strong> con el que entras a Comunio (ojo: <span class="hl">el usuario, no el correo</span>) y tu contraseña. Se guardan de forma privada y la contraseña no se vuelve a mostrar.</p>

      <h3 style="${H3}">3. Guarda y listo</h3>
      <p style="${P}">Al sincronizar, Castigos Fantasy <strong>detecta tu comunidad automáticamente</strong> e importa la clasificación de la jornada, detectando al <strong>farolillo rojo</strong> y llevando el bote. No tienes que meter ningún ID de comunidad (solo hace falta si juegas en varias comunidades a la vez y quieres elegir una).</p>

      <h3 style="${H3}">¿Entras a Comunio con Google, Facebook o Apple?</h3>
      <p style="${P}">Es el fallo más habitual. Si entras a Comunio con Google, Facebook o Apple, <strong>no tienes una contraseña propia de Comunio</strong>, así que fallará al conectar. Se arregla rápido y una sola vez: en Comunio, pulsa <span class="hl">"¿Olvidaste tu contraseña?"</span> con tu correo, créate una contraseña, y usa aquí tu <strong>usuario y esa contraseña nueva</strong>.</p>

      <h3 style="${H3}">Nota sobre las puntuaciones</h3>
      <p style="${P}">La clasificación solo tiene puntos una vez ha empezado la temporada. En pretemporada, la comunidad y los miembros se detectan igual, pero el ranking estará vacío hasta que se jueguen jornadas.</p>
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

// Categorías del hub de guías (orden en el que se muestran).
export const CATEGORIES = [
  { id: 'castigos', label: 'Castigos y tu liga' },
  { id: 'bote', label: 'El bote común' },
  { id: 'estrategia', label: 'Estrategia fantasy' },
  { id: 'basicos', label: 'Primeros pasos' }
];

// A qué categoría pertenece cada guía.
export const GUIDE_CATEGORY = {
  'ideas-de-castigos': 'castigos',
  'catalogo-de-castigos': 'castigos',
  'castigos-sin-dinero': 'castigos',
  'reglas-para-liga-de-castigos': 'castigos',
  'farolillo-rojo-biwenger': 'castigos',
  'mantener-viva-la-liga': 'castigos',
  'gestionar-el-bote': 'bote',
  'repartir-el-bote-final-temporada': 'bote',
  'como-elegir-capitan': 'estrategia',
  'encontrar-chollos': 'estrategia',
  'clausulas-de-rescision': 'estrategia',
  'mercado-de-fichajes-fantasy': 'estrategia',
  'errores-manager-novato': 'estrategia',
  'como-remontar-clasificacion': 'estrategia',
  'biwenger-comunio-laliga-fantasy': 'basicos',
  'conectar-biwenger': 'basicos',
  'conectar-comunio': 'basicos',
  'glosario-fantasy': 'basicos'
};

// Texto normalizado (minúsculas, sin acentos ni comillas) para el buscador.
function normalizeSearch(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/"/g, '');
}

export function guideCardHtml(g) {
  const search = normalizeSearch(`${g.title} ${g.description}`);
  return `
    <a href="/guias/${g.id}" class="cf-guide-card cf-link" data-nav="guias/${g.id}" data-search="${search}" style="display:block;text-decoration:none;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem 1.35rem;transition:transform 0.15s ease,border-color 0.15s ease;">
      <h2 style="font-family:var(--font-display);font-weight:800;font-size:1.15rem;text-transform:uppercase;line-height:1.15;margin:0 0 0.4rem;color:var(--text-light);">${g.title}</h2>
      <p style="margin:0 0 0.6rem;font-size:0.9rem;line-height:1.55;color:var(--text-muted);">${g.description}</p>
      <span style="font-family:var(--font-display);font-weight:800;font-size:0.85rem;text-transform:uppercase;color:var(--accent);">Leer guía →</span>
    </a>`;
}

function renderHub(container) {
  const groups = CATEGORIES.map(cat => {
    const items = GUIDES.filter(g => GUIDE_CATEGORY[g.id] === cat.id);
    if (!items.length) return '';
    return `
      <section class="cf-guide-group" data-cat="${cat.id}" style="margin-bottom:2rem;">
        <h2 class="cf-guide-cat" style="font-family:var(--font-display);font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:1px;color:var(--accent);border-bottom:1px solid var(--border-color);padding-bottom:0.4rem;margin:0 0 1rem;">${cat.label}</h2>
        <div class="cf-guides-grid" style="display:grid;grid-template-columns:1fr;gap:1rem;">
          ${items.map(guideCardHtml).join('')}
        </div>
      </section>`;
  }).join('');

  container.innerHTML = `
    <div class="content-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="content-back" data-nav="inicio" class="cf-link" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        ${BACK_ARROW} Volver al inicio
      </a>

      <h1 style="font-family:var(--font-display);font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.4rem;">Guías de Castigos Fantasy</h1>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem;line-height:1.6;">Ideas de castigos, capitanías, chollos, cláusulas, errores de novato y cómo llevar el bote de tu liga. Guías prácticas para dominar tu liga fantasy de Biwenger, Comunio o LaLiga Fantasy y mantener a tus amigos enganchados hasta la última jornada.</p>

      <input id="cf-guide-search" type="search" placeholder="Busca tu duda: capitán, bote, chollos, cláusula..." autocomplete="off" aria-label="Buscar en las guías" style="width:100%;box-sizing:border-box;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:10px;padding:0.8rem 1rem;color:var(--text-light);font-family:var(--font-sans);font-size:0.95rem;margin-bottom:1.75rem;" />

      <div id="cf-guides-groups">
        ${groups}
      </div>

      <p id="cf-no-results" style="display:none;color:var(--text-muted);text-align:center;padding:1.5rem 0;line-height:1.6;">No hemos encontrado ninguna guía con eso. Prueba con otra palabra o <a href="/contacto" class="cf-link" data-nav="contacto" style="color:var(--accent);">escríbenos tu duda</a>.</p>

      ${CTA_BLOCK}
    </div>
  `;

  // Buscador: filtro en cliente, insensible a acentos y mayúsculas. Oculta las
  // tarjetas que no coinciden y las categorías que se quedan vacías.
  const input = container.querySelector('#cf-guide-search');
  const noRes = container.querySelector('#cf-no-results');
  const cards = Array.from(container.querySelectorAll('.cf-guide-card'));
  const groupEls = Array.from(container.querySelectorAll('.cf-guide-group'));
  input?.addEventListener('input', () => {
    const q = normalizeSearch(input.value.trim());
    let visible = 0;
    cards.forEach(c => {
      const match = !q || (c.dataset.search || '').includes(q);
      c.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    groupEls.forEach(g => {
      const anyVisible = Array.from(g.querySelectorAll('.cf-guide-card')).some(c => c.style.display !== 'none');
      g.style.display = anyVisible ? '' : 'none';
    });
    if (noRes) noRes.style.display = visible ? 'none' : 'block';
  });
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
