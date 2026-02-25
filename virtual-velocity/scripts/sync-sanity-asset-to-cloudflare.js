/**
 * Sync a single Sanity image asset to Cloudflare Images and add it to the mapping index.
 *
 * Workflow:
 * 1. Upload the image in Sanity Studio (Media or in a document).
 * 2. Copy the asset _ref (e.g. image-a5bdbdc6f1cb904fa80f947f61664f7ede72154f-1600x1067-jpg).
 * 3. Run: node scripts/sync-sanity-asset-to-cloudflare.js <sanity-asset-ref>
 *
 * Requires in .env: PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN
 */

import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, '../public/cloudflare-images-index.json');

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const builder = createImageUrlBuilder(sanityClient);

function getImageUrl(ref) {
  return builder.image({ _type: 'image', asset: { _type: 'reference', _ref: ref } }).url();
}

async function uploadToCloudflare(imageBuffer, options = {}) {
  const form = new FormData();
  form.append('file', imageBuffer, {
    filename: options.filename || 'image.jpg',
    contentType: options.mimeType || 'image/jpeg',
  });
  if (options.id) form.append('id', options.id);
  if (options.metadata) form.append('metadata', JSON.stringify(options.metadata));

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfToken}` },
    body: form,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Cloudflare upload failed');
  return data.result;
}

function nextCustomId() {
  const prefix = 'sanity-';
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${t}-${r}`;
}

async function main() {
  const ref = process.argv[2];
  if (!ref || !ref.startsWith('image-')) {
    console.error('Usage: node scripts/sync-sanity-asset-to-cloudflare.js <sanity-asset-ref>');
    console.error('Example: node scripts/sync-sanity-asset-to-cloudflare.js image-a5bdbdc6f1cb904fa80f947f61664f7ede72154f-1600x1067-jpg');
    process.exit(1);
  }

  if (!projectId || !cfAccountId || !cfToken) {
    console.error('Missing env: PUBLIC_SANITY_PROJECT_ID, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN');
    process.exit(1);
  }

  console.log('Fetching asset from Sanity...');
  const asset = await sanityClient.fetch(
    `*[_id == $ref][0]{ _id, originalFilename, metadata { dimensions }, size, mimeType }`,
    { ref }
  );
  if (!asset) {
    console.error('Asset not found for ref:', ref);
    process.exit(1);
  }

  const imageUrl = getImageUrl(ref);
  console.log('Downloading image from Sanity CDN...');
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    console.error('Failed to download image:', imageRes.status);
    process.exit(1);
  }
  const buffer = await imageRes.buffer();
  const mimeType = asset.mimeType || 'image/jpeg';
  const filename = asset.originalFilename || ref.replace(/^image-[^-]+-[^-]+-/, '') || 'image.jpg';

  const cloudflareId = nextCustomId();
  console.log('Uploading to Cloudflare Images as', cloudflareId, '...');
  const cfResult = await uploadToCloudflare(buffer, {
    id: cloudflareId,
    filename,
    mimeType,
    metadata: { title: filename, sanityRef: ref },
  });

  const accountHash = 't5tnnNBoCpmnml-JZw7JMA';
  const baseUrl = `https://imagedelivery.net/${accountHash}/${cfResult.id}`;
  const variants = cfResult.variants || [`${baseUrl}/public`];

  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
    : [];
  const maxId = index.length ? Math.max(...index.map((e) => (typeof e.id === 'number' ? e.id : 0))) : 0;
  const newEntry = {
    id: maxId + 1,
    title: filename,
    filename,
    url: imageUrl,
    mimeType,
    width: asset.metadata?.dimensions?.width ?? null,
    height: asset.metadata?.dimensions?.height ?? null,
    date: new Date().toISOString().slice(0, 19),
    sanity: {
      _type: 'image',
      asset: { _type: 'reference', _ref: ref },
    },
    local: null,
    cloudflare: {
      id: cfResult.id,
      variants,
      baseUrl,
    },
  };
  index.push(newEntry);
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  console.log('Done.');
  console.log('  Sanity ref:', ref);
  console.log('  Cloudflare id:', cfResult.id);
  console.log('  Index updated:', INDEX_PATH);
  console.log('  Commit and deploy so the site uses Cloudflare for this image.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
