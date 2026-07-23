import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Preview resolver for Kiln's Presentation console.
 *
 * The console iframes this site for side-by-side editing, but Kiln's own URL
 * conventions (/team_members/<slug>, /faqs/<slug>) don't match this site's
 * routes — this endpoint owns the mapping and redirects. Kiln is configured
 * with:
 *
 *   PRESENTATION_PREVIEW_URL="https://holisticacupuncture.net/api/preview?type={type}&slug={slug}"
 */

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,128}[a-z0-9])?$/;

function pathFor(type: string, slug: string | null): string {
  switch (type) {
    case 'post':
      return slug ? `/blog/${slug}` : '/blog';
    case 'condition':
      return slug ? `/conditions/${slug}` : '/conditions';
    case 'team_member':
      return slug ? `/team/${slug}` : '/about';
    // FAQs and testimonials render as sections of a single page.
    case 'faq':
      return '/faq';
    case 'testimonial':
      return '/reviews';
    default:
      return '/';
  }
}

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') || '';
  const rawSlug = url.searchParams.get('slug');
  const slug = rawSlug && SLUG_PATTERN.test(rawSlug) ? rawSlug : null;

  return new Response(null, {
    status: 302,
    headers: {
      Location: pathFor(type, slug),
      // Previews must reflect the latest deploy, never a cached redirect.
      'Cache-Control': 'no-store',
    },
  });
};
