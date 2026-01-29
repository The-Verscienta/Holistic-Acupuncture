// Quick script to list WordPress media library images
import fetch from 'node-fetch';

async function listImages() {
  try {
    const response = await fetch('https://holisticacupuncture.net/wp-json/wp/v2/media?per_page=100');
    const images = await response.json();

    console.log(`\n📊 Total images in WordPress: ${images.length}\n`);
    console.log('='.repeat(80));

    images.forEach((img, i) => {
      const title = img.title.rendered || 'Untitled';
      const filename = img.source_url.split('/').pop();
      const size = img.media_details?.filesize
        ? `${(img.media_details.filesize / 1024).toFixed(1)}KB`
        : 'Unknown size';
      const dimensions = img.media_details?.width && img.media_details?.height
        ? `${img.media_details.width}x${img.media_details.height}`
        : 'Unknown';

      console.log(`\n${i + 1}. ${title}`);
      console.log(`   📄 ${filename}`);
      console.log(`   📐 ${dimensions} | ${size}`);
      console.log(`   🔗 ${img.source_url}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Found ${images.length} images in WordPress media library\n`);

    // Show breakdown
    const imageTypes = {};
    images.forEach(img => {
      const type = img.mime_type || 'unknown';
      imageTypes[type] = (imageTypes[type] || 0) + 1;
    });

    console.log('📊 Image type breakdown:');
    Object.entries(imageTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();

  } catch (error) {
    console.error('❌ Error fetching images:', error.message);
  }
}

listImages();
