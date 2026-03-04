/**
 * Assign clean category values to migrated WordPress blog posts.
 *
 * Each post has a raw `categories` array from WordPress. This script maps
 * those to one of the six clean website categories and writes it to the new
 * `category` field on each document.
 *
 * Priority order (most specific wins):
 *   pain-management > mental-health > womens-health > nutrition > getting-started > wellness
 *
 * Posts with no matching WP category default to "wellness".
 *
 * Usage:
 *   node scripts/assign-blog-categories.js [--dry-run]
 *
 * Requires in .env:
 *   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const dryRun = process.argv.includes('--dry-run');

// Map WP category strings → clean category value
// Keys are lowercase for case-insensitive matching
const WP_TO_CLEAN = {
  // pain-management
  'pain management':        'pain-management',
  'back pain':              'pain-management',
  'sciatic pain':           'pain-management',
  'arm pain':               'pain-management',
  'leg pain':               'pain-management',
  'neck pain':              'pain-management',
  'foot pain':              'pain-management',
  'finger pain':            'pain-management',
  'hand pain':              'pain-management',
  'general pain':           'pain-management',
  'fibromyalgia':           'pain-management',
  'headaches':              'pain-management',
  'migraines':              'pain-management',
  'chiropractic':           'pain-management',
  'chiropractor':           'pain-management',

  // mental-health
  'stress':                 'mental-health',
  'sleep disturbances':     'mental-health',
  'insomnia':               'mental-health',
  'mental wellness':        'mental-health',

  // womens-health
  "women's health":         'womens-health',
  'womens health':          'womens-health',
  'fertility':              'womens-health',

  // nutrition
  'nutrition advice':       'nutrition',
  'recipes':                'nutrition',
  'celiac disease':         'nutrition',

  // getting-started
  'success stories':        'getting-started',
  'new patient special':    'getting-started',
  'uncategorized':          'getting-started',
};

// Priority order — higher index wins if multiple categories match
const PRIORITY = [
  'wellness',
  'getting-started',
  'nutrition',
  'womens-health',
  'mental-health',
  'pain-management',
];

function assignCategory(wpCategories = []) {
  let best = 'wellness'; // default

  for (const wpCat of wpCategories) {
    const mapped = WP_TO_CLEAN[wpCat.toLowerCase()];
    if (mapped && PRIORITY.indexOf(mapped) > PRIORITY.indexOf(best)) {
      best = mapped;
    }
  }

  return best;
}

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  console.log(dryRun ? '--- DRY RUN ---\n' : '--- LIVE RUN ---\n');

  const posts = await client.fetch(
    `*[_type == "blog"]{ _id, title, category, categories }`
  );

  console.log(`Total posts: ${posts.length}\n`);

  const counts = {};
  let skipped = 0;

  for (const post of posts) {
    const newCat = assignCategory(post.categories);

    // Skip if already manually set to something different
    if (post.category && post.category !== newCat) {
      console.log(`  SKIP (already set to "${post.category}"): ${post.title}`);
      skipped++;
      continue;
    }

    counts[newCat] = (counts[newCat] || 0) + 1;

    if (dryRun) {
      console.log(`  [${newCat}] ${post.title}`);
    } else {
      await client.patch(post._id).set({ category: newCat }).commit();
    }
  }

  console.log('\n=== Summary ===');
  PRIORITY.slice().reverse().forEach((cat) => {
    if (counts[cat]) console.log(`  ${cat}: ${counts[cat]} post(s)`);
  });
  if (skipped) console.log(`  skipped (already set): ${skipped}`);
  console.log(`\nDone. ${dryRun ? 'No changes made.' : 'All posts updated.'}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
