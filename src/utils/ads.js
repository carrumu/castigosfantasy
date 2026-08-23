/**
 * Publicidad: Adsterra Native Banner, en todas las vistas.
 *
 * DÓNDE. Un único hueco global, montado por src/main.js en cada render de
 * ruta (ver renderMainLayout), debajo del contenido de la vista activa.
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

// Unidad "320x50_1". Formato clásico de Adsterra (atOptions + invoke.js), que
// pinta el anuncio con document.write en el punto donde se ejecuta el script.
// Eso es seguro en una página estática, pero no en una SPA: si se reinyecta
// tras la carga inicial (como hacemos en cada render de ruta), document.write
// borra la página entera en vez de escribir solo el anuncio. Por eso este va
// dentro de un <iframe> propio: su document.write solo afecta al documento
// del iframe, nunca al de la app.
const BANNER_KEY = '9fc59475b4073c1a36a8c58d0faa4a4a';
const BANNER_SRC = `https://www.highrevenueformat.com/${BANNER_KEY}/invoke.js`;
const BANNER_WIDTH = 320;
const BANNER_HEIGHT = 50;

export const BANNER_CONTAINER_ID = `banner-${BANNER_KEY}`;

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
 * incrustarlo en el layout global.
 *
 * Va siempre en el marcado, aunque no haya consentimiento: así la página no
 * cambia de tamaño según lo que el usuario haya contestado.
 */
export function adSlotHtml() {
  return `
    <div class="ad-slot" aria-hidden="true">
      <span class="ad-slot-label">Publicidad</span>
      <div id="${AD_CONTAINER_ID}"></div>
      <div id="${BANNER_CONTAINER_ID}" class="ad-slot-banner"></div>
    </div>`;
}

/**
 * Carga el anuncio dentro del hueco. Se llama en cada render de ruta.
 *
 * El script se reinyecta en cada llamada a propósito: `invoke.js` busca su
 * contenedor cuando se ejecuta, y en una SPA el layout se vuelve a pintar en
 * cada navegación. Si el script solo se cargara una vez, a partir de la
 * segunda vista el hueco se quedaría vacío.
 */
export function mountAd(root) {
  const slot = root.querySelector('.ad-slot');

  if (!hasAdConsent()) {
    // Sin permiso no hay anuncio, así que tampoco debe quedarse el rótulo
    // "Publicidad" presidiendo un hueco vacío.
    if (slot) slot.hidden = true;
    return;
  }

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

  mountBannerAd(root);

  // Adsterra puede no devolver anuncio: unidad recién creada, sin demanda para
  // ese país, o un bloqueador de por medio. En ese caso el contenedor se queda
  // vacío y, sin esto, el lector ve un "PUBLICIDAD" encabezando la nada. Se
  // comprueba pasado un margen y, si no ha llegado nada, el bloque desaparece.
  // Nota: esta comprobación solo mira el Native Banner (el principal); el
  // banner 320x50 va dentro de un iframe propio cuyo contenido no podemos
  // inspeccionar desde fuera, así que no entra en la cuenta.
  if (slot) {
    slot.hidden = false;
    setTimeout(() => {
      const vacio = hueco.children.length === 0 && hueco.getBoundingClientRect().height < 5;
      if (vacio) slot.hidden = true;
    }, 4000);
  }
}

/**
 * Monta el banner 320x50 dentro de su propio iframe (ver comentario de
 * BANNER_KEY más arriba: su document.write debe quedar aislado del documento
 * de la app). Se recrea el iframe en cada llamada porque el contenedor mismo
 * se destruye y se vuelve a crear en cada render de ruta.
 */
function mountBannerAd(root) {
  const contenedor = root.querySelector(`#${BANNER_CONTAINER_ID}`);
  if (!contenedor) return;

  const iframe = document.createElement('iframe');
  iframe.width = String(BANNER_WIDTH);
  iframe.height = String(BANNER_HEIGHT);
  iframe.scrolling = 'no';
  iframe.title = 'Publicidad';
  iframe.style.cssText = `width:${BANNER_WIDTH}px;height:${BANNER_HEIGHT}px;border:0;display:block;`;
  contenedor.innerHTML = '';
  contenedor.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!doctype html><html><head><style>body{margin:0;padding:0;}</style></head><body>
    <script>
      atOptions = {
        'key': '${BANNER_KEY}',
        'format': 'iframe',
        'height': ${BANNER_HEIGHT},
        'width': ${BANNER_WIDTH},
        'params': {}
      };
    </script>
    <script src="${BANNER_SRC}"></script>
    </body></html>
  `);
  doc.close();
}
