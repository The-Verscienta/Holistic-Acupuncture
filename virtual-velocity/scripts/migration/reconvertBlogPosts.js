/**
 * Re-convert blog posts from WordPress HTML to Portable Text
 * using the improved custom converter that preserves formatting
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import axios from 'axios';
import { convertHtmlToPortableText } from './htmlToPortableTextCustom.js';
import { WP_API_URL } from './config.js';

dotenv.config();

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function fetchWordPressPost(wpId) {
  try {
    const response = await axios.get(`${WP_API_URL}/posts/${wpId}`);
    return response.data;
  } catch (error) {
    console.error(`    Error fetching WP post ${wpId}:`, error.message);
    return null;
  }
}

async function reconvertBlogPosts() {
  console.log('🔍 Fetching all blog posts from Sanity...\n');

  // Fetch all blog posts with WordPress metadata
  const posts = await sanityClient.fetch(`*[_type == "blog" && metadata.wpId != null] {
    _id,
    _rev,
    title,
    slug,
    "wpId": metadata.wpId
  }`);

  console.log(`📊 Found ${posts.length} blog posts with WordPress IDs\n`);

  let reconvertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const progress = `[${i + 1}/${posts.length}]`;

    try {
      console.log(`${progress} Processing "${post.title}"...`);

      // Fetch original WordPress content
      const wpPost = await fetchWordPressPost(post.wpId);

      if (!wpPost || !wpPost.content || !wpPost.content.rendered) {
        console.log(`${progress} ⏭️  Skipping - no WordPress content found`);
        skippedCount++;
        continue;
      }

      // Convert HTML to Portable Text using improved converter
      const portableTextBody = convertHtmlToPortableText(wpPost.content.rendered);

      if (!portableTextBody || portableTextBody.length === 0) {
        console.log(`${progress} ⏭️  Skipping - conversion resulted in empty body`);
        skippedCount++;
        continue;
      }

      // Update the post in Sanity
      await sanityClient
        .patch(post._id)
        .set({ body: portableTextBody })
        .commit();

      console.log(`${progress} ✅ Re-converted "${post.title}" (${portableTextBody.length} blocks)`);
      reconvertedCount++;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`${progress} ❌ Error processing "${post.title}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 Re-conversion Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully re-converted: ${reconvertedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total posts: ${posts.length}`);
  console.log('='.repeat(60));

  if (reconvertedCount > 0) {
    console.log('\n✨ Blog posts have been re-converted with improved formatting!');
    console.log('💡 Formatting should now include:');
    console.log('   - Proper paragraphs');
    console.log('   - Bold and italic text');
    console.log('   - Working links');
    console.log('   - Headings');
    console.log('   - Lists');
    console.log('\n🔄 Refresh your blog post pages to see the improvements.');
  }
}

// Run the re-conversion script
reconvertBlogPosts()
  .then(() => {
    console.log('\n✅ Re-conversion script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Re-conversion script failed:', error);
    process.exit(1);
  });
