# Sanity CMS + Astro DB Integration Guide

## Overview

This guide explains how Sanity CMS and Astro DB work together in the Holistic Acupuncture website migration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Astro Website                            │
│                                                             │
│  ┌──────────────────────┐      ┌────────────────────────┐ │
│  │   Sanity CMS         │      │    Astro DB            │ │
│  │   (Editorial)        │      │   (Application Data)   │ │
│  │                      │      │                        │ │
│  │  - Blog Posts        │      │  - Contact Forms       │ │
│  │  - Conditions        │      │  - Testimonial Submits │ │
│  │  - Staff Bios        │      │  - Newsletter Signups  │ │
│  │  - Testimonials*     │      │  - Analytics           │ │
│  │  - Special Offers    │      │                        │ │
│  └──────────────────────┘      └────────────────────────┘ │
│           │                              │                 │
│           │ (Build-time fetch)           │ (Runtime read/write)
│           ▼                              ▼                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Static Site + API Endpoints                │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

*Approved testimonials published to Sanity from Astro DB
```

## When to Use Which System

### Use Sanity CMS For:

**✅ Editorial Content** (content that staff will create/edit regularly)
- Blog posts
- Service/condition pages
- Staff biographies
- FAQ content
- Special offers
- Approved testimonials (after review)

**Why Sanity?**
- Beautiful visual editor (Sanity Studio)
- Non-technical staff can manage content
- Image management with CDN
- Revision history
- Real-time collaboration
- Structured content with schemas

### Use Astro DB For:

**✅ Application Data** (user-generated or transactional data)
- Contact form submissions
- Newsletter signups
- Testimonial submissions (pending approval)
- Analytics/metrics
- Future: Appointment requests
- Future: User preferences/accounts

**Why Astro DB?**
- Real-time read/write operations
- Server-side API endpoints
- Edge-deployed for speed
- Type-safe with TypeScript
- Perfect for forms and dynamic features

## Workflow Examples

### Blog Post Workflow

```
1. Staff member logs into Sanity Studio (http://localhost:3333)
2. Creates new blog post with rich text editor
3. Uploads images (auto-optimized by Sanity CDN)
4. Clicks "Publish"
5. Webhook triggers Astro rebuild
6. New blog post appears on website
```

### Contact Form Workflow

```
1. User fills out contact form on website
2. Form submits to /api/contact endpoint
3. Astro DB stores submission with timestamp
4. Email notification sent to staff (optional)
5. Staff reviews submissions in admin dashboard
6. Mark as "contacted" or "resolved" in database
```

### Testimonial Workflow

```
1. Patient submits testimonial via website form
2. Stored in Astro DB with status: "pending"
3. Staff reviews in admin dashboard
4. If approved:
   a. Staff creates testimonial document in Sanity
   b. Marks as "publishedToSanity: true" in Astro DB
   c. Testimonial appears on website
5. If rejected:
   a. Mark as "rejected" in Astro DB
```

## Code Examples

### Fetching from Sanity (Build Time)

```typescript
// src/pages/blog/index.astro
import { sanityClient } from '../lib/sanity';

const posts = await sanityClient.fetch(`
  *[_type == "blogPost"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    mainImage
  }
`);
```

### Writing to Astro DB (Runtime)

```typescript
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { db, ContactSubmission } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  await db.insert(ContactSubmission).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    submittedAt: new Date(),
    status: 'new',
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
```

### Reading from Astro DB

```typescript
// src/pages/admin/submissions.astro (staff only)
import { db, ContactSubmission } from 'astro:db';

const submissions = await db
  .select()
  .from(ContactSubmission)
  .where(eq(ContactSubmission.status, 'new'))
  .orderBy(desc(ContactSubmission.submittedAt));
```

## Database Schemas

### Astro DB Tables

```typescript
// db/config.ts
const ContactSubmission = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    phone: column.text({ optional: true }),
    message: column.text({ optional: true }),
    submittedAt: column.date(),
    status: column.text({ default: 'new' }),
  },
});

const TestimonialSubmission = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    condition: column.text(),
    testimonial: column.text(),
    submittedAt: column.date(),
    status: column.text({ default: 'pending' }),
    publishedToSanity: column.boolean({ default: false }),
  },
});
```

### Sanity Schemas

```typescript
// sanity/schemas/blogPost.ts
{
  name: 'blogPost',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'body', type: 'array', of: [{ type: 'block' }] },
    { name: 'mainImage', type: 'image' },
  ],
}
```

## Environment Variables

### Required for Sanity

```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token
```

### Required for Astro DB

```env
ASTRO_DB_REMOTE_URL=your_turso_url
ASTRO_DB_AUTH_TOKEN=your_auth_token
```

## Running Locally

### Start Sanity Studio

```bash
cd sanity
npm run dev
```

Studio available at: `http://localhost:3333`

### Start Astro Dev Server

```bash
npm run dev
```

Site available at: `http://localhost:4321`

### Initialize Astro DB

```bash
npx astro db push
```

## Deployment Checklist

- [ ] Set Sanity environment variables in hosting platform
- [ ] Set Astro DB environment variables
- [ ] Configure Sanity webhook to trigger rebuilds
- [ ] Deploy Sanity Studio to production (`sanity deploy`)
- [ ] Test form submissions in production
- [ ] Verify content updates trigger rebuilds

## Benefits of This Approach

### Performance
- Static content from Sanity (pre-rendered, fast)
- Dynamic data from Astro DB (edge-deployed, fast)
- Best of both worlds: speed + interactivity

### Developer Experience
- Type-safe queries (Sanity GROQ + Astro DB TypeScript)
- Clear separation of concerns
- Easy to reason about data flow

### Content Management
- Non-technical staff can manage content in Sanity
- Developers handle dynamic features with Astro DB
- No confusion about where data lives

### Scalability
- Sanity handles unlimited content with CDN
- Astro DB scales to millions of rows
- Both have generous free tiers

## Cost Analysis

### Sanity Free Tier
- 3 users
- Unlimited API requests
- 10GB assets
- Revision history

**Upgrade when:**
- Need more than 3 editors
- Need more than 10GB assets
- Need advanced features (SAML SSO, etc.)

### Astro DB Free Tier
- 500 databases
- 1B row reads/month
- 25M row writes/month

**Upgrade when:**
- Need more than 500 databases
- Exceed read/write limits

### Estimated Monthly Cost
- **Development:** $0 (both free tiers)
- **Production (small site):** $0 (within free tiers)
- **Production (high traffic):** $19-49/month (Sanity Growth plan if needed)

## Migration Timeline

1. **Week 1:** Set up Sanity schemas and import WordPress content
2. **Week 2:** Configure Astro DB and build API endpoints
3. **Week 3:** Connect Astro pages to Sanity data
4. **Week 4:** Test forms and dynamic features with Astro DB
5. **Week 5:** Staff training on Sanity Studio
6. **Week 6:** Deploy to production

## Support & Resources

- **Sanity Docs:** https://www.sanity.io/docs
- **Astro DB Docs:** https://docs.astro.build/en/guides/astro-db/
- **GROQ Query Reference:** https://www.sanity.io/docs/groq
- **Migration Plan:** See `MIGRATION-PLAN.md`
- **Astro Guide:** See `astro.md`

---

*Last updated: 2026-01-08*
