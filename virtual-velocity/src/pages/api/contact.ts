import type { APIRoute } from 'astro';
import { insertContactSubmission } from '../../lib/database';
import { sendContactFormNotification, sendConfirmationEmail } from '../../lib/email';
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitExceededResponse,
  createRateLimitHeaders
} from '../../lib/security';

export const prerender = false;

/**
 * Contact Form API Endpoint
 *
 * This endpoint handles contact form submissions, stores them in Astro DB,
 * and sends email notifications.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 'contact', RATE_LIMITS.contact);

    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
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
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.contact.maxRequests)
          }
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
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.contact.maxRequests)
          }
        }
      );
    }

    // Insert into database
    await insertContactSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      referralSource: data.referralSource || null,
      message: data.message,
    });

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
      // Continue - form was still saved
    }

    // Send confirmation email to user
    try {
      await sendConfirmationEmail(data.email, data.name);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Continue - form was still saved
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.contact.maxRequests)
        }
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
