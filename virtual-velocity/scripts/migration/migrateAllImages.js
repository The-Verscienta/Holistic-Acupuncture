/**
 * WordPress Media Library to Sanity/Local Migration
 *
 * Migrates ALL images from WordPress media library to:
 * - Sanity CDN (recommended - global CDN, optimized)
 * - Local public folder (self-hosted with your site)
 * - Both (for backup)
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadImageFromUrl } from './uploadImages.js';
import { WP_API_URL, MIGRATION_CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../../public/wordpress-images');
const MIGRATE_TO_SANITY = true;  // Upload to Sanity CDN
const DOWNLOAD_LOCALLY = false;  // Download to public folder
const CREATE_INDEX = true;       // Create JSON index of all images

/**
 * Fetch all media items from WordPress
 */
async function fetchAllMediaItems() {
  console.log('📥 Fetching media items from WordPress...\n');

  const allMedia = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API_URL}/media?page=${page}&per_page=100`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const media = await response.json();
      allMedia.push(...media);

      // Check pagination
      const totalPages = parseInt(response.headers.get('x-wp-totalpages'), 10);
      hasMore = page < totalPages;
      page++;

      console.log(`  ✓ Fetched page ${page - 1}/${totalPages} (${media.length} items)`);
    } catch (error) {
      console.error(`  ✗ Error fetching page ${page}:`, error.message);
      break;
    }
  }

  console.log(`\n✅ Found ${allMedia.length} media items\n`);
  return allMedia;
}

/**
 * Download image to local filesystem
 */
async function downloadImageLocally(imageUrl, filename, subdir = '') {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create subdirectory if specified
    const dir = subdir ? path.join(OUTPUT_DIR, subdir) : OUTPUT_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);

    return {
      success: true,
      path: path.relative(path.join(__dirname, '../../public'), filepath),
      url: `/${path.relative(path.join(__dirname, '../../public'), filepath).replace(/\\/g, '/')}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Extract useful info from WordPress media item
 */
function extractMediaInfo(mediaItem) {
  return {
    id: mediaItem.id,
    title: mediaItem.title?.rendered || 'Untitled',
    filename: mediaItem.source_url?.split('/').pop() || `image-${mediaItem.id}.jpg`,
    url: mediaItem.source_url,
    altText: mediaItem.alt_text || '',
    caption: mediaItem.caption?.rendered || '',
    description: mediaItem.description?.rendered || '',
    mimeType: mediaItem.mime_type,
    width: mediaItem.media_details?.width,
    height: mediaItem.media_details?.height,
    fileSize: mediaItem.media_details?.filesize,
    date: mediaItem.date,
  };
}

/**
 * Main migration function
 */
async function migrateAllImages() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       WordPress Media Library Migration                  ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📋 Configuration:');
  console.log(`   Upload to Sanity: ${MIGRATE_TO_SANITY ? '✓' : '✗'}`);
  console.log(`   Download locally: ${DOWNLOAD_LOCALLY ? '✓' : '✗'}`);
  console.log(`   Create index: ${CREATE_INDEX ? '✓' : '✗'}`);
  console.log('');

  // Fetch all media
  const mediaItems = await fetchAllMediaItems();

  if (mediaItems.length === 0) {
    console.log('⚠️  No media items found');
    return;
  }

  // Statistics
  const stats = {
    total: mediaItems.length,
    sanitySuccess: 0,
    sanityFailed: 0,
    localSuccess: 0,
    localFailed: 0,
  };

  const imageIndex = [];

  // Process each image
  for (const [index, mediaItem] of mediaItems.entries()) {
    const info = extractMediaInfo(mediaItem);
    const progress = ((index + 1) / mediaItems.length * 100).toFixed(1);

    console.log(`\n[${index + 1}/${mediaItems.length}] ${info.title}`);
    console.log(`  📄 ${info.filename}`);
    console.log(`  📐 ${info.width}x${info.height} | ${(info.fileSize / 1024).toFixed(1)}KB`);

    const imageData = {
      ...info,
      sanity: null,
      local: null,
    };

    // Upload to Sanity
    if (MIGRATE_TO_SANITY) {
      console.log(`  🔄 Uploading to Sanity...`);
      const sanityImage = await uploadImageFromUrl(info.url, info.title);

      if (sanityImage) {
        stats.sanitySuccess++;
        imageData.sanity = sanityImage;
        console.log(`  ✅ Uploaded to Sanity`);
      } else {
        stats.sanityFailed++;
        console.log(`  ❌ Failed to upload to Sanity`);
      }
    }

    // Download locally
    if (DOWNLOAD_LOCALLY) {
      console.log(`  💾 Downloading locally...`);
      const localResult = await downloadImageLocally(info.url, info.filename);

      if (localResult.success) {
        stats.localSuccess++;
        imageData.local = localResult;
        console.log(`  ✅ Downloaded: ${localResult.url}`);
      } else {
        stats.localFailed++;
        console.log(`  ❌ Failed: ${localResult.error}`);
      }
    }

    console.log(`  Progress: ${progress}%`);

    imageIndex.push(imageData);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.rateLimitDelay));
  }

  // Save index
  if (CREATE_INDEX) {
    const indexPath = path.join(OUTPUT_DIR, '../wordpress-media-index.json');
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(indexPath, JSON.stringify(imageIndex, null, 2));
    console.log(`\n📋 Image index saved: ${indexPath}`);
  }

  // Display summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total images: ${stats.total}`);

  if (MIGRATE_TO_SANITY) {
    console.log(`\nSanity CDN:`);
    console.log(`  ✅ Success: ${stats.sanitySuccess}`);
    console.log(`  ❌ Failed: ${stats.sanityFailed}`);
    console.log(`  📈 Success rate: ${(stats.sanitySuccess / stats.total * 100).toFixed(1)}%`);
  }

  if (DOWNLOAD_LOCALLY) {
    console.log(`\nLocal Download:`);
    console.log(`  ✅ Success: ${stats.localSuccess}`);
    console.log(`  ❌ Failed: ${stats.localFailed}`);
    console.log(`  📈 Success rate: ${(stats.localSuccess / stats.total * 100).toFixed(1)}%`);
  }

  console.log('\n✨ Migration complete!\n');
}

// Run migration
migrateAllImages().catch(console.error);
