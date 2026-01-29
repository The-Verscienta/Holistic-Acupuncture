# Getting Started - Holistic Acupuncture Website

Welcome to the Holistic Acupuncture website project! This guide will help you get up and running.

## Tech Stack

- **Framework:** Astro 5.16.7 (Static Site Generator)
- **Styling:** Tailwind CSS v4
- **CMS:** Sanity (Content Management)
- **Database:** Astro DB (Form submissions & dynamic data)
- **Deployment:** Netlify/Vercel/Cloudflare Pages

## Quick Start

### 1. Install Dependencies

```bash
cd virtual-velocity
npm install
```

### 2. Set Up Astro DB

Astro DB uses **Astro Studio** (cloud-hosted database) to work on all platforms, including Windows ARM64.

```bash
# Login to Astro Studio
npx astro login

# Link your project
npx astro link

# Push database schema
npx astro db push
```

This creates 4 tables:
- **ContactSubmission** - Contact form data
- **TestimonialSubmission** - Patient testimonials (pending approval)
- **NewsletterSubscriber** - Email subscribers
- **AppointmentRequest** - Appointment requests (future feature)

### 3. Set Up Sanity CMS (Optional for Development)

Sanity is for managing blog posts, conditions, FAQs, etc.

```bash
# Start Sanity Studio locally
npm run sanity
```

Sanity Studio will open at `http://localhost:3333`

### 4. Start Development Server

```bash
npm run dev
```

Your site will be available at `http://localhost:4321`

## Project Structure

```
virtual-velocity/
├── src/
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Page layouts
│   ├── pages/           # All pages (routes)
│   │   ├── api/         # API endpoints (form handlers)
│   │   └── admin/       # Admin dashboard
│   └── lib/             # Utilities and helpers
├── db/                  # Astro DB configuration
│   ├── config.ts        # Database schema
│   └── seed.ts          # Sample data
├── sanity/              # Sanity CMS schemas
└── public/              # Static assets
```

## Key Features

### ✅ Already Implemented

1. **Complete Design System**
   - Modern color palette (sage green, earth tones)
   - Typography system (Sora, Inter, Crimson Pro)
   - Reusable components library

2. **Essential Pages**
   - Homepage with hero, conditions, testimonials
   - About, Conditions, Acupuncture info
   - Reviews, Blog, Contact, FAQ
   - Privacy Policy, Terms of Service

3. **Forms & Database**
   - Contact form with Astro DB integration
   - Newsletter signup API
   - Testimonial submission API
   - Admin dashboard to view submissions

4. **SEO Optimization**
   - Structured data (Schema.org)
   - Sitemap generation
   - Meta tags (Open Graph, Twitter Cards)
   - Geographic meta tags for local SEO

5. **Sanity CMS Integration**
   - Blog posts
   - Conditions database
   - Testimonials
   - Team members
   - FAQs

## Available Pages

### Public Pages
- `/` - Homepage
- `/about` - About Us
- `/conditions` - Conditions We Treat
- `/acupuncture` - About Acupuncture
- `/reviews` - Patient Reviews
- `/blog` - Blog Index
- `/contact` - Contact Form
- `/faq` - Frequently Asked Questions

### Admin Pages
- `/admin` - Admin Dashboard (⚠️ No auth yet!)

## API Endpoints

### POST /api/contact
Submit contact form data.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(414) 555-1234",
  "referralSource": "Google Search",
  "message": "I would like to schedule an appointment"
}
```

### POST /api/newsletter
Subscribe to newsletter.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/testimonial
Submit patient testimonial (pending approval).

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "condition": "Chronic Migraines",
  "testimonial": "The treatment was excellent...",
  "rating": 5
}
```

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Sanity Studio
npm run sanity

# Push database schema
npm run db:push
```

## Environment Variables

After running `npx astro link`, an `.env` file will be created:

```env
ASTRO_STUDIO_APP_TOKEN=your_token_here
```

For Sanity CMS, add:

```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token
```

**Never commit `.env` to git!** (Already in .gitignore)

## Next Steps

### Before Production Deploy

1. **Add Authentication to Admin Dashboard**
   - The `/admin` page has NO authentication!
   - Implement auth before deploying

2. **Update Placeholder Content**
   - Replace phone: (414) 555-1234
   - Replace email: info@holisticacupuncture.net
   - Add real staff photos and bios

3. **Professional Photography**
   - Office/treatment room photos
   - Practitioner headshots
   - Replace placeholder images

4. **Content Migration**
   - Migrate WordPress blog posts to Sanity
   - Import existing testimonials
   - Update all page content

5. **Testing**
   - Test all forms on mobile and desktop
   - Cross-browser testing
   - Run Lighthouse audit

6. **SEO Setup**
   - Submit sitemap to Google Search Console
   - Set up Google Business Profile
   - Configure analytics

## Common Tasks

### Adding a New Blog Post

1. Open Sanity Studio: `npm run sanity`
2. Go to `http://localhost:3333`
3. Create new "Blog Post"
4. Fill in title, slug, content, image
5. Click "Publish"
6. Site rebuilds automatically (in production with webhooks)

### Viewing Form Submissions

1. Visit `http://localhost:4321/admin`
2. See all contact submissions, testimonials, and newsletter signups
3. ⚠️ Remember to add authentication before deploying!

### Adding a New Page

1. Create file in `src/pages/`, e.g., `src/pages/new-page.astro`
2. Use BaseLayout and components
3. Page will be available at `/new-page`

## Troubleshooting

### "Cannot find module '@libsql/win32-arm64-msvc'"

This is expected on Windows ARM64. We use Astro Studio (remote database) instead.

**Solution:** Run `npx astro login` and `npx astro link` to use Astro Studio.

### Forms Not Working

1. Check that Astro DB is set up: `npx astro db push`
2. Check `.env` file has `ASTRO_STUDIO_APP_TOKEN`
3. Check browser console for errors

### Sanity Content Not Showing

1. Check Sanity Studio is running: `npm run sanity`
2. Verify content is published in Sanity Studio
3. Check `.env` has Sanity credentials

## Documentation

- **[ASTRO-DB-SETUP.md](./ASTRO-DB-SETUP.md)** - Detailed Astro DB setup
- **[SANITY-CMS-GUIDE.md](./SANITY-CMS-GUIDE.md)** - Sanity CMS documentation
- **[COMPONENTS.md](./COMPONENTS.md)** - Component library reference
- **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** - Project status

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Astro DB Documentation](https://docs.astro.build/en/guides/astro-db/)

## Support

For questions or issues:
1. Check the documentation files
2. Review the error messages in terminal
3. Check browser console for client-side errors
4. Review [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for known issues

---

**Happy coding! 🚀**
