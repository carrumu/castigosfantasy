/**
 * Prerender SIN navegador.
 *
 * El contenido de las guías son cadenas HTML fijas en src/views/guias.js, así
 * que no hace falta arrancar Chromium para "renderizarlas": basta con inyectar
 * ese HTML dentro de la plantilla dist/index.html (que ya trae las referencias
 * correctas a los bundles con hash) usando cheerio, que corre en Node puro.
 *
 * Esto arregla el fallo de build en Vercel/Render ("Exited with status 1"),
 * donde no hay ningún navegador disponible. El script nunca rompe el build:
 * si algo falla, avisa y termina en 0 para que el deploy siga adelante.
 *
 * Genera, por cada guía, dist/guias/<slug>/index.html con:
 *   - <title>, meta description, OpenGraph/Twitter y canonical propios
 *   - el contenido del artículo dentro de <div id="app"> (visible sin JS)
 * y el índice dist/guias/index.html (hub con tarjetas a cada guía).
 * El resto de rutas siguen sirviéndose como SPA (la home ya lleva su bloque
 * de contenido estático en index.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { GUIDES, CATEGORIES, GUIDE_CATEGORY } from '../src/views/guias.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SITE = 'https://castigosfantasy.com';

function main() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.warn('[prerender] No existe dist/index.html; ¿se ejecutó vite build? Se omite el prerender.');
    return;
  }
  const template = fs.readFileSync(templatePath, 'utf8');

  // Aplica los metadatos de SEO comunes a una instancia de cheerio.
  function applySeo($, { title, description, canonicalPath }) {
    $('title').text(title);
    $('#seo-description').attr('content', description);
    $('#og-title').attr('content', title);
    $('#og-description').attr('content', description);
    $('#twitter-title').attr('content', title);
    $('#twitter-description').attr('content', description);

    // OJO: la canonica lleva barra final a proposito. Estas paginas se
    // publican como <ruta>/index.html y el hosting (Render) solo sirve el
    // fichero si la URL termina en barra; sin ella devuelve el cascaron del
    // SPA. Si la canonica apuntara a la version sin barra, Google indexaria
    // el cascaron y todas las guias le pareceria la misma pagina.
    const href = canonicalPath ? `${SITE}/${canonicalPath}/` : `${SITE}/`;
    let canonical = $('link[rel="canonical"]');
    if (canonical.length === 0) {
      $('head').append(`\n    <link rel="canonical" href="${href}" />`);
    } else {
      canonical.attr('href', href);
    }
  }

  function writePage(relDir, html) {
    const outDir = path.join(DIST_DIR, relDir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  }

  let ok = 0;

  // --- Hub: /guias ---
  try {
    const $ = cheerio.load(template);
    applySeo($, {
      title: 'Guías Fantasy: castigos, capitanías, chollos y cláusulas | CastigosFantasy',
      description: 'Guías prácticas para tu liga fantasy: ideas de castigos, cómo elegir capitán, encontrar chollos, usar cláusulas, errores de novato y cómo gestionar el bote en Biwenger, Comunio y LaLiga Fantasy.',
      canonicalPath: 'guias'
    });
    const card = g => `
        <a href="/guias/${g.id}" style="display:block;text-decoration:none;background:#1c1b1b;border:1px solid #2a2a2a;border-radius:12px;padding:1.25rem 1.35rem;margin-bottom:1rem;">
          <h3 style="font-weight:800;font-size:1.15rem;text-transform:uppercase;margin:0 0 0.4rem;color:#efefef;">${g.title}</h3>
          <p style="margin:0 0 0.6rem;font-size:0.9rem;line-height:1.55;color:#a9a9a0;">${g.description}</p>
          <span style="font-weight:800;font-size:0.85rem;text-transform:uppercase;color:#deed00;">Leer guía →</span>
        </a>`;
    const groups = CATEGORIES.map(cat => {
      const items = GUIDES.filter(g => GUIDE_CATEGORY[g.id] === cat.id);
      if (!items.length) return '';
      return `
      <section style="margin-bottom:2rem;">
        <h2 style="font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:1px;color:#deed00;border-bottom:1px solid #2a2a2a;padding-bottom:0.4rem;margin:0 0 1rem;">${cat.label}</h2>
        ${items.map(card).join('')}
      </section>`;
    }).join('');
    $('#app').html(`
      <main style="max-width:820px;margin:0 auto;padding:1rem 1.25rem 3rem;color:#efefef;font-family:system-ui,sans-serif;">
        <h1 style="font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.4rem;">Guías de Castigos Fantasy</h1>
        <p style="color:#a9a9a0;font-size:0.95rem;margin-bottom:1.5rem;line-height:1.6;">Ideas de castigos, capitanías, chollos, cláusulas, errores de novato y cómo llevar el bote de tu liga. Guías prácticas para tu liga fantasy de Biwenger, Comunio o LaLiga Fantasy.</p>
        <input type="search" placeholder="Busca tu duda: capitán, bote, chollos, cláusula..." aria-label="Buscar en las guías" style="width:100%;box-sizing:border-box;background:#1c1b1b;border:1.5px solid #2a2a2a;border-radius:10px;padding:0.8rem 1rem;color:#efefef;font-size:0.95rem;margin-bottom:1.75rem;" />
        ${groups}
      </main>`);
    writePage('guias', $.html());
    ok++;
    console.log('[prerender] /guias (hub) -> guias/index.html');
  } catch (err) {
    console.warn('[prerender] Aviso: no se pudo generar el hub /guias:', err.message);
  }

  // --- Cada guía: /guias/<slug> ---
  for (const g of GUIDES) {
    try {
      const $ = cheerio.load(template);
      applySeo($, {
        title: `${g.title} | CastigosFantasy`,
        description: g.description,
        canonicalPath: `guias/${g.id}`
      });
      $('#app').html(`
        <main style="max-width:820px;margin:0 auto;padding:1rem 1.25rem 3rem;color:#efefef;font-family:system-ui,sans-serif;line-height:1.7;">
          <article>
            <h1 style="font-weight:900;font-size:2rem;text-transform:uppercase;line-height:1.08;margin-bottom:1rem;">${g.title}</h1>
            ${g.html}
          </article>
        </main>`);
      writePage(path.join('guias', g.id), $.html());
      ok++;
      console.log(`[prerender] /guias/${g.id}`);
    } catch (err) {
      console.warn(`[prerender] Aviso: no se pudo generar /guias/${g.id}:`, err.message);
    }
  }

  console.log(`[prerender] listo. ${ok} páginas generadas.`);
}

try {
  main();
} catch (err) {
  // Nunca rompas el build por el prerender: mejor desplegar sin él que no desplegar.
  console.warn('[prerender] Aviso: el prerender falló por completo, se omite:', err.message);
}
