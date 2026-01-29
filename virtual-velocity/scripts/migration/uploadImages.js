/**
 * Image Upload Handler
 *
 * Uploads images from WordPress to Sanity with caching and rate limiting
 */

import pLimit from 'p-limit';
import fetch from 'node-fetch';
import { sanityClient, MIGRATION_CONFIG } from './config.js';

// Rate limiting for concurrent uploads
const limit = pLimit(MIGRATION_CONFIG.concurrentUploads);

// Cache to avoid duplicate uploads
const uploadedImages = new Map();

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : 'jpg';
  } catch {
    return 'jpg';
  }
}

/**
 * Generate safe filename from URL
 */
function generateFilename(url, title = '') {
  try {
    const ext = getFileExtension(url);
    const pathname = new URL(url).pathname;
    const basename = pathname.split('/').pop().replace(/\.[^.]+$/, '');

    // Use title if available, otherwise use URL basename
    const name = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50)
      : basename;

    return `${name}.${ext}`;
  } catch {
    return `image-${Date.now()}.jpg`;
  }
}

/**
 * Upload image to Sanity from URL
 */
export async function uploadImageFromUrl(imageUrl, title = '') {
  // Check cache first
  if (uploadedImages.has(imageUrl)) {
    console.log(`    ↻ Using cached: ${generateFilename(imageUrl, title)}`);
    return uploadedImages.get(imageUrl);
  }

  // Skip if dry run
  if (MIGRATION_CONFIG.dryRun) {
    console.log(`    [DRY RUN] Would upload: ${imageUrl}`);
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'dry-run-image-id',
      },
    };
  }

  try {
    // Fetch image from WordPress
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Sanity Migration Script',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Get image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Sanity
    const filename = generateFilename(imageUrl, title);
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename,
      contentType,
    });

    // Create image reference
    const imageRef = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };

    // Cache the result
    uploadedImages.set(imageUrl, imageRef);

    console.log(`    ✓ Uploaded: ${filename}`);
    return imageRef;
  } catch (error) {
    console.error(`    ✗ Failed to upload ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Upload multiple images concurrently with rate limiting
 */
export async function uploadImages(images) {
  const uploadPromises = images.map((img) =>
    limit(() => uploadImageFromUrl(img.url, img.title))
  );

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean); // Filter out failed uploads
}

/**
 * Extract featured image from WordPress post
 */
export async function extractFeaturedImage(wpPost) {
  try {
    const mediaItem = wpPost._embedded?.['wp:featuredmedia']?.[0];

    if (!mediaItem) {
      return null;
    }

    const imageUrl = mediaItem.source_url;
    const title = mediaItem.title?.rendered || mediaItem.alt_text || '';

    return await uploadImageFromUrl(imageUrl, title);
  } catch (error) {
    console.error(`    ⚠️  Failed to extract featured image:`, error.message);
    return null;
  }
}

/**
 * Get upload statistics
 */
export function getUploadStats() {
  return {
    total: uploadedImages.size,
    cached: uploadedImages.size,
  };
}

/**
 * Clear upload cache (useful between migration runs)
 */
export function clearUploadCache() {
  uploadedImages.clear();
  console.log('🗑️  Upload cache cleared');
}
