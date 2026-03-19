/**
 * Write a minimal _routes.json so only API routes go to the Worker.
 * Everything else is served as static assets (so _redirects rules fire).
 *
 * Writes to both dist/ and dist/client/ to cover both locations that
 * @astrojs/cloudflare may use depending on the output mode.
 *
 * Run after `astro build`: postbuild in package.json.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const routes = {
  version: 1,
  include: [
    '/api/*',  // Server-side API routes (contact, newsletter, testimonial, search)
    '/blog',   // Blog index is SSR (pagination/filtering via query params)
  ],
  exclude: [],
};

if (!existsSync(distDir)) {
  console.log('fix-cloudflare-routes: dist/ not found, skipping.');
  process.exit(0);
}

const content = JSON.stringify(routes, null, 2);

// Write to dist/_routes.json (Cloudflare Pages root)
writeFileSync(join(distDir, '_routes.json'), content, 'utf8');
console.log('fix-cloudflare-routes: wrote dist/_routes.json');

// Also write to dist/client/_routes.json (used by @astrojs/cloudflare server mode)
const clientDir = join(distDir, 'client');
if (existsSync(clientDir)) {
  writeFileSync(join(clientDir, '_routes.json'), content, 'utf8');
  console.log('fix-cloudflare-routes: wrote dist/client/_routes.json');
}
