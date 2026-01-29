# WordPress Image Migration Guide

Complete guide for migrating all images from WordPress media library.

## Quick Start

### 1. Configure Migration Options

Edit `scripts/migration/migrateAllImages.js` (lines 18-20):

```javascript
const MIGRATE_TO_SANITY = true;   // Upload to Sanity CDN (recommended)
const DOWNLOAD_LOCALLY = false;   // Download to public folder
const CREATE_INDEX = true;        // Create JSON index of images
```

### 2. Run Migration

```bash
npm run migrate:images
```

## Migration Options

### Option 1: Sanity CDN (Recommended) ✨

**Pros:**
- Global CDN delivery (fast worldwide)
- Automatic image optimization
- Built-in transformations (resize, crop, format)
- No storage cost on your hosting
- Integrated with Sanity CMS

**Cons:**
- Relies on external service
- Requires Sanity account

**Configuration:**
```javascript
const MIGRATE_TO_SANITY = true;
const DOWNLOAD_LOCALLY = false;
```

### Option 2: Local Self-Hosted

**Pros:**
- Full control over images
- No external dependencies
- Works offline

**Cons:**
- Larger repository size
- No automatic optimization
- Slower global delivery
- Uses your hosting bandwidth

**Configuration:**
```javascript
const MIGRATE_TO_SANITY = false;
const DOWNLOAD_LOCALLY = true;
```

### Option 3: Both (Backup Strategy)

**Best for:** Peace of mind with local backup + CDN performance

**Configuration:**
```javascript
const MIGRATE_TO_SANITY = true;
const DOWNLOAD_LOCALLY = true;
```

## What Gets Migrated

The script migrates ALL images from WordPress media library:

- ✅ Featured images (already migrated with blog posts)
- ✅ Images used in post content
- ✅ Unused images in media library
- ✅ Image metadata (title, alt text, caption)
- ✅ Original dimensions and file sizes

## Output

### Sanity CDN
Images uploaded to: `https://cdn.sanity.io/images/[your-project-id]/...`

Access via Sanity Image URL builder:
```javascript
import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './lib/sanity';

const builder = imageUrlBuilder(sanityClient);
const imageUrl = builder.image(imageRef).width(800).url();
```

### Local Files
Images downloaded to: `public/wordpress-images/`

Access in Astro:
```astro
<img src="/wordpress-images/my-image.jpg" alt="..." />
```

### JSON Index
Complete catalog saved to: `public/wordpress-media-index.json`

Contains:
- Original WordPress URL
- Sanity asset reference (if uploaded)
- Local file path (if downloaded)
- Metadata (title, alt, dimensions, file size)

## Example Usage

### Use Sanity CDN Images in Astro

```astro
---
import { getImageUrl } from '@/lib/sanity';

const imageRef = {
  _type: 'image',
  asset: { _ref: 'image-abc123...' }
};
---

<img
  src={getImageUrl(imageRef).width(800).url()}
  alt="My image"
/>
```

### Use Local Images

```astro
<img src="/wordpress-images/my-photo.jpg" alt="My photo" />
```

### Find Images by WordPress ID

```javascript
import imageIndex from '/wordpress-media-index.json';

const wpImage = imageIndex.find(img => img.id === 12345);
console.log(wpImage.sanity); // Sanity reference
console.log(wpImage.local);  // Local path
```

## Performance Tips

1. **Sanity CDN:**
   - Images are automatically optimized
   - Use URL parameters for responsive images
   - Leverage automatic WebP conversion

2. **Local Images:**
   - Manually optimize with tools like `sharp`
   - Consider adding to `.gitignore` if very large
   - Use image optimization during build

## Troubleshooting

### "No media items found"
- Check WordPress REST API is accessible
- Verify WP_API_URL in `.env`
- Ensure media library isn't empty

### "Failed to upload to Sanity"
- Check SANITY_API_TOKEN is valid
- Verify token has write permissions
- Check Sanity project quotas

### "Permission denied" (local download)
- Ensure `public/` folder is writable
- Check disk space available

## Advanced: Update Image References

After migration, you may want to update image URLs in migrated posts:

```javascript
// Example: Replace WordPress image URLs with Sanity URLs
const oldUrl = 'https://holisticacupuncture.net/wp-content/uploads/image.jpg';
const imageData = imageIndex.find(img => img.url === oldUrl);
const newUrl = getImageUrl(imageData.sanity).url();
```

## NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "migrate:images": "node scripts/migration/migrateAllImages.js",
    "migrate:images:sanity": "node scripts/migration/migrateAllImages.js --sanity-only",
    "migrate:images:local": "node scripts/migration/migrateAllImages.js --local-only"
  }
}
```

---

**Questions?** Check the main migration guide or Sanity documentation.
