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
  ],
  // Orden de slots: GK, CB, CB, CB, carrilero der., MC, MC, carrilero izq., MP, DC, DC
  '3-5-2': [
    { pos: 'GK', x: 50, y: 91 },
    { pos: 'CB', x: 68, y: 76 }, { pos: 'CB', x: 50, y: 79 }, { pos: 'CB', x: 32, y: 76 },
    { pos: 'CAR', x: 88, y: 55 }, { pos: 'MC', x: 62, y: 52 }, { pos: 'MC', x: 38, y: 52 }, { pos: 'CAR', x: 12, y: 55 },
    { pos: 'MP', x: 50, y: 33 },
    { pos: 'DC', x: 62, y: 14 }, { pos: 'DC', x: 38, y: 14 }
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
  },
  {
    id: 'real-madrid-novena-2002',
    team: 'Real Madrid',
    season: '2001-02',
    milestone: 'La Novena (Glasgow, volea de Zidane)',
    formation: '4-4-2',
    source: 'Final Champions 2002 (Glasgow), once inicial',
    players: [
      p('César Sánchez', 'César', 'cesar sanchez', 'cesar'),
      p('Míchel Salgado', 'Salgado'),
      p('Fernando Hierro', 'Hierro'),
      p('Iván Helguera', 'Helguera'),
      p('Roberto Carlos', 'R. Carlos', 'roberto carlos'),
      p('Luís Figo', 'Figo'),
      p('Claude Makélélé', 'Makélélé', 'makelele'),
      p('Zinedine Zidane', 'Zidane', 'zizou'),
      p('Steve McManaman', 'McManaman', 'macca'),
      p('Raúl', 'Raúl', 'raul'),
      p('Fernando Morientes', 'Morientes', 'moro')
    ]
  },
  {
    id: 'liverpool-champions-2019',
    team: 'Liverpool',
    season: '2018-19',
    milestone: 'La Champions de Madrid',
    formation: '4-3-3',
    source: 'Final Champions 2019 (Madrid), once inicial',
    players: [
      p('Alisson', 'Alisson', 'alisson becker'),
      p('Trent Alexander-Arnold', 'Alexander-Arnold', 'trent', 'taa'),
      p('Joël Matip', 'Matip'),
      p('Virgil van Dijk', 'Van Dijk', 'vvd', 'virgil'),
      p('Andrew Robertson', 'Robertson', 'robbo'),
      p('Jordan Henderson', 'Henderson', 'hendo'),
      p('Fabinho', 'Fabinho'),
      p('Georginio Wijnaldum', 'Wijnaldum', 'gini'),
      p('Mohamed Salah', 'Salah', 'mo salah'),
      p('Roberto Firmino', 'Firmino', 'bobby'),
      p('Sadio Mané', 'Mané', 'mane')
    ]
  },
  {
    id: 'bayern-triplete-2020',
    team: 'Bayern de Múnich',
    season: '2019-20',
    milestone: 'El triplete de Flick',
    formation: '4-2-3-1',
    source: 'Final Champions 2020 (Lisboa), once inicial',
    players: [
      p('Manuel Neuer', 'Neuer'),
      p('Joshua Kimmich', 'Kimmich'),
      p('Jérôme Boateng', 'Boateng'),
      p('David Alaba', 'Alaba'),
      p('Alphonso Davies', 'Davies'),
      p('Thiago Alcántara', 'Thiago', 'thiago alcantara'),
      p('Leon Goretzka', 'Goretzka'),
      p('Serge Gnabry', 'Gnabry'),
      p('Thomas Müller', 'Müller', 'muller'),
      p('Kingsley Coman', 'Coman'),
      p('Robert Lewandowski', 'Lewandowski', 'lewy')
    ]
  },
  {
    id: 'inter-triplete-2010',
    team: 'Inter de Milán',
    season: '2009-10',
    milestone: 'El triplete de Mourinho',
    formation: '4-2-3-1',
    source: 'Final Champions 2010 (Madrid), once inicial',
    players: [
      p('Júlio César', 'Júlio César', 'julio cesar'),
      p('Maicon', 'Maicon'),
      p('Lúcio', 'Lúcio', 'lucio'),
      p('Walter Samuel', 'Samuel', 'walter samuel'),
      p('Cristian Chivu', 'Chivu'),
      p('Esteban Cambiasso', 'Cambiasso', 'cuchu'),
      p('Javier Zanetti', 'Zanetti', 'pupi'),
      p("Samuel Eto'o", "Eto'o", 'etoo'),
      p('Wesley Sneijder', 'Sneijder'),
      p('Goran Pandev', 'Pandev'),
      p('Diego Milito', 'Milito', 'el principe')
    ]
  },
  {
    id: 'manchester-united-champions-2008',
    team: 'Manchester United',
    season: '2007-08',
    milestone: 'La Champions de Moscú',
    formation: '4-2-3-1',
    source: 'Final Champions 2008 (Moscú), once inicial',
    players: [
      p('Edwin van der Sar', 'Van der Sar', 'vandersar'),
      p('Wes Brown', 'Brown'),
      p('Rio Ferdinand', 'Ferdinand', 'rio'),
      p('Nemanja Vidić', 'Vidić', 'vidic'),
      p('Patrice Evra', 'Evra'),
      p('Owen Hargreaves', 'Hargreaves'),
      p('Michael Carrick', 'Carrick'),
      p('Cristiano Ronaldo', 'Cristiano', 'ronaldo', 'cr7'),
      p('Paul Scholes', 'Scholes'),
      p('Wayne Rooney', 'Rooney'),
      p('Carlos Tévez', 'Tévez', 'tevez')
    ]
  },
  {
    id: 'espana-eurocopa-2012',
    team: 'España',
    season: '2012',
    milestone: 'Bicampeona de Europa',
    formation: '4-2-3-1',
    source: 'Final de la Eurocopa 2012 (Kiev), once inicial',
    players: [
      p('Iker Casillas', 'Casillas', 'iker'),
      p('Álvaro Arbeloa', 'Arbeloa'),
      p('Gerard Piqué', 'Piqué', 'pique'),
      p('Sergio Ramos', 'Ramos', 'sergio ramos'),
      p('Jordi Alba', 'Alba', 'jordi alba'),
      p('Xabi Alonso', 'X. Alonso', 'xabi'),
      p('Sergio Busquets', 'Busquets', 'busi'),
      p('David Silva', 'Silva', 'david silva'),
      p('Xavi Hernández', 'Xavi'),
      p('Andrés Iniesta', 'Iniesta'),
      p('Cesc Fàbregas', 'Cesc', 'fabregas', 'cesc fabregas')
    ]
  },
  {
    id: 'argentina-mundial-2022',
    team: 'Argentina',
    season: '2022',
    milestone: 'Campeona del Mundo (Messi)',
    formation: '4-3-3',
    source: 'Final del Mundial 2022 (Lusail), once inicial',
    players: [
      p('Emiliano Martínez', 'E. Martínez', 'dibu', 'martinez'),
      p('Nahuel Molina', 'Molina'),
      p('Cristian Romero', 'Romero', 'cuti'),
      p('Nicolás Otamendi', 'Otamendi'),
      p('Nicolás Tagliafico', 'Tagliafico'),
      p('Rodrigo De Paul', 'De Paul', 'depaul'),
      p('Enzo Fernández', 'Enzo', 'enzo fernandez'),
      p('Alexis Mac Allister', 'Mac Allister', 'macallister'),
      p('Lionel Messi', 'Messi', 'leo messi'),
      p('Julián Álvarez', 'J. Álvarez', 'julian alvarez', 'araña'),
      p('Ángel Di María', 'Di María', 'di maria', 'fideo')
    ]
  },
  {
    id: 'brasil-mundial-2002',
    team: 'Brasil',
    season: '2002',
    milestone: 'Pentacampeona (los tres R)',
    formation: '3-5-2',
    source: 'Final del Mundial 2002 (Yokohama), once inicial',
    players: [
      p('Marcos', 'Marcos'),
      p('Lúcio', 'Lúcio', 'lucio'),
      p('Edmílson', 'Edmílson', 'edmilson'),
      p('Roque Júnior', 'Roque Júnior', 'roque junior'),
      p('Cafú', 'Cafú', 'cafu'),
      p('Gilberto Silva', 'Gilberto', 'gilberto silva'),
      p('Kléberson', 'Kléberson', 'kleberson'),
      p('Roberto Carlos', 'R. Carlos', 'roberto carlos'),
      p('Ronaldinho', 'Ronaldinho', 'dinho'),
      p('Ronaldo', 'Ronaldo', 'r9', 'ronaldo nazario'),
      p('Rivaldo', 'Rivaldo')
    ]
  },
  {
    id: 'francia-mundial-1998',
    team: 'Francia',
    season: '1998',
    milestone: 'Campeona del Mundo en casa',
    formation: '4-2-3-1',
    source: 'Final del Mundial 1998 (Saint-Denis); Blanc sancionado, jugó Leboeuf',
    players: [
      p('Fabien Barthez', 'Barthez'),
      p('Lilian Thuram', 'Thuram'),
      p('Frank Leboeuf', 'Leboeuf'),
      p('Marcel Desailly', 'Desailly'),
      p('Bixente Lizarazu', 'Lizarazu'),
      p('Didier Deschamps', 'Deschamps', 'dd'),
      p('Emmanuel Petit', 'Petit'),
      p('Christian Karembeu', 'Karembeu'),
      p('Zinedine Zidane', 'Zidane', 'zizou'),
      p('Youri Djorkaeff', 'Djorkaeff'),
      p('Stéphane Guivarch', 'Guivarch', 'guivarc')
    ]
  },
  {
    id: 'manchester-city-triplete-2023',
    team: 'Manchester City',
    season: '2022-23',
    milestone: 'El triplete de Guardiola',
    formation: '4-3-3',
    source: 'Temporada 2022-23, once tipo — VERIFICAR (formación variable)',
    players: [
      p('Ederson', 'Ederson'),
      p('Kyle Walker', 'Walker'),
      p('John Stones', 'Stones'),
      p('Rúben Dias', 'Dias', 'ruben dias'),
      p('Nathan Aké', 'Aké', 'ake'),
      p('Kevin De Bruyne', 'De Bruyne', 'kdb', 'debruyne'),
      p('Rodri', 'Rodri'),
      p('İlkay Gündoğan', 'Gündoğan', 'gundogan'),
      p('Bernardo Silva', 'Bernardo', 'bernardo silva'),
      p('Erling Haaland', 'Haaland'),
      p('Jack Grealish', 'Grealish')
    ]
  },
  {
    id: 'real-madrid-decimocuarta-2022',
    team: 'Real Madrid',
    season: '2021-22',
    milestone: 'La Decimocuarta',
    formation: '4-3-3',
    source: 'Final Champions 2022 (París), once inicial',
    players: [
      p('Thibaut Courtois', 'Courtois'),
      p('Dani Carvajal', 'Carvajal'),
      p('Éder Militão', 'Militão', 'militao'),
      p('David Alaba', 'Alaba'),
      p('Ferland Mendy', 'Mendy'),
      p('Luka Modrić', 'Modrić', 'modric'),
      p('Casemiro', 'Casemiro', 'case'),
      p('Toni Kroos', 'Kroos'),
      p('Federico Valverde', 'Valverde', 'fede', 'pajarito'),
      p('Karim Benzema', 'Benzema'),
      p('Vinícius Júnior', 'Vinícius', 'vinicius', 'vini')
    ]
  },
  {
    id: 'bayern-wembley-2013',
    team: 'Bayern de Múnich',
    season: '2012-13',
    milestone: 'El triplete de Heynckes (Wembley)',
    formation: '4-2-3-1',
    source: 'Final Champions 2013 (Wembley), once inicial',
    players: [
      p('Manuel Neuer', 'Neuer'),
      p('Philipp Lahm', 'Lahm'),
      p('Jérôme Boateng', 'Boateng'),
      p('Dante', 'Dante'),
      p('David Alaba', 'Alaba'),
      p('Javi Martínez', 'J. Martínez', 'javi martinez'),
      p('Bastian Schweinsteiger', 'Schweinsteiger', 'schweini'),
      p('Arjen Robben', 'Robben'),
      p('Thomas Müller', 'Müller', 'muller'),
      p('Franck Ribéry', 'Ribéry', 'ribery'),
      p('Mario Mandžukić', 'Mandžukić', 'mandzukic')
    ]
  },
  {
    id: 'alemania-mundial-2014',
    team: 'Alemania',
    season: '2014',
    milestone: 'Campeona del Mundo (Maracanazo inverso)',
    formation: '4-2-3-1',
    source: 'Final del Mundial 2014 (Maracaná), once inicial',
    players: [
      p('Manuel Neuer', 'Neuer'),
      p('Philipp Lahm', 'Lahm'),
      p('Jérôme Boateng', 'Boateng'),
      p('Mats Hummels', 'Hummels'),
      p('Benedikt Höwedes', 'Höwedes', 'howedes'),
      p('Sami Khedira', 'Khedira'),
      p('Bastian Schweinsteiger', 'Schweinsteiger', 'schweini'),
      p('Thomas Müller', 'Müller', 'muller'),
      p('Toni Kroos', 'Kroos'),
      p('Mesut Özil', 'Özil', 'ozil'),
      p('Miroslav Klose', 'Klose')
    ]
  },
  {
    id: 'italia-eurocopa-2021',
    team: 'Italia',
    season: '2020',
    milestone: 'Campeona de Europa (Wembley)',
    formation: '4-3-3',
    source: 'Final de la Eurocopa 2020 (Wembley), once inicial',
    players: [
      p('Gianluigi Donnarumma', 'Donnarumma', 'gigio'),
      p('Giovanni Di Lorenzo', 'Di Lorenzo'),
      p('Leonardo Bonucci', 'Bonucci'),
      p('Giorgio Chiellini', 'Chiellini'),
      p('Emerson Palmieri', 'Emerson'),
      p('Nicolò Barella', 'Barella'),
      p('Jorginho', 'Jorginho'),
      p('Marco Verratti', 'Verratti'),
      p('Federico Chiesa', 'Chiesa'),
      p('Ciro Immobile', 'Immobile'),
      p('Lorenzo Insigne', 'Insigne')
    ]
  },
  {
    id: 'manchester-united-treble-1999',
    team: 'Manchester United',
    season: '1998-99',
    milestone: 'El triplete de Ferguson',
    formation: '4-4-2',
    source: 'Temporada 1998-99, once tipo (en la final de Champions faltaron Keane y Scholes por sanción)',
    players: [
      p('Peter Schmeichel', 'Schmeichel'),
      p('Gary Neville', 'G. Neville', 'gary neville'),
      p('Ronny Johnsen', 'Johnsen'),
      p('Jaap Stam', 'Stam'),
      p('Denis Irwin', 'Irwin'),
      p('David Beckham', 'Beckham', 'becks'),
      p('Roy Keane', 'Keane'),
      p('Paul Scholes', 'Scholes'),
      p('Ryan Giggs', 'Giggs'),
      p('Dwight Yorke', 'Yorke'),
      p('Andy Cole', 'Cole', 'andy cole')
    ]
  },
  {
    id: 'valencia-benitez-2004',
    team: 'Valencia CF',
    season: '2003-04',
    milestone: 'Liga y UEFA de Rafa Benítez',
    formation: '4-4-2',
    source: 'Temporada 2003-04, once tipo — VERIFICAR',
    players: [
      p('Santiago Cañizares', 'Cañizares', 'canizares'),
      p('Curro Torres', 'Curro Torres', 'curro'),
      p('Roberto Ayala', 'Ayala'),
      p('Carlos Marchena', 'Marchena'),
      p('Amedeo Carboni', 'Carboni'),
      p('Vicente', 'Vicente', 'vicente rodriguez'),
      p('David Albelda', 'Albelda'),
      p('Rubén Baraja', 'Baraja', 'pipo'),
      p('Francisco Rufete', 'Rufete'),
      p('Mista', 'Mista'),
      p('Pablo Aimar', 'Aimar', 'el payaso')
    ]
  },
  {
    id: 'sevilla-uefa-2006',
    team: 'Sevilla FC',
    season: '2005-06',
    milestone: 'La UEFA de Palop y Puerta',
    formation: '4-4-2',
    source: 'Final UEFA 2006 (Eindhoven) — VERIFICAR',
    players: [
      p('Andrés Palop', 'Palop'),
      p('Dani Alves', 'Alves', 'dani alves'),
      p('Javi Navarro', 'J. Navarro', 'javi navarro'),
      p('Aitor Ocio', 'Ocio', 'aitor ocio'),
      p('David Castedo', 'Castedo'),
      p('Jesús Navas', 'J. Navas', 'jesus navas'),
      p('Adriano', 'Adriano'),
      p('Renato', 'Renato'),
      p('Christian Poulsen', 'Poulsen'),
      p('Luís Fabiano', 'L. Fabiano', 'luis fabiano', 'fabiano'),
      p('Frédéric Kanouté', 'Kanouté', 'kanoute')
    ]
  },
  {
    id: 'deportivo-superdepor-2000',
    team: 'Deportivo',
    season: '1999-2000',
    milestone: 'El Superdépor campeón de Liga',
    formation: '4-4-2',
    source: 'Temporada 1999-2000, once tipo — VERIFICAR',
    players: [
      p("Jacques Songo'o", "Songo'o", 'songo', 'songoo'),
      p('Manuel Pablo', 'M. Pablo', 'manuel pablo'),
      p('Noureddine Naybet', 'Naybet'),
      p('Donato', 'Donato'),
      p('Enrique Romero', 'Romero', 'enrique romero'),
      p('Sergio', 'Sergio', 'sergio gonzalez'),
      p('Mauro Silva', 'Mauro Silva', 'mauro'),
      p('Fran', 'Fran', 'fran gonzalez'),
      p('Djalminha', 'Djalminha', 'djalma'),
      p('Roy Makaay', 'Makaay'),
      p('Pauleta', 'Pauleta')
    ]
  },
  {
    id: 'chelsea-champions-2012',
    team: 'Chelsea',
    season: '2011-12',
    milestone: 'La Champions de Múnich (Drogba)',
    formation: '4-2-3-1',
    source: 'Final Champions 2012 (Múnich) — VERIFICAR',
    players: [
      p('Petr Čech', 'Čech', 'cech'),
      p('José Bosingwa', 'Bosingwa'),
      p('Gary Cahill', 'Cahill'),
      p('David Luiz', 'David Luiz', 'luiz'),
      p('Ashley Cole', 'A. Cole', 'ashley cole'),
      p('John Obi Mikel', 'Mikel', 'obi mikel'),
      p('Frank Lampard', 'Lampard', 'lamps'),
      p('Salomon Kalou', 'Kalou'),
      p('Juan Mata', 'Mata', 'juan mata'),
      p('Ryan Bertrand', 'Bertrand'),
      p('Didier Drogba', 'Drogba')
    ]
  }
];
