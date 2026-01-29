import { sanityClient } from './sanity';
import type { BlogPost, Testimonial, Condition, TeamMember, FAQ } from '../types/sanity';

// Blog Post Queries
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const query = `*[_type == "blog"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "author": author->{name, slug, photo, role},
    category,
    excerpt,
    featuredImage,
    readTime,
    publishedAt,
    featured,
    seo
  }`;
  return await sanityClient.fetch(query);
}

export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  const query = `*[_type == "blog" && featured == true] | order(publishedAt desc) [0...${limit}] {
    _id,
    title,
    slug,
    "author": author->{name, slug, photo, role},
    category,
    excerpt,
    featuredImage,
    readTime,
    publishedAt,
    featured,
    seo
  }`;
  return await sanityClient.fetch(query);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "blog" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "author": author->{_id, name, slug, photo, role, credentials},
    category,
    excerpt,
    featuredImage,
    body,
    tags,
    readTime,
    publishedAt,
    featured,
    seo,
    metadata
  }`;
  return await sanityClient.fetch(query, { slug });
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const query = `*[_type == "blog" && category == $category] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "author": author->{name, slug, photo, role},
    category,
    excerpt,
    featuredImage,
    readTime,
    publishedAt,
    featured
  }`;
  return await sanityClient.fetch(query, { category });
}

export async function getRelatedBlogPosts(currentSlug: string, category: string, limit: number = 3): Promise<BlogPost[]> {
  const query = `*[_type == "blog" && slug.current != $currentSlug && category == $category] | order(publishedAt desc) [0...${limit}] {
    _id,
    title,
    slug,
    "author": author->{name, slug, photo, role},
    category,
    excerpt,
    featuredImage,
    readTime,
    publishedAt,
    featured
  }`;
  return await sanityClient.fetch(query, { currentSlug, category });
}

export async function getPaginatedBlogPosts(page: number = 1, pageSize: number = 9): Promise<{ posts: BlogPost[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const countQuery = `count(*[_type == "blog"])`;
  const postsQuery = `*[_type == "blog"] | order(publishedAt desc) [${offset}...${offset + pageSize}] {
    _id,
    title,
    slug,
    "author": author->{name, slug, photo, role},
    category,
    excerpt,
    featuredImage,
    readTime,
    publishedAt,
    featured,
    seo
  }`;

  const [total, posts] = await Promise.all([
    sanityClient.fetch<number>(countQuery),
    sanityClient.fetch<BlogPost[]>(postsQuery)
  ]);

  return { posts, total };
}

// Testimonial Queries
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const query = `*[_type == "testimonial"] | order(date desc) {
    _id,
    author,
    condition,
    quote,
    rating,
    date,
    featured,
    verified,
    avatar
  }`;
  return await sanityClient.fetch(query);
}

export async function getFeaturedTestimonials(limit: number = 6): Promise<Testimonial[]> {
  const query = `*[_type == "testimonial" && featured == true] | order(date desc) [0...${limit}] {
    _id,
    author,
    condition,
    quote,
    rating,
    date,
    featured,
    verified,
    avatar
  }`;
  return await sanityClient.fetch(query);
}

// Condition Queries
export async function getAllConditions(): Promise<Condition[]> {
  const query = `*[_type == "condition"] | order(order asc) {
    _id,
    name,
    slug,
    category,
    description,
    icon,
    detailedDescription,
    symptoms,
    howAcupunctureHelps,
    treatmentDuration,
    featuredOnHomepage,
    order,
    seo
  }`;
  return await sanityClient.fetch(query);
}

export async function getFeaturedConditions(limit: number = 6): Promise<Condition[]> {
  const query = `*[_type == "condition" && featuredOnHomepage == true] | order(order asc) [0...${limit}] {
    _id,
    name,
    slug,
    category,
    description,
    icon,
    featuredOnHomepage,
    order
  }`;
  return await sanityClient.fetch(query);
}

export async function getConditionsByCategory(category: string): Promise<Condition[]> {
  const query = `*[_type == "condition" && category == $category] | order(order asc) {
    _id,
    name,
    slug,
    category,
    description,
    icon,
    order
  }`;
  return await sanityClient.fetch(query, { category });
}

export async function getConditionBySlug(slug: string): Promise<Condition | null> {
  const query = `*[_type == "condition" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    category,
    description,
    icon,
    detailedDescription,
    symptoms,
    howAcupunctureHelps,
    treatmentDuration,
    "relatedConditions": relatedConditions[]->{
      _id,
      name,
      slug,
      description,
      icon
    },
    featuredOnHomepage,
    order,
    seo
  }`;
  return await sanityClient.fetch(query, { slug });
}

// Team Member Queries
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const query = `*[_type == "teamMember" && active == true] | order(order asc) {
    _id,
    name,
    slug,
    role,
    credentials,
    photo,
    bio,
    shortBio,
    specialties,
    certifications,
    education,
    yearsExperience,
    languages,
    email,
    phone,
    order,
    active
  }`;
  return await sanityClient.fetch(query);
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const query = `*[_type == "teamMember" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    role,
    credentials,
    photo,
    bio,
    shortBio,
    specialties,
    certifications,
    education,
    yearsExperience,
    languages,
    email,
    phone,
    order,
    active
  }`;
  return await sanityClient.fetch(query, { slug });
}

// FAQ Queries
export async function getAllFAQs(): Promise<FAQ[]> {
  const query = `*[_type == "faq"] | order(category asc, order asc) {
    _id,
    question,
    answer,
    category,
    order,
    featured
  }`;
  return await sanityClient.fetch(query);
}

export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  const query = `*[_type == "faq" && category == $category] | order(order asc) {
    _id,
    question,
    answer,
    category,
    order,
    featured
  }`;
  return await sanityClient.fetch(query, { category });
}

export async function getFeaturedFAQs(limit: number = 5): Promise<FAQ[]> {
  const query = `*[_type == "faq" && featured == true] | order(order asc) [0...${limit}] {
    _id,
    question,
    answer,
    category,
    order,
    featured
  }`;
  return await sanityClient.fetch(query);
}

// Aggregate data for homepage
export interface HomePageData {
  featuredConditions: Condition[];
  featuredTestimonials: Testimonial[];
  recentBlogPosts: BlogPost[];
}

export async function getHomePageData(): Promise<HomePageData> {
  const [featuredConditions, featuredTestimonials, recentBlogPosts] = await Promise.all([
    getFeaturedConditions(6),
    getFeaturedTestimonials(6),
    getFeaturedBlogPosts(3),
  ]);

  return {
    featuredConditions,
    featuredTestimonials,
    recentBlogPosts,
  };
}
