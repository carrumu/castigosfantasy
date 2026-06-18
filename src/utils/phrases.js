const PICHE_PHRASES = [
  "¡Farolillo rojo oficial! Esa alineación no la salva ni el VAR.",
  "Tus jugadores corrieron menos que el utillero esta jornada.",
  "El bote de la liga te agradece enormemente tu generoso patrocinio.",
  "Dicen en el barrio que tu estrategia da más miedo que un penalty en el 95.",
  "Menos mal que no te ganas la vida como director deportivo, porque estarías en quiebra.",
  "¿A quién has fichado esta semana? ¿A Gravesen? Vaya desastre...",
  "Paga los {amount}€ y calla. El ridículo ha sido histórico.",
  "¡Menudo entrenador de sillón! Esta jornada pagas tú las cañas.",
  "Tu equipo mete menos goles que un portero con muletas.",
  "Alguien debería confiscarte el móvil para que dejes de hacer alineaciones.",
  "Has quedado tan abajo en la clasificación que necesitas prismáticos para ver al penúltimo.",
  "¿Jornada de descanso? Porque tus jugadores no han comparecido en el campo.",
  "La próxima jornada pon la alineación aleatoria, seguro que te va mejor."
];

/**
 * Returns a random trash talk phrase, customized with the loser's name and the amount owed.
 * @param {string} displayName 
 * @param {number|string} amount 
 * @returns {string}
 */
export function getRandomPhrase(displayName, amount) {
  const index = Math.floor(Math.random() * PICHE_PHRASES.length);
  let phrase = PICHE_PHRASES[index];
  
  // Custom replacements
  phrase = phrase.replace('{amount}', amount);
  
  return `"${displayName}: ${phrase}"`;
}
