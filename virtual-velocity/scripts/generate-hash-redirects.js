#!/usr/bin/env node
/**
 * Generates static HTML redirect pages for old WordPress condition/topic URLs
 * that should redirect to /conditions/#anchor with the hash fragment preserved.
 *
 * Server-side redirects can't include # fragments, so we use client-side HTML
 * pages with <meta refresh> + JS for instant hash-preserving redirects.
 *
 * Run: node scripts/generate-hash-redirects.js
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Map of old slug → destination URL (with or without hash)
const REDIRECTS = {
  // NOTE: slugs that ARE condition pages (headaches, anxiety, digestion, hormones,
  // sinuses-allergies, neck-pain, low-energy) are intentionally NOT listed here.
  // generate-condition-redirects.js sends every condition slug to its individual
  // /conditions/:slug/ page. Only old WordPress URLs WITHOUT a 1:1 condition page
  // belong here — they redirect to the nearest /conditions/#category anchor.
  'sleep':                                               '/conditions/#mental-health',
  'influenza':                                           '/conditions/#immune',
  'diabetes':                                            '/conditions/#other',
  'irregular-and-painful-menstruation':                  '/conditions/#womens-health',
  'rotator-cuff-injuries':                               '/conditions/#pain',
  'athletes-tendon-ligament-injuries':                   '/conditions/#pain',
  'conditions-symptoms':                                 '/conditions/',
  // Acupuncture-for-X condition pages
  'acupuncture-sciatic-pain':                            '/conditions/#pain',
  'acupuncture-degenerative-disc-disease':               '/conditions/#pain',
  'acupuncture-for-stomach-issues':                      '/conditions/#digestive',
  'acupuncture-for-allergies':                           '/conditions/#immune',
  'acupuncture-for-womens-health-issues':                '/conditions/#womens-health',
  'acupuncture-for-digestive-disorders':                 '/conditions/#digestive',
  'acupuncture-for-fertility':                           '/conditions/#womens-health',
  'heart-function-natural-solutions-heart-related-health-problems': '/conditions/#other',
  'acupuncture-for-digestive-issues-a-natural-approach-in-milwaukee-wisconsin': '/conditions/#digestive',
};

const SITE_URL = 'https://holisticacupuncture.net';

function buildHtml(dest) {
  const abs = dest.startsWith('http') ? dest : `${SITE_URL}${dest}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="canonical" href="${abs}" />
    <meta http-equiv="refresh" content="0; url=${dest}" />
    <script>window.location.replace('${dest}');</script>
    <title>Redirecting…</title>
  </head>
  <body></body>
</html>
`;
}

let count = 0;
for (const [slug, dest] of Object.entries(REDIRECTS)) {
  const dir = join(publicDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildHtml(dest));
  console.log(`  ${slug}/ → ${dest}`);
  count++;
}

console.log(`\nGenerated ${count} hash-redirect page(s).`);
