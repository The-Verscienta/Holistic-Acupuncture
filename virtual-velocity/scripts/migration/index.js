#!/usr/bin/env node

/**
 * WordPress to Sanity Migration Script
 *
 * Main entry point for migrating content from WordPress to Sanity CMS
 *
 * Usage:
 *   npm run migrate              # Run full migration
 *   npm run migrate:dry-run      # Test without writing to Sanity
 *   npm run migrate:test         # Test WordPress connection
 */

import { validateConfig, MIGRATION_CONFIG } from './config.js';
import { testConnection } from './fetchWordPress.js';
import { migrateBlogPosts } from './migrateBlogPosts.js';
import { getUploadStats } from './uploadImages.js';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isTestOnly = args.includes('--test') || args.includes('-t');

// Set dry run mode
if (isDryRun) {
  MIGRATION_CONFIG.dryRun = true;
}

/**
 * Display banner
 */
function displayBanner() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       WordPress → Sanity Migration Script                ║');
  console.log('║       Holistic Acupuncture Website                        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  if (MIGRATION_CONFIG.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made to Sanity\n');
  }
}

/**
 * Display configuration
 */
function displayConfig() {
  console.log('📋 Configuration:');
  console.log(`   Batch size: ${MIGRATION_CONFIG.batchSize}`);
  console.log(`   Concurrent uploads: ${MIGRATION_CONFIG.concurrentUploads}`);
  console.log(`   Retry attempts: ${MIGRATION_CONFIG.retryAttempts}`);
  console.log(`   Rate limit delay: ${MIGRATION_CONFIG.rateLimitDelay}ms`);
  console.log(`   Dry run: ${MIGRATION_CONFIG.dryRun ? 'Yes' : 'No'}`);
  console.log('');
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    displayBanner();

    // Validate configuration (skip Sanity check if test-only mode)
    validateConfig(isTestOnly);
    console.log('');

    // Display configuration
    if (!isTestOnly) {
      displayConfig();
    }

    // Test WordPress connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without WordPress connection\n');
      process.exit(1);
    }

    // If test only, exit here
    if (isTestOnly) {
      console.log('✅ Connection test successful!\n');
      process.exit(0);
    }

    // Start timer
    const startTime = Date.now();

    // Run migrations
    console.log('🚀 Starting migration...\n');

    // Migrate blog posts
    await migrateBlogPosts();

    // TODO: Add other content types as needed
    // await migrateTestimonials();
    // await migratePages();

    // End timer
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    // Display final statistics
    console.log('═'.repeat(60));
    console.log('📊 FINAL STATISTICS');
    console.log('═'.repeat(60));

    const uploadStats = getUploadStats();
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🖼️  Images uploaded: ${uploadStats.total}`);

    if (MIGRATION_CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No actual changes were made');
      console.log('   Remove --dry-run flag to perform real migration');
    }

    console.log('\n✨ All done!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('');
    process.exit(1);
  }
}

/**
 * Display help
 */
function displayHelp() {
  console.log('');
  console.log('WordPress to Sanity Migration Script');
  console.log('');
  console.log('Usage:');
  console.log('  npm run migrate              Run full migration');
  console.log('  npm run migrate:dry-run      Test migration without writing to Sanity');
  console.log('  npm run migrate:test         Test WordPress API connection only');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run, -d                Dry run mode (no writes to Sanity)');
  console.log('  --test, -t                   Test connection only');
  console.log('  --help, -h                   Show this help message');
  console.log('');
  console.log('Environment Variables (set in .env):');
  console.log('  WP_API_URL                   WordPress REST API URL');
  console.log('  WP_USERNAME                  WordPress username (optional)');
  console.log('  WP_APP_PASSWORD              WordPress application password (optional)');
  console.log('  PUBLIC_SANITY_PROJECT_ID     Sanity project ID (required)');
  console.log('  PUBLIC_SANITY_DATASET        Sanity dataset (default: production)');
  console.log('  SANITY_API_TOKEN             Sanity API token with write access (required)');
  console.log('');
}

// Handle help flag
if (args.includes('--help') || args.includes('-h')) {
  displayHelp();
  process.exit(0);
}

// Run migration
runMigration();
