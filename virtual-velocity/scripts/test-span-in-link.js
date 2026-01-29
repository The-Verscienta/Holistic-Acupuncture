/**
 * Test link conversion with span inside link
 */

import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';

const htmlWithSpanInLink = `
<p>This is a link with a span inside: <a href="https://example.com"><span>example.com</span></a> and more text.</p>
<p>This is a simple link: <a href="https://google.com">google.com</a> without span.</p>
`;

console.log('Testing link conversion with spans...\n');
console.log('Input HTML:');
console.log(htmlWithSpanInLink);
console.log('\n' + '='.repeat(60) + '\n');

const result = convertHtmlToPortableText(htmlWithSpanInLink);

console.log('Output Portable Text:');
console.log(JSON.stringify(result, null, 2));

const blocksWithLinks = result.filter(block => block.markDefs && block.markDefs.length > 0);
console.log('\n' + '='.repeat(60));
console.log(`Found ${blocksWithLinks.length} blocks with links`);

if (blocksWithLinks.length === 0) {
  console.log('\n⚠️  PROBLEM: Links with <span> inside are being lost!');
} else {
  console.log('\n✅ Links are preserved:');
  blocksWithLinks.forEach(block => {
    block.markDefs.forEach(def => {
      console.log(`  - ${def.href}`);
    });
  });
}
