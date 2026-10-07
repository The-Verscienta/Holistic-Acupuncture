/**
 * Builds the Pagefind search index, then removes the prerendered blog shadow
 * pages from dist so they never deploy.
 *
 * /blog/[slug] is SSR, so its HTML isn't in dist for Pagefind to find.
 * src/pages/search-index/blog/[slug].astro prerenders the same page under
 * /search-index/blog/; this script indexes those files under their real
 * /blog/<slug>/ URL and deletes dist/search-index.
 *
 * Run after `astro build`: postbuild in package.json.
 */
import * as pagefind from 'pagefind';
import { readdirSync, readFileSync, rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const shadowDir = join(distDir, 'search-index', 'blog');

// Read the shadow pages, then drop them from dist before indexing the rest
// so they are neither indexed under /search-index/ nor deployed.
const shadowPages = existsSync(shadowDir)
  ? readdirSync(shadowDir)
      .filter((slug) => existsSync(join(shadowDir, slug, 'index.html')))
      .map((slug) => ({
        url: `/blog/${slug}/`,
        content: readFileSync(join(shadowDir, slug, 'index.html'), 'utf8'),
      }))
  : [];
rmSync(join(distDir, 'search-index'), { recursive: true, force: true });

// Mirrors pagefind.yml, which the Node API doesn't read
const { index } = await pagefind.createIndex({
  rootSelector: '[data-pagefind-body]',
  excludeSelectors: [
    '[data-pagefind-ignore]',
    '[data-pagefind-ignore] *',
    'header',
    'footer',
    'nav',
    '.pagefind-ignore',
  ],
  keepIndexUrl: false,
});

const site = await index.addDirectory({ path: distDir });
if (site.errors.length) throw new Error(site.errors.join('\n'));

for (const page of shadowPages) {
  const res = await index.addHTMLFile(page);
  if (res.errors.length) throw new Error(res.errors.join('\n'));
}

await index.writeFiles({ outputPath: join(distDir, 'pagefind') });
await pagefind.close();

console.log(`build-search-index: indexed ${site.page_count} pages + ${shadowPages.length} blog posts`);
