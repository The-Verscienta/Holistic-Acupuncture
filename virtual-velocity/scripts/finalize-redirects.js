/**
 * Rewrites dist/client/_redirects so every rule actually loads on Cloudflare
 * Workers static assets, and adds permanent trailing-slash redirects.
 * Run after `astro build`: postbuild in package.json.
 *
 * 1. Static rules first. Cloudflare's parser treats every rule that comes
 *    *after* the first splat/placeholder rule as dynamic, and it silently
 *    skips everything past the 100th dynamic rule. public/_redirects has its
 *    first wildcard near the top, so ~160 exact-path rules were being
 *    dropped (on Pages too). At request time static rules are always checked
 *    before dynamic ones regardless of file order, so hoisting them doesn't
 *    change which rule wins.
 *
 * 2. `/dir /dir/ 301` for every `<dir>/index.html`. Pages redirected these
 *    with a 308 (permanent). Workers' `html_handling: auto-trailing-slash`
 *    does the same redirect but always with a 307 (temporary), which is weaker
 *    for SEO. `_redirects` runs before html_handling, so an explicit rule keeps
 *    it permanent. Where `/dir/` itself already redirects, `/dir` goes straight
 *    to that target (one hop). Paths that already have a rule are left alone.
 *
 * 3. Rules that redirect into a page that doesn't exist (posts that were
 *    never migrated) fall back to the destination of the meta-refresh page
 *    at the same path (public/<slug>/index.html, from the
 *    generate-*-redirect* scripts), which is what production served while
 *    those rules sat past the cutoff. Rules with no such fallback are listed
 *    as warnings. "Exists" = a built directory page or a sitemap URL (SSR
 *    blog posts appear in the sitemap via their search-index shadow pages).
 *    For a directory with no rule at all, the meta-refresh destination is
 *    used directly, so `/slug` is a single 301 instead of 301 + meta refresh.
 *
 * 4. Rule targets that are a directory page without its trailing slash
 *    (`/x /conditions/x 301`) get the slash added, saving a hop.
 *
 * Fails the build if Cloudflare's limits would be exceeded, rather than
 * letting rules be dropped silently.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'client');
const redirectsFile = join(clientDir, '_redirects');
const SKIP_TOP_LEVEL = new Set(['_astro', 'pagefind']);
// developers.cloudflare.com/workers/static-assets/redirects/
const MAX_STATIC = 2000;
const MAX_DYNAMIC = 100;
const isDynamic = (source) => /\*|:[A-Za-z]/.test(source);

if (!existsSync(clientDir)) throw new Error(`finalize-redirects: ${clientDir} not found; run astro build first`);

function dirPages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (dir === clientDir && SKIP_TOP_LEVEL.has(name)) continue;
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, 'index.html'))) out.push('/' + relative(clientDir, p).split('\\').join('/'));
    out.push(...dirPages(p));
  }
  return out;
}

const dirs = new Set(dirPages(clientDir));

// `/slug` → destination of public/slug/index.html, for meta-refresh pages.
const metaTargets = new Map();
for (const dir of dirs) {
  const html = readFileSync(join(clientDir, dir, 'index.html'), 'utf8');
  if (!/http-equiv=["']?refresh/i.test(html)) continue;
  const url = html.match(/content=["']\d+;\s*url=([^"'>\s]+)/i)?.[1];
  if (url) metaTargets.set(dir, url.replace(/^https?:\/\/(www\.)?holisticacupuncture\.net/, ''));
}
const withSlash = (target) => (dirs.has(target) ? `${target}/` : target);

const sitemapFile = join(clientDir, 'sitemap-0.xml');
const sitemapPaths = existsSync(sitemapFile)
  ? [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  : [];
const existing = new Set(['/', ...dirs, ...sitemapPaths].map((p) => p.replace(/(.)\/$/, '$1')));
// Targets with splats/placeholders, external URLs, or non-HTML files are assumed fine.
const targetExists = (target) => {
  if (/:[A-Za-z]|\*|^https?:/.test(target)) return true;
  const path = target.replace(/[?#].*$/, '');
  return existing.has(path.replace(/(.)\/$/, '$1')) || /\.[a-z0-9]+$/i.test(path);
};

let retargeted = 0;
const broken = [];
const rules = (existsSync(redirectsFile) ? readFileSync(redirectsFile, 'utf8') : '')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [source, target, ...rest] = l.split(/\s+/);
    if (targetExists(target)) return [source, withSlash(target), ...rest].join(' ');
    const meta = metaTargets.get(source.replace(/\/$/, ''));
    if (meta && targetExists(meta)) {
      retargeted++;
      return [source, withSlash(meta), ...rest].join(' ');
    }
    broken.push(l);
    return l;
  });

// First rule for a source wins, matching Cloudflare's behaviour.
const targets = new Map();
for (const rule of rules) {
  const [source, target] = rule.split(/\s+/);
  if (!targets.has(source)) targets.set(source, target);
}

const staticRules = rules.filter((r) => !isDynamic(r.split(/\s+/)[0]));
const dynamicRules = rules.filter((r) => isDynamic(r.split(/\s+/)[0]));
const slashRules = [...dirs]
  .filter((path) => !targets.has(path))
  .sort()
  .map((path) => `${path} ${withSlash(targets.get(`${path}/`) ?? metaTargets.get(path) ?? `${path}/`)} 301`);

const staticCount = staticRules.length + slashRules.length;
if (staticCount > MAX_STATIC) throw new Error(`finalize-redirects: ${staticCount} static rules exceeds the limit of ${MAX_STATIC}`);
if (dynamicRules.length > MAX_DYNAMIC) {
  throw new Error(`finalize-redirects: ${dynamicRules.length} dynamic rules exceeds the limit of ${MAX_DYNAMIC}`);
}

writeFileSync(
  redirectsFile,
  [
    '# Generated by scripts/finalize-redirects.js from public/_redirects.',
    '# Static rules must precede splat/placeholder rules, or Cloudflare treats them as dynamic (max 100).',
    '',
    '# --- Static rules ---',
    ...staticRules,
    '',
    '# --- Permanent trailing-slash redirects (Workers html_handling would 307) ---',
    ...slashRules,
    '',
    '# --- Dynamic rules (splats / placeholders) ---',
    ...dynamicRules,
    '',
  ].join('\n'),
);
console.log(
  `finalize-redirects: ${staticRules.length} static + ${slashRules.length} trailing-slash + ${dynamicRules.length} dynamic rules` +
    ` (${retargeted} broken targets replaced by their meta-refresh destination)`,
);
if (broken.length) {
  console.warn(`finalize-redirects: WARNING ${broken.length} rules redirect to a page that doesn't exist:\n  ${broken.join('\n  ')}`);
}
