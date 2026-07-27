import type { APIRoute } from 'astro';
import { checkBodySize } from '../../lib/sanitize';

export const prerender = false;

const SITE_URL = 'https://holisticacupuncture.net';
const INDEXNOW_KEY = '81e84114cb0247a7b6c5fbd5c9f1e44d';
// Any participating engine relays IndexNow submissions to all the others, so
// the first endpoint that accepts is sufficient. The cascade exists because
// Microsoft's infrastructure (api.indexnow.org AND www.bing.com) 429s
// Cloudflare Workers' shared egress IPs by source IP (verified 2026-07-27:
// identical submissions — same key/host/URL — get 200 from a residential IP
// while this function gets TooManyRequests). Yandex and Seznam run separate
// infrastructure and accept this site's key; Naver is excluded (422 for
// sites not registered with its Search Advisor).
const INDEXNOW_ENDPOINTS = [
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

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

  // Kiln webhook body: { event: "post.published", data: <serialized content> }
  // (KilnCMS.Webhooks.DeliveryWorker encodes %{event: event, data: payload};
  // the serialized content carries a top-level slug).
  const event = body?.event as string | undefined;
  const type = event?.split('.')[0];
  const slug = (body?.data as { slug?: string } | undefined)?.slug;

  if (!type || !slug) {
    return new Response('Bad Request: missing event or data.slug', { status: 400 });
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

  const submission = JSON.stringify({
    host: 'holisticacupuncture.net',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: [url],
  });

  // Walk the engines until one accepts; each failure is logged so real-time
  // function logs show the whole cascade, not just the final verdict.
  let lastStatus = 0;
  let lastDetail = '';
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: submission,
      });
    } catch (err) {
      console.error(`IndexNow fetch to ${endpoint} for ${url} threw: ${err}`);
      lastStatus = 502;
      lastDetail = 'unreachable';
      continue;
    }

    if (res.ok || res.status === 202) {
      return new Response(JSON.stringify({ submitted: url, engine: endpoint }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    lastStatus = res.status;
    lastDetail = (await res.text().catch(() => '')).slice(0, 500);
    console.error(`${endpoint} rejected ${url}: HTTP ${lastStatus} ${lastDetail}`);
  }

  // Mirror the last upstream status (4xx/5xx) instead of a flat 502: Kiln's
  // delivery ledger records our status line, so "endpoint returned HTTP 429"
  // in its logs directly names the upstream complaint without needing
  // real-time function logs. Kiln retries any non-2xx either way.
  const status = lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502;
  return new Response(`IndexNow error: ${lastStatus} ${lastDetail}`, { status });
};
