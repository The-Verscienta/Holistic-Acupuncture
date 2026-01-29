/**
 * Debug why links are being lost during conversion
 */

import axios from 'axios';
import { WP_API_URL } from './migration/config.js';
import { convertHtmlToPortableText } from './migration/htmlToPortableTextCustom.js';

async function debugLinkLoss() {
  // Fetch the Winter Immunity post
  const response = await axios.get(`${WP_API_URL}/posts?search=Winter Immunity&per_page=1`);
  const post = response.data[0];

  if (!post) {
    console.log('Post not found');
    return;
  }

  console.log('Post:', post.title.rendered);
  console.log('\n' + '='.repeat(60) + '\n');

  const html = post.content.rendered;

  // Count links in WordPress HTML
  const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi);
  console.log(`WordPress HTML has ${linkMatches ? linkMatches.length : 0} links:`);
  if (linkMatches) {
    linkMatches.forEach((match, i) => {
      const hrefMatch = match.match(/href=["']([^"']*)["']/i);
      if (hrefMatch) {
        console.log(`  ${i + 1}. ${hrefMatch[1]}`);
      }
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Convert to Portable Text
  const portableText = convertHtmlToPortableText(html);

  // Count links in Portable Text
  const blocksWithLinks = portableText.filter(block => block.markDefs && block.markDefs.length > 0);
  const totalLinks = blocksWithLinks.reduce((sum, block) => sum + block.markDefs.length, 0);

  console.log(`Portable Text has ${totalLinks} links in ${blocksWithLinks.length} blocks:`);
  blocksWithLinks.forEach((block, i) => {
    console.log(`\nBlock ${i + 1}:`);
    block.markDefs.forEach(def => {
      console.log(`  - ${def.href}`);
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${linkMatches ? linkMatches.length : 0} links in WordPress -> ${totalLinks} links in Portable Text`);
  console.log(`Lost ${(linkMatches ? linkMatches.length : 0) - totalLinks} links during conversion`);
  console.log('='.repeat(60));

  // Show a sample of the HTML to understand structure
  console.log('\nSample HTML (first 1000 chars):');
  console.log(html.substring(0, 1000));

  // Show actual link HTML
  console.log('\n\nActual link HTML (first 3 links):');
  const fullLinkMatches = html.match(/<a[^>]*>.*?<\/a>/gi);
  if (fullLinkMatches) {
    fullLinkMatches.slice(0, 3).forEach((link, i) => {
      console.log(`\n${i + 1}. ${link.substring(0, 300)}`);
    });
  }
}

debugLinkLoss().catch(console.error);
