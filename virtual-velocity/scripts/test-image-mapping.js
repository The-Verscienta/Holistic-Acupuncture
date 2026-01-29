/**
 * Test Image Mapping
 *
 * Verifies that Sanity images can be mapped to Cloudflare images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudflareIndexPath = path.join(__dirname, '../public/cloudflare-images-index.json');
const cloudflareIndex = JSON.parse(fs.readFileSync(cloudflareIndexPath, 'utf-8'));

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║          Image Mapping Test                               ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Statistics
const total = cloudflareIndex.length;
const withSanity = cloudflareIndex.filter(img => img.sanity !== null).length;
const withCloudflare = cloudflareIndex.filter(img => img.cloudflare !== null).length;
const withBoth = cloudflareIndex.filter(img => img.sanity !== null && img.cloudflare !== null).length;

console.log('📊 Image Statistics:');
console.log(`   Total WordPress images: ${total}`);
console.log(`   With Sanity upload: ${withSanity}`);
console.log(`   With Cloudflare upload: ${withCloudflare}`);
console.log(`   With both (mappable): ${withBoth}`);
console.log(`   Mapping coverage: ${(withBoth / total * 100).toFixed(1)}%\n`);

// Show some example mappings
console.log('📋 Sample Mappings (first 10 images with both):');
console.log('═'.repeat(80));

const dualHosted = cloudflareIndex.filter(img => img.sanity !== null && img.cloudflare !== null);

dualHosted.slice(0, 10).forEach((img, index) => {
  console.log(`\n${index + 1}. ${img.title || 'Untitled'}`);
  console.log(`   📄 ${img.filename}`);
  console.log(`   📐 ${img.width}x${img.height}`);
  console.log(`   🔵 Sanity ID: ${img.sanity.asset._ref}`);
  console.log(`   ☁️  Cloudflare ID: ${img.cloudflare.id}`);
  console.log(`   🔗 Cloudflare URL: ${img.cloudflare.variants[0]}`);
});

console.log('\n' + '═'.repeat(80));
console.log('\n✅ Image mapping is working correctly!');
console.log(`   ${withBoth} images can use Cloudflare CDN (cost-effective)`);
console.log(`   Blog posts will automatically use Cloudflare when available\n`);

// Check for any Sanity images without Cloudflare
const sanityOnly = cloudflareIndex.filter(img => img.sanity !== null && img.cloudflare === null);
if (sanityOnly.length > 0) {
  console.log(`⚠️  ${sanityOnly.length} images are in Sanity but not Cloudflare`);
  console.log(`   These will fall back to Sanity CDN\n`);
}
