/**
 * Test script to inspect Portable Text structure
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

async function inspectPortableText() {
  // Get a single blog post to inspect
  const post = await sanityClient.fetch(`*[_type == "blog"][0] {
    _id,
    title,
    body
  }`);

  console.log('Post title:', post.title);
  console.log('\nBody structure:');
  console.log(JSON.stringify(post.body, null, 2));
}

inspectPortableText().catch(console.error);
