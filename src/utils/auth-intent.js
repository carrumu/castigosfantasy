/**
 * Recuerda POR QUÉ el visitante entró en la pantalla de acceso.
 *
 * El CTA de la home ("Crea tu liga gratis") y el enlace de "Inicia sesión"
 * llevan a la misma vista, así que sin esto la pantalla no sabe a cuál de los
 * dos responder y siempre abría el formulario de login. Peor aún: entre medias
 * hay un viaje de ida y vuelta por el correo de verificación (o por Google),
 * que recarga la página entera. Por eso la intención vive en localStorage y no
 * en una variable: es lo único que sobrevive a esa recarga.
 *
 * La consume la vista que cumple la promesa (mis-ligas), no la que autentica.
 */

const KEY = 'CF_AUTH_INTENT';

/** El visitante venía a crear su liga, no solo a entrar. */
export const INTENT_CREATE_LEAGUE = 'crear-liga';

export function setAuthIntent(intent) {
  try {
    localStorage.setItem(KEY, intent);
  } catch (err) {
    // Modo incógnito o almacenamiento lleno: se pierde el atajo, no el flujo.
    console.warn('No se pudo guardar la intención de acceso:', err);
  }
}

export function getAuthIntent() {
  try {
    return localStorage.getItem(KEY);
  } catch (err) {
    return null;
  }
}

export function clearAuthIntent() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    /* nada que hacer */
  }
}

/** Lee y borra de una vez, para que la intención se cumpla una sola vez. */
export function consumeAuthIntent() {
  const intent = getAuthIntent();
  clearAuthIntent();
  return intent;
}
