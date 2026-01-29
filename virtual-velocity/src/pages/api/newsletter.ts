import type { APIRoute } from 'astro';
import { insertNewsletterSubscriber, getNewsletterSubscribers } from '../../lib/database';
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitExceededResponse,
  createRateLimitHeaders
} from '../../lib/security';

export const prerender = false;

/**
 * Newsletter Subscription API Endpoint
 *
 * This endpoint handles email newsletter subscriptions.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 'newsletter', RATE_LIMITS.newsletter);

    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
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
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.newsletter.maxRequests)
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
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.newsletter.maxRequests)
          }
        }
      );
    }

    // Insert subscriber (handles duplicate check internally)
    const result = await insertNewsletterSubscriber({ email: data.email });

    if (result.exists) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'You are already subscribed to our newsletter'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.newsletter.maxRequests)
          }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for subscribing to our newsletter!'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.newsletter.maxRequests)
        }
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

// GET endpoint to retrieve subscribers (protected by middleware)
export const GET: APIRoute = async () => {
  try {
    const subscribers = await getNewsletterSubscribers();

    return new Response(
      JSON.stringify({
        success: true,
        subscribers
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching subscribers:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while fetching subscribers'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
