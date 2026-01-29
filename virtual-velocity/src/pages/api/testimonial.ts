import type { APIRoute } from 'astro';
import {
  insertTestimonialSubmission,
  getTestimonialSubmissions,
  updateTestimonialStatus,
  deleteTestimonial
} from '../../lib/database';
import { sendTestimonialNotification } from '../../lib/email';
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitExceededResponse,
  createRateLimitHeaders
} from '../../lib/security';

export const prerender = false;

/**
 * Testimonial Submission API Endpoint
 *
 * This endpoint handles patient testimonial submissions.
 * Testimonials are stored with status 'pending' for staff review.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 'testimonial', RATE_LIMITS.testimonial);

    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
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
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.testimonial.maxRequests)
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
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.testimonial.maxRequests)
          }
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
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.testimonial.maxRequests)
          }
        }
      );
    }

    // Insert into database with pending status
    await insertTestimonialSubmission({
      name: data.name,
      email: data.email,
      condition: data.condition || 'General',
      testimonial: data.testimonial,
      rating: data.rating || null,
    });

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
      // Continue - testimonial was still saved
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your testimonial! It will be reviewed and published soon.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMITS.testimonial.maxRequests)
        }
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

// GET endpoint to retrieve pending testimonials (protected by middleware)
export const GET: APIRoute = async () => {
  try {
    const testimonials = await getTestimonialSubmissions();

    return new Response(
      JSON.stringify({
        success: true,
        testimonials
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching testimonials:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while fetching testimonials'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// PATCH endpoint to update testimonial status (protected by middleware)
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.id || !data.status) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Testimonial ID and status are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(data.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid status. Must be: pending, approved, or rejected'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update testimonial status
    await updateTestimonialStatus(data.id, data.status);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Testimonial ${data.status === 'approved' ? 'approved' : 'rejected'} successfully`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error updating testimonial:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while updating the testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// DELETE endpoint to remove a testimonial (protected by middleware)
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Testimonial ID is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await deleteTestimonial(parseInt(id));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Testimonial deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error deleting testimonial:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while deleting the testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
