// View all migrated images from the index
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '../public/wordpress-media-index.json');
const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║          Migrated Images from WordPress                   ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log(`📊 Total images: ${imageIndex.length}\n`);
console.log('═'.repeat(80));

// Filter only successfully uploaded images
const successfulImages = imageIndex.filter(img => img.sanity !== null);

console.log(`\n✅ Successfully uploaded to Sanity: ${successfulImages.length}\n`);

// Show first 20 images
for (let index = 0; index < Math.min(20, successfulImages.length); index++) {
  const img = successfulImages[index];
  console.log(`\n${index + 1}. ${img.title || 'Untitled'}`);
  console.log(`   📄 ${img.filename}`);
  console.log(`   📐 ${img.width}x${img.height}`);
  console.log(`   🔗 WordPress: ${img.url}`);
  console.log(`   🎨 Sanity Asset ID: ${img.sanity.asset._ref}`);
}

if (successfulImages.length > 20) {
  console.log(`\n... and ${successfulImages.length - 20} more images`);
  console.log(`\n💡 View all ${successfulImages.length} images in Sanity Studio: http://localhost:3333/media`);
}

console.log('\n' + '═'.repeat(80));
console.log('\n📋 Full index available at: public/wordpress-media-index.json');
console.log('🎨 View in Sanity Studio: http://localhost:3333/media\n');
