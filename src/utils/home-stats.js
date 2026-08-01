/**
 * Cifras de la portada.
 *
 * REGLA: aquí solo entran números verdaderos, y todos salen de nuestra propia
 * base de datos vía `public_home_stats()`. Sin dependencias externas a
 * propósito: los seguidores de redes se descartaron porque habrían obligado a
 * mantenerlos a mano (Instagram y TikTok no dejan leerlos sin su API oficial) o
 * a pagar un agregador, y ninguna de las dos cosas compensa por una cifra.
 *
 * Segunda regla, igual de importante: **una cifra que no llega al mínimo no se
 * pinta**. Presumir de "5 usuarios" o de "0 castigos" resta en vez de sumar, y
 * un hueco con un guion canta todavía más. El bloque entero desaparece si no
 * queda nada digno que enseñar, así que se puede desplegar hoy y se irá
 * encendiendo solo según crezcan los números.
 */

import { supabase, isConfigured } from '../supabase';

// Debajo de esto una cifra de comunidad hace más daño que bien.
const MINIMO_PRESENTABLE = 25;

const fmt = (n) => n.toLocaleString('es-ES');

export function statsMarkup() {
  return `<section class="landing-tier" id="cifras-home" hidden>
    <div class="stats-strip" id="stats-strip"></div>
  </section>`;
}

export async function wireStats(root) {
  const section = root.querySelector('#cifras-home');
  const strip = root.querySelector('#stats-strip');
  if (!section || !strip) return;

  // Aquí solo van cifras de comunidad. El tamaño del catálogo y el número de
  // guías se quitaron a propósito: describen el producto, no a la gente que lo
  // usa, y en un bloque de prueba social eso suena a relleno. Consecuencia
  // buscada: mientras no haya comunidad que enseñar, el bloque no aparece.
  // `prioridad` ordena; la tira solo tiene sitio para 4.
  const cifras = [];

  // Cifras vivas de la base de datos. Si la llamada falla, `cifras` se queda
  // vacío y el bloque no se pinta: la página sigue entera.
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('public_home_stats');
      if (!error && data?.[0]) {
        const { usuarios, ligas, castigos_asignados, castigos_generados } = data[0];
        cifras.push(
          // "Generados" cuenta cada castigo que ha sacado la app, incluidos los
          // de la ruleta de esta misma portada. La etiqueta dice exactamente
          // eso: no son castigos cumplidos ni asignados a nadie.
          { valor: Number(castigos_generados), etiqueta: 'castigos generados', min: MINIMO_PRESENTABLE, prioridad: 3 },
          { valor: Number(ligas), etiqueta: 'ligas creadas', min: MINIMO_PRESENTABLE, prioridad: 2 },
          { valor: Number(usuarios), etiqueta: 'jugadores registrados', min: MINIMO_PRESENTABLE, prioridad: 6 },
          // Estos sí son castigos sentenciados de verdad en una jornada real,
          // por eso van los primeros: es la prueba más fuerte que existe.
          { valor: Number(castigos_asignados), etiqueta: 'castigos sentenciados', min: MINIMO_PRESENTABLE, prioridad: 1 }
        );
      }
    } catch (err) {
      console.warn('Cifras de la home no disponibles:', err);
    }
  }

  const visibles = cifras
    .filter(c => c.valor >= c.min)
    .sort((a, b) => a.prioridad - b.prioridad)
    .slice(0, 4); // La tira es de 4 columnas; más cifras la convierten en ruido.

  // Basta con una. "Castigos generados" cruzará el mínimo mucho antes que
  // "ligas creadas", y exigir dos dejaría el bloque escondido meses teniendo ya
  // algo que enseñar. Una sola tarjeta ocupa el ancho completo y funciona.
  if (visibles.length === 0) return;

  strip.innerHTML = visibles.map(c => `
    <div class="stat-item">
      <strong class="stat-num">${fmt(c.valor)}</strong>
      <span class="stat-label">${c.etiqueta}</span>
    </div>
  `).join('');

  section.hidden = false;
}
