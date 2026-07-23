/**
 * Site content types, as served by Kiln CMS.
 *
 * Field names deliberately mirror the old Sanity-era interfaces
 * (src/types/sanity.ts) so page templates carry over with minimal changes:
 * slugs keep the `{ current }` wrapper and list-ish Sanity fields keep their
 * names. Images are now plain URLs (Cloudflare Images) instead of Sanity
 * asset references.
 */

export interface ContentImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Slug {
  current: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: Slug;
  excerpt: string;
  category: string;
  tags?: string[];
  featuredImage?: ContentImage;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  featured: boolean;
  author?: { name: string; slug?: Slug; role?: string };
  seo?: { metaTitle?: string; metaDescription?: string };
  /** Rendered HTML of the block tree; present on detail (BySlug) fetches. */
  contentHtml?: string;
}

export interface Condition {
  _id: string;
  name: string;
  slug: Slug;
  category: string;
  description: string;
  icon?: string;
  symptoms?: string[];
  treatmentDuration?: string;
  relatedConditions?: Array<{ name: string; slug: Slug }>;
  featuredOnHomepage: boolean;
  order: number;
  seo?: { metaTitle?: string; metaDescription?: string };
  /** Rendered HTML of the block tree; present on detail (BySlug) fetches. */
  contentHtml?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: Slug;
  role: string;
  credentials?: string;
  photo?: ContentImage;
  shortBio: string;
  specialties?: string[];
  certifications?: Array<{ title: string; organization?: string; year?: number }>;
  education?: Array<{ degree: string; school?: string; year?: number }>;
  yearsExperience?: number;
  languages?: string[];
  email?: string;
  phone?: string;
  order: number;
  /** Rendered HTML of the bio block tree; present on detail fetches. */
  bioHtml?: string;
}

export interface Testimonial {
  _id: string;
  author: string;
  condition: string;
  quote: string;
  rating: number;
  date: string;
  featured: boolean;
  verified: boolean;
  avatar?: ContentImage;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  featured: boolean;
}

// Category label maps (unchanged from the Sanity era).
export { categoryLabels, conditionCategories, faqCategories } from './sanity';
