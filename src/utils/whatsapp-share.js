/**
 * Compartir en WhatsApp desde la home de invitados.
 *
 * Es el canal donde ya vive cada liga de fantasy: el grupo. Un castigo o un
 * bote calculado se comparte ahí en un toque y arrastra al resto del grupo de
 * vuelta a la web, que es el único crecimiento que este producto tiene gratis.
 *
 * En móvil `wa.me` abre la app; en escritorio abre WhatsApp Web. No hace falta
 * SDK ni script de terceros, así que funciona con la CSP estricta.
 */

const SITE = 'https://castigosfantasy.com';

/**
 * @param {string} message Texto ya redactado, sin la URL (se añade al final).
 * @param {boolean} [withLink=true] Añadir el enlace de la web al mensaje.
 */
export function shareOnWhatsApp(message, withLink = true) {
  const text = withLink ? `${message}\n\n${SITE}` : message;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

/**
 * Botón de compartir con el look de la marca. Devuelve HTML; el llamador
 * engancha el listener sobre `[data-share]` con el mensaje que toque.
 */
export function shareButton(label = 'Mandarlo al grupo') {
  return `
    <button type="button" class="wa-share-btn" data-share>
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24z"/>
      </svg>
      <span>${label}</span>
    </button>`;
}
