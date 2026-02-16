// TypeScript types for Sanity documents

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: Array<{
    _type: 'span';
    text: string;
    marks?: string[];
  }>;
}

export interface BlogPost {
  _id: string;
  _type: 'blog';
  title: string;
  slug: SanitySlug;
  author?: TeamMember;
  category: string;
  excerpt: string;
  featuredImage?: SanityImage;
  content?: Array<SanityBlock | SanityImage>; // For native blogPost type
  body?: Array<SanityBlock | SanityImage>; // For migrated blog type
  tags?: string[];
  readTime: number;
  publishedAt: string;
  featured: boolean;
  metadata?: {
    wpId?: number;
    wpLink?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface Testimonial {
  _id: string;
  _type: 'testimonial';
  author: string;
  condition: string;
  quote: string;
  rating: number;
  date: string;
  featured: boolean;
  verified: boolean;
  avatar?: SanityImage;
}

export interface Condition {
  _id: string;
  _type: 'condition';
  name: string;
  slug: SanitySlug;
  category: string;
  description: string;
  icon?: string;
  detailedDescription?: SanityBlock[];
  symptoms?: string[];
  howAcupunctureHelps?: SanityBlock[];
  treatmentDuration?: string;
  relatedConditions?: Condition[];
  featuredOnHomepage: boolean;
  order: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface TeamMember {
  _id: string;
  _type: 'teamMember';
  name: string;
  slug: SanitySlug;
  role: string;
  credentials?: string;
  photo?: SanityImage;
  bio: SanityBlock[];
  shortBio: string;
  specialties?: string[];
  certifications?: Array<{
    title: string;
    organization: string;
    year: number;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    year: number;
  }>;
  yearsExperience?: number;
  languages?: string[];
  email?: string;
  phone?: string;
  order: number;
  active: boolean;
}

export interface FAQ {
  _id: string;
  _type: 'faq';
  question: string;
  answer: string;
  category: string;
  order: number;
  featured: boolean;
}

// Category mappings
export const categoryLabels: Record<string, string> = {
  'wellness': 'Wellness',
  'pain-management': 'Pain Management',
  'getting-started': 'Getting Started',
  'mental-health': 'Mental Health',
  'womens-health': "Women's Health",
  'nutrition': 'Nutrition',
};

export const conditionCategories: Record<string, string> = {
  'pain': 'Pain Management',
  'mental-health': 'Mental Health',
  'womens-health': "Women's Health",
  'digestive': 'Digestive Health',
  'immune': 'Immune & Allergies',
  'other': 'Other Conditions',
};

export const faqCategories: Record<string, string> = {
  'about-acupuncture': 'About Acupuncture',
  'treatment-process': 'Treatment & Process',
  'insurance-payment': 'Insurance & Payment',
  'appointments-policies': 'Appointments & Policies',
  'safety-side-effects': 'Safety & Side Effects',
  'our-practice': 'Our Practice',
};
