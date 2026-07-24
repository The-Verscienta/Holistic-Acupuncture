/**
 * Media-only Kiln export — sweeps public/cloudflare-images-index.json into a
 * kiln-export JSON whose `media` list carries one item per distinct Cloudflare
 * image (deduped by original asset ref), with empty content lists so the Kiln
 * importer (projects/acupuncture/priv/repo/acupuncture_import.exs) upserts
 * media and touches nothing else.
 *
 * This replaces the retired Sanity-era exporter (scripts/export-to-kiln.js,
 * removed with the Sanity teardown): the content migration is complete, but
 * re-seeding a Kiln environment's media library from the Cloudflare index
 * remains useful.
 *
 *   node scripts/export-media-to-kiln.js [output-path]
 *
 * Defaults to writing ../kiln-export-media.json (next to package.json).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const OUT_PATH =
  args.find((a) => !a.startsWith('--')) || path.join(__dirname, '../kiln-export-media.json');
const INDEX_PATH = path.join(__dirname, '../public/cloudflare-images-index.json');
const ACCOUNT_HASH = 't5tnnNBoCpmnml-JZw7JMA';

const cfUrl = (id, opts = '') =>
  `https://imagedelivery.net/${ACCOUNT_HASH}/${id}/public${opts}`;

const cfIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

// One media item per unique original asset ref (the index contains a few
// byte-identical duplicate uploads sharing a ref — first one wins, matching
// the retired exporter's behavior).
const media = new Map();
let unmapped = 0;

for (const entry of cfIndex) {
  if (!entry.cloudflare) {
    unmapped++;
    continue;
  }
  const ref = entry.sanity?.asset?._ref;
  if (!ref || media.has(ref)) continue;

  // Dimensions from the asset ref (image-<hash>-<WxH>-<ext>), falling back to the index.
  const dims = ref.match(/-(\d+)x(\d+)-(\w+)$/);
  const width = dims ? Number(dims[1]) : entry.width || null;
  const height = dims ? Number(dims[2]) : entry.height || null;
  const ext = dims ? dims[3] : 'jpg';

  media.set(ref, {
    sanity_ref: ref,
    filename: entry.filename || `${ref}.${ext}`,
    content_type:
      entry.mimeType ||
      (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'),
    width,
    height,
    url: cfUrl(entry.cloudflare.id),
    variants: {
      thumb: { url: cfUrl(entry.cloudflare.id, '?width=400'), width: 400 },
      medium: { url: cfUrl(entry.cloudflare.id, '?width=800'), width: 800 },
      large: { url: cfUrl(entry.cloudflare.id, '?width=1200'), width: 1200 },
    },
    alt: entry.altText || entry.title || '',
  });
}

const out = {
  exported_at: new Date().toISOString(),
  source: { index: 'public/cloudflare-images-index.json' },
  media: [...media.values()],
  categories: [],
  tags: [],
  records: [],
};

fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 1));
console.log(`Exported to ${OUT_PATH}`);
console.log(
  `  media: ${media.size}` +
    (unmapped ? ` (${unmapped} index entries without a Cloudflare id skipped)` : '')
);
