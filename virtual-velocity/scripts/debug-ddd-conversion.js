/**
 * Debug Degenerative Disc Disease post conversion
 */

import axios from 'axios';
import { WP_API_URL } from './migration/config.js';
import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';

async function debugDDD() {
  const response = await axios.get(`${WP_API_URL}/posts?slug=acupuncture-degenerative-disc-disease`);
  const post = response.data[0];

  console.log('Post:', post.title.rendered);
  console.log('\nWordPress HTML has:');
  const html = post.content.rendered;
  console.log('- Images:', (html.match(/<img/g) || []).length);
  console.log('- Links:', (html.match(/<a /g) || []).length);

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('Converting to Portable Text...\n');

  const result = convertHtmlToPortableText(html);

  const imageBlocks = result.filter(b => b._type === 'image');
  const linkBlocks = result.filter(b => b.markDefs && b.markDefs.length > 0);

  console.log('Converted Portable Text has:');
  console.log('- Image blocks:', imageBlocks.length);
  console.log('- Link blocks:', linkBlocks.length);
  console.log('- Total blocks:', result.length);

  if (imageBlocks.length > 0) {
    console.log('\nImages found:');
    imageBlocks.forEach((img, i) => {
      console.log(`  ${i+1}. ${img._sanityAsset}`);
    });
  } else {
    console.log('\n⚠️  WARNING: All images were lost during conversion!');
  }
}

debugDDD().catch(console.error);
