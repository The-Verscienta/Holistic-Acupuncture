/**
 * Fix null image fields in Sanity documents.
 *
 * The WordPress migration stored null in image fields for documents that had
 * no image. Sanity requires image fields to be absent (unset), not null —
 * null causes "Invalid property value" errors in Sanity Studio.
 *
 * Covers:
 *   - teamMember.photo
 *   - blogPost.featuredImage + blogPost.content[] image blocks
 *   - blog.featuredImage + blog.body[] image blocks (WordPress-migrated posts)
 *
 * Usage:
 *   node scripts/fix-null-images.js [--dry-run]
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
let totalFixed = 0;

async function fixNullImages() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  console.log(dryRun ? '--- DRY RUN (no changes will be made) ---\n' : '--- LIVE RUN ---\n');

  // teamMember: photo field
  await fixNullField('teamMember', 'photo', 'photo', 'name');

  // blogPost: featuredImage field
  await fixNullField('blogPost', 'featuredImage', 'featuredImage', 'title');

  // blogPost: null image blocks inside content array
  await fixNullBodyImages('blogPost', 'content', 'title');

  // blog (WordPress-migrated): featuredImage field
  await fixNullField('blog', 'featuredImage', 'featuredImage', 'title');

  // blog (WordPress-migrated): null image blocks inside body array
  await fixNullBodyImages('blog', 'body', 'title');

  console.log(`\nDone. ${totalFixed} document(s) ${dryRun ? 'would be' : 'were'} fixed.`);
}

async function fixNullField(docType, field, unsetField, labelField) {
  const docs = await client.fetch(
    `*[_type == $type && ${field} == null]{ _id, "${labelField}": ${labelField} }`,
    { type: docType }
  );
  console.log(`${docType} with null ${field}: ${docs.length}`);
  for (const doc of docs) {
    console.log(`  Fixing: ${doc[labelField]} (${doc._id})`);
    if (!dryRun) {
      await client.patch(doc._id).unset([unsetField]).commit();
    }
    totalFixed++;
  }
}

async function fixNullBodyImages(docType, arrayField, labelField) {
  const docs = await client.fetch(
    `*[_type == $type && count(${arrayField}[_type == "image" && asset == null]) > 0]{ _id, "${labelField}": ${labelField}, "${arrayField}": ${arrayField} }`,
    { type: docType }
  );
  console.log(`\n${docType} with null image blocks in ${arrayField}: ${docs.length}`);
  for (const doc of docs) {
    const blocks = doc[arrayField] || [];
    const cleaned = blocks.filter((b) => !(b._type === 'image' && b.asset == null));
    const removed = blocks.length - cleaned.length;
    console.log(`  Fixing: ${doc[labelField]} (${doc._id}) — removing ${removed} null image block(s)`);
    if (!dryRun) {
      await client.patch(doc._id).set({ [arrayField]: cleaned }).commit();
    }
    totalFixed++;
  }
}

fixNullImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
