/**
 * Test converter with actual WordPress HTML
 */

import axios from 'axios';
import { WP_API_URL } from './migration/config.js';
import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';
import fs from 'fs';

async function testActualHTML() {
  const response = await axios.get(`${WP_API_URL}/posts?search=Winter Immunity&per_page=1`);
  const post = response.data[0];

  const html = post.content.rendered;

  // Save HTML to file for inspection
  fs.writeFileSync('winter-immunity-wp.html', html);
  console.log('Saved WordPress HTML to winter-immunity-wp.html');

  // Show first part with a link
  const firstLinkIndex = html.indexOf('<a href');
  if (firstLinkIndex > -1) {
    const snippet = html.substring(Math.max(0, firstLinkIndex - 200), firstLinkIndex + 400);
    console.log('\nHTML around first link:');
    console.log(snippet);
  }

  // Convert
  console.log('\n' + '='.repeat(60));
  console.log('Converting to Portable Text...\n');
  const result = convertHtmlToPortableText(html);

  // Count links
  const blocksWithLinks = result.filter(block => block.markDefs && block.markDefs.length > 0);
  const totalLinks = blocksWithLinks.reduce((sum, block) => sum + block.markDefs.length, 0);

  console.log(`Result: ${totalLinks} links found in ${blocksWithLinks.length} blocks`);

  if (blocksWithLinks.length > 0) {
    console.log('\nLinks found:');
    blocksWithLinks.forEach((block, i) => {
      console.log(`\nBlock ${i + 1}:`);
      block.markDefs.forEach(def => {
        console.log(`  - ${def.href}`);
      });
    });
  }

  // Save result to file
  fs.writeFileSync('winter-immunity-pt.json', JSON.stringify(result, null, 2));
  console.log('\nSaved Portable Text to winter-immunity-pt.json');
}

testActualHTML().catch(console.error);
