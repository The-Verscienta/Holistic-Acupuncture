/**
 * Site Configuration
 *
 * Centralized configuration for site-wide settings
 */

// Jane App booking URL - configurable via environment variable
export const JANE_BOOKING_URL = import.meta.env.PUBLIC_JANE_BOOKING_URL || 'https://ahha.janeapp.com';

// Site info
export const SITE_NAME = 'Acupuncture & Holistic Health Associates';
export const SITE_URL = 'https://holisticacupuncture.net';
export const DEFAULT_OG_IMAGE = '/logo.png';

/** Allowed origins for API CSRF check (production + optional preview, e.g. Cloudflare Pages) */
export const ALLOWED_ORIGINS: string[] = [
  SITE_URL,
  import.meta.env.PUBLIC_APP_URL,
].filter(Boolean) as string[];

/** Allowed origins including request origin so same-origin works on any deployment (pages.dev, localhost, etc.) */
export function getAllowedOrigins(request: Request): string[] {
  const list = [...ALLOWED_ORIGINS];
  try {
    const requestOrigin = new URL(request.url).origin;
    if (requestOrigin && !list.includes(requestOrigin)) list.push(requestOrigin);
  } catch {
    // ignore invalid request url
  }
  return list;
}

// Contact info
export const CONTACT = {
  phone: '(414) 332-8888',
  phoneRaw: '+14143328888',
  email: 'info@holisticacupuncture.net',
  address: {
    street: '500 W Silver Spring Dr. Ste K205',
    city: 'Glendale',
    state: 'WI',
    zip: '53217',
    full: '500 W Silver Spring Dr. Ste K205, Glendale, WI 53217',
    googlePlaceId: 'ChIJpwaRdmAeBYgRadfuDNZDi_4'
  }
};

// Business hours
export const HOURS = {
  monday: '9:00 AM - 7:00 PM',
  tuesday: '9:00 AM - 7:00 PM',
  wednesday: '9:00 AM - 7:00 PM',
  thursday: '9:00 AM - 7:00 PM',
  friday: 'Administrative Day',
  saturday: 'Closed',
  sunday: 'Closed'
};

// Social media links
export const SOCIAL = {
  facebook: 'https://www.facebook.com/acupunctureMKE/',
  instagram: 'https://instagram.com/acupuncturemke',
  linkedin: 'https://www.linkedin.com/company/acupuncture-&-holistic-health-associates',
  // Optional: set for Twitter card attribution when links are shared
  twitter: 'https://twitter.com/acuphilip'
};
