// @ts-ignore - Tables are registered via astro:db config, only runs in production
import { db, ContactSubmission, TestimonialSubmission, NewsletterSubscriber } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  // Seed sample contact submissions for testing
  await db.insert(ContactSubmission).values([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(414) 555-0101',
      referralSource: 'Google Search',
      message: 'I would like to schedule an appointment for chronic headaches.',
      submittedAt: new Date('2025-01-05'),
      status: 'new',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '(414) 555-0102',
      referralSource: 'Friend Referral',
      message: 'Interested in acupuncture for stress and anxiety management.',
      submittedAt: new Date('2025-01-08'),
      status: 'contacted',
    },
  ]);

  // Seed sample testimonial submissions
  await db.insert(TestimonialSubmission).values([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      condition: 'Chronic Migraines',
      testimonial: 'After years of suffering from migraines, I finally found relief through acupuncture. The treatment plan was personalized and effective. Highly recommend!',
      rating: 5,
      submittedAt: new Date('2025-01-03'),
      status: 'approved',
      publishedToSanity: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      condition: 'Lower Back Pain',
      testimonial: 'The acupuncture treatments have dramatically reduced my back pain. Professional staff and calming environment.',
      rating: 5,
      submittedAt: new Date('2025-01-06'),
      status: 'pending',
      publishedToSanity: false,
    },
  ]);

  // Seed sample newsletter subscribers
  await db.insert(NewsletterSubscriber).values([
    {
      id: 1,
      email: 'newsletter1@example.com',
      subscribedAt: new Date('2025-01-01'),
      active: true,
    },
    {
      id: 2,
      email: 'newsletter2@example.com',
      subscribedAt: new Date('2025-01-04'),
      active: true,
    },
  ]);

  console.log('✅ Database seeded successfully!');
}
