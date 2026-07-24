import { supabase } from '../supabase';
import { getRandomBufonLine } from './bufon-lines';
import { escapeHTML } from './security';
import { generateStoryCardBlob } from './story-card';

/**
 * Opens the "Modo Jornada Express" summary modal: last place, the
 * punishment they got, a Bufón one-liner, and a share button — all in one
 * place, no navigation.
 * @param {string} leagueId
 * @param {Object} callbacks
 */
export async function openJornadaExpressModal(leagueId, callbacks) {
  const existing = document.querySelector('#jornada-express-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'jornada-express-modal';
  modal.className = 'modal-overlay active';
  modal.style.cssText = 'display: flex; align-items: center; justify-content: center; z-index: 9999;';

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px; width: 92%; background: var(--bg-card); border: 1.5px solid #000; box-shadow: 4px 4px 0px #000; max-height: 90vh; overflow-y: auto; border-radius: 12px;">
      <div style="height: 4px; background: var(--accent);"></div>
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.1rem; border-bottom: 1.5px solid #000;">
        <h3 style="font-family: var(--font-display); font-weight: 800; font-size: 0.95rem; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
          <span class="material-symbols-outlined" style="color: var(--accent); font-size: 1.15rem;">bolt</span>
          Jornada Express
        </h3>
        <button id="jornada-express-close" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">✕</button>
      </div>
      <div id="jornada-express-body" style="padding: 1.15rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; min-height: 220px; justify-content: center;">
        <span class="spinner" style="width: 28px; height: 28px;"></span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const body = modal.querySelector('#jornada-express-body');
  const close = () => modal.remove();
  modal.querySelector('#jornada-express-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  try {
    // Last complete record for this league (loser + punishment already assigned).
    // Whether that punishment came from a roulette spin or was assigned some
    // other way doesn't matter here — some leagues don't use the roulette at
    // all, so this only ever shows the result, never a spin animation.
    const { data: record, error: recordErr } = await supabase
      .from('matchday_records')
      .select(`
        id, matchday_number, punishment_id, loser_points,
        profiles:loser_profile_id ( apodo, display_name ),
        roster:loser_roster_id ( name ),
        punishments:punishment_id ( id, name, description )
      `)
      .eq('league_id', leagueId)
      .not('punishment_id', 'is', null)
      .order('matchday_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recordErr) throw recordErr;

    if (!record) {
      body.innerHTML = `<p style="color: var(--text-muted); text-align: center; font-size: 0.9rem;">Todavía no hay ninguna jornada cerrada con castigo asignado.</p>`;
      return;
    }

    const loserName = record.profiles?.apodo || record.profiles?.display_name || record.roster?.name || 'Mánager';
    const punishment = record.punishments;

    // Step 1: colista — same red-border/wash treatment DESIGN.md defines for
    // the "last place" callout on the Lista de Morosos.
    body.innerHTML = `
      <div style="width: 100%;">
        ${stepEyebrow('01', 'Colista de la jornada')}
        <div style="border: 1px solid var(--danger); background: rgba(211, 0, 23, 0.08); border-radius: 8px; padding: 0.8rem; text-align: center; margin-top: 0.45rem;">
          <h2 style="font-family: var(--font-display); font-weight: 800; font-size: 1.35rem; margin: 0; color: var(--text-light); letter-spacing: -0.3px;">${escapeHTML(loserName)}</h2>
          ${record.loser_points != null ? `<span style="font-size: 0.78rem; color: var(--danger); font-weight: 700;">${record.loser_points} pts esta jornada</span>` : ''}
        </div>
      </div>
    `;

    if (punishment) {
      renderPunishmentStep(body, punishment);
    } else {
      body.insertAdjacentHTML('beforeend', `<p style="color: var(--text-muted); text-align: center; font-size: 0.85rem;">El castigo asignado ya no está disponible.</p>`);
    }

    renderBufonAndShare(body, loserName, punishment, record.loser_points);
  } catch (err) {
    console.error('Error loading Jornada Express:', err);
    body.innerHTML = `<p style="color: var(--danger); text-align: center; font-size: 0.85rem;">Error al cargar el resumen de la jornada.</p>`;
  }
}

function stepEyebrow(number, label) {
  return `
    <div style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
      <span style="font-family: var(--font-display); font-weight: 800; font-size: 0.68rem; color: #000; background: var(--accent); border: 1px solid #000; border-radius: 4px; padding: 0.03rem 0.35rem;">${number}</span>
      <span style="font-size: 0.68rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.4px;">${label}</span>
    </div>
  `;
}

function renderPunishmentStep(body, punishment) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width: 100%;';
  wrap.innerHTML = stepEyebrow('02', 'Castigo asignado');

  const card = document.createElement('div');
  card.style.cssText = 'text-align: center; padding: 0.8rem; margin: 0.45rem 0 0; width: 100%; background: var(--bg-card-hover); border: 1px solid #000; border-radius: 8px;';
  card.innerHTML = `
    <h4 style="font-family: var(--font-display); font-weight: 800; font-size: 0.92rem; margin: 0 0 0.3rem;">${escapeHTML(punishment.name)}</h4>
    <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">${escapeHTML(punishment.description || '')}</p>
  `;
  wrap.appendChild(card);
  body.appendChild(wrap);
}

function renderBufonAndShare(body, loserName, punishment, points) {
  const bufonLine = getRandomBufonLine(loserName);

  const bufonWrap = document.createElement('div');
  bufonWrap.style.cssText = 'width: 100%;';
  bufonWrap.innerHTML = `
    ${stepEyebrow('03', 'Sentencia del Bufón')}
    <div style="display: flex; align-items: flex-start; gap: 0.4rem; border: 1px solid #000; border-radius: 8px; padding: 0.6rem 0.75rem; background: var(--bg-input); margin-top: 0.45rem;">
      <span class="material-symbols-outlined" style="color: var(--accent); font-size: 1.05rem; flex-shrink: 0;">theater_comedy</span>
      <p style="font-size: 0.8rem; color: var(--text-light); margin: 0; font-weight: 600;">${escapeHTML(bufonLine)}</p>
    </div>
  `;
  body.appendChild(bufonWrap);

  // Single share button: generates the story-card image and hands it to the
  // OS share sheet (WhatsApp, Instagram, X, Telegram, whatever's installed —
  // not just WhatsApp), falling back to a plain download where Web Share
  // with files isn't supported (most desktop browsers).
  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn-primary';
  shareBtn.style.cssText = 'width: 100%; font-weight: 800; text-transform: uppercase; font-size: 0.88rem; padding: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.15rem;';
  shareBtn.innerHTML = `<span class="material-symbols-outlined">share</span> Compartir`;
  shareBtn.addEventListener('click', async () => {
    shareBtn.disabled = true;
    const originalHtml = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Generando imagen...';

    try {
      const blob = await generateStoryCardBlob({
        loserName,
        points: points ?? null,
        punishmentName: punishment ? punishment.name : 'Castigo pendiente',
        punishmentDescription: punishment ? punishment.description : ''
      });

      const file = new File([blob], 'jornada-express.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Castigos Fantasy',
          text: `Colista de la jornada: ${loserName}`
        });
      } else {
        // No native multi-app share sheet available (typical on desktop) —
        // download the image so it can be attached manually anywhere.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jornada-express.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Error generating/sharing story card:', err);
      }
    } finally {
      shareBtn.disabled = false;
      shareBtn.innerHTML = originalHtml;
    }
  });
  body.appendChild(shareBtn);
}
