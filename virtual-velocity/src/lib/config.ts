/**
 * Site Configuration
 *
 * Centralized configuration for site-wide settings
 */

// Jane App booking URL - configurable via environment variable
export const JANE_BOOKING_URL = import.meta.env.PUBLIC_JANE_BOOKING_URL || 'https://ahha.janeapp.com';

// Internal booking interstitial. All in-site "Book" CTAs point here; the /book
// page itself is the only place that links out to JANE_BOOKING_URL (new tab).
export const BOOK_PATH = '/book';

// Site info
export const SITE_NAME = 'Acupuncture & Holistic Health Associates';
export const SITE_URL = 'https://holisticacupuncture.net';
export const DEFAULT_OG_IMAGE = '/images/default-og.jpg';

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
  email: 'info@milwaukeeacu.com',
  address: {
    street: '500 W Silver Spring Dr. Ste K205',
    city: 'Glendale',
    state: 'WI',
    zip: '53217',
    full: '500 W Silver Spring Dr. Ste K205, Glendale, WI 53217',
    googlePlaceId: 'ChIJpwaRdmAeBYgRadfuDNZDi_4'
  }
};

// Verified Google Business reviews, derived from the Place ID above.
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${CONTACT.address.googlePlaceId}`;
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${CONTACT.address.googlePlaceId}`;

// Canonical Google Business Profile URL for schema.org sameAs (stable, derived from Place ID).
export const GOOGLE_BUSINESS_URL = `https://www.google.com/maps/place/?q=place_id:${CONTACT.address.googlePlaceId}`;

// Cities/suburbs the practice serves — single source of truth for the schema.org
// areaServed (StructuredData.astro) and on-page local copy. Milwaukee first.
export const SERVICE_AREAS = [
  'Milwaukee',
  'Glendale',
  'Whitefish Bay',
  'Shorewood',
  'Mequon',
  'Bayside',
  'Fox Point',
  'River Hills',
  'Brown Deer',
  'Wauwatosa',
];

// Review stats — single source of truth. Keep in sync with the aggregateRating
// in src/components/StructuredData.astro.
export const REVIEW_STATS = {
  rating: 4.8,
  count: 171,
  recommendPct: 98,
};

// New patient special offer pricing
export const NEW_PATIENT_SPECIAL = {
  price: 59,
  regularPrice: 350,
  get savings() { return this.regularPrice - this.price; },
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
  // Twitter card attribution: must be the @handle, not a URL
  twitter: '@acuphilip',
  // Profile URL used in schema.org sameAs
  twitterUrl: 'https://twitter.com/acuphilip'
};
