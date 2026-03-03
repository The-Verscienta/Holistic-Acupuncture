/**
 * Fix null image fields in Sanity documents.
 *
 * The WordPress migration stored null in image fields for documents that had
 * no image. Sanity requires image fields to be absent (unset), not null —
 * null causes "Invalid property value" errors in Sanity Studio.
 *
 * This script finds all teamMember and blogPost documents with null image
 * fields and unsets them.
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

async function fixNullImages() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  console.log(dryRun ? '--- DRY RUN (no changes will be made) ---\n' : '--- LIVE RUN ---\n');

  // teamMember: photo field
  const teamWithNullPhoto = await client.fetch(
    `*[_type == "teamMember" && photo == null]{ _id, name }`
  );
  console.log(`teamMember documents with null photo: ${teamWithNullPhoto.length}`);
  for (const doc of teamWithNullPhoto) {
    console.log(`  Fixing teamMember: ${doc.name} (${doc._id})`);
    if (!dryRun) {
      await client.patch(doc._id).unset(['photo']).commit();
    }
  }

  // blogPost: featuredImage field
  const postsWithNullImage = await client.fetch(
    `*[_type == "blogPost" && featuredImage == null]{ _id, title }`
  );
  console.log(`\nblogPost documents with null featuredImage: ${postsWithNullImage.length}`);
  for (const doc of postsWithNullImage) {
    console.log(`  Fixing blogPost: ${doc.title} (${doc._id})`);
    if (!dryRun) {
      await client.patch(doc._id).unset(['featuredImage']).commit();
    }
  }

  // blogPost: null image blocks inside content array
  const postsWithNullContentImages = await client.fetch(
    `*[_type == "blogPost" && count(content[_type == "image" && asset == null]) > 0]{ _id, title, content }`
  );
  console.log(`\nblogPost documents with null image blocks in content: ${postsWithNullContentImages.length}`);
  for (const doc of postsWithNullContentImages) {
    const cleaned = doc.content.filter(
      (block) => !(block._type === 'image' && block.asset == null)
    );
    console.log(
      `  Fixing blogPost content: ${doc.title} (${doc._id}) — removing ${doc.content.length - cleaned.length} null image block(s)`
    );
    if (!dryRun) {
      await client.patch(doc._id).set({ content: cleaned }).commit();
    }
  }

  const total = teamWithNullPhoto.length + postsWithNullImage.length + postsWithNullContentImages.length;
  console.log(`\nDone. ${total} document(s) ${dryRun ? 'would be' : 'were'} fixed.`);
}

fixNullImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
