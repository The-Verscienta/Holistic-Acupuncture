# Cloudflare Images Integration

All WordPress images have been migrated to Cloudflare Images CDN for cost-effective image hosting.

## Cost Savings

- **Cloudflare Images:** $5/month for 100,000 images + 100,000 monthly variants
- **Sanity CDN:** Pay-as-you-go bandwidth costs
- **Savings:** Significant reduction in monthly costs

## Migrated Images

- **Total:** 563 images successfully uploaded
- **Success Rate:** 99.8%
- **Index:** `public/cloudflare-images-index.json`

## Using Cloudflare Images

### 1. View All Images

Visit: **http://localhost:4322/cloudflare-gallery**

Beautiful gallery showing all 563 images with:
- Automatic WebP/AVIF conversion
- Responsive thumbnails
- Full-size image links

### 2. Using the CloudflareImage Component

```astro
---
import CloudflareImage from '@/components/CloudflareImage.astro';
---

<!-- Basic usage -->
<CloudflareImage
  imageId="wp-18973"
  alt="Acupuncture needle"
  width={800}
  height={600}
/>

<!-- With custom fit and quality -->
<CloudflareImage
  imageId="wp-18973"
  alt="Acupuncture needle"
  width={400}
  height={300}
  fit="cover"
  quality={90}
  class="rounded-lg shadow-lg"
/>

<!-- Responsive hero image -->
<CloudflareImage
  imageId="wp-18973"
  alt="Hero image"
  width={1920}
  height={1080}
  fit="cover"
  loading="eager"
/>
```

### 3. Using Helper Functions Directly

```typescript
import {
  getCloudflareImageUrl,
  getCloudflareImageUrlWithOptions,
  getThumbnailUrl
} from '@/lib/cloudflare';

// Get original image URL
const imageUrl = getCloudflareImageUrl('wp-18973', 'public');

// Get optimized image with options
const optimizedUrl = getCloudflareImageUrlWithOptions('wp-18973', 'public', {
  width: 800,
  height: 600,
  fit: 'cover',
  quality: 85,
  format: 'auto' // Auto WebP/AVIF
});

// Get thumbnail
const thumbnail = getThumbnailUrl('wp-18973');
```

### 4. Finding Image IDs

All Cloudflare image IDs follow the pattern: `wp-{wordpress-id}`

To find an image:

```javascript
import cloudflareIndex from '@/public/cloudflare-images-index.json';

// Find by WordPress ID
const image = cloudflareIndex.find(img => img.id === 18973);
console.log(image.cloudflare.id); // "wp-18973"

// Find by filename
const image = cloudflareIndex.find(img =>
  img.filename === 'acupuncture-needle.jpg'
);

// Find by title
const image = cloudflareIndex.find(img =>
  img.title.includes('Acupuncture')
);
```

## Image Transformation Options

Cloudflare Images supports powerful URL-based transformations:

### Width & Height

```typescript
getCloudflareImageUrlWithOptions('wp-18973', 'public', {
  width: 800,
  height: 600
});
```

### Fit Modes

- **`scale-down`**: Shrink to fit within bounds (maintains aspect ratio)
- **`contain`**: Fit within bounds, add letterboxing if needed
- **`cover`**: Fill bounds, crop if needed (default)
- **`crop`**: Resize to exactly fill bounds
- **`pad`**: Add padding to maintain aspect ratio

```typescript
getCloudflareImageUrlWithOptions('wp-18973', 'public', {
  width: 800,
  height: 600,
  fit: 'cover' // or 'contain', 'crop', etc.
});
```

### Format & Quality

```typescript
getCloudflareImageUrlWithOptions('wp-18973', 'public', {
  format: 'auto', // Auto WebP/AVIF based on browser support
  quality: 85 // 1-100
});
```

## Creating Custom Variants

In Cloudflare dashboard, you can create named variants (presets):

1. Go to: https://dash.cloudflare.com/
2. Navigate to Images → Variants
3. Create variants like:
   - `thumbnail`: 200x200, cover
   - `hero`: 1920x1080, cover, quality 90
   - `card`: 400x300, cover, quality 85

Then use them:

```typescript
getCloudflareImageUrl('wp-18973', 'thumbnail');
getCloudflareImageUrl('wp-18973', 'hero');
```

## Migration Scripts

### Migrate Images to Cloudflare

```bash
npm run migrate:cloudflare
```

Re-runs the migration (uploads any new images from WordPress).

### List All Images

```bash
node scripts/list-all-images.js
```

Shows all WordPress images with their Cloudflare IDs.

## Example: Blog Post Featured Image

Replace Sanity images with Cloudflare:

```astro
---
import CloudflareImage from '@/components/CloudflareImage.astro';
import cloudflareIndex from '@/public/cloudflare-images-index.json';

// Get the blog post's WordPress featured image ID
const wpImageId = post.metadata?.wpFeaturedImageId;

// Find corresponding Cloudflare image
const cfImage = cloudflareIndex.find(img => img.id === wpImageId);
---

{cfImage && (
  <CloudflareImage
    imageId={cfImage.cloudflare.id}
    alt={post.title}
    width={1200}
    height={630}
    fit="cover"
    class="featured-image"
  />
)}
```

## Browser cache (Cache TTL)

Images from `imagedelivery.net` are served by Cloudflare Images. **Browser TTL** controls the `Cache-Control` header (and thus how long browsers cache images). A short TTL can trigger PageSpeed’s “long cache lifetime” suggestion.

**Default:** Cloudflare Images uses a 2-day browser TTL.

**To use a long cache (1 year) for better LCP/repeat visits:**

### Option A: Dashboard

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/) go to **Images** (or **Account** → **Images**).
2. Open **Browser TTL** (or **Cache** / **Caching** for Images).
3. Set **Browser TTL** to **1 year** (e.g. `31536000` seconds).

### Option B: API (curl)

```bash
curl --request PATCH "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/config" \
  --header "Authorization: Bearer <API_TOKEN>" \
  --header "Content-Type: application/json" \
  --data '{"browser_ttl": 31536000}'
```

Replace `{account_id}` with your Cloudflare account ID and `<API_TOKEN>` with an API token that has **Cloudflare Images: Edit** permission.

### Option C: Script (uses .env)

From the project root (with `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_IMAGES_TOKEN` in `.env`):

```bash
node scripts/set-cloudflare-images-browser-ttl.js
```

After this, responses from `imagedelivery.net` will include something like  
`Cache-Control: public, max-age=31536000, stale-while-revalidate=7200`, which satisfies the “long cache lifetime” recommendation.

Docs: [Browser TTL · Cloudflare Images](https://developers.cloudflare.com/images/manage-images/browser-ttl/).

## Performance Benefits

1. **Automatic Format Optimization:** WebP/AVIF served to supporting browsers
2. **Global CDN:** Fast delivery worldwide
3. **Responsive Images:** Automatic 2x srcset generation
4. **Lazy Loading:** Built into CloudflareImage component
5. **Cost Effective:** Fixed $5/month pricing
6. **Long cache:** Set Browser TTL to 1 year (see above) for better repeat-visit performance

## Blog Posts Integration

Blog posts automatically use Cloudflare Images via the `HybridImage` component!

### How It Works

The `HybridImage` component intelligently chooses between Cloudflare and Sanity:

1. **Checks mapping:** Looks up if the Sanity image has a Cloudflare equivalent
2. **Uses Cloudflare:** If found, serves from Cloudflare CDN ($5/month fixed cost)
3. **Falls back to Sanity:** If not found, uses Sanity CDN (bandwidth costs)

### Coverage

```bash
npm run test:images
```

Shows mapping statistics:
- **563/564 images** mapped (99.8% coverage)
- Blog posts automatically use Cloudflare for 99.8% of images
- Only 1 image falls back to Sanity

### Usage in Blog Posts

Blog index (`/blog`):
```astro
<HybridImage
  image={post.featuredImage}
  alt={post.title}
  width={800}
  height={450}
/>
```

Individual blog post (`/blog/[slug]`):
```astro
<HybridImage
  image={post.featuredImage}
  alt={post.title}
  width={1200}
  height={675}
  loading="eager"
/>
```

The component automatically:
- ✅ Uses Cloudflare if available (99.8% of images)
- ✅ Falls back to Sanity if not found
- ✅ Maintains same API as SanityImage
- ✅ Saves significant CDN costs

## Testing

### Test Image Mapping

```bash
npm run test:images
```

Displays:
- Mapping coverage statistics
- Sample Sanity → Cloudflare mappings
- Images without Cloudflare equivalents

### View All Images

- **Cloudflare Gallery:** http://localhost:4322/cloudflare-gallery
- **Original Gallery:** http://localhost:4322/image-gallery

## Next Steps

1. ✅ Images migrated to Cloudflare
2. ✅ Gallery page created
3. ✅ CloudflareImage component created
4. ✅ HybridImage component created
5. ✅ Blog posts updated to use HybridImage
6. ✅ Image mapping service created
7. 🔄 Monitor and verify in production
8. ⏳ Once verified, optionally delete from Sanity to save costs

---

**Questions?** Check the Cloudflare Images docs: https://developers.cloudflare.com/images/
