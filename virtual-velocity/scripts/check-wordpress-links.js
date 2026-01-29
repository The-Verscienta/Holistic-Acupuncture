/**
 * Check WordPress posts for links
 */

import axios from 'axios';
import { WP_API_URL } from './migration/config.js';

async function checkLinks() {
  console.log('Fetching WordPress posts to check for links...\n');

  // Fetch a few recent posts
  const response = await axios.get(`${WP_API_URL}/posts?per_page=10`);
  const posts = response.data;

  console.log(`Checking ${posts.length} posts for links...\n`);

  let postsWithLinks = 0;
  let totalLinks = 0;

  posts.forEach((post, i) => {
    const html = post.content.rendered;
    const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi);

    if (linkMatches && linkMatches.length > 0) {
      postsWithLinks++;
      totalLinks += linkMatches.length;

      console.log(`[${i + 1}] "${post.title.rendered}"`);
      console.log(`    Found ${linkMatches.length} links:`);

      linkMatches.slice(0, 3).forEach(match => {
        const hrefMatch = match.match(/href=["']([^"']*)["']/i);
        if (hrefMatch) {
          console.log(`    - ${hrefMatch[1]}`);
        }
      });

      if (linkMatches.length > 3) {
        console.log(`    ... and ${linkMatches.length - 3} more`);
      }
      console.log('');
    }
  });

  console.log('='.repeat(60));
  console.log(`Summary: ${postsWithLinks}/${posts.length} posts have links`);
  console.log(`Total links found: ${totalLinks}`);
  console.log('='.repeat(60));
}

checkLinks().catch(console.error);
