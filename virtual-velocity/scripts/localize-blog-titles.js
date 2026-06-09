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

const SUFFIX = ' | Acupuncture in Milwaukee, WI';
// Symptom/condition signal words (plural-tolerant via \w* stems). Tuned to catch
// clinical posts while leaving pure-TCM/philosophy posts untouched.
const CLINICAL = /\b(pain|pains|painful|ache|aches|headache|headaches|migraine|migraines|anxiety|stress|insomnia|sleep|fertility|allerg\w*|arthritis|sciatic\w*|fibromyalgia|nausea|digest\w*|ibs|depression|menopause|menstrua\w*|pms|injur\w*|inflammation|neuropath\w*|carpal tunnel|fatigue|acne|sinus\w*|mood disorder|seasonal affective|vertigo|tinnitus|asthma|constipation|bloating|hormon\w*|weight management|neck|back|shoulder|knee|joint)\b/i;

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---');
  const posts = await client.fetch(`*[_type == "blog"]{ _id, title }`);
  let updated = 0, skippedLocal = 0, skippedNonClinical = 0;
  for (const p of posts) {
    if (!p.title) continue;
    if (/milwaukee/i.test(p.title)) { skippedLocal++; continue; }
    if (!CLINICAL.test(p.title)) { skippedNonClinical++; continue; }
    const next = p.title + SUFFIX;
    console.log(`${dryRun ? '[dry] ' : ''}"${p.title}" -> "${next}"`);
    if (!dryRun) await client.patch(p._id).set({ title: next }).commit();
    updated++;
  }
  console.log(`\nDone. updated=${updated} skipped(local)=${skippedLocal} skipped(non-clinical)=${skippedNonClinical} total=${posts.length}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
