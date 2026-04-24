import type { APIRoute } from 'astro';
import { sendPhoneCallConversion } from '../../lib/meta';

export const prerender = false;

/**
 * Phone Click Tracking API Endpoint
 *
 * Receives phone click events from JavaScript and sends them to Meta
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const metaToken = runtimeEnv.META_CONVERSIONS_API_TOKEN ?? import.meta.env.META_CONVERSIONS_API_TOKEN;
  const metaDatasetId = runtimeEnv.META_DATASET_ID ?? import.meta.env.META_DATASET_ID;

  try {
    // Parse request
    const data = await request.json();

    // Validate required fields
    if (!data.sourceUrl || !data.location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sourceUrl and location are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send conversion event to Meta (non-critical, fire-and-forget)
    if (metaToken && metaDatasetId) {
      try {
        await sendPhoneCallConversion(
          {
            clientIp: request.headers.get('cf-connecting-ip') ||
                     request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     undefined,
            clientUserAgent: request.headers.get('user-agent') || undefined,
            sourceUrl: data.sourceUrl,
            location: data.location,
          },
          metaToken,
          metaDatasetId
        );
      } catch (err) {
        console.error('Failed to send Meta phone click event:', err);
        // Don't fail the response - this is fire-and-forget
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Phone click endpoint error:', error);
    // Still return 200 - client doesn't care if this fails
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
