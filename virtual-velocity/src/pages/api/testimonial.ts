import type { APIRoute } from 'astro';
import { sendTestimonialNotification } from '../../lib/email';
import { validateOrigin } from '../../lib/sanitize';
import { SITE_URL } from '../../lib/config';

export const prerender = false;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 2; // 2 requests per minute (testimonials should be rare)
const MAX_NAME_LENGTH = 200;
const MAX_TESTIMONIAL_LENGTH = 2000;
const MAX_CONDITION_LENGTH = 200;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Testimonial Submission API Endpoint
 *
 * Handles patient testimonial submissions by sending an email notification.
 * No database storage - for testimonial management, integrate with
 * Sanity CMS or add them manually.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // CSRF protection: validate Origin header
    if (!validateOrigin(request, SITE_URL)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request origin' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again in a minute.'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.testimonial) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name, email, and testimonial are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format (reject CRLF to prevent header injection)
    const email = String(data.email).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || /[\r\n]/.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email address'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rating must be between 1 and 5'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Enforce max lengths
    const name = String(data.name).trim();
    const testimonial = String(data.testimonial).trim();
    if (name.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (testimonial.length > MAX_TESTIMONIAL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Testimonial is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (data.condition && String(data.condition).length > MAX_CONDITION_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Condition field is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to admin
    const notificationSent = await sendTestimonialNotification({
      name,
      email,
      condition: data.condition?.trim().slice(0, MAX_CONDITION_LENGTH) || undefined,
      testimonial,
      rating: data.rating || 5,
    });

    if (!notificationSent) {
      console.error('Testimonial notification email failed to send');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send testimonial. Please try again or contact us directly.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your testimonial! It will be reviewed and published soon.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Testimonial submission error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
