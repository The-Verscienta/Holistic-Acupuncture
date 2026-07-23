import type { APIRoute } from 'astro';
import { getAllBlogPosts, getAllConditions } from '../../lib/kilnQueries';
import type { BlogPost, Condition } from '../../types/content';

export const prerender = false;

// Rate limiting to prevent abuse of Sanity API
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 searches per minute per IP

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

// Module-scope TTL cache for searchable corpus.
// On Cloudflare Workers each isolate has its own cache; that's fine —
// blog/condition data changes rarely and the goal is to stop hammering
// Sanity on every keystroke. Sanity webhook revalidation could clear this
// in the future via a separate purge endpoint.
const CORPUS_TTL_MS = 5 * 60 * 1000; // 5 minutes
let corpusCache: {
  blogPosts: BlogPost[];
  conditions: Condition[];
  expiresAt: number;
} | null = null;
let corpusInflight: Promise<{ blogPosts: BlogPost[]; conditions: Condition[] }> | null = null;

async function getCorpus(kilnUrl?: string): Promise<{ blogPosts: BlogPost[]; conditions: Condition[] }> {
  const now = Date.now();
  if (corpusCache && corpusCache.expiresAt > now) {
    return { blogPosts: corpusCache.blogPosts, conditions: corpusCache.conditions };
  }
  // Coalesce concurrent misses so a burst of requests triggers a single fetch
  if (corpusInflight) return corpusInflight;
  corpusInflight = (async () => {
    const [blogPosts, conditions] = await Promise.all([
      getAllBlogPosts(kilnUrl),
      getAllConditions(kilnUrl),
    ]);
    corpusCache = { blogPosts, conditions, expiresAt: Date.now() + CORPUS_TTL_MS };
    return { blogPosts, conditions };
  })();
  try {
    return await corpusInflight;
  } finally {
    corpusInflight = null;
  }
}

interface SearchResult {
  type: 'blog' | 'condition';
  title: string;
  description: string;
  url: string;
  category?: string;
  date?: string;
}

/**
 * Search API Endpoint
 *
 * Searches through blog posts and conditions for matching content.
 */
export const GET: APIRoute = async ({ request, url, locals }) => {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again in a minute.'
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const query = url.searchParams.get('q')?.trim().toLowerCase();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({
          success: true,
          results: [],
          message: 'Please enter at least 2 characters to search'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch all searchable content (cached in-isolate for CORPUS_TTL_MS)
    const kilnUrl = (locals as any)?.runtime?.env?.KILN_API_URL;
    const { blogPosts, conditions } = await getCorpus(kilnUrl);

    const results: SearchResult[] = [];

    // Search blog posts
    blogPosts.forEach(post => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = post.category?.toLowerCase().includes(query);
      const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));

      if (titleMatch || excerptMatch || categoryMatch || tagsMatch) {
        results.push({
          type: 'blog',
          title: post.title,
          description: post.excerpt || '',
          url: `/blog/${post.slug.current}`,
          category: post.category,
          date: post.publishedAt
        });
      }
    });

    // Search conditions
    conditions.forEach(condition => {
      const nameMatch = condition.name.toLowerCase().includes(query);
      const descriptionMatch = condition.description?.toLowerCase().includes(query);
      const categoryMatch = condition.category?.toLowerCase().includes(query);
      const symptomsMatch = condition.symptoms?.some(s => s.toLowerCase().includes(query));

      if (nameMatch || descriptionMatch || categoryMatch || symptomsMatch) {
        results.push({
          type: 'condition',
          title: condition.name,
          description: condition.description || '',
          url: `/conditions/${condition.slug.current}`,
          category: condition.category
        });
      }
    });

    // Sort results: prioritize title matches
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aStartsWith = aTitle.startsWith(query);
      const bStartsWith = bTitle.startsWith(query);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.title.localeCompare(b.title);
    });

    // Limit results
    const limitedResults = results.slice(0, 20);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: limitedResults,
        total: results.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Search error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while searching'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
