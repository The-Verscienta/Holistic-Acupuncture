/**
 * Audit (and optionally sync) all Sanity-referenced image assets to Cloudflare Images.
 *
 * Walks every document of the site's active types, collects every image asset _ref
 * (featured images, photos, avatars, and Portable Text inline images), and diffs
 * against public/cloudflare-images-index.json.
 *
 *   node scripts/sync-all-images-to-cloudflare.js            # audit only (dry run)
 *   node scripts/sync-all-images-to-cloudflare.js --upload   # upload missing to Cloudflare + update index
 *
 * Audit needs only PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET.
 * --upload additionally requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_TOKEN in .env.
 */

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Accept either name for the account id (matches .env.example and existing setups).
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID;
const CF_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, '../public/cloudflare-images-index.json');
const ACCOUNT_HASH = 't5tnnNBoCpmnml-JZw7JMA';

// Types the site actually queries; contactSubmission is write-only and imageless.
const ACTIVE_TYPES = ['blog', 'condition', 'teamMember', 'testimonial', 'faq'];

const upload = process.argv.includes('--upload');

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

// Recursively collect image asset _refs, remembering where each was found.
function collectImageRefs(node, docLabel, fieldPath, out) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectImageRefs(item, docLabel, `${fieldPath}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    const ref = node.asset?._ref;
    if (typeof ref === 'string' && ref.startsWith('image-')) {
      if (!out.has(ref)) out.set(ref, []);
      out.get(ref).push(`${docLabel} → ${fieldPath}`);
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'asset') continue;
      collectImageRefs(value, docLabel, fieldPath ? `${fieldPath}.${key}` : key, out);
    }
  }
}

async function uploadToCloudflare(buffer, { id, filename, mimeType, metadata }) {
  const form = new FormData();
  form.append('file', buffer, { filename, contentType: mimeType });
  form.append('id', id);
  form.append('metadata', JSON.stringify(metadata));
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    { method: 'POST', headers: { Authorization: `Bearer ${CF_TOKEN}` }, body: form }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Cloudflare upload failed');
  return data.result;
}

function cloudflareIdForRef(ref) {
  // Deterministic, readable id derived from the Sanity ref hash so reruns are idempotent.
  const hash = ref.split('-')[1]?.slice(0, 16) || Math.random().toString(36).slice(2, 10);
  return `sanity-${hash}`;
}

async function main() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID in .env');
    process.exit(1);
  }

  console.log(`Fetching documents for types: ${ACTIVE_TYPES.join(', ')} ...`);
  const docs = await sanityClient.fetch(`*[_type in $types && !(_id in path("drafts.**"))]`, {
    types: ACTIVE_TYPES,
  });
  console.log(`Fetched ${docs.length} published documents.`);

  const referenced = new Map(); // ref -> [locations]
  for (const doc of docs) {
    const label = `${doc._type}:${doc.slug?.current || doc.name || doc.title || doc._id}`;
    collectImageRefs(doc, label, '', referenced);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const mapped = new Set(
    index.filter((e) => e.sanity && e.cloudflare).map((e) => e.sanity.asset._ref)
  );

  const missing = [...referenced.keys()].filter((ref) => !mapped.has(ref));

  console.log(`\nReferenced image assets: ${referenced.size}`);
  console.log(`Already mapped to Cloudflare: ${referenced.size - missing.length}`);
  console.log(`Missing Cloudflare mapping: ${missing.length}\n`);

  for (const ref of missing) {
    console.log(`  ${ref}`);
    for (const loc of referenced.get(ref)) console.log(`      used by: ${loc}`);
  }

  if (!missing.length) {
    console.log('Nothing to do — every referenced image has a Cloudflare mapping.');
    return;
  }

  if (!upload) {
    console.log('\nDry run. Re-run with --upload to push the missing images to Cloudflare Images.');
    return;
  }

  if (!CF_ACCOUNT_ID || !CF_TOKEN) {
    console.error('\n--upload requires CLOUDFLARE_ACCOUNT_ID (or CLOUDFLARE_IMAGES_ACCOUNT_ID) and CLOUDFLARE_IMAGES_TOKEN in .env');
    process.exit(1);
  }

  const assets = await sanityClient.fetch(
    `*[_id in $ids]{ _id, originalFilename, mimeType, metadata { dimensions } }`,
    { ids: missing }
  );
  const assetById = new Map(assets.map((a) => [a._id, a]));

  let maxId = index.reduce((m, e) => (typeof e.id === 'number' && e.id > m ? e.id : m), 0);
  let ok = 0;
  for (const ref of missing) {
    const asset = assetById.get(ref) || {};
    const filename = asset.originalFilename || `${ref}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';
    const sourceUrl = builder.image({ _type: 'image', asset: { _type: 'reference', _ref: ref } }).url();
    try {
      const res = await fetch(sourceUrl);
      if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
      const buffer = await res.buffer();
      const cfResult = await uploadToCloudflare(buffer, {
        id: cloudflareIdForRef(ref),
        filename,
        mimeType,
        metadata: { title: filename, sanityRef: ref },
      });
      const baseUrl = `https://imagedelivery.net/${ACCOUNT_HASH}/${cfResult.id}`;
      index.push({
        id: ++maxId,
        title: filename,
        filename,
        url: sourceUrl,
        mimeType,
        width: asset.metadata?.dimensions?.width ?? null,
        height: asset.metadata?.dimensions?.height ?? null,
        date: new Date().toISOString().slice(0, 19),
        sanity: { _type: 'image', asset: { _type: 'reference', _ref: ref } },
        local: null,
        cloudflare: { id: cfResult.id, variants: cfResult.variants || [`${baseUrl}/public`], baseUrl },
      });
      ok++;
      console.log(`  uploaded ${ref} → ${cfResult.id}`);
    } catch (err) {
      console.error(`  FAILED ${ref}: ${err.message}`);
    }
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\nUploaded ${ok}/${missing.length}. Index updated: ${INDEX_PATH}`);
  console.log('Commit the index and deploy so the site serves these from Cloudflare.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
