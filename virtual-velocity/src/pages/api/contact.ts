import type { APIRoute } from 'astro';
import { sendContactFormNotification, sendConfirmationEmail } from '../../lib/email';

export const prerender = false;

// Simple in-memory rate limiting (resets on worker restart, but good enough for basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

// Max lengths to prevent DoS and oversized emails
const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_PHONE_LENGTH = 30;
const MAX_REFERRAL_LENGTH = 100;

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

    // Enforce max lengths
    const name = String(data.name).trim();
    const message = String(data.message).trim();
    if (name.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (data.phone && String(data.phone).length > MAX_PHONE_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (data.referralSource && String(data.referralSource).length > MAX_REFERRAL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Referral source is too long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to admin
    try {
      await sendContactFormNotification({
        name,
        email: data.email,
        phone: data.phone?.trim().slice(0, MAX_PHONE_LENGTH) || undefined,
        message,
        referralSource: data.referralSource?.trim().slice(0, MAX_REFERRAL_LENGTH) || undefined,
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
      await sendConfirmationEmail(data.email, name);
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
