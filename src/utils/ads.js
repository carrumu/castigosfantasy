/**
 * Publicidad: Adsterra Native Banner, solo en las guías.
 *
 * DÓNDE Y POR QUÉ. El anuncio va únicamente en los artículos de /guias/, que
 * es tráfico que llega de Google, lee y se va. La home, la ruleta, los juegos,
 * el generador y todo el alta de liga se quedan limpios: ahí la persona está a
 * un clic de registrarse, y cambiar un usuario por medio céntimo es mal
 * negocio. Si algún día se amplía, que sea con esa regla en la cabeza.
 *
 * CONSENTIMIENTO. No se carga nada hasta que el usuario acepta las cookies.
 * Si rechaza, o si todavía no ha contestado, aquí no se pide ni un byte a
 * Adsterra.
 */

const CONSENT_KEY = 'CF_COOKIE_CONSENT';

// Unidad "NativeBanner_1" del panel de Adsterra. La clave hexadecimal aparece
// dos veces a propósito: una en la URL del script y otra en el id del div donde
// el script inyecta el anuncio. Si se cambia la unidad, hay que cambiar las dos.
const ADSTERRA_KEY = '4bc03d4ff4ec8dcbc4ff1a912db0e38f';
const ADSTERRA_SRC = `https://pl30802281.effectivecpmnetwork.com/${ADSTERRA_KEY}/invoke.js`;

export const AD_CONTAINER_ID = `container-${ADSTERRA_KEY}`;

/** ¿Ha aceptado el usuario las cookies de publicidad? */
export function hasAdConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch (err) {
    return false;
  }
}

/**
 * Hueco donde Adsterra pintará el anuncio. Se devuelve como HTML para poder
 * incrustarlo en la plantilla del artículo.
 *
 * Va siempre en el marcado, aunque no haya consentimiento: así el artículo no
 * cambia de tamaño según lo que el usuario haya contestado.
 */
export function adSlotHtml() {
  return `
    <div class="ad-slot" aria-hidden="true">
      <span class="ad-slot-label">Publicidad</span>
      <div id="${AD_CONTAINER_ID}"></div>
    </div>`;
}

/**
 * Carga el anuncio dentro del hueco. Se llama cada vez que se pinta un
 * artículo.
 *
 * El script se reinyecta en cada llamada a propósito: `invoke.js` busca su
 * contenedor cuando se ejecuta, y en una SPA el contenedor se destruye y se
 * vuelve a crear al cambiar de guía. Si el script solo se cargara una vez, a
 * partir de la segunda guía el hueco se quedaría vacío.
 */
export function mountAd(root) {
  if (!hasAdConsent()) return;

  const hueco = root.querySelector(`#${AD_CONTAINER_ID}`);
  if (!hueco) return;

  // Fuera el script de la guía anterior, para no acumular uno por navegación.
  document.querySelectorAll('script[data-adsterra]').forEach(s => s.remove());

  const s = document.createElement('script');
  s.async = true;
  s.src = ADSTERRA_SRC;
  // Adsterra lo pide para que Cloudflare no lo reescriba con Rocket Loader.
  s.setAttribute('data-cfasync', 'false');
  s.setAttribute('data-adsterra', 'true');
  document.body.appendChild(s);
}
