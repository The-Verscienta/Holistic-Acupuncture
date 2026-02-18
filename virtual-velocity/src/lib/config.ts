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

// Contact info
export const CONTACT = {
  phone: '(414) 332-8888',
  phoneRaw: '+14143328888',
  email: 'info@holisticacupuncture.net',
  address: {
    street: '500 W Silver Spring Dr, Suite K-205',
    city: 'Glendale',
    state: 'WI',
    zip: '53217',
    full: 'Bayshore Town Center, 500 W Silver Spring Dr, Suite K-205, Glendale, WI 53217'
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
