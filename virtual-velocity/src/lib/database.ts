/**
 * Database Abstraction Layer
 *
 * This module provides a consistent interface for database operations.
 *
 * On Windows ARM64 (local development), database operations are logged but not persisted.
 * In production (Coolify/Docker on Linux), the full Astro DB is used.
 */

// Types for our database entities
export interface ContactSubmissionData {
  name: string;
  email: string;
  phone?: string | null;
  referralSource?: string | null;
  message?: string | null;
}

export interface NewsletterSubscriberData {
  email: string;
}

export interface TestimonialSubmissionData {
  name: string;
  email: string;
  condition?: string;
  testimonial: string;
  rating?: number | null;
}

// In-memory storage for development (data won't persist between restarts)
const devStorage = {
  contacts: [] as any[],
  testimonials: [] as any[],
  subscribers: [] as any[],
  nextId: 1,
};

// Check if we're in an environment where Astro DB works
const isDbAvailable = (): boolean => {
  // Windows ARM64 doesn't support libsql
  if (typeof process !== 'undefined') {
    const isWindowsArm = process.platform === 'win32' && process.arch === 'arm64';
    if (isWindowsArm) {
      return false;
    }
  }
  return true;
};

// Contact submission operations
export async function insertContactSubmission(data: ContactSubmissionData): Promise<boolean> {
  if (!isDbAvailable()) {
    const submission = {
      id: devStorage.nextId++,
      ...data,
      submittedAt: new Date(),
    };
    devStorage.contacts.unshift(submission);
    console.log('[database:dev] Stored contact submission:', data.name);
    return true;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, ContactSubmission } = await import('astro:db');
    await db.insert(ContactSubmission).values({
      ...data,
      submittedAt: new Date(),
    });
    return true;
  } catch (e) {
    console.error('[database] Error inserting contact submission:', e);
    return false;
  }
}

// Newsletter subscription operations
export async function insertNewsletterSubscriber(data: NewsletterSubscriberData): Promise<{ success: boolean; exists?: boolean }> {
  if (!isDbAvailable()) {
    const existing = devStorage.subscribers.find(s => s.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      console.log('[database:dev] Subscriber already exists:', data.email);
      return { success: true, exists: true };
    }

    const subscriber = {
      id: devStorage.nextId++,
      email: data.email.toLowerCase(),
      subscribedAt: new Date(),
      active: true,
    };
    devStorage.subscribers.unshift(subscriber);
    console.log('[database:dev] Stored newsletter subscriber:', data.email);
    return { success: true };
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, NewsletterSubscriber, eq } = await import('astro:db');

    // Check if already subscribed
    const existing = await db
      .select()
      .from(NewsletterSubscriber)
      .where(eq(NewsletterSubscriber.email, data.email.toLowerCase()));

    if (existing.length > 0) {
      return { success: true, exists: true };
    }

    await db.insert(NewsletterSubscriber).values({
      email: data.email.toLowerCase(),
      subscribedAt: new Date(),
      active: true,
    });

    return { success: true };
  } catch (e) {
    console.error('[database] Error inserting newsletter subscriber:', e);
    return { success: false };
  }
}

// Testimonial submission operations
export async function insertTestimonialSubmission(data: TestimonialSubmissionData): Promise<boolean> {
  if (!isDbAvailable()) {
    const testimonial = {
      id: devStorage.nextId++,
      name: data.name,
      email: data.email,
      condition: data.condition || 'General',
      testimonial: data.testimonial,
      rating: data.rating || null,
      submittedAt: new Date(),
      status: 'pending',
      publishedToSanity: false,
    };
    devStorage.testimonials.unshift(testimonial);
    console.log('[database:dev] Stored testimonial from:', data.name);
    return true;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, TestimonialSubmission } = await import('astro:db');
    await db.insert(TestimonialSubmission).values({
      name: data.name,
      email: data.email,
      condition: data.condition || 'General',
      testimonial: data.testimonial,
      rating: data.rating || null,
      submittedAt: new Date(),
      status: 'pending',
      publishedToSanity: false,
    });
    return true;
  } catch (e) {
    console.error('[database] Error inserting testimonial:', e);
    return false;
  }
}

// Get all submissions (for admin)
export async function getContactSubmissions(): Promise<any[]> {
  if (!isDbAvailable()) {
    console.log('[database:dev] Returning', devStorage.contacts.length, 'contacts from memory');
    return devStorage.contacts;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, ContactSubmission, desc } = await import('astro:db');
    return await db
      .select()
      .from(ContactSubmission)
      .orderBy(desc(ContactSubmission.submittedAt));
  } catch (e) {
    console.error('[database] Error fetching contacts:', e);
    return [];
  }
}

export async function getTestimonialSubmissions(): Promise<any[]> {
  if (!isDbAvailable()) {
    console.log('[database:dev] Returning', devStorage.testimonials.length, 'testimonials from memory');
    return devStorage.testimonials;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, TestimonialSubmission, desc } = await import('astro:db');
    return await db
      .select()
      .from(TestimonialSubmission)
      .orderBy(desc(TestimonialSubmission.submittedAt));
  } catch (e) {
    console.error('[database] Error fetching testimonials:', e);
    return [];
  }
}

export async function getNewsletterSubscribers(): Promise<any[]> {
  if (!isDbAvailable()) {
    console.log('[database:dev] Returning', devStorage.subscribers.length, 'subscribers from memory');
    return devStorage.subscribers;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, NewsletterSubscriber, desc } = await import('astro:db');
    return await db
      .select()
      .from(NewsletterSubscriber)
      .orderBy(desc(NewsletterSubscriber.subscribedAt));
  } catch (e) {
    console.error('[database] Error fetching subscribers:', e);
    return [];
  }
}

// Update testimonial status
export async function updateTestimonialStatus(id: number, status: string): Promise<boolean> {
  if (!isDbAvailable()) {
    const testimonial = devStorage.testimonials.find(t => t.id === id);
    if (testimonial) {
      testimonial.status = status;
      console.log('[database:dev] Updated testimonial', id, 'status to', status);
    }
    return true;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, TestimonialSubmission, eq } = await import('astro:db');
    await db
      .update(TestimonialSubmission)
      .set({ status })
      .where(eq(TestimonialSubmission.id, id));
    return true;
  } catch (e) {
    console.error('[database] Error updating testimonial:', e);
    return false;
  }
}

// Delete testimonial
export async function deleteTestimonial(id: number): Promise<boolean> {
  if (!isDbAvailable()) {
    const index = devStorage.testimonials.findIndex(t => t.id === id);
    if (index > -1) {
      devStorage.testimonials.splice(index, 1);
      console.log('[database:dev] Deleted testimonial', id);
    }
    return true;
  }

  try {
    // @ts-ignore - Tables are registered via astro:db config
    const { db, TestimonialSubmission, eq } = await import('astro:db');
    await db
      .delete(TestimonialSubmission)
      .where(eq(TestimonialSubmission.id, id));
    return true;
  } catch (e) {
    console.error('[database] Error deleting testimonial:', e);
    return false;
  }
}
