/**
 * Import Google reviews from Outscraper into Sanity testimonials.
 *
 * - Fetches reviews via Outscraper's Google Maps Reviews API (async + poll)
 * - Skips any review that already exists (matched by author name)
 * - Names are anonymized to first name + last initial (e.g. "Victoria B.")
 * - Uses the actual star rating from Google
 * - Skips reviews under 50 chars (Sanity schema min) and truncates over 1500 (max)
 * - condition field is left blank (not available from Google reviews)
 *
 * Usage:
 *   node scripts/import-google-reviews.js [--dry-run] [--limit=N] [--sort=newest|highest|lowest]
 *
 * Requires in .env:
 *   OUTSCRAPER_API_KEY      - https://app.outscraper.com/profile
 *   PUBLIC_SANITY_PROJECT_ID
 *   PUBLIC_SANITY_DATASET
 *   SANITY_API_TOKEN        - write token
 *
 * Free tier: 500 reviews/month. Outscraper bills per review returned, so this
 * script defaults to --limit=500 to stay free. Override with --limit=N to fetch fewer.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Source of truth: virtual-velocity/src/lib/config.ts CONTACT.address.googlePlaceId
const GOOGLE_PLACE_ID = 'ChIJpwaRdmAeBYgRadfuDNZDi_4';

const OUTSCRAPER_API_KEY = process.env.OUTSCRAPER_API_KEY;
const OUTSCRAPER_BASE = 'https://api.outscraper.com';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const sortArg = args.find((a) => a.startsWith('--sort='));
const REVIEWS_LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500;
const SORT = sortArg ? sortArg.split('=')[1] : 'newest';

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 min
const SCHEMA_MIN_QUOTE = 50;
const SCHEMA_MAX_QUOTE = 1500;

const sanity = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toFirstNameLastInitial(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Anonymous';
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toIsoDate(review) {
  // Outscraper exposes a few possible date fields; prefer review_datetime_utc.
  const raw =
    review.review_datetime_utc ||
    review.review_timestamp ||
    review.review_date ||
    null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function outscraperRequest(path, opts = {}) {
  const res = await fetch(`${OUTSCRAPER_BASE}${path}`, {
    ...opts,
    headers: {
      'X-API-KEY': OUTSCRAPER_API_KEY,
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Outscraper ${path} → ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchReviewsFromOutscraper() {
  const query = encodeURIComponent(`place_id:${GOOGLE_PLACE_ID}`);
  const url =
    `/maps/reviews-v3?query=${query}` +
    `&reviewsLimit=${REVIEWS_LIMIT}` +
    `&sort=${encodeURIComponent(SORT)}` +
    `&async=true`;

  console.log(`Submitting Outscraper job (limit=${REVIEWS_LIMIT}, sort=${SORT})...`);
  const submission = await outscraperRequest(url);
  const requestId = submission.id;
  if (!requestId) {
    throw new Error(`No request id from Outscraper submission: ${JSON.stringify(submission)}`);
  }
  console.log(`Request id: ${requestId}. Polling...`);

  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);
    const status = await outscraperRequest(`/requests/${requestId}`);
    const s = (status.status || '').toLowerCase();
    process.stdout.write(`  status=${status.status || 'unknown'}\r`);
    if (s === 'success' || s === 'finished') {
      console.log('\nJob complete.');
      // Either inline data or a results_location URL.
      if (Array.isArray(status.data)) return status.data;
      if (status.results_location) {
        const r = await fetch(status.results_location);
        if (!r.ok) throw new Error(`results_location fetch failed: ${r.status}`);
        const json = await r.json();
        return json.data || json;
      }
      throw new Error(`Job finished but no data field: ${JSON.stringify(status).slice(0, 300)}`);
    }
    if (s === 'failed' || s === 'error') {
      throw new Error(`Outscraper job failed: ${JSON.stringify(status)}`);
    }
  }
  throw new Error(`Outscraper job timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

function flattenReviews(data) {
  // data is an array of place result objects; each may have a reviews_data array.
  const reviews = [];
  for (const place of data || []) {
    const list = place?.reviews_data || place?.reviews || [];
    for (const r of list) reviews.push(r);
  }
  return reviews;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!OUTSCRAPER_API_KEY) {
    console.error('Missing OUTSCRAPER_API_KEY in .env');
    process.exit(1);
  }
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Place ID: ${GOOGLE_PLACE_ID}`);

  const data = await fetchReviewsFromOutscraper();
  const reviews = flattenReviews(data);
  console.log(`Reviews fetched: ${reviews.length}\n`);

  if (reviews.length === 0) {
    console.log('Nothing to import.');
    return;
  }

  // Existing testimonials → dedup by author name
  const existing = await sanity.fetch(`*[_type == "testimonial"]{ author }`);
  const existingNames = new Set(existing.map((t) => (t.author || '').toLowerCase()));
  console.log(`Existing testimonials in Sanity: ${existing.length}`);

  let created = 0;
  let skippedDup = 0;
  let skippedShort = 0;
  let skippedNoText = 0;

  for (const r of reviews) {
    const fullName = r.author_title || r.author_name || r.reviewer_name || '';
    const text = (r.review_text || r.text || '').trim();
    const rating = Number(r.review_rating || r.rating || 0);
    const date = toIsoDate(r) || new Date().toISOString().slice(0, 10);

    if (!text) {
      skippedNoText++;
      continue;
    }
    if (text.length < SCHEMA_MIN_QUOTE) {
      skippedShort++;
      continue;
    }

    const author = toFirstNameLastInitial(fullName);
    if (existingNames.has(author.toLowerCase())) {
      console.log(`  SKIP (duplicate author): ${author}`);
      skippedDup++;
      continue;
    }

    const doc = {
      _type: 'testimonial',
      author,
      quote: text.slice(0, SCHEMA_MAX_QUOTE),
      rating: rating >= 1 && rating <= 5 ? Math.round(rating) : 5,
      date,
      featured: false,
      verified: true,
    };

    if (isDryRun) {
      console.log(`  DRY RUN - would create: ${author} (${date}, ${doc.rating}★)`);
    } else {
      await sanity.create(doc);
      console.log(`  CREATED: ${author} (${date}, ${doc.rating}★)`);
      // Reserve the name immediately so a same-batch duplicate is also skipped.
      existingNames.add(author.toLowerCase());
    }
    created++;
  }

  console.log(
    `\nDone. Created: ${created}, Dup skipped: ${skippedDup}, ` +
      `Short skipped: ${skippedShort}, No-text skipped: ${skippedNoText}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
