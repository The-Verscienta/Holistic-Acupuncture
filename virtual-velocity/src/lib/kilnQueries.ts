/**
 * Content queries against Kiln CMS — the successor to sanityQueries.ts, with
 * matching function names and page-facing shapes (see src/types/content.ts).
 *
 * Lists come from Kiln's JSON:API; detail (BySlug) functions additionally
 * fetch the record's fired artifact and attach rendered HTML (`contentHtml` /
 * `bioHtml`) via the shared block renderer, replacing the per-page Portable
 * Text serializers of the Sanity era.
 *
 * List responses are cached for 5 minutes per base URL: at build time that
 * collapses the getStaticPaths + per-page refetches into one request per
 * type; at runtime (blog index, search API on Cloudflare) it bounds Kiln
 * traffic per isolate.
 */

import { kilnList, kilnArtifact, related, relatedList, type JsonApiResource } from './kiln';
import { renderBlocks, blocksToPlainText, readTimeMinutes } from './kilnBlocks';
import type { BlogPost, Condition, ContentImage, FAQ, TeamMember, Testimonial } from '../types/content';

const CACHE_TTL_MS = 5 * 60 * 1000;
const listCache = new Map<string, { at: number; data: Promise<any> }>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = listCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as Promise<T>;
  const data = load().catch((err) => {
    listCache.delete(key);
    throw err;
  });
  listCache.set(key, { at: Date.now(), data });
  return data;
}

function image(resource: JsonApiResource | null, fallbackAlt = ''): ContentImage | undefined {
  if (!resource?.attributes?.url) return undefined;
  return {
    url: resource.attributes.url,
    alt: resource.attributes.alt || fallbackAlt,
    width: resource.attributes.width || undefined,
    height: resource.attributes.height || undefined,
  };
}

const splitLines = (value: unknown): string[] | undefined =>
  typeof value === 'string' && value.trim()
    ? value.split('\n').map((line) => line.trim()).filter(Boolean)
    : undefined;

const splitStructured = (value: unknown, keys: string[]) =>
  splitLines(value)?.map((line) => {
    const parts = line.split('|').map((p) => p.trim());
    return Object.fromEntries(
      keys.map((key, i) => [key, key === 'year' ? Number(parts[i]) || undefined : parts[i] || undefined])
    );
  });

// --- Blog posts ------------------------------------------------------------

function mapPost(record: JsonApiResource, included: Map<string, JsonApiResource>): BlogPost {
  const attrs = record.attributes;
  const cf = attrs.custom_fields || {};
  return {
    _id: record.id,
    title: attrs.title,
    slug: { current: attrs.slug },
    excerpt: attrs.excerpt || '',
    category: related(record, 'category', included)?.attributes.slug || 'wellness',
    tags: relatedList(record, 'tags', included).map((t) => t.attributes.name),
    featuredImage: image(related(record, 'featured_image', included), attrs.title),
    publishedAt: attrs.published_at,
    updatedAt: attrs.updated_at,
    readTime: 3, // placeholder; corrected on detail fetch where blocks exist
    featured: cf.featured === true,
    author: cf.author_name
      ? {
          name: cf.author_name,
          slug: cf.author_slug ? { current: cf.author_slug } : undefined,
        }
      : undefined,
    seo:
      attrs.seo_title || attrs.seo_description
        ? { metaTitle: attrs.seo_title || undefined, metaDescription: attrs.seo_description || undefined }
        : undefined,
  };
}

export function getAllBlogPosts(baseUrl?: string): Promise<BlogPost[]> {
  return cached(`posts:${baseUrl || ''}`, async () => {
    const { records, included } = await kilnList('posts/published', {
      include: ['category', 'tags', 'featured_image'],
      sort: '-published_at',
      baseUrl,
    });
    return records.map((record) => mapPost(record, included));
  });
}

export async function getFeaturedBlogPosts(limit = 3, baseUrl?: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts(baseUrl);
  return posts.filter((p) => p.featured).slice(0, limit);
}

export async function getBlogPostBySlug(slug: string, baseUrl?: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts(baseUrl);
  const post = posts.find((p) => p.slug.current === slug);
  if (!post) return null;
  const artifact = await kilnArtifact('post', slug, baseUrl);
  if (!artifact) return post;
  return {
    ...post,
    contentHtml: renderBlocks(artifact.blocks),
    readTime: readTimeMinutes(artifact.blocks),
  };
}

export async function getRelatedBlogPosts(
  slug: string,
  category: string,
  limit = 3,
  baseUrl?: string
): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts(baseUrl);
  const sameCategory = posts.filter((p) => p.slug.current !== slug && p.category === category);
  const fill = posts.filter((p) => p.slug.current !== slug && p.category !== category);
  return [...sameCategory, ...fill].slice(0, limit);
}

// --- Conditions ------------------------------------------------------------

function mapCondition(record: JsonApiResource): Condition {
  const attrs = record.attributes;
  const cf = attrs.custom_fields || {};
  return {
    _id: record.id,
    name: attrs.title,
    slug: { current: attrs.slug },
    category: cf.category || 'other',
    description: attrs.excerpt || '',
    icon: cf.icon || undefined,
    symptoms: splitLines(cf.symptoms),
    treatmentDuration: cf.treatment_duration || undefined,
    featuredOnHomepage: cf.featured === true,
    order: cf.display_order ?? 0,
    seo:
      attrs.seo_title || attrs.seo_description
        ? { metaTitle: attrs.seo_title || undefined, metaDescription: attrs.seo_description || undefined }
        : undefined,
  };
}

export function getAllConditions(baseUrl?: string): Promise<Condition[]> {
  return cached(`conditions:${baseUrl || ''}`, async () => {
    const { records, included } = await kilnList('conditions/published', {
      include: ['related_conditions'],
      baseUrl,
    });
    const conditions = records
      .map((record) => {
        const condition = mapCondition(record);
        condition.relatedConditions = relatedList(record, 'related_conditions', included).map((r) => ({
          name: r.attributes.title,
          slug: { current: r.attributes.slug },
        }));
        return condition;
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    return conditions;
  });
}

export async function getConditionBySlug(slug: string, baseUrl?: string): Promise<Condition | null> {
  const conditions = await getAllConditions(baseUrl);
  const condition = conditions.find((c) => c.slug.current === slug);
  if (!condition) return null;
  const artifact = await kilnArtifact('condition', slug, baseUrl);
  return artifact ? { ...condition, contentHtml: renderBlocks(artifact.blocks) } : condition;
}

// --- Team members ----------------------------------------------------------

function mapTeamMember(record: JsonApiResource, included: Map<string, JsonApiResource>): TeamMember {
  const attrs = record.attributes;
  const cf = attrs.custom_fields || {};
  return {
    _id: record.id,
    name: attrs.title,
    slug: { current: attrs.slug },
    role: cf.role || 'Practitioner',
    credentials: cf.credentials || undefined,
    photo: image(related(record, 'featured_image', included), attrs.title),
    shortBio: attrs.excerpt || '',
    specialties: splitLines(cf.specialties),
    certifications: splitStructured(cf.certifications, ['title', 'organization', 'year']) as
      | TeamMember['certifications']
      | undefined,
    education: splitStructured(cf.education, ['degree', 'school', 'year']) as
      | TeamMember['education']
      | undefined,
    yearsExperience: cf.years_experience ?? undefined,
    languages: splitLines(cf.languages),
    email: cf.email || undefined,
    phone: cf.phone || undefined,
    order: cf.display_order ?? 0,
  };
}

export function getAllTeamMembers(baseUrl?: string): Promise<TeamMember[]> {
  return cached(`team:${baseUrl || ''}`, async () => {
    const { records, included } = await kilnList('team_members/published', {
      include: ['featured_image'],
      baseUrl,
    });
    return records
      .map((record) => mapTeamMember(record, included))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  });
}

export async function getTeamMemberBySlug(slug: string, baseUrl?: string): Promise<TeamMember | null> {
  const members = await getAllTeamMembers(baseUrl);
  const member = members.find((m) => m.slug.current === slug);
  if (!member) return null;
  const artifact = await kilnArtifact('team_member', slug, baseUrl);
  return artifact ? { ...member, bioHtml: renderBlocks(artifact.blocks) } : member;
}

// --- Testimonials ----------------------------------------------------------

function mapTestimonial(record: JsonApiResource, included: Map<string, JsonApiResource>): Testimonial {
  const attrs = record.attributes;
  const cf = attrs.custom_fields || {};
  return {
    _id: record.id,
    author: attrs.title,
    condition: cf.condition_treated || '',
    quote: attrs.excerpt || '',
    rating: cf.rating ?? 5,
    date: cf.review_date || attrs.published_at,
    featured: cf.featured === true,
    verified: cf.verified === true,
    avatar: image(related(record, 'featured_image', included), attrs.title),
  };
}

export function getAllTestimonials(baseUrl?: string): Promise<Testimonial[]> {
  return cached(`testimonials:${baseUrl || ''}`, async () => {
    const { records, included } = await kilnList('testimonials/published', {
      include: ['featured_image'],
      sort: '-published_at',
      baseUrl,
    });
    return records.map((record) => mapTestimonial(record, included));
  });
}

export async function getFeaturedTestimonials(limit = 3, baseUrl?: string): Promise<Testimonial[]> {
  const all = await getAllTestimonials(baseUrl);
  return all.filter((t) => t.featured).slice(0, limit);
}

export async function getRandomTestimonials(count = 3, baseUrl?: string): Promise<Testimonial[]> {
  const all = await getAllTestimonials(baseUrl);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// --- FAQs ------------------------------------------------------------------

export function getAllFAQs(baseUrl?: string): Promise<FAQ[]> {
  return cached(`faqs:${baseUrl || ''}`, async () => {
    const { records } = await kilnList('faqs/published', { baseUrl });
    const faqs = await Promise.all(
      records.map(async (record) => {
        const attrs = record.attributes;
        const cf = attrs.custom_fields || {};
        const artifact = await kilnArtifact('faq', attrs.slug, baseUrl);
        return {
          _id: record.id,
          question: attrs.title,
          answer: artifact ? blocksToPlainText(artifact.blocks) : '',
          category: cf.category || 'about-acupuncture',
          order: cf.display_order ?? 0,
          featured: cf.featured === true,
        } satisfies FAQ;
      })
    );
    return faqs.sort((a, b) => a.order - b.order || a.question.localeCompare(b.question));
  });
}
