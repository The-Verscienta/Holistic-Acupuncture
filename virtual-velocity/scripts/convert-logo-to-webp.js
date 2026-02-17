#!/usr/bin/env node
/**
 * Convert src/assets/logo.png to public/logo.webp for WebP delivery.
 * Run before build (prebuild) or manually: node scripts/convert-logo-to-webp.js
 * If conversion fails (e.g. on some Windows/ARM setups), add public/logo.webp manually
 * or the site will use the PNG logo via the <img> fallback.
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcPath = join(root, 'src', 'assets', 'logo.png');
const outPath = join(root, 'public', 'logo.webp');

async function main() {
  if (!existsSync(srcPath)) {
    console.warn('Logo not found at src/assets/logo.png, skipping WebP conversion.');
    return;
  }
  try {
    const sharp = (await import('sharp')).default;
    await sharp(srcPath)
      .toFormat('webp')
      .toFile(outPath);
    console.log('Created public/logo.webp');
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND' && e.message.includes('sharp')) {
      console.warn('Install sharp to generate logo.webp: npm install -D sharp');
    } else {
      console.warn('Could not convert logo to WebP:', e.message || e);
    }
  }
}

main();
