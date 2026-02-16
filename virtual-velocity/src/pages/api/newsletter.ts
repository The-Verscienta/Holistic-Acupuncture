import type { APIRoute } from 'astro';
import { sendNewsletterWelcomeEmail } from '../../lib/email';
import { validateOrigin } from '../../lib/sanitize';
import { SITE_URL } from '../../lib/config';

export const prerender = false;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // 3 requests per minute
const MAX_EMAIL_LENGTH = 254;

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
 * Newsletter Subscription API Endpoint
 *
 * Handles email newsletter subscriptions by sending a welcome email.
 * No database storage - for a full newsletter system, integrate with
 * a service like Mailchimp, ConvertKit, or Buttondown.
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

    // Validate email
    if (!data.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format (reject CRLF to prevent header injection)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = String(data.email).trim();
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
    if (email.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send welcome email to subscriber
    const welcomeSent = await sendNewsletterWelcomeEmail(email);
    if (!welcomeSent) {
      console.error('Newsletter welcome email failed to send');
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for subscribing to our newsletter!'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your subscription'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
