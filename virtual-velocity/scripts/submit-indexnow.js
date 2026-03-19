#!/usr/bin/env node
/**
 * submit-indexnow.js
 *
 * Submits all site URLs to IndexNow after each deployment.
 * Run from the virtual-velocity/ directory:
 *   node scripts/submit-indexnow.js
 *
 * Requires env vars:
 *   PUBLIC_SANITY_PROJECT_ID
 *   PUBLIC_SANITY_DATASET  (optional, defaults to "production")
 */

import { createClient } from '@sanity/client';

const SITE_URL = 'https://holisticacupuncture.net';
const INDEXNOW_KEY = '81e84114cb0247a7b6c5fbd5c9f1e44d';
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/acupuncture',
  '/conditions',
  '/services',
  '/contact',
  '/blog',
  '/faq',
  '/reviews',
  '/privacy',
  '/terms',
];

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

if (!projectId) {
  console.error('Error: PUBLIC_SANITY_PROJECT_ID env var is required.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

async function buildUrlList() {
  const [blogSlugs, conditionSlugs, teamSlugs] = await Promise.all([
    client.fetch(`*[_type == "blog" && defined(slug.current)].slug.current`),
    client.fetch(`*[_type == "condition" && defined(slug.current)].slug.current`),
    client.fetch(`*[_type == "teamMember" && defined(slug.current)].slug.current`),
  ]);

  return [
    ...STATIC_ROUTES.map((r) => `${SITE_URL}${r}`),
    ...blogSlugs.map((s) => `${SITE_URL}/blog/${s}`),
    ...conditionSlugs.map((s) => `${SITE_URL}/conditions/${s}`),
    ...teamSlugs.map((s) => `${SITE_URL}/team/${s}`),
  ];
}

async function submitBatch(urls) {
  const res = await fetch(INDEXNOW_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'holisticacupuncture.net',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });

  if (res.ok || res.status === 202) {
    console.log(`  ✓ Submitted ${urls.length} URLs`);
  } else {
    const text = await res.text();
    console.error(`  ✗ IndexNow returned ${res.status}: ${text}`);
    process.exitCode = 1;
  }
}

const urls = await buildUrlList();
console.log(`Submitting ${urls.length} URLs to IndexNow...`);

// IndexNow accepts up to 10,000 URLs per request
const BATCH_SIZE = 10000;
for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  await submitBatch(urls.slice(i, i + BATCH_SIZE));
}
