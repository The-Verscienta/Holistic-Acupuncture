import type { APIRoute } from 'astro';

export const prerender = false;

const SITE_URL = 'https://holisticacupuncture.net';
const INDEXNOW_KEY = '81e84114cb0247a7b6c5fbd5c9f1e44d';
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

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

export const POST: APIRoute = async ({ request }) => {
  // Validate webhook secret (set INDEXNOW_WEBHOOK_SECRET in Cloudflare env vars
  // and add x-webhook-secret header in the Sanity webhook config)
  const secret = import.meta.env.INDEXNOW_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get('x-webhook-secret');
    if (header !== secret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

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
