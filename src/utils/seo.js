/**
 * Utilidad de SEO Dinámico para CastigosFantasy
 * Actualiza el Título, Meta Descripción y OpenGraph en tiempo real al navegar.
 */

const seoMap = {
  'inicio': {
    title: 'Gestor de Castigos y Ligas Fantasy | CastigosFantasy',
    description: 'Organiza tu liga Biwenger o Fantasy, gestiona botes de dinero y aplica castigos aleatorios con la ruleta de morosos. Disfruta con tus amigos.'
  },
  'acceso': {
    title: 'Iniciar Sesión | CastigosFantasy',
    description: 'Inicia sesión o regístrate en CastigosFantasy para empezar a gestionar tu liga, botes y castigos de forma gratuita.'
  },
  'mis-ligas': {
    title: 'Mis Ligas | CastigosFantasy',
    description: 'Accede a tus ligas fantasy guardadas, o crea una nueva para invitar a tus amigos y empezar a registrar las jornadas.'
  },
  'menu-liga': {
    title: 'Dashboard de la Liga | CastigosFantasy',
    description: 'Vista principal de tu liga. Revisa el tablón, las deudas acumuladas de la jornada y los castigos pendientes.'
  },
  'muro': {
    title: 'Muro de la Liga | CastigosFantasy',
    description: 'Revisa el progreso de tu liga, las deudas acumuladas y toda la actividad reciente de los miembros.'
  },
  'herramientas': {
    title: 'Sala VAR - Herramientas | CastigosFantasy',
    description: 'Elige tu castigo o utiliza herramientas generadoras para dar salseo a tu liga fantasy.'
  },
  'ruleta': {
    title: 'Ruleta Aleatoria de Castigos Fantasy | CastigosFantasy',
    description: 'Gira la ruleta del VAR para decidir los castigos de los perdedores de tu liga. Una forma aleatoria y justa de aplicar penitencias a los últimos.'
  },
  'retos': {
    title: 'Retos Semanales para Ligas Fantasy | CastigosFantasy',
    description: 'Propón y vota retos semanales para dar vida a cada jornada de tu liga. Mantén a todos los managers picados hasta la última jornada.'
  },
  'juegos': {
    title: 'Juegos Fantasy | CastigosFantasy',
    description: 'Juega a adivinar jugadores y ponte a prueba contra el resto de managers de tu liga fantasy.'
  },
  'adivina-jugador': {
    title: 'Adivina el Jugador | CastigosFantasy',
    description: 'Minijuego diario: Adivina el jugador misterioso con menos intentos posibles. Demuestra quién sabe más de fútbol en tu liga.'
  },
  'top-10': {
    title: 'Top 10 Morosos | CastigosFantasy',
    description: 'Descubre quiénes son los peores managers de la plataforma. El muro de la vergüenza de CastigosFantasy.'
  },
  'jugadores': {
    title: 'Buscador de Jugadores | CastigosFantasy',
    description: 'Consulta los valores de mercado y estadísticas de todos los jugadores de las principales ligas.'
  },
  'bufon': {
    title: 'El Bufón - Votaciones | CastigosFantasy',
    description: 'Vota al jugador más decepcionante de la jornada. El perdedor de la jornada tendrá su castigo asegurado.'
  },
  'generador': {
    title: 'Generador de Castigos | CastigosFantasy',
    description: 'Genera ideas de castigos graciosos y pesados para el perdedor de tu liga fantasy.'
  },
  'comunidad': {
    title: 'Comunidad de Mánagers Fantasy | CastigosFantasy',
    description: 'Comparte tácticas, lloros y chollos en el foro global de CastigosFantasy. Únete a la comunidad más tóxica (pero sana) de mánagers.'
  },
  'foro': {
    title: 'Foro de Debate | CastigosFantasy',
    description: 'Debate con otros mánagers, llora por tus lesiones o chulea de tus clausulazos en el foro de CastigosFantasy.'
  }
};

export function setSEO(view) {
  const seoData = seoMap[view] || seoMap['inicio'];

  // Update Title
  document.title = seoData.title;

  // Update Meta Description
  const metaDesc = document.querySelector('#seo-description');
  if (metaDesc) {
    metaDesc.setAttribute('content', seoData.description);
  }

  // Update OpenGraph Title
  const ogTitle = document.querySelector('#og-title');
  if (ogTitle) {
    ogTitle.setAttribute('content', seoData.title);
  }

  // Update OpenGraph Description
  const ogDesc = document.querySelector('#og-description');
  if (ogDesc) {
    ogDesc.setAttribute('content', seoData.description);
  }

  // Update Canonical URL
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  const cleanPath = view === 'inicio' ? '' : view;
  canonicalTag.setAttribute('href', `https://castigosfantasy.com/${cleanPath}`);
}
