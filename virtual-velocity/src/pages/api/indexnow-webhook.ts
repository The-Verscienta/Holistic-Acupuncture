import type { APIRoute } from 'astro';
import { checkBodySize } from '../../lib/sanitize';

export const prerender = false;

const SITE_URL = 'https://holisticacupuncture.net';
const INDEXNOW_KEY = '81e84114cb0247a7b6c5fbd5c9f1e44d';
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

// Kiln slugs are URL-safe; restrict to a-z 0-9 and `-` to prevent
// path traversal or arbitrary URL injection into the IndexNow submission.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,128}[a-z0-9])?$/;
const ALLOWED_TYPES = new Set(['post', 'condition', 'team_member']);

function urlForDocument(type: string, slug: string): string | null {
  switch (type) {
    case 'post':
      return `${SITE_URL}/blog/${slug}`;
    case 'condition':
      return `${SITE_URL}/conditions/${slug}`;
    case 'team_member':
      return `${SITE_URL}/team/${slug}`;
    default:
      return null;
  }
}

/** Constant-time comparison of two hex strings. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Verify Kiln's webhook signature: HMAC-SHA256 of the raw body, hex-encoded
  // in x-kilncms-signature, keyed by the endpoint's signing secret (shown in
  // Kiln admin → Webhooks). Set INDEXNOW_WEBHOOK_SECRET to that signing
  // secret in the Cloudflare Pages runtime env.
  // Fail-closed: if the secret env var is unset, refuse all requests rather
  // than accepting any caller.
  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const secret = runtimeEnv.INDEXNOW_WEBHOOK_SECRET ?? import.meta.env.INDEXNOW_WEBHOOK_SECRET;
  if (!secret) {
    console.error('INDEXNOW_WEBHOOK_SECRET is not configured; rejecting webhook');
    return new Response('Service not configured', { status: 503 });
  }

  // Reject oversized bodies before reading them
  const tooBig = checkBodySize(request, 50_000);
  if (tooBig) return tooBig;

  const raw = await request.text();
  const signature = request.headers.get('x-kilncms-signature') || '';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (!timingSafeEqualHex(expected, signature.toLowerCase())) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response('Bad Request: invalid JSON', { status: 400 });
  }

  // Kiln webhook payload: { event: "post.published", payload: { slug, ... } }
  const event = body?.event as string | undefined;
  const type = event?.split('.')[0];
  const slug = (body?.payload as { slug?: string } | undefined)?.slug;

  if (!type || !slug) {
    return new Response('Bad Request: missing event or payload.slug', { status: 400 });
  }

  // Whitelist document type before doing anything with the slug
  if (!ALLOWED_TYPES.has(type)) {
    return new Response(JSON.stringify({ skipped: true, type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate slug shape — defense in depth even though Sanity slugs are URL-safe
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    return new Response('Bad Request: invalid slug', { status: 400 });
  }

  const url = urlForDocument(type, slug);
  if (!url) {
    // Unknown doc type — not an error, just nothing to submit
    return new Response(JSON.stringify({ skipped: true, type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(INDEXNOW_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'holisticacupuncture.net',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [url],
    }),
  });

  if (res.ok || res.status === 202) {
    return new Response(JSON.stringify({ submitted: url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(`IndexNow error: ${res.status}`, { status: 502 });
};
