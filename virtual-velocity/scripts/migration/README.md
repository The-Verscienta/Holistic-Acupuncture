# WordPress to Sanity Migration Scripts

Automated migration scripts to transfer content from WordPress to Sanity CMS.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create/update `.env` in the project root:

```bash
# WordPress Configuration
WP_API_URL=https://holisticacupuncture.net/wp-json/wp/v2
WP_USERNAME=your_username                    # Optional, for private sites
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx         # Optional, WordPress app password

# Sanity Configuration
PUBLIC_SANITY_PROJECT_ID=your_project_id    # Required
PUBLIC_SANITY_DATASET=production            # Required
SANITY_API_TOKEN=your_write_token           # Required
```

### 3. Test Connection

```bash
npm run migrate:test
```

Expected output:
```
✅ Connection successful! Found 42 total posts
```

### 4. Dry Run (Recommended First)

Test the migration without writing to Sanity:

```bash
npm run migrate:dry-run
```

This will:
- ✅ Fetch content from WordPress
- ✅ Transform to Sanity format
- ✅ Show what would be migrated
- ❌ NOT write to Sanity

### 5. Run Full Migration

When ready:

```bash
npm run migrate
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run full migration |
| `npm run migrate:dry-run` | Test without writing to Sanity |
| `npm run migrate:test` | Test WordPress connection only |

## What Gets Migrated

### ✅ Blog Posts
- Title, slug, content
- Excerpt
- Featured image
- Categories and tags
- Publish date
- WordPress metadata (for reference)

### 🔄 Content Transformations
- **HTML → Portable Text:** WordPress content converted to Sanity's block format
- **Images:** Uploaded to Sanity's CDN
- **Shortcodes:** Removed or converted
- **Embeds:** Converted to placeholder text

### 📊 Preserved Metadata
- WordPress post ID (as `metadata.wpId`)
- Original URL (as `metadata.wpLink`)
- Publish status
- Author ID

## Migration Process

1. **Fetch:** Retrieves content from WordPress REST API
2. **Transform:** Converts HTML to Portable Text
3. **Upload Images:** Downloads and uploads to Sanity
4. **Create Documents:** Writes to Sanity with deterministic IDs
5. **Report:** Shows success/failure statistics

## Features

### ⚡ Performance Optimizations
- **Concurrent uploads:** 5 images uploaded simultaneously
- **Caching:** Uploaded images cached to avoid duplicates
- **Rate limiting:** Prevents API throttling
- **Batch processing:** Handles large content volumes
- **Retry logic:** Automatically retries failed requests

### 🔒 Safety Features
- **Dry run mode:** Test before committing
- **Deterministic IDs:** Safe to re-run migration
- **Error handling:** Continues on single post failure
- **Detailed logging:** Track progress and errors

### 📝 Logging
Every step is logged:
```
[1/42] Processing post...
  📄 Processing: "Benefits of Acupuncture"
    Categories: Health, Wellness
    Tags: acupuncture, natural healing
    🖼️  Featured image...
    ✓ Uploaded: benefits-of-acupuncture.jpg
    📝 Converting content...
    ✓ Converted to 12 blocks
  ✅ Uploaded to Sanity: wp-post-123
  Progress: 2.4%
```

## Configuration

Edit `scripts/migration/config.js`:

```javascript
export const MIGRATION_CONFIG = {
  batchSize: 10,           // Posts per batch
  concurrentUploads: 5,    // Simultaneous image uploads
  retryAttempts: 3,        // Retry failed requests
  rateLimitDelay: 100,     // ms between requests
  dryRun: false,           // Test mode
};
```

## Troubleshooting

### "Connection failed: 401 Unauthorized"

WordPress site requires authentication.

**Solution:**
1. Go to WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords"
3. Create new password
4. Add to `.env`:
   ```
   WP_USERNAME=your_username
   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### "SANITY_API_TOKEN not configured"

Missing Sanity write token.

**Solution:**
1. Go to [Sanity Dashboard](https://www.sanity.io/manage)
2. Select your project
3. Go to API → Tokens
4. Create token with "Editor" permissions
5. Add to `.env`:
   ```
   SANITY_API_TOKEN=your_token_here
   ```

### "HTML conversion failed"

Some WordPress content couldn't be converted to Portable Text.

**Result:** Falls back to plain text (stripped HTML)

**To improve:**
- Check for unusual HTML structures
- Remove WordPress plugins that inject complex HTML
- Manually review converted posts in Sanity Studio

### Images not uploading

**Common causes:**
- Image URLs are broken
- Images require authentication
- Rate limiting

**Check:**
1. Visit image URL in browser
2. Reduce `concurrentUploads` in config
3. Increase `rateLimitDelay`

### Rate limit exceeded

WordPress or Sanity is throttling requests.

**Solution:**
```javascript
// In config.js
export const MIGRATION_CONFIG = {
  concurrentUploads: 3,    // Reduce from 5
  rateLimitDelay: 500,     // Increase from 100ms
};
```

## Re-running Migration

The migration uses **deterministic IDs** (`wp-post-{id}`), making it safe to re-run:

```bash
npm run migrate
```

This will:
- ✅ Update existing posts (via `createOrReplace`)
- ✅ Skip already-uploaded images (via cache)
- ✅ Add any new posts since last run

## Advanced Usage

### Migrate Only Recent Posts

Edit `migrateBlogPosts.js`:

```javascript
// Filter posts by date
const recentPosts = posts.filter((post) => {
  const postDate = new Date(post.date);
  const cutoffDate = new Date('2024-01-01');
  return postDate > cutoffDate;
});
```

### Migrate Drafts Too

Edit `migrateBlogPosts.js`:

```javascript
// Change this line:
const postsToMigrate = publishedPosts;

// To this:
const postsToMigrate = posts; // Include all statuses
```

### Custom Transformations

Edit `migrateBlogPosts.js` `transformPost()` function:

```javascript
// Add custom fields
return {
  _type: 'blog',
  // ... existing fields
  customField: wpPost.custom_field_name,
  authorName: wpPost.author_name,
};
```

## File Structure

```
scripts/migration/
├── index.js                  # Main entry point
├── config.js                 # Configuration
├── fetchWordPress.js         # WordPress API fetcher
├── htmlToPortableText.js     # HTML converter
├── uploadImages.js           # Image uploader
├── migrateBlogPosts.js       # Blog post migrator
└── README.md                 # This file
```

## Migration Checklist

Before running:
- [ ] Backup WordPress database
- [ ] Create Sanity project
- [ ] Get Sanity API token
- [ ] Configure `.env` file
- [ ] Test connection: `npm run migrate:test`
- [ ] Dry run: `npm run migrate:dry-run`
- [ ] Review dry run output
- [ ] Run migration: `npm run migrate`

After running:
- [ ] Review migrated content in Sanity Studio
- [ ] Check image uploads
- [ ] Verify categories/tags
- [ ] Test a few posts on frontend
- [ ] Set up redirects (old URLs → new URLs)

## Support

See main documentation:
- [WordPress to Sanity Migration Guide](../../docs/WORDPRESS-SANITY-MIGRATION.md)

## License

MIT
