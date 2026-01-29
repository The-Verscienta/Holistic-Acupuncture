/**
 * Migrate WordPress images to Cloudflare Images
 *
 * Uploads all images from WordPress media library to Cloudflare Images CDN
 * Much cheaper than Sanity: $5/month for 100k images vs bandwidth costs
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN;
const INDEX_PATH = path.join(__dirname, '../../public/wordpress-media-index.json');
const OUTPUT_PATH = path.join(__dirname, '../../public/cloudflare-images-index.json');

// Rate limiting: 5 concurrent uploads
const limit = pLimit(5);

// Cloudflare Images API endpoint
const CF_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

/**
 * Upload image to Cloudflare Images from URL
 */
async function uploadToCloudflare(imageUrl, imageId, metadata = {}) {
  try {
    const form = new FormData();

    // Download image from WordPress
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const buffer = await response.buffer();

    // Upload to Cloudflare
    form.append('file', buffer, {
      filename: metadata.filename || 'image.jpg',
      contentType: metadata.mimeType || 'image/jpeg',
    });

    // Use custom ID (WordPress ID for easy reference)
    form.append('id', imageId);

    // Add metadata
    if (metadata.title) {
      form.append('metadata', JSON.stringify({
        title: metadata.title,
        alt: metadata.altText || '',
        wpId: metadata.wpId,
      }));
    }

    const uploadResponse = await fetch(CF_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
      body: form,
    });

    const result = await uploadResponse.json();

    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Upload failed');
    }

    return {
      success: true,
      id: result.result.id,
      filename: result.result.filename,
      variants: result.result.variants,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main migration function
 */
async function migrateToCloudflare() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       Cloudflare Images Migration                         ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Verify credentials
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGES_TOKEN) {
    console.error('❌ Missing Cloudflare credentials in .env file');
    console.error('   Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Account ID: ${CLOUDFLARE_ACCOUNT_ID}`);
  console.log(`   API Token: ${CLOUDFLARE_IMAGES_TOKEN.substring(0, 10)}...`);
  console.log('');

  // Load WordPress media index
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('❌ WordPress media index not found');
    console.error(`   Expected: ${INDEX_PATH}`);
    console.error('   Run: npm run migrate:images first');
    process.exit(1);
  }

  const mediaIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  // Filter only successful images (exclude PDFs, etc.)
  const images = mediaIndex.filter(item => item.sanity !== null);

  console.log(`📊 Found ${images.length} images to migrate\n`);
  console.log('═'.repeat(80));

  // Statistics
  const stats = {
    total: images.length,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  const cloudflareIndex = [];

  // Process each image
  const uploadTasks = images.map((image, index) =>
    limit(async () => {
      const progress = ((index + 1) / images.length * 100).toFixed(1);

      console.log(`\n[${index + 1}/${images.length}] ${image.title || 'Untitled'}`);
      console.log(`  📄 ${image.filename}`);
      console.log(`  📐 ${image.width}x${image.height}`);

      // Use WordPress ID as Cloudflare ID for easy reference
      const cloudflareId = `wp-${image.id}`;

      console.log(`  🔄 Uploading to Cloudflare...`);

      const result = await uploadToCloudflare(
        image.url,
        cloudflareId,
        {
          filename: image.filename,
          mimeType: image.mimeType,
          title: image.title,
          altText: image.altText,
          wpId: image.id,
        }
      );

      if (result.success) {
        stats.success++;
        console.log(`  ✅ Uploaded successfully`);
        console.log(`  🔗 Cloudflare ID: ${result.id}`);

        cloudflareIndex.push({
          ...image,
          cloudflare: {
            id: result.id,
            variants: result.variants,
            // Base URL for variants (add /variant at the end)
            baseUrl: result.variants[0].replace('/public', ''),
          },
        });
      } else {
        stats.failed++;
        console.log(`  ❌ Failed: ${result.error}`);

        cloudflareIndex.push({
          ...image,
          cloudflare: null,
          cloudflareError: result.error,
        });
      }

      console.log(`  Progress: ${progress}%`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    })
  );

  // Wait for all uploads to complete
  await Promise.all(uploadTasks);

  // Save Cloudflare index
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cloudflareIndex, null, 2));
  console.log(`\n📋 Cloudflare index saved: ${OUTPUT_PATH}`);

  // Display summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Total images: ${stats.total}`);
  console.log(`\n✅ Success: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success rate: ${(stats.success / stats.total * 100).toFixed(1)}%`);

  console.log('\n💡 Next Steps:');
  console.log('   1. Update image components to use Cloudflare URLs');
  console.log('   2. Test image loading on your site');
  console.log('   3. Once verified, you can delete images from Sanity');

  console.log('\n✨ Migration complete!\n');
}

// Run migration
migrateToCloudflare().catch(console.error);
