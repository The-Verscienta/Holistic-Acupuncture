import type { APIRoute } from 'astro';
import { getAllBlogPosts, getAllConditions } from '../../lib/sanityQueries';

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
export const GET: APIRoute = async ({ request, url }) => {
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

    // Fetch all searchable content
    const [blogPosts, conditions] = await Promise.all([
      getAllBlogPosts(),
      getAllConditions()
    ]);

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
