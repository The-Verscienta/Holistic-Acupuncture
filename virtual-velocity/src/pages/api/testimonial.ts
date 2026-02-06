import type { APIRoute } from 'astro';
import { sendTestimonialNotification } from '../../lib/email';

export const prerender = false;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 2; // 2 requests per minute (testimonials should be rare)

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
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

    // Send notification email to admin
    try {
      await sendTestimonialNotification({
        name: data.name,
        email: data.email,
        condition: data.condition,
        testimonial: data.testimonial,
        rating: data.rating || 5,
      });
    } catch (emailError) {
      console.error('Testimonial notification email error:', emailError);
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
