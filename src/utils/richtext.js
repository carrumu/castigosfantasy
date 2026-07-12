/**
 * Safe rich-text helpers for user-generated content (forum posts/comments).
 *
 * linkifyInto builds the content out of DOM text nodes + <a> elements — it never
 * touches innerHTML, so there is no HTML-injection/XSS surface. Only http(s)
 * URLs are turned into links.
 *
 * createLinkPreview returns a small, clickable preview card for a URL
 * (YouTube thumbnail, direct image, or a generic favicon + domain card).
 */

import { supabase } from '../supabase.js';

const URL_RE = /(https?:\/\/[^\s<]+)/g;

/**
 * Replace the text content of `el` with text nodes and clickable links.
 * @returns {string|null} the first URL found (for building a preview), or null.
 */
export function linkifyInto(el, text) {
  el.textContent = '';
  if (!text) return null;

  let lastIndex = 0;
  let firstUrl = null;
  let m;
  URL_RE.lastIndex = 0;

  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      el.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }

    let url = m[1];
    // Trailing punctuation is usually sentence punctuation, not part of the URL.
    const trailing = url.match(/[.,;:!?)\]}'"]+$/);
    let suffix = '';
    if (trailing) {
      suffix = trailing[0];
      url = url.slice(0, url.length - suffix.length);
    }

    const a = document.createElement('a');
    a.href = url;                 // only http(s) matched, so this is safe
    a.textContent = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'forum-link';
    el.appendChild(a);

    if (suffix) el.appendChild(document.createTextNode(suffix));
    if (!firstUrl) firstUrl = url;

    lastIndex = m.index + m[1].length;
  }

  if (lastIndex < text.length) {
    el.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return firstUrl;
}

function getYouTubeId(u) {
  try {
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1) || null;
    if (host.endsWith('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const mShorts = u.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
      if (mShorts) return mShorts[1];
    }
  } catch (_) {}
  return null;
}

/**
 * Build a clickable preview card element for a URL, or null if the URL is unsafe.
 */
export function createLinkPreview(url) {
  let u;
  try { u = new URL(url); } catch (_) { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

  const host = u.hostname.replace(/^www\./, '');

  const card = document.createElement('a');
  card.href = url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'link-preview';

  // 1. YouTube → video thumbnail
  const ytId = getYouTubeId(u);
  if (ytId) {
    card.classList.add('link-preview-video');
    const thumb = document.createElement('div');
    thumb.className = 'link-preview-video-thumb';
    thumb.style.backgroundImage = `url("https://img.youtube.com/vi/${ytId}/hqdefault.jpg")`;
    const play = document.createElement('div');
    play.className = 'link-preview-video-play';
    play.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    thumb.appendChild(play);
    card.appendChild(thumb);
    card.appendChild(buildBody(host, url, 'Ver en YouTube'));
    return card;
  }

  // 2. Direct image → inline image
  if (/\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(u.pathname)) {
    card.classList.add('link-preview-image');
    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.alt = 'Imagen compartida';
    img.addEventListener('error', () => card.replaceWith(genericCard(url, host)));
    card.appendChild(img);
    return card;
  }

  // 3. Generic → favicon + domain
  return genericCard(url, host);
}

function genericCard(url, host) {
  const card = document.createElement('a');
  card.href = url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'link-preview';

  const fav = document.createElement('img');
  fav.className = 'link-preview-favicon';
  fav.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  fav.alt = '';
  fav.addEventListener('error', () => {
    const fb = document.createElement('span');
    fb.className = 'link-preview-fallback material-symbols-outlined';
    fb.textContent = 'link';
    fav.replaceWith(fb);
  });
  card.appendChild(fav);

  card.appendChild(buildBody(host, url));

  const open = document.createElement('span');
  open.className = 'link-preview-open material-symbols-outlined';
  open.textContent = 'open_in_new';
  card.appendChild(open);

  // Upgrade to a rich Open Graph card (image + title + description) in the
  // background; if it fails or has no data, the favicon card stays.
  enhanceWithOpenGraph(card, url, host).catch(() => {});

  return card;
}

async function fetchOpenGraph(url) {
  try {
    const base = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';
    if (!base) return null;

    let token = anon;
    try {
      const s = await supabase.auth.getSession();
      if (s.data?.session?.access_token) token = s.data.session.access_token;
    } catch (_) {}

    const res = await fetch(`${base}/functions/v1/link-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'apikey': anon },
      body: JSON.stringify({ url })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data && (data.title || data.image)) ? data : null;
  } catch (_) {
    return null;
  }
}

async function enhanceWithOpenGraph(card, url, host) {
  const og = await fetchOpenGraph(url);
  if (!og || !card.isConnected) return;

  card.textContent = '';
  card.classList.remove('link-preview-video', 'link-preview-image');
  card.classList.add('link-preview-rich');

  if (og.image) {
    const img = document.createElement('img');
    img.className = 'link-preview-rich-img';
    img.loading = 'lazy';
    img.alt = '';
    img.src = og.image; // property assignment: no CSS/HTML injection
    img.addEventListener('error', () => img.remove());
    card.appendChild(img);
  }

  const body = document.createElement('div');
  body.className = 'link-preview-rich-body';
  if (og.title) {
    const t = document.createElement('span');
    t.className = 'link-preview-title';
    t.textContent = og.title;
    body.appendChild(t);
  }
  if (og.description) {
    const d = document.createElement('span');
    d.className = 'link-preview-desc';
    d.textContent = og.description;
    body.appendChild(d);
  }
  const dm = document.createElement('span');
  dm.className = 'link-preview-domain-sm';
  dm.textContent = og.siteName || host;
  body.appendChild(dm);
  card.appendChild(body);
}

function buildBody(host, url, label) {
  const body = document.createElement('div');
  body.className = 'link-preview-body';
  const domain = document.createElement('span');
  domain.className = 'link-preview-domain';
  domain.textContent = label || host;
  const link = document.createElement('span');
  link.className = 'link-preview-url';
  link.textContent = url;
  body.appendChild(domain);
  body.appendChild(link);
  return body;
}
