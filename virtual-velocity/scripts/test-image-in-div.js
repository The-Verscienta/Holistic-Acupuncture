/**
 * Test if converter handles images inside divs
 */

import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';

const htmlWithImageInDiv = `
<div class="wp-caption">
  <img src="https://example.com/image.jpg" alt="Test image" />
  <p>Caption text</p>
</div>
<p>Regular paragraph</p>
<img src="https://example.com/direct-image.jpg" alt="Direct image" />
`;

console.log('Testing image conversion...\n');
const result = convertHtmlToPortableText(htmlWithImageInDiv);

console.log('Result:');
console.log(JSON.stringify(result, null, 2));

const imageBlocks = result.filter(b => b._type === 'image');
console.log('\nImage blocks found:', imageBlocks.length);

if (imageBlocks.length === 0) {
  console.log('\n⚠️  PROBLEM: Images are being lost!');
} else {
  console.log('\n✅ Images preserved:');
  imageBlocks.forEach(img => {
    console.log('  -', img._sanityAsset);
  });
}
