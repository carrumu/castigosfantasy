// @ts-nocheck
// Calendario real de LaLiga: cuando termina cada jornada. Vale igual para
// Comunio, Mister o Biwenger -- es la misma liga de fútbol española, el
// calendario no depende de la plataforma de fantasy que la sigue.
//
// Se lee de la API publica de Comunio (api.comunio.es/matchdays), que no
// pide credenciales, porque es la unica de las tres que respondio sin login
// al probarla; Mister no expone nada equivalente en publico. Si Comunio
// cambia o cae, esto falla en silencio (array vacio) y sencillamente no se
// avisa de ninguna jornada terminada -- nunca un dato inventado.
const MATCHDAYS_URL = "https://api.comunio.es/matchdays";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface FinishedMatchday {
  key: string;
  timestamp: string;
}

/**
 * Jornadas totalmente terminadas, de mas antigua a mas reciente.
 *
 * Una misma matchdayKey puede tener varias entradas (p.ej. una alineación
 * aplazada de un partido de esa jornada, type "matchday_shifted"). Solo
 * cuenta como terminada si TODAS sus entradas lo estan -- mejor tarde que
 * anunciar cerrada una jornada con un partido aun pendiente.
 */
export async function fetchFinishedMatchdays(): Promise<FinishedMatchday[]> {
  try {
    const res = await fetch(MATCHDAYS_URL, {
      headers: { "Accept": "application/json", "User-Agent": UA },
    });
    const json = await res.json().catch(() => []);
    const byKey = new Map<string, { allFinished: boolean; latestTimestamp: string }>();
    for (const md of Array.isArray(json) ? json : []) {
      const key = String(md.matchdayKey);
      const prev = byKey.get(key);
      const allFinished = (prev?.allFinished ?? true) && !!md.finished;
      const latestTimestamp = prev && prev.latestTimestamp > md.timestamp ? prev.latestTimestamp : md.timestamp;
      byKey.set(key, { allFinished, latestTimestamp });
    }
    return Array.from(byKey.entries())
      .filter(([, v]) => v.allFinished)
      .map(([key, v]) => ({ key, timestamp: v.latestTimestamp }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  } catch (e) {
    console.log(`[laligaCalendar] no se pudo leer el calendario: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}
