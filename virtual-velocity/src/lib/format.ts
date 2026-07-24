// Date/text formatting helpers shared by the blog and reviews pages.
// (Formerly part of lib/sanity.ts; the Sanity client half was removed with the
// Sanity → Kiln migration.)

// Helper function to format dates
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format relative dates
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Decode HTML entities from WordPress content
// Only decodes known safe entities to prevent XSS via character code injection
const UNSAFE_CHAR_CODES = new Set([34, 38, 39, 60, 62]); // " & ' < >
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, code) => {
      const charCode = parseInt(code, 10);
      if (UNSAFE_CHAR_CODES.has(charCode)) return match;
      return String.fromCharCode(charCode);
    });
}
