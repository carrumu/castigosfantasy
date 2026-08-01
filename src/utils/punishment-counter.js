/**
 * Cuenta los castigos que genera la app.
 *
 * Alimenta la cifra "castigos generados" de la portada. Cuenta también los de
 * visitantes sin cuenta, que es donde más se usa: `punishment_events` solo
 * registra los de usuarios logueados y con liga, así que dejaba fuera la home
 * entera.
 *
 * Es contabilidad, no funcionalidad: si la base de datos falla, el usuario no
 * se entera de nada y su castigo sale igual. Por eso no se espera la respuesta
 * ni se propaga ningún error hacia arriba.
 */

import { supabase, isConfigured } from '../supabase';

// Un tope por sesión. El contador es una cifra de vanidad en la portada, y sin
// esto bastaría con dejar pulsado "girar otra vez" para inflarla sin límite.
const MAX_POR_SESION = 40;
let registrados = 0;

/**
 * @param {'home-demo'|'generador'|'ruleta'} source Dónde se generó.
 * @param {string} [punishmentId] Qué castigo salió, para saber cuáles gustan.
 */
export function logPunishmentGeneration(source, punishmentId) {
  if (!isConfigured || !supabase) return;
  if (registrados >= MAX_POR_SESION) return;
  registrados += 1;

  supabase
    .from('punishment_generations')
    .insert({ source, punishment_id: punishmentId ?? null })
    .then(({ error }) => {
      if (error) console.warn('No se pudo contar el castigo generado:', error.message);
    });
}
