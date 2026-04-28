import type { APIRoute } from 'astro';
import { sendPhoneCallConversion } from '../../lib/meta';
import { checkBodySize } from '../../lib/sanitize';

export const prerender = false;

// Whitelist of known-good location tags emitted by phone tracking buttons.
// Anything else is coerced to 'other' so we don't propagate arbitrary client
// strings into Meta custom_data.
const ALLOWED_LOCATIONS = new Set([
  'header',
  'mobile-menu',
  'mobile-book-bar',
  'footer',
  'contact-page',
  'sticky-cta',
  'other',
]);
const MAX_LOCATION_LEN = 64;

// Per-isolate rate limit (best-effort; back with Cloudflare WAF for global limits)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 20; // 20 phone clicks per IP per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
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
 * Phone Click Tracking API Endpoint
 *
 * Receives phone click events from JavaScript and sends them to Meta
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const metaToken = runtimeEnv.META_CONVERSIONS_API_TOKEN ?? import.meta.env.META_CONVERSIONS_API_TOKEN;
  const metaDatasetId = runtimeEnv.META_DATASET_ID ?? import.meta.env.META_DATASET_ID;

  try {
    // Reject oversized bodies before reading them
    const tooBig = checkBodySize(request, 2_000);
    if (tooBig) return tooBig;

    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      // Silently 200 — client doesn't care; we just don't propagate to Meta
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    // Validate location: cap length, restrict charset, fall back to 'other'
    const rawLocation = String(data.location).trim().slice(0, MAX_LOCATION_LEN);
    const location = ALLOWED_LOCATIONS.has(rawLocation) ? rawLocation : 'other';

    // Validate sourceUrl: must parse as http(s) URL
    let sourceUrl: string;
    try {
      const u = new URL(String(data.sourceUrl));
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad protocol');
      sourceUrl = u.toString();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid sourceUrl' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send conversion event to Meta (non-critical, fire-and-forget)
    if (metaToken && metaDatasetId) {
      try {
        await sendPhoneCallConversion(
          {
            clientIp: clientIp !== 'unknown' ? clientIp : undefined,
            clientUserAgent: request.headers.get('user-agent') || undefined,
            sourceUrl,
            location,
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
