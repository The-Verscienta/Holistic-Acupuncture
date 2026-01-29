# WordPress to Sanity Content Migration Guide

**Project:** Holistic Acupuncture Website
**Last Updated:** 2026-01-10
**Reference:** [Sanity Learn - WordPress Migration Course](https://www.sanity.io/learn/course/migrating-content-from-wordpress-to-sanity)

## Overview

This guide provides a step-by-step process for migrating content from the existing WordPress installation at holisticacupuncture.net to Sanity CMS, preserving all editorial content while transforming it into structured, presentation-agnostic data.

**Migration Scope:**
- Blog posts and articles
- Patient testimonials
- Team member profiles
- FAQ content
- Categories and tags
- Featured images and media assets
- Custom fields and metadata

---

## Migration Workflow

### Phase 1: Preparation

#### 1.1 Discover WordPress Content

**Identify Content to Migrate:**
```bash
# Access WordPress REST API
curl https://holisticacupuncture.net/wp-json/wp/v2/posts
curl https://holisticacupuncture.net/wp-json/wp/v2/pages
curl https://holisticacupuncture.net/wp-json/wp/v2/media
curl https://holisticacupuncture.net/wp-json/wp/v2/categories
curl https://holisticacupuncture.net/wp-json/wp/v2/tags
```

**Content Inventory:**
- Blog posts (articles about acupuncture, wellness, treatments)
- Pages (About, Services, etc. - may not migrate, rebuilding instead)
- Media (images, featured images)
- Testimonials (likely in custom post type or posts)
- Team members (likely in custom post type)
- Categories (for blog organization)
- Tags (for topic classification)

#### 1.2 Verify Sanity Schemas

Ensure your Sanity schemas match the WordPress content structure:

```typescript
// sanity/schemas/blog.ts - Already created ✅
// sanity/schemas/testimonial.ts - Already created ✅
// sanity/schemas/teamMember.ts - Already created ✅
// sanity/schemas/faq.ts - Already created ✅
// sanity/schemas/condition.ts - Already created ✅
```

**Schema Checklist:**
- [x] Blog post schema with author, categories, tags
- [x] Testimonial schema with patient info
- [x] Team member schema with bio and credentials
- [x] FAQ schema with questions/answers
- [x] Condition schema for treatment areas

#### 1.3 Set Up Migration Environment

**Install Dependencies:**
```bash
npm install --save-dev @sanity/client dotenv
npm install --save-dev html-to-portable-text
npm install --save-dev p-limit  # For rate limiting
```

**Create Migration Script Directory:**
```bash
mkdir -p scripts/migration
```

---

### Phase 2: Build Migration Scripts

#### 2.1 Base Configuration

**`scripts/migration/config.js`**
```javascript
import dotenv from 'dotenv';
import { createClient } from '@sanity/client';

dotenv.config();

// WordPress Configuration
export const WP_API_URL = 'https://holisticacupuncture.net/wp-json/wp/v2';
export const WP_AUTH = {
  username: process.env.WP_USERNAME,
  password: process.env.WP_APP_PASSWORD,
};

// Sanity Configuration
export const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Migration Settings
export const MIGRATION_CONFIG = {
  batchSize: 10,
  concurrentUploads: 5,
  retryAttempts: 3,
  rateLimitDelay: 100, // ms between requests
};
```

#### 2.2 WordPress Content Fetcher

**`scripts/migration/fetchWordPress.js`**
```javascript
import fetch from 'node-fetch';
import { WP_API_URL, WP_AUTH } from './config.js';

/**
 * Fetch all posts from WordPress REST API with pagination
 */
export async function fetchAllPosts() {
  const allPosts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API_URL}/posts?page=${page}&per_page=100&_embed`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WP_AUTH.username}:${WP_AUTH.password}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();
    allPosts.push(...posts);

    // Check if there are more pages
    const totalPages = parseInt(response.headers.get('x-wp-totalpages'), 10);
    hasMore = page < totalPages;
    page++;

    console.log(`Fetched page ${page - 1}/${totalPages} (${posts.length} posts)`);
  }

  return allPosts;
}

/**
 * Fetch specific WordPress content types
 */
export async function fetchContent(endpoint) {
  const url = `${WP_API_URL}/${endpoint}?per_page=100&_embed`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${WP_AUTH.username}:${WP_AUTH.password}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch categories and tags
 */
export async function fetchTaxonomies() {
  const [categories, tags] = await Promise.all([
    fetchContent('categories'),
    fetchContent('tags'),
  ]);

  return { categories, tags };
}
```

#### 2.3 HTML to Portable Text Converter

**`scripts/migration/htmlToPortableText.js`**
```javascript
import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';
import { Schema } from '@sanity/schema';

// Define schema for block content
const defaultSchema = Schema.compile({
  name: 'default',
  types: [
    {
      type: 'object',
      name: 'blogPost',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find((field) => field.name === 'body').type;

/**
 * Convert WordPress HTML content to Portable Text
 */
export function convertHtmlToPortableText(html) {
  if (!html) return [];

  try {
    // Parse HTML
    const dom = new JSDOM(html);
    const blocks = htmlToBlocks(html, blockContentType, {
      parseHtml: (htmlString) => dom.window.document,
    });

    return blocks;
  } catch (error) {
    console.error('Error converting HTML to Portable Text:', error);
    return [
      {
        _type: 'block',
        children: [{ _type: 'span', text: html.replace(/<[^>]*>/g, '') }],
      },
    ];
  }
}
```

#### 2.4 Image Upload Handler

**`scripts/migration/uploadImages.js`**
```javascript
import pLimit from 'p-limit';
import fetch from 'node-fetch';
import { sanityClient, MIGRATION_CONFIG } from './config.js';

// Rate limiting for concurrent uploads
const limit = pLimit(MIGRATION_CONFIG.concurrentUploads);

// Cache to avoid duplicate uploads
const uploadedImages = new Map();

/**
 * Upload image to Sanity from URL
 */
export async function uploadImageFromUrl(imageUrl, filename) {
  // Check cache first
  if (uploadedImages.has(imageUrl)) {
    console.log(`Using cached image: ${filename}`);
    return uploadedImages.get(imageUrl);
  }

  try {
    // Fetch image from WordPress
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    // Upload to Sanity
    const asset = await sanityClient.assets.upload('image', Buffer.from(buffer), {
      filename: filename,
    });

    // Cache the result
    uploadedImages.set(imageUrl, {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    });

    console.log(`Uploaded image: ${filename}`);
    return uploadedImages.get(imageUrl);
  } catch (error) {
    console.error(`Error uploading image ${filename}:`, error);
    return null;
  }
}

/**
 * Upload multiple images concurrently with rate limiting
 */
export async function uploadImages(images) {
  const uploadPromises = images.map((img) =>
    limit(() => uploadImageFromUrl(img.url, img.filename))
  );

  return await Promise.all(uploadPromises);
}
```

#### 2.5 Blog Post Migration Script

**`scripts/migration/migrateBlogPosts.js`**
```javascript
import slugify from 'slugify';
import { fetchAllPosts, fetchTaxonomies } from './fetchWordPress.js';
import { convertHtmlToPortableText } from './htmlToPortableText.js';
import { uploadImageFromUrl } from './uploadImages.js';
import { sanityClient } from './config.js';

/**
 * Transform WordPress post to Sanity blog post document
 */
async function transformPost(wpPost, taxonomies) {
  const { categories, tags } = taxonomies;

  // Get category and tag names
  const postCategories = wpPost.categories?.map((catId) =>
    categories.find((c) => c.id === catId)?.name
  ).filter(Boolean) || [];

  const postTags = wpPost.tags?.map((tagId) =>
    tags.find((t) => t.id === tagId)?.name
  ).filter(Boolean) || [];

  // Upload featured image if exists
  let featuredImage = null;
  if (wpPost._embedded?.['wp:featuredmedia']?.[0]) {
    const mediaItem = wpPost._embedded['wp:featuredmedia'][0];
    featuredImage = await uploadImageFromUrl(
      mediaItem.source_url,
      mediaItem.title?.rendered || 'featured-image.jpg'
    );
  }

  // Convert content to Portable Text
  const body = convertHtmlToPortableText(wpPost.content?.rendered || '');

  // Create Sanity document
  return {
    _type: 'blog',
    _id: `wp-post-${wpPost.id}`, // Deterministic ID
    title: wpPost.title?.rendered || 'Untitled',
    slug: {
      _type: 'slug',
      current: wpPost.slug || slugify(wpPost.title?.rendered || 'untitled', { lower: true }),
    },
    excerpt: wpPost.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '',
    body,
    featuredImage,
    categories: postCategories,
    tags: postTags,
    publishedAt: wpPost.date || new Date().toISOString(),
    _createdAt: wpPost.date,
    _updatedAt: wpPost.modified,
    // Metadata for tracking
    metadata: {
      wpId: wpPost.id,
      wpLink: wpPost.link,
      wpStatus: wpPost.status,
    },
  };
}

/**
 * Migrate all blog posts from WordPress to Sanity
 */
export async function migrateBlogPosts() {
  console.log('Starting blog post migration...\n');

  // Fetch content from WordPress
  console.log('Fetching WordPress content...');
  const [posts, taxonomies] = await Promise.all([
    fetchAllPosts(),
    fetchTaxonomies(),
  ]);

  console.log(`Found ${posts.length} posts to migrate\n`);

  // Transform and upload posts
  const transaction = sanityClient.transaction();
  let successCount = 0;
  let errorCount = 0;

  for (const [index, wpPost] of posts.entries()) {
    try {
      console.log(`[${index + 1}/${posts.length}] Migrating: ${wpPost.title?.rendered}`);

      const sanityDoc = await transformPost(wpPost, taxonomies);
      transaction.createOrReplace(sanityDoc);

      successCount++;
    } catch (error) {
      console.error(`Error migrating post ${wpPost.id}:`, error);
      errorCount++;
    }
  }

  // Commit all changes
  console.log('\nCommitting changes to Sanity...');
  await transaction.commit();

  console.log('\n✅ Migration complete!');
  console.log(`Success: ${successCount} posts`);
  console.log(`Errors: ${errorCount} posts`);
}
```

#### 2.6 Run Migration Script

**`scripts/migration/index.js`**
```javascript
import { migrateBlogPosts } from './migrateBlogPosts.js';

async function runMigration() {
  try {
    console.log('='.repeat(50));
    console.log('WordPress to Sanity Content Migration');
    console.log('='.repeat(50));
    console.log('');

    // Migrate blog posts
    await migrateBlogPosts();

    // TODO: Add other content types
    // await migrateTestimonials();
    // await migrateTeamMembers();

    console.log('\n' + '='.repeat(50));
    console.log('All migrations complete!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
```

**Add npm script to `package.json`:**
```json
{
  "scripts": {
    "migrate": "node scripts/migration/index.js"
  }
}
```

---

### Phase 3: Execute Migration

#### 3.1 Pre-Migration Checklist

- [ ] Backup WordPress database (just in case)
- [ ] Test Sanity Studio access
- [ ] Verify environment variables are set
- [ ] Test migration script with 1-2 posts first
- [ ] Review Sanity schema matches WordPress structure

#### 3.2 Test Migration

**Run with limited posts first:**
```javascript
// In migrateBlogPosts.js, temporarily limit posts
const posts = (await fetchAllPosts()).slice(0, 5); // Test with 5 posts
```

**Verify in Sanity Studio:**
1. Open http://localhost:3333
2. Check "Blog Posts" section
3. Verify content looks correct
4. Check images uploaded properly
5. Verify categories and tags

#### 3.3 Full Migration

**Run complete migration:**
```bash
npm run migrate
```

**Monitor progress:**
- Watch console output for errors
- Check Sanity Studio for imported content
- Verify image uploads in Sanity's media library

---

## Best Practices

### Data Quality

1. **Preserve Metadata:**
   - Keep original WordPress post IDs
   - Preserve creation and modification dates
   - Store original URLs for redirects

2. **Deterministic IDs:**
   - Use `wp-post-${wpPost.id}` format
   - Enables re-running migration safely
   - Prevents duplicate content

3. **Content Validation:**
   - Check for required fields before upload
   - Validate image URLs exist
   - Handle missing or corrupt data gracefully

### Performance Optimization

1. **Rate Limiting:**
   - Limit concurrent image uploads (5-10 max)
   - Add delays between API requests
   - Respect WordPress and Sanity API limits

2. **Batch Processing:**
   - Process posts in batches of 10-20
   - Commit transactions in batches
   - Avoid memory issues with large migrations

3. **Caching:**
   - Cache uploaded images to avoid duplicates
   - Store taxonomy lookups
   - Reuse transformation functions

### Error Handling

1. **Retry Logic:**
   - Retry failed image uploads 3 times
   - Continue migration if single post fails
   - Log errors for manual review

2. **Transaction Safety:**
   - Use Sanity transactions for atomic writes
   - Roll back on critical errors
   - Keep track of failed items

---

## Post-Migration Tasks

### 3.4 Content Review

- [ ] Review all migrated posts in Sanity Studio
- [ ] Check image quality and sizing
- [ ] Verify categories and tags are correct
- [ ] Test Portable Text formatting (headings, lists, links)
- [ ] Check for any missing content

### 3.5 SEO Preservation

**Set up redirects in `netlify.toml` or `vercel.json`:**
```toml
# Old WordPress URLs to new Astro URLs
[[redirects]]
  from = "/old-blog-post-slug"
  to = "/blog/old-blog-post-slug"
  status = 301

# Category archive redirects
[[redirects]]
  from = "/category/:category"
  to = "/blog?category=:category"
  status = 301
```

### 3.6 Cleanup

- [ ] Remove test/draft posts from Sanity
- [ ] Verify all images uploaded successfully
- [ ] Delete WordPress site (or keep as backup temporarily)
- [ ] Update DNS when ready to launch

---

## Troubleshooting

### Common Issues

**Issue: "Failed to fetch posts: 401 Unauthorized"**
```bash
# Solution: Generate WordPress Application Password
# 1. Go to WordPress Admin > Users > Your Profile
# 2. Scroll to "Application Passwords"
# 3. Create new password and add to .env
WP_USERNAME=your-username
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Issue: "Rate limit exceeded"**
```javascript
// Solution: Increase delay in config.js
export const MIGRATION_CONFIG = {
  rateLimitDelay: 500, // Increase to 500ms
  concurrentUploads: 3, // Reduce concurrent uploads
};
```

**Issue: "HTML conversion errors"**
```javascript
// Solution: Add fallback for problematic HTML
try {
  const body = convertHtmlToPortableText(wpPost.content?.rendered);
} catch (error) {
  console.error('HTML conversion failed, using plain text');
  const body = [{
    _type: 'block',
    children: [{ _type: 'span', text: wpPost.content?.rendered?.replace(/<[^>]*>/g, '') }],
  }];
}
```

---

## Additional Resources

- [Sanity Migration Course](https://www.sanity.io/learn/course/migrating-content-from-wordpress-to-sanity)
- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Portable Text Specification](https://portabletext.org/)

---

## Migration Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Setup migration scripts | 2-4 hours |
| Test with sample posts | 1-2 hours |
| Full blog post migration | 1-2 hours (automated) |
| Content review and cleanup | 2-4 hours |
| SEO redirects setup | 1-2 hours |
| **Total** | **7-14 hours** |

---

*Last updated: 2026-01-10*
