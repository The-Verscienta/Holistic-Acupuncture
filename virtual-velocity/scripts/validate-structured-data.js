#!/usr/bin/env node
/**
 * Structured Data Validation Helper
 *
 * Extracts JSON-LD from built HTML and prints validation instructions.
 * Run after: npm run build
 *
 * Validate your live site:
 * - Schema.org: https://validator.schema.org/ (paste URL or code)
 * - Google Rich Results: https://search.google.com/test/rich-results (enter URL)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'client');
const indexPath = join(distDir, 'index.html');

function extractJsonLd(html) {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      blocks.push(parsed);
    } catch (e) {
      blocks.push({ _parseError: e.message, _raw: raw.slice(0, 200) + '...' });
    }
  }
  return blocks;
}

function main() {
  if (!existsSync(indexPath)) {
    console.error('Built HTML not found. Run: npm run build');
    process.exit(1);
  }

  const html = readFileSync(indexPath, 'utf-8');
  const blocks = extractJsonLd(html);

  if (blocks.length === 0) {
    console.log('No JSON-LD blocks found in index.html');
    process.exit(0);
  }

  console.log('Structured data found:', blocks.length, 'block(s)\n');

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b._parseError) {
      console.log(`Block ${i + 1}: Parse error - ${b._parseError}`);
      continue;
    }
    const types = [].concat(b['@type'] || b['@type'] || 'Unknown');
    console.log(`Block ${i + 1}: @type = ${types.join(', ')}`);
  }

  console.log('\n--- Validate structured data ---\n');
  console.log('1. Schema.org Validator (paste page URL or JSON-LD):');
  console.log('   https://validator.schema.org/\n');
  console.log('2. Google Rich Results Test (enter your page URL):');
  console.log('   https://search.google.com/test/rich-results\n');
  console.log('Example URLs to test:');
  console.log('   Homepage:  https://holistic-acupuncture.pages.dev/');
  console.log('   Blog post: https://holistic-acupuncture.pages.dev/blog/<slug>\n');
}

main();
