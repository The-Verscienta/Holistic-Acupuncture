/**
 * Hover-prefetch opt-in (astro.config.mjs: prefetchAll false, defaultStrategy 'hover').
 *
 * Returns the value for a link's `data-astro-prefetch` attribute: `''` (use the
 * default strategy) for internal content pages, `undefined` (attribute omitted)
 * for everything else. Must be an empty string, not `true`: Astro's client only
 * matches `''` or an explicit strategy name.
 * Booking/call pages and API routes are excluded so a hover never fires a
 * conversion, analytics hit or cookie-setting request.
 */
import { BOOK_PATH } from './config';

const NO_PREFETCH_PREFIXES = [BOOK_PATH, '/call', '/api/'];

export function prefetchAttr(href: string | undefined): '' | undefined {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return undefined;
  const path = href.split(/[?#]/)[0];
  const blocked = NO_PREFETCH_PREFIXES.some(
    (p) => path === p || path.startsWith(p.endsWith('/') ? p : `${p}/`),
  );
  return blocked ? undefined : '';
}
