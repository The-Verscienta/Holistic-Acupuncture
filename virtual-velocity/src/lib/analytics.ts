/**
 * Google Analytics 4 Event Tracking Utilities
 *
 * Usage:
 * - Import functions where needed
 * - Events are only sent in production when GA is configured
 */

// Check if Google Analytics is available
export function isGAAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}

// Generic event tracking
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
): void {
  if (!isGAAvailable()) return;

  try {
    (window as any).gtag('event', eventName, parameters);
  } catch (error) {
    console.error('GA tracking error:', error);
  }
}

// Form submission events
export function trackFormSubmission(formName: string, success: boolean = true): void {
  trackEvent('form_submission', {
    form_name: formName,
    success: success,
  });
}

// Contact form specific
export function trackContactFormSubmission(reason?: string): void {
  trackEvent('generate_lead', {
    form_name: 'contact',
    contact_reason: reason || 'general',
  });
}

// Newsletter signup
export function trackNewsletterSignup(): void {
  trackEvent('newsletter_signup', {
    form_name: 'newsletter',
  });
}

// Testimonial submission
export function trackTestimonialSubmission(): void {
  trackEvent('testimonial_submission', {
    form_name: 'testimonial',
  });
}

// Booking click (external link to Jane App)
export function trackBookingClick(location: string): void {
  trackEvent('booking_click', {
    click_location: location,
    destination: 'jane_app',
  });
}

// Search event
export function trackSearch(searchTerm: string, resultsCount: number): void {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

// Page view (automatically handled by GA, but available for custom tracking)
export function trackPageView(pagePath: string, pageTitle: string): void {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

// Phone call click
export function trackPhoneClick(): void {
  trackEvent('phone_click', {
    method: 'phone',
  });
}

// Email click
export function trackEmailClick(): void {
  trackEvent('email_click', {
    method: 'email',
  });
}

// Service/condition view
export function trackServiceView(serviceName: string, category?: string): void {
  trackEvent('view_item', {
    item_name: serviceName,
    item_category: category || 'service',
  });
}
