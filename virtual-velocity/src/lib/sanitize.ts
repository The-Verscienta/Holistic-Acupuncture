/**
 * Sanitization helpers for safe HTML output (e.g. portable text from CMS).
 * Prevents XSS from user/CMS-controlled content.
 */

/**
 * Escape HTML special characters to prevent XSS when inserting text into HTML.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Return href only if it is a safe http or https URL; otherwise return null (no link).
 * Prevents javascript:, data:, vbscript:, etc.
 */
export function safeHref(href: string | undefined | null): string | null {
  if (!href || typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') return trimmed;
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Return a URL string only if it looks like a safe http(s) or relative path for img src.
 * For Sanity image URLs we allow https and relative; block javascript:, data:, etc.
 */
export function safeImageSrc(src: string | undefined | null): string {
  if (!src || typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  // Sanity CDN and similar
  if (trimmed.startsWith('image@')) return trimmed;
  return '';
}
