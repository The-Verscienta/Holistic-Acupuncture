/**
 * Test script to inspect link structure in Portable Text
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function inspectLinks() {
  // Get a blog post that likely has links
  const posts = await sanityClient.fetch(`*[_type == "blog"] | order(_createdAt desc) [0...5] {
    _id,
    title,
    body
  }`);

  for (const post of posts) {
    console.log('\n' + '='.repeat(60));
    console.log('Post:', post.title);
    console.log('='.repeat(60));

    if (!post.body || post.body.length === 0) {
      console.log('No body content');
      continue;
    }

    // Look for blocks with links
    const blocksWithLinks = post.body.filter(block => {
      if (block._type !== 'block') return false;
      return block.markDefs && block.markDefs.length > 0;
    });

    if (blocksWithLinks.length === 0) {
      console.log('No blocks with links found');
      continue;
    }

    console.log(`\nFound ${blocksWithLinks.length} blocks with links:`);

    blocksWithLinks.forEach((block, i) => {
      console.log(`\nBlock ${i + 1}:`);
      console.log('markDefs:', JSON.stringify(block.markDefs, null, 2));
      console.log('children:', JSON.stringify(block.children, null, 2));
    });

    break; // Just show first post with links
  }
}

inspectLinks().catch(console.error);
