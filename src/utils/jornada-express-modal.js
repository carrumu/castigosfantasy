import { supabase } from '../supabase';
import { drawWheel, spinToIndex } from './roulette-wheel';
import { getRandomBufonLine } from './bufon-lines';
import { escapeHTML } from './security';

/**
 * Opens the "Modo Jornada Express" summary modal: last place, a replay of
 * the roulette spin that decided their punishment, a Bufón one-liner, and a
 * WhatsApp share button — all in one place, no navigation.
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
    <div class="modal-content glass" style="max-width: 420px; width: 92%; border: 2.5px solid #000; box-shadow: 6px 6px 0px #000; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 2px solid #000;">
        <h3 style="font-family: var(--font-display); font-weight: 900; font-size: 1.05rem; text-transform: uppercase; margin: 0;">Resumen Exprés de la Jornada</h3>
        <button id="jornada-express-close" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
      </div>
      <div id="jornada-express-body" style="padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; min-height: 200px; justify-content: center;">
        <span class="spinner" style="width: 32px; height: 32px;"></span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const body = modal.querySelector('#jornada-express-body');
  const close = () => modal.remove();
  modal.querySelector('#jornada-express-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  try {
    // 1. Last complete record for this league (loser + punishment already assigned)
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

    // Step 1: colista
    body.innerHTML = `
      <div style="text-align: center;">
        <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px;">Colista de la Jornada</span>
        <h2 style="font-family: var(--font-display); font-weight: 900; font-size: 1.6rem; margin: 0.25rem 0; color: var(--danger);">${escapeHTML(loserName)}</h2>
        ${record.loser_points != null ? `<span style="font-size: 0.85rem; color: var(--text-light);">${record.loser_points} pts</span>` : ''}
        <span class="brutalist-badge" style="display: block; margin: 0.5rem auto 0; width: fit-content; background: var(--danger); color: #fff; border-color: #000;">Último</span>
      </div>
    `;

    if (!punishment) {
      body.insertAdjacentHTML('beforeend', `<p style="color: var(--text-muted); text-align: center; font-size: 0.85rem;">El castigo asignado ya no está disponible.</p>`);
      renderBufonAndShare(body, loserName, null);
      return;
    }

    // 2. Fetch the league's current punishment pool to find where this one sits
    const { data: punList } = await supabase
      .from('punishments')
      .select('*')
      .eq('league_id', leagueId);

    const winningIdx = (punList || []).findIndex(p => p.id === punishment.id);

    if (!punList || winningIdx === -1) {
      // Punishment no longer in the active pool — skip the spin, show result directly.
      renderPunishmentCard(body, punishment);
      renderBufonAndShare(body, loserName, punishment);
      return;
    }

    // Step 2: wheel replay (after a short pause, matching the "3 pasos seguidos" pacing)
    setTimeout(() => {
      const wheelWrap = document.createElement('div');
      wheelWrap.style.cssText = 'position: relative; width: 220px; height: 220px;';
      wheelWrap.innerHTML = `
        <canvas width="220" height="220" style="border-radius: 50%; border: 4px solid #000;"></canvas>
        <div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 16px solid var(--accent);"></div>
      `;
      body.appendChild(wheelWrap);
      const canvas = wheelWrap.querySelector('canvas');
      drawWheel(canvas, punList);

      setTimeout(() => {
        spinToIndex(canvas, {
          punishments: punList,
          winningIdx,
          onComplete: () => {
            renderPunishmentCard(body, punishment);
            renderBufonAndShare(body, loserName, punishment);
          }
        });
      }, 400);
    }, 600);
  } catch (err) {
    console.error('Error loading Jornada Express:', err);
    body.innerHTML = `<p style="color: var(--danger); text-align: center; font-size: 0.85rem;">Error al cargar el resumen de la jornada.</p>`;
  }
}

function renderPunishmentCard(body, punishment) {
  const card = document.createElement('div');
  card.className = 'brutalist-card';
  card.style.cssText = 'text-align: center; padding: 1rem; margin: 0; width: 100%;';
  card.innerHTML = `
    <h4 style="font-family: var(--font-display); font-weight: 900; font-size: 1.05rem; margin: 0 0 0.35rem;">${escapeHTML(punishment.name)}</h4>
    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">${escapeHTML(punishment.description || '')}</p>
  `;
  body.appendChild(card);
}

function renderBufonAndShare(body, loserName, punishment) {
  const bufonLine = getRandomBufonLine(loserName);

  const bufonEl = document.createElement('p');
  bufonEl.style.cssText = 'font-size: 0.85rem; font-style: italic; color: var(--accent); text-align: center; margin: 0; opacity: 0; transition: opacity 0.4s;';
  bufonEl.textContent = `"${bufonLine}"`;
  body.appendChild(bufonEl);
  requestAnimationFrame(() => { bufonEl.style.opacity = '1'; });

  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn-primary';
  shareBtn.style.cssText = 'width: 100%; font-weight: 900; text-transform: uppercase; font-size: 1rem; padding: 1rem; margin-top: 0.5rem;';
  shareBtn.textContent = 'Compartir en WhatsApp 📲';
  shareBtn.addEventListener('click', () => {
    const punishmentLine = punishment ? `*${punishment.name}*\n_${punishment.description || ''}_` : 'castigo pendiente';
    const shareText = encodeURIComponent(
      `*Resumen de la Jornada* 🎉\n\nColista: *${loserName}*\n\n${punishmentLine}\n\n"${bufonLine}"\n\n${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  });
  body.appendChild(shareBtn);
}
