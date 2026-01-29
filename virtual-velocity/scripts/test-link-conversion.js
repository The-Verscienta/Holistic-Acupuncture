/**
 * Test link conversion from WordPress HTML
 */

import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';

// Sample WordPress HTML with links
const sampleHtml = `
<p>This is a paragraph with a <a href="https://example.com">link to example</a> in the middle.</p>
<p>Here is <strong>bold text</strong> and <a href="https://google.com">another link</a>.</p>
<p>Complex: <a href="/internal-link"><strong>bold link</strong></a> and <em><a href="/italic-link">italic link</a></em>.</p>
`;

console.log('Converting HTML to Portable Text...\n');
console.log('Input HTML:');
console.log(sampleHtml);
console.log('\n' + '='.repeat(60) + '\n');

const result = convertHtmlToPortableText(sampleHtml);

console.log('Output Portable Text:');
console.log(JSON.stringify(result, null, 2));

// Check if links were preserved
const blocksWithLinks = result.filter(block => block.markDefs && block.markDefs.length > 0);
console.log('\n' + '='.repeat(60));
console.log(`Found ${blocksWithLinks.length} blocks with links out of ${result.length} total blocks`);

if (blocksWithLinks.length > 0) {
  console.log('\nLinks found:');
  blocksWithLinks.forEach((block, i) => {
    console.log(`\nBlock ${i + 1}:`);
    block.markDefs.forEach(def => {
      console.log(`  - ${def.href}`);
    });
  });
} else {
  console.log('\n⚠️  WARNING: No links were preserved during conversion!');
}
