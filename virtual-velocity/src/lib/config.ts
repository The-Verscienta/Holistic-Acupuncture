/**
 * Site Configuration
 *
 * Centralized configuration for site-wide settings
 */

// Jane App booking URL - configurable via environment variable
export const JANE_BOOKING_URL = import.meta.env.PUBLIC_JANE_BOOKING_URL || 'https://holisticacupuncture.janeapp.com';

// Site info
export const SITE_NAME = 'Acupuncture & Holistic Health Associates';
export const SITE_URL = 'https://holisticacupuncture.net';

// Contact info
export const CONTACT = {
  phone: '(414) 332-8888',
  email: 'info@holisticacupuncture.net',
  address: {
    street: '5800 N Bayshore Drive',
    city: 'Glendale',
    state: 'WI',
    zip: '53217',
    full: 'Bayshore Town Center, 5800 N Bayshore Drive, Glendale, WI 53217'
  }
};

// Business hours
export const HOURS = {
  monday: '9:00 AM - 6:00 PM',
  tuesday: '9:00 AM - 6:00 PM',
  wednesday: '9:00 AM - 6:00 PM',
  thursday: '9:00 AM - 6:00 PM',
  friday: '9:00 AM - 5:00 PM',
  saturday: 'By Appointment',
  sunday: 'Closed'
};

// Social media links
export const SOCIAL = {
  facebook: 'https://facebook.com/holisticacupuncture',
  instagram: 'https://instagram.com/holisticacupuncture',
  linkedin: 'https://linkedin.com/company/holisticacupuncture',
  // Optional: set for Twitter card attribution when links are shared
  twitter: undefined as string | undefined
};
