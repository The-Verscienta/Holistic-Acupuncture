/**
 * Overwrite dist/_routes.json with a minimal config so no rule exceeds
 * Cloudflare's 100-character limit (Error 8000057).
 *
 * Run after `astro build` when deploying to Cloudflare Pages:
 *   npm run build && node scripts/fix-cloudflare-routes.js
 *
 * Or use postbuild in package.json.
 */
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const routesPath = join(distDir, '_routes.json');

const MAX_LEN = 100;
const routes = {
  version: 1,
  include: [
    '/api/*',  // API routes (contact, newsletter, testimonial, search)
    '/blog',   // Blog index (prerender = false)
  ],
  exclude: [],
};

// Validate all patterns are under Cloudflare's limit
const allPatterns = [...routes.include, ...routes.exclude];
const over = allPatterns.filter((p) => p.length > MAX_LEN);
if (over.length > 0) {
  console.error(`fix-cloudflare-routes: pattern(s) over ${MAX_LEN} chars:`, over);
  process.exit(1);
}

if (!existsSync(routesPath)) {
  // No Cloudflare build output; skip (e.g. local Node adapter build)
  process.exit(0);
}

writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
console.log('fix-cloudflare-routes: wrote dist/_routes.json (all rules under 100 chars)');
