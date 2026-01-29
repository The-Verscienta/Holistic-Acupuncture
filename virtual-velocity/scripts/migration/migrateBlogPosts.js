/**
 * Blog Post Migration Script
 *
 * Migrates WordPress blog posts to Sanity CMS
 */

import slugify from 'slugify';
import { fetchAllPosts, fetchTaxonomies } from './fetchWordPress.js';
import { convertHtmlToPortableText, extractExcerpt } from './htmlToPortableText.js';
import { extractFeaturedImage } from './uploadImages.js';
import { sanityClient, MIGRATION_CONFIG } from './config.js';

/**
 * Transform WordPress post to Sanity blog post document
 */
async function transformPost(wpPost, taxonomies) {
  const { categories, tags } = taxonomies;

  console.log(`\n  📄 Processing: "${wpPost.title?.rendered || 'Untitled'}"`);

  // Get category and tag names
  const postCategories =
    wpPost.categories
      ?.map((catId) => categories.find((c) => c.id === catId)?.name)
      .filter(Boolean) || [];

  const postTags =
    wpPost.tags
      ?.map((tagId) => tags.find((t) => t.id === tagId)?.name)
      .filter(Boolean) || [];

  console.log(`    Categories: ${postCategories.join(', ') || 'None'}`);
  console.log(`    Tags: ${postTags.join(', ') || 'None'}`);

  // Upload featured image if exists
  console.log(`    🖼️  Featured image...`);
  const featuredImage = await extractFeaturedImage(wpPost);

  // Convert content to Portable Text
  console.log(`    📝 Converting content...`);
  const body = convertHtmlToPortableText(wpPost.content?.rendered || '');
  console.log(`    ✓ Converted to ${body.length} blocks`);

  // Extract excerpt
  const excerpt = extractExcerpt(wpPost.excerpt?.rendered) || '';

  // Generate slug
  const slug = wpPost.slug || slugify(wpPost.title?.rendered || 'untitled', { lower: true, strict: true });

  // Convert WordPress date to proper ISO datetime
  const publishDate = wpPost.date ? new Date(wpPost.date).toISOString() : new Date().toISOString();

  // Create Sanity document
  return {
    _type: 'blogPost',
    _id: `wp-post-${wpPost.id}`, // Deterministic ID for safe re-runs
    title: wpPost.title?.rendered || 'Untitled',
    slug: {
      _type: 'slug',
      current: slug,
    },
    excerpt,
    body,
    featuredImage,
    categories: postCategories,
    tags: postTags,
    publishedAt: publishDate,
    // Store metadata for reference (including original WordPress dates)
    metadata: {
      wpId: wpPost.id,
      wpLink: wpPost.link,
      wpStatus: wpPost.status,
      wpAuthor: wpPost.author,
      wpCreated: wpPost.date,
      wpModified: wpPost.modified,
    },
  };
}

/**
 * Migrate all blog posts from WordPress to Sanity
 */
export async function migrateBlogPosts() {
  console.log('═'.repeat(60));
  console.log('📰 BLOG POST MIGRATION');
  console.log('═'.repeat(60));
  console.log('');

  // Fetch content from WordPress
  console.log('📥 Fetching WordPress content...\n');
  const [posts, taxonomies] = await Promise.all([fetchAllPosts(), fetchTaxonomies()]);

  if (posts.length === 0) {
    console.log('⚠️  No posts found to migrate\n');
    return;
  }

  console.log(`Found ${posts.length} posts to migrate\n`);

  // Filter only published posts (optional)
  const publishedPosts = posts.filter((post) => post.status === 'publish');
  console.log(`📊 Status breakdown:`);
  console.log(`   Published: ${publishedPosts.length}`);
  console.log(`   Draft: ${posts.filter((p) => p.status === 'draft').length}`);
  console.log(`   Other: ${posts.length - publishedPosts.length - posts.filter((p) => p.status === 'draft').length}\n`);

  // Ask which posts to migrate
  const postsToMigrate = publishedPosts; // Change to 'posts' to include drafts

  console.log(`📝 Migrating ${postsToMigrate.length} posts...\n`);

  // Transform and upload posts
  let successCount = 0;
  let errorCount = 0;
  const failedPosts = [];

  for (const [index, wpPost] of postsToMigrate.entries()) {
    console.log(`\n[${ index + 1}/${postsToMigrate.length}] Processing post...`);

    try {
      const sanityDoc = await transformPost(wpPost, taxonomies);

      // Upload to Sanity (unless dry run)
      if (MIGRATION_CONFIG.dryRun) {
        console.log(`  [DRY RUN] Would create/replace document: ${sanityDoc._id}`);
      } else {
        await sanityClient.createOrReplace(sanityDoc);
        console.log(`  ✅ Uploaded to Sanity: ${sanityDoc._id}`);
      }

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
      failedPosts.push({
        id: wpPost.id,
        title: wpPost.title?.rendered,
        error: error.message,
      });
    }

    // Progress indicator
    const progress = ((index + 1) / postsToMigrate.length * 100).toFixed(1);
    console.log(`  Progress: ${progress}%`);

    // Rate limiting between posts
    if (index < postsToMigrate.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, MIGRATION_CONFIG.rateLimitDelay));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Successful: ${successCount} posts`);
  console.log(`❌ Failed: ${errorCount} posts`);
  console.log(`📈 Success rate: ${((successCount / postsToMigrate.length) * 100).toFixed(1)}%`);

  if (failedPosts.length > 0) {
    console.log('\n❌ Failed posts:');
    failedPosts.forEach((post) => {
      console.log(`  - ${post.title} (ID: ${post.id})`);
      console.log(`    Error: ${post.error}`);
    });
  }

  if (MIGRATION_CONFIG.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes were made to Sanity');
  }

  console.log('\n✨ Migration complete!\n');
}
