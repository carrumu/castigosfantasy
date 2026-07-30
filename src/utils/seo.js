/**
 * Utilidad de SEO Dinámico para CastigosFantasy
 * Actualiza el Título, Meta Descripción y OpenGraph en tiempo real al navegar.
 */

const seoMap = {
  'inicio': {
    title: 'Gestor de Castigos y Ligas Fantasy | CastigosFantasy',
    description: 'Organiza tu liga de Biwenger, Comunio o LaLiga Fantasy, gestiona el bote y aplica castigos aleatorios con la ruleta de morosos. Disfruta con tus amigos.',
    schemaType: 'WebApplication'
  },
  'acceso': {
    title: 'Iniciar Sesión | CastigosFantasy',
    description: 'Inicia sesión o regístrate en CastigosFantasy para empezar a gestionar tu liga, botes y castigos de forma gratuita.',
    schemaType: 'WebPage'
  },
  'mis-ligas': {
    title: 'Mis Ligas | CastigosFantasy',
    description: 'Accede a tus ligas fantasy guardadas, o crea una nueva para invitar a tus amigos y empezar a registrar las jornadas.',
    schemaType: 'WebApplication'
  },
  'menu-liga': {
    title: 'Dashboard de la Liga | CastigosFantasy',
    description: 'Vista principal de tu liga. Revisa el tablón, las deudas acumuladas de la jornada y los castigos pendientes.',
    schemaType: 'WebApplication'
  },
  'muro': {
    title: 'Muro de la Liga | CastigosFantasy',
    description: 'Revisa el progreso de tu liga, las deudas acumuladas y toda la actividad reciente de los miembros.',
    schemaType: 'CollectionPage'
  },
  'herramientas': {
    title: 'Sala VAR - Herramientas | CastigosFantasy',
    description: 'Elige tu castigo o utiliza herramientas generadoras para dar salseo a tu liga fantasy.',
    schemaType: 'WebPage'
  },
  'ruleta': {
    title: 'Ruleta Aleatoria de Castigos Fantasy | CastigosFantasy',
    description: 'Gira la ruleta del VAR para decidir los castigos de los perdedores de tu liga. Una forma aleatoria y justa de aplicar penitencias a los últimos.',
    schemaType: 'SoftwareApplication'
  },
  'retos': {
    title: 'Retos Semanales para Ligas Fantasy | CastigosFantasy',
    description: 'Propón y vota retos semanales para dar vida a cada jornada de tu liga. Mantén a todos los managers picados hasta la última jornada.',
    schemaType: 'CollectionPage'
  },
  'juegos': {
    title: 'Juegos Fantasy | CastigosFantasy',
    description: 'Juega a adivinar jugadores y ponte a prueba contra el resto de managers de tu liga fantasy.',
    schemaType: 'CollectionPage'
  },
  'adivina-jugador': {
    title: 'Adivina el Jugador | CastigosFantasy',
    description: 'Minijuego diario: Adivina el jugador misterioso con menos intentos posibles. Demuestra quién sabe más de fútbol en tu liga.',
    schemaType: 'VideoGame'
  },
  'top-10': {
    title: 'Top 10 Morosos | CastigosFantasy',
    description: 'Descubre quiénes son los peores managers de la plataforma. El muro de la vergüenza de CastigosFantasy.',
    schemaType: 'CollectionPage'
  },
  'duelo': {
    title: 'El Duelo - Más o Menos | CastigosFantasy',
    description: 'Dos leyendas, un ranking. Adivina quién tiene más goles, partidos o títulos y encadena la racha más larga de tu liga.',
    schemaType: 'VideoGame'
  },
  'jugadores': {
    title: 'Buscador de Jugadores | CastigosFantasy',
    description: 'Consulta los valores de mercado y estadísticas de todos los jugadores de las principales ligas.',
    schemaType: 'CollectionPage'
  },
  'bufon': {
    title: 'El Bufón - Votaciones | CastigosFantasy',
    description: 'Vota al jugador más decepcionante de la jornada. El perdedor de la jornada tendrá su castigo asegurado.',
    schemaType: 'WebPage'
  },
  'generador': {
    title: 'Generador de Castigos | CastigosFantasy',
    description: 'Genera ideas de castigos graciosos y pesados para el perdedor de tu liga fantasy.',
    schemaType: 'SoftwareApplication'
  },
  'comunidad': {
    title: 'Comunidad de Mánagers Fantasy | CastigosFantasy',
    description: 'Comparte tácticas, lloros y chollos en el foro global de CastigosFantasy. Únete a la comunidad más tóxica (pero sana) de mánagers.',
    schemaType: 'CollectionPage'
  },
  'foro': {
    title: 'Foro de Debate | CastigosFantasy',
    description: 'Debate con otros mánagers, llora por tus lesiones o chulea de tus clausulazos en el foro de CastigosFantasy.',
    schemaType: 'DiscussionForumPosting'
  },
  'muro-verguenza': {
    title: 'Muro de la Vergüenza | CastigosFantasy',
    description: 'El registro público de castigos aceptados y rechazados de tu liga. Nadie escapa al Muro de la Vergüenza.',
    schemaType: 'CollectionPage'
  },
  'sobre-nosotros': {
    title: 'Sobre nosotros | CastigosFantasy',
    description: 'Somos unos chavales de Sevilla que creamos Castigos Fantasy en 2026 para mejorar la comunidad fantasy: castigos, bote y piques para tu liga de Biwenger, Comunio o LaLiga Fantasy.',
    schemaType: 'AboutPage'
  },
  'contacto': {
    title: 'Contacto | CastigosFantasy',
    description: 'Contacta con el equipo de Castigos Fantasy en soporte@castigosfantasy.com para soporte, sugerencias o cualquier duda sobre tu liga.',
    schemaType: 'ContactPage'
  },
  'guias': {
    // Barra final: es la URL que sirve el HTML prerenderizado (ver prerender.mjs).
    path: 'guias/',
    title: 'Guías Fantasy: castigos, capitanías, chollos y cláusulas | CastigosFantasy',
    description: 'Guías prácticas para tu liga fantasy: ideas de castigos, cómo elegir capitán, encontrar chollos, usar cláusulas, errores de novato y cómo gestionar el bote en Biwenger, Comunio y LaLiga Fantasy.',
    schemaType: 'Article'
  }
};

export function setSEO(view, overrides = null) {
  // `overrides` permite SEO por página dentro de una misma vista (p.ej. cada
  // artículo de /guias/<slug>): { title, description, path, schemaType }.
  const base = seoMap[view] || seoMap['inicio'];
  const seoData = overrides ? { ...base, ...overrides } : base;

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
  const cleanPath = seoData.path !== undefined ? seoData.path : (view === 'inicio' ? '' : view);
  canonicalTag.setAttribute('href', `https://castigosfantasy.com/${cleanPath}`);

  // Dynamic JSON-LD (SEO/AEO)
  const scriptTag = document.querySelector('#seo-json-ld');
  if (scriptTag) {
    try {
      const jsonData = JSON.parse(scriptTag.textContent);
      // Actualizamos el objeto que representa la aplicación o página dentro de @graph
      const webAppGraph = jsonData['@graph']?.find(g =>
        g['@type'] === 'WebApplication' ||
        g['@type'] === 'WebPage' ||
        g['@type'] === 'SoftwareApplication' ||
        g['@type'] === 'CollectionPage' ||
        g['@type'] === 'VideoGame' ||
        g['@type'] === 'DiscussionForumPosting' ||
        g['@type'] === 'AboutPage' ||
        g['@type'] === 'ContactPage' ||
        g['@type'] === 'Article'
      );
      if (webAppGraph) {
        webAppGraph.name = seoData.title;
        webAppGraph.description = seoData.description;
        webAppGraph.url = `https://castigosfantasy.com/${cleanPath}`;
        if (seoData.schemaType) {
          webAppGraph['@type'] = seoData.schemaType;
        }
      }
      scriptTag.textContent = JSON.stringify(jsonData, null, 2);
    } catch (err) {
      console.warn('Error parsing or updating JSON-LD:', err);
    }
  }
}
