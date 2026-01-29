/**
 * WordPress Content Fetcher
 *
 * Fetches content from WordPress REST API with pagination support
 */

import fetch from 'node-fetch';
import { WP_API_URL, WP_AUTH, MIGRATION_CONFIG } from './config.js';

/**
 * Create authorization header for WordPress API
 */
function getAuthHeader() {
  if (WP_AUTH.username && WP_AUTH.password) {
    const credentials = Buffer.from(`${WP_AUTH.username}:${WP_AUTH.password}`).toString('base64');
    return { Authorization: `Basic ${credentials}` };
  }
  return {};
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options = {}, retries = MIGRATION_CONFIG.retryAttempts) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (response.status === 429) {
        // Rate limited, wait longer
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`  ⏳ Rate limited, waiting ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (i === retries - 1) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      console.log(`  ⚠️  Attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Fetch all posts from WordPress REST API with pagination
 */
export async function fetchAllPosts() {
  console.log('📥 Fetching WordPress posts...');

  const allPosts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API_URL}/posts?page=${page}&per_page=100&_embed`;

    try {
      const response = await fetchWithRetry(url, {
        headers: getAuthHeader(),
      });

      const posts = await response.json();
      allPosts.push(...posts);

      // Check if there are more pages
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      hasMore = page < totalPages;

      console.log(`  ✓ Fetched page ${page}/${totalPages} (${posts.length} posts)`);

      page++;

      // Rate limiting delay
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, MIGRATION_CONFIG.rateLimitDelay));
      }
    } catch (error) {
      console.error(`  ❌ Failed to fetch posts page ${page}:`, error.message);
      break;
    }
  }

  console.log(`✅ Fetched ${allPosts.length} total posts\n`);
  return allPosts;
}

/**
 * Fetch specific WordPress content type
 */
export async function fetchContent(endpoint) {
  console.log(`📥 Fetching WordPress ${endpoint}...`);

  const allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API_URL}/${endpoint}?page=${page}&per_page=100&_embed`;

    try {
      const response = await fetchWithRetry(url, {
        headers: getAuthHeader(),
      });

      const items = await response.json();
      allItems.push(...items);

      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      hasMore = page < totalPages;

      console.log(`  ✓ Fetched page ${page}/${totalPages} (${items.length} items)`);

      page++;

      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, MIGRATION_CONFIG.rateLimitDelay));
      }
    } catch (error) {
      console.error(`  ❌ Failed to fetch ${endpoint} page ${page}:`, error.message);
      break;
    }
  }

  console.log(`✅ Fetched ${allItems.length} ${endpoint}\n`);
  return allItems;
}

/**
 * Fetch categories and tags
 */
export async function fetchTaxonomies() {
  console.log('📥 Fetching WordPress taxonomies...');

  const [categories, tags] = await Promise.all([
    fetchContent('categories'),
    fetchContent('tags'),
  ]);

  return { categories, tags };
}

/**
 * Fetch media items
 */
export async function fetchMedia() {
  return fetchContent('media');
}

/**
 * Fetch pages
 */
export async function fetchPages() {
  return fetchContent('pages');
}

/**
 * Test WordPress API connection
 */
export async function testConnection() {
  console.log('🔍 Testing WordPress API connection...');

  try {
    const url = `${WP_API_URL}/posts?per_page=1`;
    const response = await fetch(url, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`✅ Connection successful! Found ${response.headers.get('x-wp-total')} total posts\n`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('  1. WP_API_URL is correct in .env');
    console.error('  2. WordPress site is accessible');
    console.error('  3. REST API is enabled');
    console.error('  4. Authentication credentials are correct (if required)\n');
    return false;
  }
}
