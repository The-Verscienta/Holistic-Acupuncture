/**
 * Migration Configuration
 *
 * Configure WordPress and Sanity connection details
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// WordPress Configuration
export const WP_API_URL = process.env.WP_API_URL || 'https://holisticacupuncture.net/wp-json/wp/v2';
export const WP_AUTH = {
  username: process.env.WP_USERNAME || '',
  password: process.env.WP_APP_PASSWORD || '',
};

// Sanity Configuration
export const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Migration Settings
export const MIGRATION_CONFIG = {
  batchSize: 10,           // Number of posts to process in each batch
  concurrentUploads: 5,    // Number of images to upload concurrently
  retryAttempts: 3,        // Number of retry attempts for failed requests
  rateLimitDelay: 100,     // Milliseconds between requests
  dryRun: false,           // Set to true to test without writing to Sanity
};

// Validate configuration
export function validateConfig(testOnly = false) {
  const errors = [];

  // Skip Sanity validation if we're only testing WordPress connection
  if (!testOnly) {
    if (!process.env.PUBLIC_SANITY_PROJECT_ID) {
      errors.push('Missing PUBLIC_SANITY_PROJECT_ID in .env');
    }

    if (!process.env.SANITY_API_TOKEN) {
      errors.push('Missing SANITY_API_TOKEN in .env');
    }

    if (!process.env.PUBLIC_SANITY_DATASET) {
      errors.push('Missing PUBLIC_SANITY_DATASET in .env');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error('\nPlease check your .env file and try again.');
    process.exit(1);
  }

  console.log('✅ Configuration validated');
}
