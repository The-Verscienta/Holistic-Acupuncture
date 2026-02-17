#!/usr/bin/env node
/**
 * Set Cloudflare Images Browser TTL to 1 year (31536000 seconds).
 * Improves PageSpeed "long cache lifetime" for imagedelivery.net requests.
 *
 * Requires in .env (or environment):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_IMAGES_TOKEN  (API token with Cloudflare Images: Edit)
 *
 * Run: node scripts/set-cloudflare-images-browser-ttl.js
 * Or:  npm run cloudflare:images-ttl
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptRootDir = join(__dirname, '..');
const envPath = join(scriptRootDir, '.env');

// Load .env from project root (virtual-velocity/.env) so it works from any cwd
dotenv.config({ path: envPath });
if (!existsSync(envPath)) {
  dotenv.config({ path: join(process.cwd(), '.env') });
}

const BROWSER_TTL_ONE_YEAR = 31536000;

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;

  if (!accountId || !token) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_IMAGES_TOKEN.');
    console.error('Loaded .env from:', existsSync(envPath) ? envPath : join(process.cwd(), '.env'));
    if (!accountId) console.error('Add CLOUDFLARE_ACCOUNT_ID=your_account_id to .env');
    if (!token) console.error('Add CLOUDFLARE_IMAGES_TOKEN=your_api_token to .env');
    process.exit(1);
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/config`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ browser_ttl: BROWSER_TTL_ONE_YEAR }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('API error:', res.status, data);
    process.exit(1);
  }
  if (!data.success) {
    console.error('Cloudflare API reported failure:', data.errors || data);
    process.exit(1);
  }

  console.log('Cloudflare Images Browser TTL set to 1 year (31536000 seconds).');
  if (data.result) {
    console.log('Current config:', JSON.stringify(data.result, null, 2));
  }
}

main();
