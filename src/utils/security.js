/**
 * Helper to escape HTML and prevent XSS (Cross-Site Scripting).
 * Always use this function when inserting user-generated text into innerHTML.
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
