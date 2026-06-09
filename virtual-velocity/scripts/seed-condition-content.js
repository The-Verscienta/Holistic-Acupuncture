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
const force = process.argv.includes('--force');

let keyN = 0;
const block = (text, style = 'normal') => ({
  _type: 'block', _key: 'b' + keyN++, style,
  markDefs: [], children: [{ _type: 'span', _key: 's' + keyN++, text, marks: [] }],
});

function detailedFor(c) {
  const name = c.name, lower = name.toLowerCase();
  const sx = (c.symptoms || []).join(', ');
  return [
    block(`Understanding ${name}`, 'h2'),
    block(`${name} affects many people across the Milwaukee area, and it can interfere with work, sleep, and everyday life. ${c.description || ''}`.trim()),
    block(sx ? `Common signs include ${sx}. Left unaddressed, ${lower} can become a chronic pattern that's harder to resolve.` : `Left unaddressed, ${lower} can become a chronic pattern that's harder to resolve.`),
    block(`At Acupuncture & Holistic Health Associates in Glendale, WI, we take time to understand the root cause of your ${lower} — not just the symptoms — so we can build a treatment plan tailored to you.`),
  ];
}
function helpsFor(c) {
  const lower = c.name.toLowerCase();
  return [
    block(`Acupuncture supports the body's natural ability to heal and regulate itself. For ${lower}, treatment can help reduce pain and inflammation, calm the nervous system, improve circulation, and restore balance.`),
    block(`We often combine acupuncture with traditional Chinese medicine techniques — such as cupping, herbal medicine, and lifestyle guidance — for a whole-person approach. ${c.treatmentDuration ? `Most patients follow a course of ${c.treatmentDuration}.` : 'Your plan and timeline are personalized at your first visit.'}`),
    block(`If you're dealing with ${lower} in the Milwaukee or Glendale area, we'd be glad to help you explore whether acupuncture is right for you.`),
  ];
}

const isThin = (arr) => !Array.isArray(arr) || arr.length === 0 ||
  arr.reduce((n, b) => n + ((b.children || []).reduce((m, s) => m + (s.text || '').length, 0)), 0) < 200;

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---', force ? '(force)' : '');
  const conds = await client.fetch(`*[_type == "condition"]{ _id, name, description, symptoms, treatmentDuration, detailedDescription, howAcupunctureHelps }`);
  let patched = 0;
  for (const c of conds) {
    const patch = {};
    if (force || isThin(c.detailedDescription)) patch.detailedDescription = detailedFor(c);
    if (force || isThin(c.howAcupunctureHelps)) patch.howAcupunctureHelps = helpsFor(c);
    if (Object.keys(patch).length === 0) { console.log(`skip (has content): ${c.name}`); continue; }
    console.log(`${dryRun ? '[dry] would patch' : 'patching'}: ${c.name} [${Object.keys(patch).join(', ')}]`);
    if (!dryRun) await client.patch(c._id).set(patch).commit();
    patched++;
  }
  console.log(`\nDone. patched=${patched} of ${conds.length} conditions.`);
}
run().catch((e) => { console.error(e); process.exit(1); });
