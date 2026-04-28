import type { APIRoute } from 'astro';
import { checkBodySize } from '../../lib/sanitize';

export const prerender = false;

const SITE_URL = 'https://holisticacupuncture.net';
const INDEXNOW_KEY = '81e84114cb0247a7b6c5fbd5c9f1e44d';
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

// Sanity slugs are URL-safe; restrict to a-z 0-9 and `-` to prevent
// path traversal or arbitrary URL injection into the IndexNow submission.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,128}[a-z0-9])?$/;
const ALLOWED_TYPES = new Set(['blog', 'blogPost', 'condition', 'teamMember']);

function urlForDocument(type: string, slug: string): string | null {
  switch (type) {
    case 'blog':
    case 'blogPost':
      return `${SITE_URL}/blog/${slug}`;
    case 'condition':
      return `${SITE_URL}/conditions/${slug}`;
    case 'teamMember':
      return `${SITE_URL}/team/${slug}`;
    default:
      return null;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Validate webhook secret (set INDEXNOW_WEBHOOK_SECRET in Cloudflare env vars
  // and add x-webhook-secret header in the Sanity webhook config).
  // Fail-closed: if the secret env var is unset, refuse all requests rather
  // than accepting any caller — the previous opt-in behavior was a footgun.
  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const secret = runtimeEnv.INDEXNOW_WEBHOOK_SECRET ?? import.meta.env.INDEXNOW_WEBHOOK_SECRET;
  if (!secret) {
    console.error('INDEXNOW_WEBHOOK_SECRET is not configured; rejecting webhook');
    return new Response('Service not configured', { status: 503 });
  }
  const header = request.headers.get('x-webhook-secret');
  if (header !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Reject oversized bodies before parsing
  const tooBig = checkBodySize(request, 10_000);
  if (tooBig) return tooBig;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad Request: invalid JSON', { status: 400 });
  }

  const type = body?._type as string | undefined;
  const slug = (body?.slug as { current?: string } | undefined)?.current;

  if (!type || !slug) {
    return new Response('Bad Request: missing _type or slug.current', { status: 400 });
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
