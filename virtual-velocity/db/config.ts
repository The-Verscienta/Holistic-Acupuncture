import { defineDb, defineTable, column } from 'astro:db';

// Contact form submissions table
const ContactSubmission = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    phone: column.text({ optional: true }),
    referralSource: column.text({ optional: true }),
    message: column.text({ optional: true }),
    submittedAt: column.date(),
    status: column.text({ default: 'new' }), // new, contacted, resolved
  },
});

// Testimonial submissions table (pending approval)
const TestimonialSubmission = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    condition: column.text(),
    testimonial: column.text(),
    rating: column.number({ optional: true }),
    submittedAt: column.date(),
    status: column.text({ default: 'pending' }), // pending, approved, rejected
    publishedToSanity: column.boolean({ default: false }),
  },
});

// Newsletter subscribers table
const NewsletterSubscriber = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    subscribedAt: column.date(),
    active: column.boolean({ default: true }),
  },
});

// Export database configuration
export default defineDb({
  tables: {
    ContactSubmission,
    TestimonialSubmission,
    NewsletterSubscriber,
  },
});
