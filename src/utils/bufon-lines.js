// Banco de sentencias cortas del Bufón para el resumen de Jornada Express.
// Mismo patrón que phrases.js: array plano + selección aleatoria.
const BUFON_LINES = [
  "Que suenen las trompetas: {name} ha caído en desgracia ante toda la corte.",
  "El Bufón declara oficialmente a {name} el hazmerreír de la jornada.",
  "Ni el bufón más torpe del reino la hubiera liado tan gorda como {name}.",
  "{name}, la corte entera se ríe de tu alineación. Hasta el rey se ha reído.",
  "Se abre el juicio: {name} queda condenado por alta traición al buen fútbol.",
  "El Bufón canta una balada nueva esta semana, y se titula '{name} y su desastre'.",
  "Redoble de tambores... y {name} cae al foso de los morosos.",
  "{name} ha demostrado que se puede perder incluso sin jugar en el campo.",
  "La corte pide clemencia para {name}, pero el Bufón no la conoce.",
  "Cuentan las crónicas del reino que {name} fichó fatal esta semana.",
  "El Bufón corona a {name} como Duque del Farolillo Rojo.",
  "Ni con magia negra se explica la jornada de {name}.",
  "{name}, guarda silencio: cuanto menos hables de tu once, mejor.",
  "El bufón se ha quedado sin chistes... {name} ya es la broma en sí mismo.",
  "Se dice en el castillo que {name} alinea con los ojos cerrados.",
  "{name} ha bajado tanto que necesita un mapa para encontrar su posición.",
  "El Bufón brinda por {name}: por seguir intentándolo, sin éxito.",
  "Que se anote en los libros: {name} firma la peor jornada del reino.",
  "{name}, ni el escudero más torpe hubiera fallado tanto.",
  "El Bufón le dedica una reverencia burlona a {name}, el nuevo colista.",
  "Suena la campana de la vergüenza: es turno de {name}.",
  "{name} ha sido nombrado embajador oficial de la lista de morosos."
];

/**
 * Returns a random mocking one-liner from the Bufón, with the loser's name
 * substituted in.
 * @param {string} name
 * @returns {string}
 */
export function getRandomBufonLine(name) {
  const index = Math.floor(Math.random() * BUFON_LINES.length);
  const line = BUFON_LINES[index];
  return line.replace('{name}', name || 'Mánager');
}
