/**
 * Upload a local image file to Sanity (via API) and to Cloudflare Images, then add to the mapping index.
 *
 * Use this when you can't use the Media upload in Sanity Studio (e.g. on the free plan).
 *
 * Usage:
 *   node scripts/upload-image-to-sanity-and-cloudflare.js <path-to-image>
 *   node scripts/upload-image-to-sanity-and-cloudflare.js ./photo.jpg --title "My photo"
 *
 * Requires in .env:
 *   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN
 *
 * After running, the script prints the Sanity asset _ref. Use that ref in your documents
 * (e.g. paste into an image reference field, or store in an "Image asset ID" field if you have one).
 */

import { createClient } from '@sanity/client';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, '../public/cloudflare-images-index.json');
const ACCOUNT_HASH = 't5tnnNBoCpmnml-JZw7JMA';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

const sanityClient = createClient({
  projectId,
  dataset,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith('--'));
  const titleIdx = args.indexOf('--title');
  const title = titleIdx >= 0 && args[titleIdx + 1] ? args[titleIdx + 1] : null;
  return { filePath, title };
}

function nextCloudflareId() {
  return `sanity-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function uploadToCloudflare(buffer, options = {}) {
  const form = new FormData();
  form.append('file', buffer, {
    filename: options.filename || 'image.jpg',
    contentType: options.mimeType || 'image/jpeg',
  });
  form.append('id', options.id);
  if (options.metadata) form.append('metadata', JSON.stringify(options.metadata));

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfToken}` },
      body: form,
    }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Cloudflare upload failed');
  return data.result;
}

async function main() {
  const { filePath, title } = parseArgs();
  if (!filePath) {
    console.error('Usage: node scripts/upload-image-to-sanity-and-cloudflare.js <path-to-image> [--title "Title"]');
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved);
    process.exit(1);
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    console.error('Not a file:', resolved);
    process.exit(1);
  }

  const buffer = fs.readFileSync(resolved);
  const ext = path.extname(resolved).toLowerCase().slice(1) || 'jpg';
  const baseName = path.basename(resolved, path.extname(resolved));
  const filename = path.basename(resolved);
  const mimeType = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/jpeg';

  if (!projectId || !process.env.SANITY_API_TOKEN || !cfAccountId || !cfToken) {
    console.error('Missing .env: PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN');
    process.exit(1);
  }

  console.log('Uploading to Sanity...');
  const asset = await sanityClient.assets.upload('image', buffer, {
    filename,
    contentType: mimeType,
  });
  const ref = asset._id;
  console.log('  Sanity asset _ref:', ref);

  const cloudflareId = nextCloudflareId();
  console.log('Uploading to Cloudflare Images as', cloudflareId, '...');
  const cfResult = await uploadToCloudflare(buffer, {
    id: cloudflareId,
    filename,
    mimeType,
    metadata: { title: title || baseName, sanityRef: ref },
  });

  const baseUrl = `https://imagedelivery.net/${ACCOUNT_HASH}/${cfResult.id}`;
  const variants = cfResult.variants || [`${baseUrl}/public`];

  const index = fs.existsSync(INDEX_PATH)
    ? JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
    : [];
  const maxId = index.length ? Math.max(...index.map((e) => (typeof e.id === 'number' ? e.id : 0))) : 0;
  const newEntry = {
    id: maxId + 1,
    title: title || baseName,
    filename,
    url: asset.url || '',
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
  console.log('');
  console.log('  Sanity asset _ref (use this in your documents):');
  console.log('  ', ref);
  console.log('');
  console.log('  Cloudflare id:', cfResult.id);
  console.log('  Index updated:', INDEX_PATH);
  console.log('');
  console.log('  Next: Commit the updated cloudflare-images-index.json and deploy.');
  console.log('  To use this image in a document: paste the _ref above into your image/reference field if your Studio allows it, or use the API to set the image on a document.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
