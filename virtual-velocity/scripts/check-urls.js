#!/usr/bin/env node
/**
 * URL behaviour baseline for the Pages → Workers migration
 * (docs/ASTRO-7-WORKERS-MIGRATION.md, Phase 0).
 *
 *   node scripts/check-urls.js record  https://holisticacupuncture.net
 *       Builds the URL list, fetches each URL from the host (no redirect
 *       following) and writes scripts/baseline-urls.json.
 *
 *   node scripts/check-urls.js compare https://<preview-host>
 *       Re-fetches every path in baseline-urls.json from another host and
 *       prints the differences. Exits 1 if anything differs.
 *
 * URL list = sitemap URLs + every _redirects source (wildcards filled with a
 * sample segment) + every public/** /index.html redirect page + a few
 * /blog/<slug>/ and /api/* paths. Only GET requests are made.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'baseline-urls.json');
const SITE = 'https://holisticacupuncture.net';
const HEADERS = ['location', 'content-security-policy', 'cache-control', 'content-type'];
// SSR blog pages each hit the Kiln API; more parallelism than this produces
// spurious 500s from the backend.
const CONCURRENCY = Number(process.env.CHECK_URLS_CONCURRENCY || 3);

const [mode, hostArg] = process.argv.slice(2);
if (!['record', 'compare'].includes(mode) || !hostArg) {
  console.error('usage: node scripts/check-urls.js <record|compare> <host-url>');
  process.exit(2);
}
const host = hostArg.replace(/\/$/, '');

function sitemapPaths() {
  const files = ['dist/client/sitemap-0.xml', 'dist/sitemap-0.xml'].map((f) => join(ROOT, f));
  const file = files.find(existsSync);
  if (!file) {
    console.warn('check-urls: no built sitemap found (run npm run build first); skipping sitemap URLs');
    return [];
  }
  const xml = readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

function redirectSources() {
  const text = readFileSync(join(ROOT, 'public', '_redirects'), 'utf8');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/)[0].replace(/\*/g, 'sample-path').replace(/:\w+/g, 'sample'));
}

function redirectPages(dir = join(ROOT, 'public')) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...redirectPages(p));
    else if (name === 'index.html' && /http-equiv=["']?refresh/i.test(readFileSync(p, 'utf8'))) {
      out.push('/' + relative(join(ROOT, 'public'), dirname(p)).split('\\').join('/') + '/');
    }
  }
  return out;
}

function extraPaths(sitemap) {
  const blog = sitemap.filter((p) => /^\/blog\/[^/]+\/$/.test(p) && !p.startsWith('/blog/page/'));
  return [
    '/blog',
    '/blog/',
    '/blog/page/2/',
    ...blog.slice(0, 5),
    '/blog/this-post-does-not-exist/',
    '/this-page-does-not-exist/',
    '/api/search?q=acupuncture',
    '/api/phone-click',
    '/api/contact',
    '/api/indexnow-webhook',
    '/sitemap-index.xml',
    '/robots.txt',
    '/_headers',
    '/pagefind/pagefind.js',
  ];
}

async function probe(path, attempt = 1) {
  try {
    const res = await fetch(host + path, { redirect: 'manual', headers: { 'user-agent': 'check-urls/1.0' } });
    const headers = {};
    for (const h of HEADERS) {
      let v = res.headers.get(h);
      // Make absolute Locations on the probed host comparable across hosts.
      if (v && h === 'location') v = v.replace(host, '').replace(SITE, '');
      if (v !== null) headers[h] = v;
    }
    await res.body?.cancel();
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return probe(path, attempt + 1);
    }
    return { status: res.status, headers };
  } catch (e) {
    return { status: 0, error: String(e.message || e) };
  }
}

async function probeAll(paths) {
  const results = {};
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < paths.length) {
        const p = paths[i++];
        results[p] = await probe(p);
      }
    }),
  );
  return Object.fromEntries(paths.map((p) => [p, results[p]]));
}

if (mode === 'record') {
  const sitemap = sitemapPaths();
  const paths = [...new Set([...sitemap, ...redirectSources(), ...redirectPages(), ...extraPaths(sitemap)])].sort();
  console.log(`check-urls: probing ${paths.length} URLs on ${host}…`);
  const results = await probeAll(paths);
  writeFileSync(BASELINE, JSON.stringify({ host, recordedAt: new Date().toISOString(), results }, null, 2) + '\n');
  console.log(`check-urls: wrote ${relative(ROOT, BASELINE)}`);
} else {
  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const paths = Object.keys(baseline.results);
  console.log(`check-urls: comparing ${paths.length} URLs on ${host} against ${baseline.host} (${baseline.recordedAt})`);
  const results = await probeAll(paths);
  let diffs = 0;
  for (const p of paths) {
    const a = baseline.results[p];
    const b = results[p];
    const lines = [];
    if (a.status !== b.status) lines.push(`status ${a.status} → ${b.status}`);
    for (const h of HEADERS) {
      if ((a.headers?.[h] ?? null) !== (b.headers?.[h] ?? null)) {
        lines.push(`${h}: ${a.headers?.[h] ?? '(none)'} → ${b.headers?.[h] ?? '(none)'}`);
      }
    }
    if (lines.length) {
      diffs++;
      console.log(`\n${p}\n  ${lines.join('\n  ')}`);
    }
  }
  console.log(`\ncheck-urls: ${diffs} of ${paths.length} URLs differ`);
  process.exit(diffs ? 1 : 0);
}
