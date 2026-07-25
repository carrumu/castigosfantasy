/**
 * Prerender de páginas de contenido tras `vite build`.
 *
 * Castigos Fantasy es una SPA (Vite + JS vanilla, sin framework, enrutado
 * por history.pushState en src/main.js). Eso significa que un crawler que no
 * ejecute JavaScript ve el mismo cascarón <div id="app"></div> vacío en
 * TODAS las rutas — home, guías, sobre nosotros... todas idénticas. Esa es
 * una de las señales que hacen que revisores como AdSense marquen el sitio
 * como "contenido de poco valor" (páginas finas y duplicadas).
 *
 * Este script arranca un servidor estático del propio `dist/`, visita cada
 * ruta de CONTENIDO REAL con Chromium headless (Playwright), deja que
 * src/main.js renderice esa vista (título, meta description y HTML ya
 * los actualiza dinámicamente src/utils/seo.js), y vuelca el documento
 * final ya renderizado a un index.html estático propio de esa ruta
 * (dist/guias/index.html, etc.).
 *
 * El bundle JS se mantiene intacto en el HTML volcado: un visitante real
 * recibe el contenido ya pintado al instante, y en cuanto carga el JS,
 * main.js vuelve a renderizar por encima con el mismo contenido (no hay
 * hydration diffing que romper — main.js siempre reemplaza app.innerHTML
 * entero). El único cambio es que ahora SÍ hay texto real sin depender de
 * que el crawler ejecute JavaScript.
 *
 * IMPORTANTE: solo se prerenderizan páginas de contenido público real.
 * Las herramientas interactivas (ruleta, juegos, generador...) se excluyen
 * a propósito — ver public/sitemap.xml y public/robots.txt para el motivo.
 */

import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDES } from '../src/views/guias.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 4173 + Math.floor(Math.random() * 200); // evita choques si algo más usa el puerto habitual

// Rutas de contenido real a prerenderizar. Deben coincidir con
// public/sitemap.xml. '/' se escribe sobre el propio dist/index.html;
// el resto crea dist/<ruta>/index.html. Cada guía (/guias/<slug>) se
// añade automáticamente desde GUIDES, así no hay que mantener dos listas.
const ROUTES = [
  '/',
  '/guias',
  ...GUIDES.map(g => `/guias/${g.id}`),
  '/sobre-nosotros',
  '/contacto',
  '/privacidad',
  '/cookies',
  '/terminos'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(DIST_DIR, urlPath);

    // Si la ruta pide un archivo real (assets, favicons...), se sirve tal cual.
    // Si no, es una ruta de la SPA (p.ej. /guias): fallback a dist/index.html
    // para que el enrutador cliente (history.pushState) pueda leer el pathname.
    let servePath = filePath;
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      servePath = path.join(DIST_DIR, 'index.html');
    }

    fs.readFile(servePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(servePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('[prerender] No existe dist/index.html — ejecuta "vite build" antes.');
    process.exit(1);
  }

  const server = await startStaticServer();
  const browser = await chromium.launch();

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      // Las vistas de contenido renderizan de forma síncrona (innerHTML), pero
      // damos un pequeño margen por si el SEO util o algún efecto tarda un tick.
      await page.waitForTimeout(250);

      const html = await page.content();
      await page.close();

      const outPath =
        route === '/'
          ? path.join(DIST_DIR, 'index.html')
          : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');

      const chars = html.length;
      console.log(`[prerender] ${route.padEnd(18)} -> ${path.relative(DIST_DIR, outPath)} (${chars} chars)`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('[prerender] listo.');
}

main().catch((err) => {
  console.error('[prerender] Error:', err);
  process.exit(1);
});
