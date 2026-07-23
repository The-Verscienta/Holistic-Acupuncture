/**
 * Kiln CMS client — thin fetch wrappers over Kiln's two read surfaces:
 *
 *  - JSON:API (`/api/json/...`) for lists and record metadata (everything
 *    except blocks: title, slug, excerpt, custom_fields, seo_*, published_at,
 *    relationships).
 *  - Fired-artifact API (`/api/content/:type/:slug`) for a published record's
 *    block tree (rich_text bodies are Portable Text; image blocks carry the
 *    final Cloudflare Images URL).
 *
 * Base URL comes from KILN_API_URL. At build time (SSG) import.meta.env is
 * used; runtime endpoints on Cloudflare pass the env value explicitly via
 * `baseUrl` since worker env vars live on locals.runtime.env.
 */

const DEFAULT_KILN_URL = 'http://localhost:4000';

export function kilnBaseUrl(override?: string): string {
  const url = override || import.meta.env.KILN_API_URL || import.meta.env.PUBLIC_KILN_URL;
  if (!url) {
    // Fall back to the local dev server only in dev — a production build
    // without the env var should fail loudly, not dial localhost in CI.
    if (import.meta.env.DEV) return DEFAULT_KILN_URL;
    throw new Error(
      'KILN_API_URL is not set. Configure it in the build environment ' +
        '(and as a Cloudflare Pages runtime variable for SSR endpoints).'
    );
  }
  return url.replace(/\/$/, '');
}

export interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships?: Record<string, { data?: { id: string; type: string } | Array<{ id: string; type: string }> | null }>;
}

export interface JsonApiResult {
  records: JsonApiResource[];
  /** Included resources indexed by `${type}:${id}` */
  included: Map<string, JsonApiResource>;
}

interface ListOptions {
  include?: string[];
  sort?: string;
  baseUrl?: string;
  /** Extra query params, e.g. { 'filter[slug]': 'x' } */
  params?: Record<string, string>;
}

/**
 * Fetch every page of a JSON:API collection route (e.g. "posts/published").
 */
export async function kilnList(path: string, options: ListOptions = {}): Promise<JsonApiResult> {
  const base = kilnBaseUrl(options.baseUrl);
  const search = new URLSearchParams();
  if (options.include?.length) search.set('include', options.include.join(','));
  if (options.sort) search.set('sort', options.sort);
  for (const [key, value] of Object.entries(options.params || {})) search.set(key, value);
  search.set('page[limit]', '100');

  let url: string | null = `${base}/api/json/${path}?${search.toString()}`;
  const records: JsonApiResource[] = [];
  const included = new Map<string, JsonApiResource>();

  while (url) {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      throw new Error(`Kiln JSON:API ${res.status} for ${url}`);
    }
    const body: any = await res.json();
    records.push(...(body.data || []));
    for (const inc of body.included || []) {
      included.set(`${inc.type}:${inc.id}`, inc);
    }
    const next = body.links?.next;
    url = next ? (next.startsWith('http') ? next : `${base}${next}`) : null;
  }

  return { records, included };
}

/** Resolve a to-one relationship out of the included map. */
export function related(
  record: JsonApiResource,
  name: string,
  included: Map<string, JsonApiResource>
): JsonApiResource | null {
  const data = record.relationships?.[name]?.data;
  if (!data || Array.isArray(data)) return null;
  return included.get(`${data.type}:${data.id}`) || null;
}

/** Resolve a to-many relationship out of the included map. */
export function relatedList(
  record: JsonApiResource,
  name: string,
  included: Map<string, JsonApiResource>
): JsonApiResource[] {
  const data = record.relationships?.[name]?.data;
  if (!Array.isArray(data)) return [];
  return data
    .map((ref) => included.get(`${ref.type}:${ref.id}`))
    .filter((r): r is JsonApiResource => Boolean(r));
}

export interface KilnArtifact {
  id: string;
  type: string;
  slug: string;
  title: string;
  blocks: Array<Record<string, any>>;
}

// Astro's static build renders every page concurrently, which would fan out
// hundreds of parallel artifact fetches and trip Kiln's rate limiter — gate
// them through a small semaphore instead.
const MAX_CONCURRENT = 4;
let active = 0;
const waiters: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}

/** GET with retry/backoff on 429 (rate limited) and 503, through the semaphore. */
function fetchWithRetry(url: string): Promise<Response> {
  return withSlot(async () => {
    let res: Response;
    for (let attempt = 0; attempt < 6; attempt++) {
      res = await fetch(url);
      if (res.status !== 429 && res.status !== 503) return res;
      const retryAfter = Number(res.headers.get('retry-after')) || 0;
      const delayMs = Math.max(retryAfter * 1000, 500 * (attempt + 1));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return res!;
  });
}

/**
 * Fetch a published record's fired JSON artifact (block tree). Returns null
 * on 404 (not published / unknown slug). 503 (artifact still firing) and 429
 * (rate limited) are retried with backoff.
 */
export async function kilnArtifact(
  type: string,
  slug: string,
  baseUrl?: string
): Promise<KilnArtifact | null> {
  const url = `${kilnBaseUrl(baseUrl)}/api/content/${type}/${encodeURIComponent(slug)}`;
  const res = await fetchWithRetry(url);
  if (res.ok) return (await res.json()) as KilnArtifact;
  if (res.status === 404) return null;
  throw new Error(`Kiln artifact ${res.status} for ${url}`);
}
