/**
 * Onces históricos para el juego "El Once del Día".
 *
 * Cada entrada es un equipo-hito con su formación y su 11 titular por posición.
 * Los datos son FACTUALES: hay que verificarlos. Este núcleo inicial son onces
 * muy documentados (finales o temporadas icónicas). Se irá ampliando en tandas,
 * cada equipo con su fuente, hasta ~30.
 *
 * FORMATIONS: coordenadas en % del campo. x = izquierda(0)→derecha(100).
 * y = arriba(0, ataque) → abajo(100, portería). El orden de los slots de cada
 * formación DEBE coincidir con el orden del array `players` de cada equipo.
 */

export const FORMATIONS = {
  '4-2-3-1': [
    { pos: 'GK', x: 50, y: 91 },
    { pos: 'RB', x: 86, y: 71 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 14, y: 71 },
    { pos: 'MC', x: 38, y: 52 }, { pos: 'MC', x: 62, y: 52 },
    { pos: 'ED', x: 84, y: 31 }, { pos: 'MP', x: 50, y: 34 }, { pos: 'EI', x: 16, y: 31 },
    { pos: 'DC', x: 50, y: 13 }
  ],
  '4-3-3': [
    { pos: 'GK', x: 50, y: 91 },
    { pos: 'RB', x: 86, y: 71 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 14, y: 71 },
    { pos: 'MC', x: 74, y: 50 }, { pos: 'MCD', x: 50, y: 58 }, { pos: 'MC', x: 26, y: 50 },
    { pos: 'ED', x: 82, y: 27 }, { pos: 'DC', x: 50, y: 15 }, { pos: 'EI', x: 18, y: 27 }
  ],
  '4-4-2': [
    { pos: 'GK', x: 50, y: 91 },
    { pos: 'RB', x: 86, y: 71 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 14, y: 71 },
    { pos: 'MD', x: 86, y: 47 }, { pos: 'MC', x: 62, y: 50 }, { pos: 'MC', x: 38, y: 50 }, { pos: 'MI', x: 14, y: 47 },
    { pos: 'DC', x: 62, y: 15 }, { pos: 'DC', x: 38, y: 15 }
  ]
};

// Helper corto para escribir jugadores: p(nombreCompleto, etiquetaCorta, ...clavesBusqueda)
const p = (name, short, ...keys) => ({ name, short, keys: [name.toLowerCase(), short.toLowerCase(), ...keys] });

export const HISTORIC_ELEVENS = [
  {
    id: 'real-madrid-100-puntos',
    team: 'Real Madrid',
    season: '2011-12',
    milestone: 'Los 100 puntos de Mourinho',
    formation: '4-2-3-1',
    source: 'La Liga 2011-12, once tipo',
    players: [
      p('Iker Casillas', 'Casillas', 'iker'),
      p('Álvaro Arbeloa', 'Arbeloa'),
      p('Pepe', 'Pepe'),
      p('Sergio Ramos', 'Ramos', 'sergio ramos'),
      p('Marcelo', 'Marcelo'),
      p('Xabi Alonso', 'X. Alonso', 'xabi', 'alonso'),
      p('Sami Khedira', 'Khedira'),
      p('Ángel Di María', 'Di María', 'di maria', 'dimaria'),
      p('Mesut Özil', 'Özil', 'ozil'),
      p('Cristiano Ronaldo', 'Cristiano', 'ronaldo', 'cr7'),
      p('Karim Benzema', 'Benzema')
    ]
  },
  {
    id: 'barcelona-wembley-2011',
    team: 'FC Barcelona',
    season: '2010-11',
    milestone: 'La final de Wembley (Champions)',
    formation: '4-3-3',
    source: 'Final Champions 2011 (Wembley), once inicial',
    players: [
      p('Víctor Valdés', 'Valdés', 'valdes'),
      p('Dani Alves', 'Alves', 'dani alves'),
      p('Gerard Piqué', 'Piqué', 'pique'),
      p('Javier Mascherano', 'Mascherano', 'masche'),
      p('Éric Abidal', 'Abidal'),
      p('Xavi Hernández', 'Xavi', 'xavi hernandez'),
      p('Sergio Busquets', 'Busquets', 'busi'),
      p('Andrés Iniesta', 'Iniesta'),
      p('Pedro', 'Pedro', 'pedrito'),
      p('Lionel Messi', 'Messi', 'leo messi'),
      p('David Villa', 'Villa', 'guaje')
    ]
  },
  {
    id: 'atletico-liga-2014',
    team: 'Atlético de Madrid',
    season: '2013-14',
    milestone: 'La Liga de Simeone',
    formation: '4-4-2',
    source: 'La Liga 2013-14, once tipo',
    players: [
      p('Thibaut Courtois', 'Courtois'),
      p('Juanfran', 'Juanfran'),
      p('Miranda', 'Miranda'),
      p('Diego Godín', 'Godín', 'godin'),
      p('Filipe Luís', 'Filipe', 'filipe luis'),
      p('Raúl García', 'R. García', 'raul garcia'),
      p('Gabi', 'Gabi'),
      p('Tiago', 'Tiago'),
      p('Koke', 'Koke'),
      p('Diego Costa', 'D. Costa', 'costa'),
      p('David Villa', 'Villa', 'guaje')
    ]
  },
  {
    id: 'real-madrid-decima-2014',
    team: 'Real Madrid',
    season: '2013-14',
    milestone: 'La Décima (final de Lisboa)',
    formation: '4-3-3',
    source: 'Final Champions 2014 (Lisboa), once inicial',
    players: [
      p('Iker Casillas', 'Casillas', 'iker'),
      p('Dani Carvajal', 'Carvajal'),
      p('Raphaël Varane', 'Varane'),
      p('Sergio Ramos', 'Ramos', 'sergio ramos'),
      p('Fábio Coentrão', 'Coentrão', 'coentrao'),
      p('Luka Modrić', 'Modrić', 'modric'),
      p('Xabi Alonso', 'X. Alonso', 'xabi', 'alonso'),
      p('Ángel Di María', 'Di María', 'di maria', 'dimaria'),
      p('Gareth Bale', 'Bale'),
      p('Karim Benzema', 'Benzema'),
      p('Cristiano Ronaldo', 'Cristiano', 'ronaldo', 'cr7')
    ]
  },
  {
    id: 'leicester-2016',
    team: 'Leicester City',
    season: '2015-16',
    milestone: 'La Premier del milagro',
    formation: '4-4-2',
    source: 'Premier League 2015-16, once tipo',
    players: [
      p('Kasper Schmeichel', 'Schmeichel'),
      p('Danny Simpson', 'Simpson'),
      p('Wes Morgan', 'Morgan'),
      p('Robert Huth', 'Huth'),
      p('Christian Fuchs', 'Fuchs'),
      p('Riyad Mahrez', 'Mahrez'),
      p('Danny Drinkwater', 'Drinkwater'),
      p("N'Golo Kanté", 'Kanté', 'kante'),
      p('Marc Albrighton', 'Albrighton'),
      p('Jamie Vardy', 'Vardy'),
      p('Shinji Okazaki', 'Okazaki')
    ]
  },
  {
    id: 'atletico-europa-league-2012',
    team: 'Atlético de Madrid',
    season: '2011-12',
    milestone: 'La Europa League de Falcao',
    formation: '4-4-2',
    source: 'Final Europa League 2012 (Bucarest) — VERIFICAR',
    players: [
      p('Thibaut Courtois', 'Courtois'),
      p('Juanfran', 'Juanfran'),
      p('Miranda', 'Miranda'),
      p('Álvaro Domínguez', 'Á. Domínguez', 'alvaro dominguez', 'dominguez'),
      p('Filipe Luís', 'Filipe', 'filipe luis'),
      p('Arda Turan', 'Turan', 'arda'),
      p('Gabi', 'Gabi'),
      p('Mario Suárez', 'M. Suárez', 'mario suarez'),
      p('Koke', 'Koke'),
      p('Radamel Falcao', 'Falcao', 'el tigre', 'radamel'),
      p('Adrián López', 'Adrián', 'adrian lopez')
    ]
  },
  {
    id: 'barcelona-msn-2015',
    team: 'FC Barcelona',
    season: '2014-15',
    milestone: 'El triplete de la MSN',
    formation: '4-3-3',
    source: 'Final Champions 2015 (Berlín), once inicial',
    players: [
      p('Marc-André ter Stegen', 'Ter Stegen', 'ter stegen', 'stegen'),
      p('Dani Alves', 'Alves', 'dani alves'),
      p('Gerard Piqué', 'Piqué', 'pique'),
      p('Javier Mascherano', 'Mascherano', 'masche'),
      p('Jordi Alba', 'Alba', 'jordi alba'),
      p('Ivan Rakitić', 'Rakitić', 'rakitic'),
      p('Sergio Busquets', 'Busquets', 'busi'),
      p('Andrés Iniesta', 'Iniesta'),
      p('Lionel Messi', 'Messi', 'leo messi'),
      p('Luis Suárez', 'L. Suárez', 'luis suarez', 'suarez'),
      p('Neymar', 'Neymar', 'ney')
    ]
  },
  {
    id: 'barcelona-sextete-2009',
    team: 'FC Barcelona',
    season: '2008-09',
    milestone: 'El sextete de Guardiola',
    formation: '4-3-3',
    source: 'Final Champions 2009 (Roma), once inicial',
    players: [
      p('Víctor Valdés', 'Valdés', 'valdes'),
      p('Carles Puyol', 'Puyol'),
      p('Yaya Touré', 'Touré', 'yaya', 'yaya toure'),
      p('Gerard Piqué', 'Piqué', 'pique'),
      p('Sylvinho', 'Sylvinho'),
      p('Xavi Hernández', 'Xavi'),
      p('Sergio Busquets', 'Busquets', 'busi'),
      p('Andrés Iniesta', 'Iniesta'),
      p('Lionel Messi', 'Messi'),
      p("Samuel Eto'o", "Eto'o", 'etoo', 'samuel etoo'),
      p('Thierry Henry', 'Henry')
    ]
  },
  {
    id: 'barcelona-ronaldinho-2006',
    team: 'FC Barcelona',
    season: '2005-06',
    milestone: 'El Barça de Ronaldinho (París)',
    formation: '4-3-3',
    source: 'Final Champions 2006 (París), once inicial',
    players: [
      p('Víctor Valdés', 'Valdés', 'valdes'),
      p('Oleguer', 'Oleguer'),
      p('Carles Puyol', 'Puyol'),
      p('Rafael Márquez', 'Márquez', 'marquez'),
      p('Giovanni van Bronckhorst', 'Van Bronckhorst', 'bronckhorst', 'gio'),
      p('Deco', 'Deco'),
      p('Edmílson', 'Edmílson', 'edmilson'),
      p('Mark van Bommel', 'Van Bommel', 'bommel'),
      p('Ludovic Giuly', 'Giuly'),
      p("Samuel Eto'o", "Eto'o", 'etoo'),
      p('Ronaldinho', 'Ronaldinho', 'ronnie', 'dinho')
    ]
  },
  {
    id: 'espana-mundial-2010',
    team: 'España',
    season: '2010',
    milestone: 'Campeones del Mundo',
    formation: '4-2-3-1',
    source: 'Final del Mundial 2010 (Johannesburgo), once inicial',
    players: [
      p('Iker Casillas', 'Casillas', 'iker'),
      p('Sergio Ramos', 'Ramos', 'sergio ramos'),
      p('Gerard Piqué', 'Piqué', 'pique'),
      p('Carles Puyol', 'Puyol'),
      p('Joan Capdevila', 'Capdevila'),
      p('Xabi Alonso', 'X. Alonso', 'xabi'),
      p('Sergio Busquets', 'Busquets', 'busi'),
      p('Pedro', 'Pedro', 'pedrito'),
      p('Xavi Hernández', 'Xavi'),
      p('Andrés Iniesta', 'Iniesta'),
      p('David Villa', 'Villa', 'guaje')
    ]
  },
  {
    id: 'real-madrid-duodecima-2017',
    team: 'Real Madrid',
    season: '2016-17',
    milestone: 'El BBC y la Duodécima',
    formation: '4-3-3',
    source: 'La Liga / Champions 2016-17, once tipo',
    players: [
      p('Keylor Navas', 'Navas', 'keylor'),
      p('Dani Carvajal', 'Carvajal'),
      p('Raphaël Varane', 'Varane'),
      p('Sergio Ramos', 'Ramos', 'sergio ramos'),
      p('Marcelo', 'Marcelo'),
      p('Luka Modrić', 'Modrić', 'modric'),
      p('Casemiro', 'Casemiro', 'case'),
      p('Toni Kroos', 'Kroos'),
      p('Gareth Bale', 'Bale'),
      p('Karim Benzema', 'Benzema'),
      p('Cristiano Ronaldo', 'Cristiano', 'ronaldo', 'cr7')
    ]
  }
];
