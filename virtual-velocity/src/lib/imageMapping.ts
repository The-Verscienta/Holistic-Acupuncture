/**
 * Image Mapping Utilities
 *
 * Maps between Sanity images and Cloudflare Images based on WordPress source URLs
 */

import cloudflareIndex from '../../public/cloudflare-images-index.json';
import type { SanityImage } from '../types/sanity';

interface CloudflareImageData {
  id: number;
  title: string;
  filename: string;
  url: string; // WordPress source URL
  sanity: {
    _type: string;
    asset: {
      _type: string;
      _ref: string;
    };
  } | null;
  cloudflare: {
    id: string;
    variants: string[];
    baseUrl: string;
  } | null;
}

// Type the imported JSON
const cfImages = cloudflareIndex as CloudflareImageData[];

// Create a map of Sanity asset IDs to Cloudflare IDs for fast lookup
const sanityToCloudflareMap = new Map<string, string>();

// Populate the map
cfImages.forEach((img) => {
  if (img.sanity && img.cloudflare) {
    const sanityRef = img.sanity.asset._ref;
    const cloudflareId = img.cloudflare.id;
    sanityToCloudflareMap.set(sanityRef, cloudflareId);
  }
});

/**
 * Get Cloudflare image ID from Sanity image reference
 * @param sanityImage - Sanity image object
 * @returns Cloudflare image ID (e.g., "wp-18973") or null if not found
 */
export function getCloudflareIdFromSanityImage(sanityImage: SanityImage): string | null {
  if (!sanityImage || !sanityImage.asset) {
    return null;
  }

  const sanityRef = sanityImage.asset._ref;
  return sanityToCloudflareMap.get(sanityRef) || null;
}

/**
 * Get Cloudflare image data from Sanity image reference
 * @param sanityImage - Sanity image object
 * @returns Full Cloudflare image data or null if not found
 */
export function getCloudflareImageFromSanityImage(sanityImage: SanityImage): CloudflareImageData | null {
  if (!sanityImage || !sanityImage.asset) {
    return null;
  }

  const sanityRef = sanityImage.asset._ref;
  return cfImages.find((img) =>
    img.sanity && img.sanity.asset._ref === sanityRef
  ) || null;
}

/**
 * Check if a Sanity image has a Cloudflare equivalent
 * @param sanityImage - Sanity image object
 * @returns true if Cloudflare version exists
 */
export function hasCloudflareImage(sanityImage: SanityImage): boolean {
  return getCloudflareIdFromSanityImage(sanityImage) !== null;
}

/**
 * Get all images that have both Sanity and Cloudflare versions
 */
export function getDualHostedImages(): CloudflareImageData[] {
  return cfImages.filter((img) => img.sanity !== null && img.cloudflare !== null);
}

/**
 * Get migration statistics
 */
export function getImageMappingStats() {
  const total = cfImages.length;
  const withSanity = cfImages.filter((img) => img.sanity !== null).length;
  const withCloudflare = cfImages.filter((img) => img.cloudflare !== null).length;
  const withBoth = cfImages.filter((img) => img.sanity !== null && img.cloudflare !== null).length;

  return {
    total,
    withSanity,
    withCloudflare,
    withBoth,
    mappingCoverage: withBoth > 0 ? (withBoth / total * 100).toFixed(1) + '%' : '0%',
  };
}
