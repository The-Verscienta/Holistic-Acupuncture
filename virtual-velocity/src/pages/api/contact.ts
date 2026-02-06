import type { APIRoute } from 'astro';
import { sendContactFormNotification, sendConfirmationEmail } from '../../lib/email';

export const prerender = false;

// Simple in-memory rate limiting (resets on worker restart, but good enough for basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

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
 * Contact Form API Endpoint
 *
 * Handles contact form submissions and sends email notifications.
 * No database storage - emails only.
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
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name, email, and message are required'
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

    // Send notification email to admin
    try {
      await sendContactFormNotification({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        referralSource: data.referralSource,
      });
    } catch (emailError) {
      console.error('Contact notification email error:', emailError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send message. Please try again or call us directly.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Send confirmation email to user
    try {
      await sendConfirmationEmail(data.email, data.name);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Continue - main notification was sent
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
