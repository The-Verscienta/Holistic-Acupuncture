/**
 * Patch existing blog posts in Sanity to add missing _key properties
 *
 * This script fixes the "Missing keys" error in Sanity Studio by adding
 * _key properties to all blocks, children, and markDefs in blog post body content.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Add _key properties to blocks recursively
 */
function addKeysToBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map(block => {
    const newBlock = { ...block };

    // Add _key to block if missing
    if (!newBlock._key) {
      newBlock._key = generateKey();
    }

    // Add _key to children if they exist
    if (Array.isArray(newBlock.children)) {
      newBlock.children = newBlock.children.map(child => ({
        ...child,
        _key: child._key || generateKey(),
      }));
    }

    // Handle nested blocks (like in lists)
    if (Array.isArray(newBlock.markDefs)) {
      newBlock.markDefs = newBlock.markDefs.map(def => ({
        ...def,
        _key: def._key || generateKey(),
      }));
    }

    return newBlock;
  });
}

/**
 * Check if a block needs keys
 */
function needsKeys(blocks) {
  if (!Array.isArray(blocks)) return false;

  for (const block of blocks) {
    if (!block._key) return true;

    if (Array.isArray(block.children)) {
      for (const child of block.children) {
        if (!child._key) return true;
      }
    }

    if (Array.isArray(block.markDefs)) {
      for (const def of block.markDefs) {
        if (!def._key) return true;
      }
    }
  }

  return false;
}

async function patchBlogPosts() {
  console.log('🔍 Fetching all blog posts from Sanity...\n');

  // Fetch all blog posts
  const posts = await sanityClient.fetch(`*[_type == "blog"] {
    _id,
    _rev,
    title,
    slug,
    body
  }`);

  console.log(`📊 Found ${posts.length} blog posts\n`);

  let patchedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const progress = `[${i + 1}/${posts.length}]`;

    try {
      // Check if this post needs patching
      if (!post.body || !Array.isArray(post.body) || post.body.length === 0) {
        console.log(`${progress} ⏭️  Skipping "${post.title}" - no body content`);
        skippedCount++;
        continue;
      }

      if (!needsKeys(post.body)) {
        console.log(`${progress} ✓ Skipping "${post.title}" - already has keys`);
        skippedCount++;
        continue;
      }

      // Add keys to the body content
      const patchedBody = addKeysToBlocks(post.body);

      // Update the post in Sanity
      await sanityClient
        .patch(post._id)
        .set({ body: patchedBody })
        .commit();

      console.log(`${progress} ✅ Patched "${post.title}"`);
      patchedCount++;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`${progress} ❌ Error patching "${post.title}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 Patch Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully patched: ${patchedCount}`);
  console.log(`⏭️  Skipped (no changes needed): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total posts: ${posts.length}`);
  console.log('='.repeat(60));

  if (patchedCount > 0) {
    console.log('\n✨ Blog posts have been patched! The content should now display correctly.');
    console.log('💡 Try refreshing your blog post pages to see the content.');
  }
}

// Run the patch script
patchBlogPosts()
  .then(() => {
    console.log('\n✅ Patch script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Patch script failed:', error);
    process.exit(1);
  });
