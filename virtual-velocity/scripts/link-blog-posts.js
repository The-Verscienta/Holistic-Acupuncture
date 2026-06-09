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

// Ordered: most specific first. Hrefs target real condition slugs (verified
// against *[_type=="condition"]{slug}) so anchors deep-link to the matching page.
const KEYWORD_LINKS = [
  { re: /\b(back|neck) pain\b/i, href: '/conditions/neck-pain' },
  { re: /\bsciatica\b/i, href: '/conditions/sciatica' },
  { re: /\bfibromyalgia\b/i, href: '/conditions/fibromyalgia' },
  { re: /\barthritis\b/i, href: '/conditions/arthritis' },
  { re: /\b(headaches?|migraines?)\b/i, href: '/conditions/headaches' },
  { re: /\b(stress|anxiety)\b/i, href: '/conditions/anxiety' },
  { re: /\bdepression\b/i, href: '/conditions/depression' },
  { re: /\b(insomnia|sleep)\b/i, href: '/conditions/insomnia' },
  { re: /\bfertility\b/i, href: '/conditions/fertility-support' },
  { re: /\b(menopause|menstrual|pms)\b/i, href: '/conditions/menopause' },
  { re: /\b(allergies|allergy|sinus(es)?)\b/i, href: '/conditions/sinuses-allergies' },
  { re: /\b(digesti\w+|ibs|bloating)\b/i, href: '/conditions/digestion' },
  { re: /\b(chronic pain|pain management)\b/i, href: '/conditions' },
  { re: /\bholistic\b/i, href: '/holistic-acupuncture' },
  { re: /\bacupuncture\b/i, href: '/acupuncture' },
  { re: /\b(pricing|cost|insurance)\b/i, href: '/services' },
];
const MAX_INTERNAL = 3;

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }

function existingLinkHrefs(block) {
  return new Set((block.markDefs || []).filter((m) => m._type === 'link').map((m) => m.href));
}

function linkifyPost(body) {
  const usedHref = new Set();
  for (const blk of body) if (blk._type === 'block') for (const h of existingLinkHrefs(blk)) usedHref.add(h);
  // Count internal links already present toward the cap so re-runs are idempotent
  // (otherwise each run adds up to MAX_INTERNAL more links).
  let added = 0;
  for (const h of usedHref) if (h.startsWith('/')) added++;
  const startCount = added;

  for (const blk of body) {
    if (added >= MAX_INTERNAL) break;
    if (blk._type !== 'block' || !Array.isArray(blk.children)) continue;
    for (const map of KEYWORD_LINKS) {
      if (added >= MAX_INTERNAL || usedHref.has(map.href)) continue;
      const spanIdx = blk.children.findIndex(
        (c) => c._type === 'span' && map.re.test(c.text || '') && !(c.marks || []).some((mk) => (blk.markDefs || []).some((d) => d._key === mk && d._type === 'link'))
      );
      if (spanIdx === -1) continue;
      const span = blk.children[spanIdx];
      const m = span.text.match(map.re);
      const start = m.index, end = start + m[0].length;
      const keyBase = 'lnk' + Math.abs(hashStr(map.href + blk._key)).toString(36);
      const markDef = { _key: keyBase, _type: 'link', href: map.href };
      const before = { ...span, _key: span._key + 'a', text: span.text.slice(0, start) };
      const linked = { ...span, _key: span._key + 'b', text: span.text.slice(start, end), marks: [...(span.marks || []), keyBase] };
      const after = { ...span, _key: span._key + 'c', text: span.text.slice(end) };
      const replacement = [before, linked, after].filter((s) => s.text.length > 0);
      blk.children.splice(spanIdx, 1, ...replacement);
      blk.markDefs = [...(blk.markDefs || []), markDef];
      usedHref.add(map.href);
      added++;
    }
  }
  return added - startCount; // newly added links only

}

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---');
  // Optional --limit=N for staged/safe runs (e.g. spot-check one post live first).
  const limitArg = (process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1];
  const slice = limitArg ? `[0...${Number(limitArg)}]` : '';
  if (slice) console.log(`(limited to first ${limitArg} posts)`);
  const posts = await client.fetch(`*[_type == "blog" && defined(body)] | order(_id asc) ${slice}{ _id, title, body }`);
  let changed = 0, totalLinks = 0;
  for (const p of posts) {
    const added = linkifyPost(p.body);
    if (added > 0) {
      changed++; totalLinks += added;
      console.log(`${dryRun ? '[dry] ' : ''}${p.title}: +${added} link(s)`);
      if (!dryRun) await client.patch(p._id).set({ body: p.body }).commit();
    }
  }
  console.log(`\nDone. posts changed=${changed} links added=${totalLinks} of ${posts.length} posts.`);
}
run().catch((e) => { console.error(e); process.exit(1); });
