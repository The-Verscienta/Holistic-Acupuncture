/**
 * Workaround for Astro 6.0.4 bug: createGetFontData is referenced in the
 * astro:assets virtual module but missing from dist/assets/fonts/runtime.js.
 * Remove this script when upgrading to an Astro version that fixes it.
 */
const fs = require('fs');
const path = require('path');

const runtimePath = path.join(__dirname, '../node_modules/astro/dist/assets/fonts/runtime.js');

if (!fs.existsSync(runtimePath)) {
  console.log('[patch] astro fonts runtime not found, skipping');
  process.exit(0);
}

const content = fs.readFileSync(runtimePath, 'utf8');

if (content.includes('createGetFontData')) {
  console.log('[patch] astro fonts runtime already patched, skipping');
  process.exit(0);
}

const patched = content.replace(
  /export \{/,
  'function createGetFontData() { return () => undefined; }\nexport {'
).replace(
  /fontData\s*\n\};/,
  'fontData,\n  createGetFontData\n};'
);

fs.writeFileSync(runtimePath, patched);
console.log('[patch] astro fonts runtime patched successfully');
