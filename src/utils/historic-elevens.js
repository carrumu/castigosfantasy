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
  }
];
