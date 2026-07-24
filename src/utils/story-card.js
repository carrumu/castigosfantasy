import QRCode from 'qrcode';

const WIDTH = 1080;
const HEIGHT = 1920;
const SITE_URL = 'https://castigosfantasy.com';

const COLOR = {
  bg: '#131313',
  card: '#20201f',
  ink: '#0e0e0e',
  accent: '#deed00',
  accentDeep: '#c3d000',
  danger: '#d30017',
  bone: '#e5e2e1',
  muted: '#c8c8ab',
  black: '#000000',
  white: '#ffffff'
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Wraps text to fit maxWidth, returning an array of lines. */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  words.forEach(word => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function roundRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/**
 * Draws a "sticker" card: a hard black offset shadow behind a rounded,
 * black-bordered fill — the brutalist signature used across the app
 * (2-3px hard offset, not a blurred drop shadow).
 */
function drawStickerCard(ctx, x, y, width, height, { fill = COLOR.card, radius = 24, offset = 10, borderWidth = 5 } = {}) {
  ctx.fillStyle = COLOR.black;
  roundRectPath(ctx, x + offset, y + offset, width, height, radius);
  ctx.fill();

  ctx.fillStyle = fill;
  ctx.strokeStyle = COLOR.black;
  ctx.lineWidth = borderWidth;
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();
}

function drawEyebrow(ctx, text, centerX, y) {
  ctx.fillStyle = COLOR.accent;
  ctx.font = '800 30px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text.toUpperCase(), centerX, y);
}

/**
 * Generates a 1080x1920 (9:16) branded "story card" summarizing the week's
 * loser, points, and punishment — meant for sharing to Instagram Stories /
 * WhatsApp Estado.
 * @param {Object} data
 * @param {string} data.loserName
 * @param {number|null} [data.points]
 * @param {string} data.punishmentName
 * @param {string} [data.punishmentDescription]
 * @returns {Promise<Blob>}
 */
export async function generateStoryCardBlob({ loserName, points, punishmentName, punishmentDescription }) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // Ensure Syne is actually loaded before drawing text — canvas silently
  // falls back to a system font otherwise on first paint.
  await Promise.all([
    document.fonts.load('800 96px Syne'),
    document.fonts.load('800 44px Syne'),
    document.fonts.load('700 32px Syne'),
    document.fonts.load('600 32px Syne'),
    document.fonts.ready
  ]);

  // --- Background: obsidian base with a two-corner glow (lime top, danger
  // bottom) for depth without breaking the "one scream" accent scarcity.
  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowTop = ctx.createRadialGradient(WIDTH, 0, 0, WIDTH, 0, 950);
  glowTop.addColorStop(0, 'rgba(222, 237, 0, 0.16)');
  glowTop.addColorStop(1, 'rgba(222, 237, 0, 0)');
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowBottom = ctx.createRadialGradient(0, HEIGHT, 0, 0, HEIGHT, 800);
  glowBottom.addColorStop(0, 'rgba(211, 0, 23, 0.10)');
  glowBottom.addColorStop(1, 'rgba(211, 0, 23, 0)');
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Top brand bar — instant recognition even as a thumbnail.
  ctx.fillStyle = COLOR.accent;
  ctx.fillRect(0, 0, WIDTH, 22);

  let y = 130;

  // --- Logo + wordmark
  // logo.png is a wide 1376x768 mark, not square — force-fitting it into a
  // 128x128 box squashed the "CF" glyph. Scale by width and derive height
  // from the image's own aspect ratio instead.
  try {
    const logo = await loadImage('/logo.png');
    const logoWidth = 300;
    const logoHeight = logoWidth * (logo.height / logo.width);
    ctx.drawImage(logo, WIDTH / 2 - logoWidth / 2, y, logoWidth, logoHeight);
    y += logoHeight + 30;
  } catch (_) {
    y += 20;
  }
  ctx.fillStyle = COLOR.bone;
  ctx.font = '800 40px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CASTIGOS FANTASY', WIDTH / 2, y);
  y += 110;

  // --- Colista block
  drawEyebrow(ctx, 'Colista de la jornada', WIDTH / 2, y);
  y += 60;

  const avatarRadius = 100;
  const avatarCenterY = y + avatarRadius;
  const initial = (loserName || '?').trim().charAt(0).toUpperCase();

  ctx.beginPath();
  ctx.arc(WIDTH / 2 + 8, avatarCenterY + 8, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.black;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(WIDTH / 2, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.accent;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = COLOR.black;
  ctx.stroke();

  ctx.fillStyle = COLOR.black;
  ctx.font = '800 100px Syne, sans-serif';
  ctx.fillText(initial, WIDTH / 2, avatarCenterY + 35);
  y = avatarCenterY + avatarRadius + 70;

  // Loser name (shrink if too long)
  let nameFontSize = 88;
  if (loserName.length > 12) nameFontSize = 70;
  if (loserName.length > 18) nameFontSize = 56;
  if (loserName.length > 26) nameFontSize = 44;
  ctx.fillStyle = COLOR.bone;
  ctx.font = `800 ${nameFontSize}px Syne, sans-serif`;
  ctx.fillText(loserName, WIDTH / 2, y);
  y += 50;

  // Points — scoreboard chip instead of plain text
  if (points != null) {
    const chipText = `${points} PTS ESTA JORNADA`;
    ctx.font = '800 30px Syne, sans-serif';
    const chipWidth = ctx.measureText(chipText).width + 60;
    const chipHeight = 64;
    drawStickerCard(ctx, WIDTH / 2 - chipWidth / 2, y, chipWidth, chipHeight, {
      fill: COLOR.danger, radius: 32, offset: 6, borderWidth: 4
    });
    ctx.fillStyle = COLOR.white;
    ctx.fillText(chipText, WIDTH / 2, y + chipHeight / 2 + 11);
    y += chipHeight + 70;
  } else {
    y += 40;
  }

  // --- Punishment card
  drawEyebrow(ctx, 'Castigo asignado', WIDTH / 2, y);
  y += 45;

  const cardX = 90;
  const cardWidth = WIDTH - cardX * 2;
  const cardPadding = 50;
  ctx.font = '800 46px Syne, sans-serif';
  const nameLines = wrapText(ctx, punishmentName || '', cardWidth - cardPadding * 2);
  ctx.font = '600 32px Syne, sans-serif';
  const descLines = punishmentDescription
    ? wrapText(ctx, punishmentDescription, cardWidth - cardPadding * 2)
    : [];

  const cardHeight = cardPadding * 2 + nameLines.length * 58 + (descLines.length ? 24 + descLines.length * 44 : 0);
  drawStickerCard(ctx, cardX, y, cardWidth, cardHeight);

  let textY = y + cardPadding + 42;
  ctx.fillStyle = COLOR.bone;
  ctx.font = '800 46px Syne, sans-serif';
  nameLines.forEach(line => {
    ctx.fillText(line, WIDTH / 2, textY);
    textY += 58;
  });
  if (descLines.length) {
    textY += 14;
    ctx.fillStyle = COLOR.muted;
    ctx.font = '600 32px Syne, sans-serif';
    descLines.forEach(line => {
      ctx.fillText(line, WIDTH / 2, textY);
      textY += 44;
    });
  }
  y += cardHeight + 30 + 70;

  // --- QR: pure black-on-white for reliable scanning (a QR needs strong
  // contrast — lime-on-black looked "on brand" but scanned poorly), framed
  // in a white sticker chip, pointing at the real production domain (not
  // window.location.origin, which is localhost in dev and would produce a
  // QR nobody else's phone can ever reach).
  try {
    const qrSize = 260;
    const qrPad = 24;
    const boxSize = qrSize + qrPad * 2;
    drawStickerCard(ctx, WIDTH / 2 - boxSize / 2, y, boxSize, boxSize, {
      fill: COLOR.white, radius: 20, offset: 8, borderWidth: 5
    });

    const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
      margin: 0,
      width: qrSize,
      color: { dark: '#000000', light: '#ffffff' }
    });
    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, WIDTH / 2 - qrSize / 2, y + qrPad, qrSize, qrSize);
    y += boxSize + 45;
  } catch (err) {
    console.error('Error generating QR code:', err);
    y += 30;
  }

  ctx.fillStyle = COLOR.muted;
  ctx.font = '700 28px Syne, sans-serif';
  ctx.fillText('ESCANEA Y ÚNETE A TU LIGA', WIDTH / 2, y);
  y += 60;

  // Footer
  ctx.strokeStyle = 'rgba(222, 237, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 80, Math.min(y, HEIGHT - 90));
  ctx.lineTo(WIDTH / 2 + 80, Math.min(y, HEIGHT - 90));
  ctx.stroke();
  y += 45;

  ctx.fillStyle = COLOR.bone;
  ctx.font = '800 32px Syne, sans-serif';
  ctx.fillText('castigosfantasy.com', WIDTH / 2, Math.min(y, HEIGHT - 50));

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
