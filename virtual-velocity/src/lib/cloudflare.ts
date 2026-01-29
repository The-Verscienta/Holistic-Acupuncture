/**
 * Cloudflare Images Helper Functions
 *
 * Cloudflare Images provides automatic variants:
 * - public: Original image
 * - thumbnail: 200x200
 * - And custom variants you can create in CF dashboard
 */

const CLOUDFLARE_ACCOUNT_HASH = 't5tnnNBoCpmnml-JZw7JMA'; // Your Cloudflare account hash

/**
 * Generate Cloudflare Images URL
 * @param imageId - Cloudflare image ID (e.g., "wp-18978")
 * @param variant - Variant name (default: "public" for original)
 * @returns Full Cloudflare Images URL
 */
export function getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/${variant}`;
}

/**
 * Generate responsive image srcset for Cloudflare Images
 * Uses Cloudflare's flexible variants
 */
export function getResponsiveSrcSet(imageId: string): string {
  // You can create custom variants in Cloudflare dashboard
  // For now, we'll use the public variant with width parameters
  return `
    ${getCloudflareImageUrl(imageId, 'public')} 1x,
    ${getCloudflareImageUrl(imageId, 'public')} 2x
  `.trim();
}

/**
 * Get thumbnail URL (useful for galleries)
 */
export function getThumbnailUrl(imageId: string): string {
  return getCloudflareImageUrl(imageId, 'thumbnail');
}

/**
 * Cloudflare Images supports URL-based transformations:
 * https://imagedelivery.net/{account_hash}/{image_id}/{variant}?width=400&height=300&fit=cover
 */
export interface CloudflareImageOptions {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  format?: 'auto' | 'avif' | 'webp' | 'json';
  quality?: number; // 1-100
}

export function getCloudflareImageUrlWithOptions(
  imageId: string,
  variant: string = 'public',
  options?: CloudflareImageOptions
): string {
  const baseUrl = getCloudflareImageUrl(imageId, variant);

  if (!options || Object.keys(options).length === 0) {
    return baseUrl;
  }

  const params = new URLSearchParams();

  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.fit) params.append('fit', options.fit);
  if (options.format) params.append('format', options.format);
  if (options.quality) params.append('quality', options.quality.toString());

  return `${baseUrl}?${params.toString()}`;
}
