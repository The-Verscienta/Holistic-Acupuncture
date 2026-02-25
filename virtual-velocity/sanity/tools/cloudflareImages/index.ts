import type { Tool } from 'sanity';
import { ImageIcon } from '@sanity/icons';
import { CloudflareImagesTool } from './CloudflareImagesTool';

export interface CloudflareImagesToolOptions {
  /** Site origin to fetch cloudflare-images-index.json from (e.g. https://holisticacupuncture.net or http://localhost:4321) */
  indexUrl?: string;
}

/**
 * Sanity Studio tool that lists images hosted on Cloudflare Images
 * and their mapped Sanity asset refs. Fetches from site’s cloudflare-images-index.json.
 *
 * Pass indexUrl in options, or set SANITY_STUDIO_CLOUDFLARE_INDEX_URL in .env.
 */
export function cloudflareImagesTool(options?: CloudflareImagesToolOptions): Tool<CloudflareImagesToolOptions> {
  return {
    name: 'cloudflare-images',
    title: 'Cloudflare Images',
    icon: ImageIcon,
    component: CloudflareImagesTool,
    options: options ?? {},
  };
}
