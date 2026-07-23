// Standalone wheel drawing + "spin to a known result" animation, used by
// jornada-express.js to replay an already-decided punishment. Mirrors the
// canvas drawing and rotation math in roulette.js's drawWheel()/spinWheel(),
// but deliberately kept separate rather than importing from that file: the
// live roulette decides the winner with Math.random() and writes the result
// to Supabase, and this module must never touch either of those — duplicating
// the ~70 lines of pure rendering math is a smaller risk than refactoring a
// working, payment-adjacent feature to share code with a one-shot replay.

const WHEEL_COLORS = [
  '#6366f1', // indigo
  '#4f46e5', // indigo dark
  '#f43f5e', // rose
  '#db2777', // pink/rose dark
  '#1e293b', // charcoal
  '#0f172a'  // dark slate
];

/**
 * Draws the punishment wheel sectors onto a canvas at rest (no rotation).
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{name: string}>} punishments
 */
export function drawWheel(canvas, punishments) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const center = width / 2;
  ctx.clearRect(0, 0, width, height);

  if (!punishments || punishments.length === 0) {
    ctx.beginPath();
    ctx.arc(center, center, center - 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#20201f';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#3a3a3a';
    ctx.stroke();
    return;
  }

  const arcLength = (2 * Math.PI) / punishments.length;

  for (let i = 0; i < punishments.length; i++) {
    const angle = i * arcLength;
    ctx.beginPath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 15, angle, angle + arcLength);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + arcLength / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.95)";
    ctx.shadowBlur = 6;

    const nameText = punishments[i].name;
    let fontSize = 28;
    if (nameText.length > 15) fontSize = 24;
    if (nameText.length > 22) fontSize = 20;
    if (nameText.length > 30) fontSize = 16;
    if (nameText.length > 38) fontSize = 13;
    ctx.font = `bold ${fontSize}px Syne, sans-serif`;

    let displayName = nameText;
    if (nameText.length > 45) {
      displayName = nameText.substring(0, 42) + "...";
    }

    const verticalOffset = fontSize / 3;
    ctx.fillText(displayName, center - 35, verticalOffset);
    ctx.restore();
  }
}

/**
 * Animates the wheel spinning to land on a known index (no randomness, no
 * persistence) — a replay of an already-decided result.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opts
 * @param {Array} opts.punishments
 * @param {number} opts.winningIdx
 * @param {Function} [opts.onComplete]
 */
export function spinToIndex(canvas, { punishments, winningIdx, onComplete }) {
  if (!canvas || !punishments || punishments.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  const sectorsCount = punishments.length;
  const sliceAngle = 360 / sectorsCount;
  const winningMidAngle = (winningIdx * sliceAngle) + (sliceAngle / 2);
  const targetOffset = (270 - winningMidAngle + 360) % 360;
  const finalRot = 1800 + targetOffset;

  canvas.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1)';
  canvas.style.transform = `rotate(${finalRot}deg)`;

  canvas.addEventListener('transitionend', function handleEnd() {
    canvas.removeEventListener('transitionend', handleEnd);
    if (onComplete) onComplete();
  });
}
