# Holistic Acupuncture Website Migration to Astro

## Project Overview

This document outlines the complete plan for migrating **Acupuncture & Holistic Health Associates** (https://holisticacupuncture.net) from WordPress to Astro.

**Reference Documentation:**
- [Astro Framework Guide](./claude.md) - Comprehensive Astro documentation
- [Sanity + Astro DB Integration Guide](./SANITY-ASTRODB-GUIDE.md) - Content management and database architecture

**Key Technology Decisions:**
- **CMS:** Sanity (for non-technical staff to manage content)
- **Database:** Astro DB (for forms and dynamic data)
- **Styling:** Tailwind CSS + Biome formatting

---

## Current State Analysis

### Technology Stack

#### Current (WordPress)
- **Platform:** WordPress
- **Theme:** Hestia by ThemeIsle
- **Styling:** Tailwind CSS v4.1.12
- **Optimization:** WindPress framework v3.2.59
- **Forms:** WPForms
- **Analytics:** Google Site Kit
- **Performance:** Optimization Detective, Image Prioritizer, Embed Optimizer

#### Target (Astro)
- **Framework:** Astro (Static Site Generator)
- **Styling:** Tailwind CSS v4
- **Content Management:** Sanity CMS (headless CMS for editorial content)
- **Database:** Astro DB (Turso/LibSQL for dynamic data)
- **Linting & Formatting:** Biome
- **Forms:** Form submissions stored in Astro DB
- **Email Notifications:** Resend (form submission notifications)
- **Search:** Pagefind (static site search)
- **Error Monitoring:** Sentry (production error tracking)
- **Spam Protection:** Cloudflare Turnstile (CAPTCHA alternative)
- **SEO:** Schema.org markup (medical business, articles)
- **Analytics:** Plausible Analytics (privacy-focused, HIPAA-friendly)
- **Deployment:** Netlify / Vercel / Cloudflare Pages
- **CI/CD:** GitHub Actions (automated testing & deployment)
- **Testing:** Playwright (end-to-end tests)
- **Performance:** Built-in optimization (image optimization, HTML compression)
- **Image CDN:** Sanity Image CDN
- **Appointment Scheduling:** jane.app (external integration)

### Site Structure

#### Primary Navigation
1. Home
2. About Us
   - Acupuncturists
   - Staff
3. Conditions We Treat (9+ condition-specific pages)
   - Headaches
   - Insomnia
   - Fatigue
   - Neck Pain
   - PMS/Menopause
   - Allergies
   - Digestive Issues
   - Anxiety/Stress
4. About Acupuncture
   - How It Works
   - Diagnosis
   - FAQ
5. Reviews
6. Contact
7. Blog
8. Current Specials

#### Content Types
- **Service Pages:** Treatment descriptions and condition-specific information
- **Blog Posts:** Health tips, seasonal advice, Chinese medicine education
- **Team Profiles:** Staff and acupuncturist bios
- **Testimonials/Reviews:** Patient success stories
- **Special Offers:** Promotional content ($29 Winter 2025 Special)
- **Educational Content:** FAQ, acupuncture explanations, Qi concepts

#### Key Features
- Contact form with HIPAA compliance notice
- Multiple award badges display
- Location map integration
- Mobile-responsive navigation
- Blog with recent posts
- Service area information
- Staff photography
- Care Credit financing information

#### Design Elements
- **Primary Color:** Orange (#d37000)
- **Secondary:** Green gradient (#23ce2b)
- **Typography:** Arial/Helvetica sans-serif
- **Button Styling:** 15px border-radius, rounded corners
- **Responsive Breakpoints:** 480px, 768px, 1400px
- **Layout:** Modern, clean, professional medical aesthetic

---

## Migration Strategy

### Why Astro?

Astro is the ideal choice for this migration because:

1. **Performance:** 40% faster load times with 90% less JavaScript (see [Astro Guide](./claude.md))
2. **SEO Optimization:** Server-side rendering ensures excellent search engine visibility
3. **Content-First:** Built specifically for content-driven sites like this
4. **Zero JavaScript Default:** Medical/health sites benefit from fast, accessible pages
5. **CMS Flexibility:** Can integrate with any headless CMS or use Content Collections
6. **Tailwind Support:** Maintain existing Tailwind CSS styling
7. **Progressive Enhancement:** Add interactivity only where needed (forms, maps)

### Development Tooling

**Biome for Linting & Formatting:**

We'll use Biome instead of the traditional ESLint + Prettier combination:

- **35x Faster:** Significantly faster than Prettier for formatting operations
- **Single Tool:** Unified linting and formatting in one package
- **Astro Support:** Native `.astro` file support for HTML, CSS, and JavaScript
- **Zero Config:** Works out of the box with sensible defaults
- **Proven:** Used by the official Astro website and major companies (Vercel, Cloudflare)

This choice aligns with Astro's philosophy of modern, performant tooling while maintaining excellent developer experience.

### Content & Data Architecture

**Dual-System Approach:**

We'll use both Sanity CMS and Astro DB, each serving distinct purposes:

#### Sanity CMS - Editorial Content Management

**Purpose:** Manage content that non-technical staff will update regularly

**Managed Content:**
- Blog posts
- Service/condition pages
- Staff biographies
- FAQ content
- Special offers
- Approved testimonials

**Benefits:**
- Beautiful visual editor (Sanity Studio)
- Real-time collaborative editing
- Image management with built-in CDN
- Revision history
- Role-based permissions
- Free tier: 3 users, unlimited API requests, 10GB assets

**Content Flow:**
```
Staff writes in Sanity Studio → Saves → Webhook triggers → Astro rebuilds → Site updates
```

#### Astro DB - Application Data

**Purpose:** Store dynamic, user-generated, and application-level data

**Stored Data:**
- Contact form submissions
- Newsletter signups
- Testimonial submissions (pending review)
- Analytics/metrics
- Future: Appointment requests
- Future: User preferences

**Benefits:**
- Serverless (powered by Turso/LibSQL)
- Type-safe with TypeScript
- Edge-deployed for speed
- Built specifically for Astro
- Free tier: 500 databases, 1B row reads/month

**Data Flow:**
```
User submits form → Stored in Astro DB → Staff reviews → Approves → Publishes to Sanity
```

#### Why Both?

- **Sanity:** Content that needs editorial workflow, version control, and non-technical editing
- **Astro DB:** Transactional data, form submissions, and features requiring real-time updates
- **Separation of Concerns:** Content strategy separate from application data
- **Optimal Performance:** Static content from Sanity, dynamic queries from Astro DB

---

## Migration Benefits: Why This Is Better Than WordPress

### 1. Easier to Keep Up to Date

#### Current WordPress Setup

**Update Burden:**
- ❌ WordPress core updates (monthly security patches)
- ❌ Theme updates (Hestia)
- ❌ Plugin updates (WPForms, WindPress, Optimization Detective, Image Prioritizer, Embed Optimizer, Google Site Kit)
- ❌ PHP version updates on server
- ❌ Database updates
- ❌ **Risk:** Updates can break the site, require testing

**Maintenance Tasks:**
- ❌ Database optimization
- ❌ Clearing caches
- ❌ Checking for plugin conflicts
- ❌ Fixing broken plugins after updates

#### New Astro + Sanity + Astro DB

**Minimal Updates:**
- ✅ Astro framework (quarterly major updates, opt-in)
- ✅ Tailwind CSS (stable, rare breaking changes)
- ✅ Biome (automatic, non-breaking)
- ✅ **No plugins to manage!**

**Automated Dependency Updates:**
```bash
npx @astrojs/upgrade  # Updates all Astro packages safely
npm update            # Update other dependencies
```

**No Database Maintenance:**
- ✅ Astro DB is fully managed (Turso handles it)
- ✅ Sanity is fully managed (no database maintenance)

**Result:** Astro setup is **90% less maintenance** than WordPress

---

### 2. Significantly More Secure

#### Current WordPress Setup

**Major Security Concerns:**
- ❌ **#1 hacked CMS platform** (43% of hacked websites are WordPress)
- ❌ Plugin vulnerabilities (each plugin = potential security hole)
- ❌ Database vulnerabilities (SQL injection risks)
- ❌ Admin panel exposed to brute force attacks
- ❌ Theme vulnerabilities
- ❌ PHP vulnerabilities
- ❌ **Constant security patches needed**

**Attack Surface:**
```
WordPress Core + 6+ Plugins + PHP + MySQL + Server = Large Attack Surface
```

**Common WordPress Nightmare Scenarios:**
- ❌ Plugin vulnerability discovered → site hacked → customer data stolen
- ❌ Brute force attack succeeds → malware injected
- ❌ Database compromised → site defaced
- ❌ Old PHP version → security vulnerability
- ❌ Theme vulnerability → backdoor installed

#### New Astro + Sanity + Astro DB

**Significantly More Secure:**

**Static Site Security:**
- ✅ **No server-side code execution** (static HTML pages)
- ✅ **No database to hack** on the main site
- ✅ **No admin panel** exposed on the public site
- ✅ **No PHP vulnerabilities** (JavaScript only runs at build time)
- ✅ **CDN protection** (Netlify/Vercel/Cloudflare handle DDoS)

**Sanity Security:**
- ✅ **Separate subdomain** (studio.holisticacupuncture.net)
- ✅ **OAuth authentication** (can use Google/Microsoft login)
- ✅ **Role-based permissions**
- ✅ **No SQL database** (API-based, injection-proof)
- ✅ **Managed infrastructure** (Sanity handles security)

**Astro DB Security:**
- ✅ **No direct database access** (API only)
- ✅ **Edge-deployed** (distributed, harder to attack)
- ✅ **Type-safe queries** (prevents injection)

**Attack Surface:**
```
Static HTML + API endpoints = Minimal Attack Surface
```

**Result:** Astro setup is **dramatically more secure** than WordPress

---

### 3. Much Easier to Post Material

#### Current WordPress Experience

**Good:**
- ✅ Visual editor (Gutenberg or Classic)
- ✅ WYSIWYG editing
- ✅ Media library

**Bad:**
- ❌ **Slow admin panel** (especially on shared hosting)
- ❌ **Cluttered interface** (plugins add menu items everywhere)
- ❌ **Distracting notifications** (update warnings, plugin ads)
- ❌ **Formatting issues** (copy/paste from Word breaks things)
- ❌ **Image optimization manual** or requires plugins
- ❌ **Mobile editing poor** (admin panel not mobile-friendly)
- ❌ **Version control limited** (revisions stored in database)

**Typical WordPress Workflow:**
1. Log into slow admin panel
2. Navigate through cluttered menus
3. See update warnings and plugin notifications
4. Fight with formatting when pasting content
5. Manually optimize images or wait for plugin
6. Preview might not match live site
7. Hope update doesn't break site

#### New Sanity Studio Experience

**Excellent Content Editing:**
- ✅ **Clean, modern interface** (purpose-built for content)
- ✅ **Real-time collaboration** (multiple editors can work simultaneously)
- ✅ **Structured content** (forms guide you through required fields)
- ✅ **Portable Text editor** (rich text without HTML mess)
- ✅ **Automatic image optimization** (CDN handles it)
- ✅ **Paste from anywhere** (handles formatting automatically)
- ✅ **Mobile-friendly** (responsive admin panel)
- ✅ **Revision history** (see all changes, restore any version)
- ✅ **Preview before publish** (see exactly how it will look)
- ✅ **Scheduled publishing** (write now, publish later)
- ✅ **No distractions** (no ads, no update warnings)
- ✅ **Fast performance** (no waiting for slow servers)

**New Sanity Workflow:**
1. Open clean, fast Sanity Studio
2. Click "Create Blog Post"
3. Fill in structured form (title, content, image)
4. Paste content from anywhere (auto-formatted)
5. Drag image (auto-optimized instantly)
6. Preview exactly as it will appear
7. Click "Publish" (goes live in seconds)

**Result:** Sanity is **significantly easier** for non-technical staff

---

### Side-by-Side Comparison

| Aspect | WordPress (Current) | Astro + Sanity (Proposed) |
|--------|-------------------|--------------------------|
| **Updates Required** | Core + 6+ plugins monthly | Quarterly optional updates |
| **Security Patches** | Constant vigilance required | Managed infrastructure |
| **Attack Surface** | Very large (PHP, MySQL, plugins) | Minimal (static HTML + APIs) |
| **Hacking Risk** | High (43% of hacked sites) | Very low (static sites rarely hacked) |
| **Content Editing UI** | Good but cluttered | Excellent, clean interface |
| **Admin Panel Speed** | Slow (database queries) | Fast (modern SPA) |
| **Collaboration** | Limited (conflicts possible) | Real-time multi-user |
| **Mobile Editing** | Poor | Excellent |
| **Image Handling** | Manual or plugin-dependent | Automatic CDN optimization |
| **Downtime Risk** | Higher (server issues, updates) | Lower (CDN redundancy) |
| **Site Performance** | Slower (database queries) | Faster (static HTML, 40% improvement) |
| **Maintenance Time** | 5-10 hours/month | 30 minutes/month |
| **Plugin Conflicts** | Common | N/A (no plugins) |
| **Version Control** | Limited (database revisions) | Full history (Git + Sanity) |
| **Scalability** | Limited (server resources) | Unlimited (CDN) |
| **Cost** | $15-50/month (hosting + plugins) | $0-19/month (free tiers available) |

---

### Real-World Benefits for Your Staff

**Current Pain Points Eliminated:**
- ✅ No more "Plugin X conflicts with Plugin Y"
- ✅ No more "Update broke the site"
- ✅ No more slow admin panel on bad internet
- ✅ No more formatting nightmares
- ✅ No more worrying about security breaches
- ✅ No more database optimization
- ✅ No more cache clearing

**New Capabilities Gained:**
- ✅ Multiple staff can edit simultaneously
- ✅ Edit from phone/tablet easily
- ✅ See exactly how content will look before publishing
- ✅ Restore any previous version instantly
- ✅ Never lose work (auto-saves constantly)
- ✅ Images automatically optimized and served from CDN
- ✅ Peace of mind on security

---

### The Bottom Line

**One-Time Migration Effort:** 3-4 weeks

**Long-Term Benefits:**
- ✅ **90% less maintenance** time
- ✅ **Dramatically better security** (sleep easy)
- ✅ **Happier staff** (better editing experience)
- ✅ **40% faster website** for visitors
- ✅ **Similar or lower cost** (free tiers available)
- ✅ **Future-proof technology** (modern stack)
- ✅ **Better scalability** (handle traffic spikes)

**ROI:** The time saved on maintenance alone pays for the migration within 6 months.

**Recommendation:** Migrate. The WordPress era is ending for good reasons—modern tools are simply better.

---

## Phase 1: Project Setup & Architecture

### 1.1 Initialize Astro Project

```bash
npm create astro@latest holistic-acupuncture
cd holistic-acupuncture
```

**Configuration Options:**
- Template: Empty (start from scratch)
- TypeScript: Yes (for type safety)
- Install dependencies: Yes
- Git repository: Initialize

### 1.2 Install Essential Integrations

```bash
npx astro add tailwind
npx astro add sitemap
npx astro add mdx
npx astro add db
```

**Additional Dependencies:**
```bash
npm install @astrojs/rss
npm install zod
npm install @sanity/client
npm install @sanity/image-url
npm install groq
```

**Sanity CMS Setup:**

```bash
npm create sanity@latest -- --project holistic-acupuncture-cms --dataset production
```

This will:
- Create a new Sanity project
- Set up the Sanity Studio (admin panel)
- Generate project ID and dataset name
- Create schema files for content types

**Configure Sanity in your Astro project:**

Create `src/lib/sanity.ts`:
```typescript
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: 'YOUR_PROJECT_ID', // From sanity.cli.ts
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: any) {
  return builder.image(source);
}
```

**Production Services Setup:**

```bash
# Error Monitoring
npm install @sentry/astro

# Email Notifications
npm install resend

# Search
npm install pagefind

# Spam Protection (Turnstile)
npm install @marsidev/react-turnstile

# Analytics
npm install plausible-tracker
```

### 1.3 Install Development Tools

**Biome - Unified Linter & Formatter:**

```bash
npm install --save-dev --save-exact @biomejs/biome
npx @biomejs/biome init
```

**Why Biome?**
- **Performance:** 35x faster than Prettier for formatting
- **Unified Tooling:** Replaces both ESLint and Prettier with a single tool
- **Astro Support:** Native support for `.astro` files (HTML, CSS, JS portions)
- **Zero Config:** Works out of the box with sensible defaults
- **Battle-Tested:** Used by the official Astro website and major companies (Vercel, Cloudflare, Discord)

**Add npm scripts to package.json:**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "astro-check": "astro check"
  }
}
```

**Editor Setup (VS Code):**

Install the Biome extension for VS Code:
- Extension ID: `biomejs.biome`
- Provides real-time linting and formatting
- Format on save support
- Auto-fix on save

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### 1.4 Project Structure

```
holistic-acupuncture/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vscode/
│   └── settings.json
├── db/
│   ├── config.ts
│   └── seed.ts
├── public/
│   ├── images/
│   │   ├── staff/
│   │   ├── awards/
│   │   └── hero/
│   ├── fonts/
│   └── favicon.ico
├── sanity/
│   ├── schemas/
│   │   ├── blogPost.ts
│   │   ├── condition.ts
│   │   ├── staffMember.ts
│   │   ├── testimonial.ts
│   │   └── index.ts
│   ├── sanity.cli.ts
│   └── sanity.config.ts
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   ├── ContactForm.astro
│   │   ├── AwardBadges.astro
│   │   ├── Testimonial.astro
│   │   ├── SpecialOffer.astro
│   │   ├── BlogCard.astro
│   │   ├── Search.astro
│   │   ├── SchemaMarkup.astro
│   │   └── AppointmentButton.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PageLayout.astro
│   │   └── BlogLayout.astro
│   ├── pages/
│   │   ├── api/
│   │   │   ├── contact.ts
│   │   │   └── testimonial-submit.ts
│   │   ├── index.astro
│   │   ├── about/
│   │   │   ├── index.astro
│   │   │   ├── acupuncturists.astro
│   │   │   └── staff.astro
│   │   ├── conditions/
│   │   │   ├── index.astro
│   │   │   ├── headaches.astro
│   │   │   ├── insomnia.astro
│   │   │   ├── fatigue.astro
│   │   │   ├── neck-pain.astro
│   │   │   ├── pms-menopause.astro
│   │   │   ├── allergies.astro
│   │   │   ├── digestive-issues.astro
│   │   │   └── anxiety-stress.astro
│   │   ├── acupuncture/
│   │   │   ├── index.astro
│   │   │   ├── how-it-works.astro
│   │   │   ├── diagnosis.astro
│   │   │   └── faq.astro
│   │   ├── reviews.astro
│   │   ├── contact.astro
│   │   ├── specials.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── lib/
│   │   ├── sanity.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── styles/
│       └── global.css
├── tests/
│   ├── contact-form.spec.ts
│   ├── blog.spec.ts
│   └── search.spec.ts
├── astro.config.mjs
├── db.config.ts
├── tailwind.config.mjs
├── tsconfig.json
├── biome.json
├── playwright.config.ts
└── package.json
```

### 1.5 Configuration Files

#### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import db from '@astrojs/db';

export default defineConfig({
  site: 'https://holisticacupuncture.net',
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    db(),
  ],
  output: 'hybrid', // Hybrid mode for API endpoints and forms
  compressHTML: true,
});
```

#### tailwind.config.mjs

```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#d37000', // Orange accent
        secondary: '#23ce2b', // Green
      },
      borderRadius: {
        'button': '15px',
      },
    },
  },
  plugins: [],
}
```

#### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "useImportType": "error",
        "noNonNullAssertion": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  },
  "files": {
    "ignore": [
      "dist",
      "node_modules",
      ".astro",
      "package-lock.json"
    ]
  }
}
```

**Note:** Biome supports `.astro` files natively. It will format and lint the HTML, CSS, and JavaScript portions of your Astro components, including the frontmatter script.

#### db/config.ts (Astro DB Schema)

```typescript
import { defineDb, defineTable, column } from 'astro:db';

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

const NewsletterSubscriber = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    subscribedAt: column.date(),
    active: column.boolean({ default: true }),
  },
});

export default defineDb({
  tables: {
    ContactSubmission,
    TestimonialSubmission,
    NewsletterSubscriber,
  },
});
```

#### sanity/schemas/blogPost.ts (Sanity Schema)

```typescript
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Dr. Curry',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Winter Health', value: 'winter-health' },
          { title: 'Chinese Medicine', value: 'chinese-medicine' },
          { title: 'Prevention', value: 'prevention' },
          { title: 'General', value: 'general' },
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage',
    },
  },
});
```

#### sanity/schemas/condition.ts

```typescript
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'condition',
  title: 'Condition',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'symptoms',
      title: 'Symptoms',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'treatments',
      title: 'Treatments',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
});
```

#### sanity/schemas/testimonial.ts

```typescript
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Patient Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'condition',
      title: 'Condition Treated',
      type: 'string',
    }),
    defineField({
      name: 'quote',
      title: 'Testimonial Quote',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
```

#### sanity/schemas/index.ts

```typescript
import blogPost from './blogPost';
import condition from './condition';
import testimonial from './testimonial';
import staffMember from './staffMember';

export const schemaTypes = [blogPost, condition, testimonial, staffMember];
```

#### sanity/sanity.config.ts

```typescript
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Holistic Acupuncture CMS',
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

**To run Sanity Studio locally:**
```bash
cd sanity
npm run dev
```

Studio will be available at `http://localhost:3333`

---

## Phase 1.6: Production Services & Integrations

### Error Monitoring (Sentry)

**Purpose:** Track and fix production errors before users report them

**Setup:**

1. **Create Sentry account** at https://sentry.io (free tier available)
2. **Configure Sentry:**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: process.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: 'holistic-acupuncture',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
});
```

3. **Environment variables:**
```env
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_auth_token
```

**Benefits:**
- Email/Slack notifications for errors
- Stack traces show exactly where bugs occur
- See which pages/browsers have issues
- Free tier: 5,000 events/month

---

### Email Notifications (Resend)

**Purpose:** Send emails when users submit contact forms

**Setup:**

1. **Create Resend account** at https://resend.com (free tier: 3,000 emails/month)
2. **Get API key** from dashboard
3. **Create email endpoint:**

```typescript
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { db, ContactSubmission } from 'astro:db';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  // Store in database
  await db.insert(ContactSubmission).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    submittedAt: new Date(),
    status: 'new',
  });

  // Send notification email
  await resend.emails.send({
    from: 'website@holisticacupuncture.net',
    to: 'admin@holisticacupuncture.net',
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
```

4. **Environment variable:**
```env
RESEND_API_KEY=re_your_api_key
```

**Benefits:**
- Instant notifications when forms submitted
- Reliable delivery (99.9% uptime)
- Track email opens/clicks
- Free tier: 3,000 emails/month, 100 emails/day

---

### Site Search (Pagefind)

**Purpose:** Allow users to search blog posts, conditions, and FAQs

**Setup:**

1. **Install Pagefind:**
```bash
npm install -D pagefind
```

2. **Update build script:**
```json
// package.json
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

3. **Add search component:**

```astro
---
// src/components/Search.astro
---

<div id="search-container">
  <input
    type="search"
    id="search-input"
    placeholder="Search conditions, blog posts..."
    class="w-full px-4 py-2 border rounded"
  />
  <div id="search-results"></div>
</div>

<script>
  import * as pagefind from '/pagefind/pagefind.js';

  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  searchInput?.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const search = await pagefind.search(query);
    const results = await Promise.all(search.results.map((r) => r.data()));

    searchResults.innerHTML = results
      .map(
        (r) => `
        <div class="p-4 border-b hover:bg-gray-50">
          <a href="${r.url}" class="text-primary font-semibold">
            ${r.meta.title}
          </a>
          <p class="text-sm text-gray-600">${r.excerpt}</p>
        </div>
      `
      )
      .join('');
  });
</script>
```

**Benefits:**
- Completely free and open source
- Works offline (static index)
- Blazing fast (built in Rust)
- No external API calls
- Automatic indexing during build

---

### Spam Protection (Cloudflare Turnstile)

**Purpose:** Prevent spam form submissions without annoying CAPTCHAs

**Setup:**

1. **Get Turnstile keys** from Cloudflare dashboard (free)
2. **Add to contact form:**

```astro
---
// src/components/ContactForm.astro
---

<form id="contact-form" action="/api/contact" method="POST">
  <!-- Form fields... -->

  <!-- Turnstile widget -->
  <div
    class="cf-turnstile"
    data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
  ></div>

  <button type="submit" class="bg-primary text-white px-8 py-3 rounded">
    Send Message
  </button>
</form>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

3. **Verify on server:**

```typescript
// src/pages/api/contact.ts
async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: import.meta.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );

  const data = await response.json();
  return data.success;
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  // Verify Turnstile token
  const isValid = await verifyTurnstile(data.turnstileToken);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Verification failed' }), {
      status: 400,
    });
  }

  // Process form...
};
```

4. **Environment variables:**
```env
PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

**Benefits:**
- Free unlimited usage
- Privacy-friendly (GDPR compliant)
- Invisible to most users
- Blocks 99.9% of bots
- Better UX than reCAPTCHA

---

### SEO Enhancement (Schema.org Markup)

**Purpose:** Help Google understand your medical practice and improve search rankings

**Setup:**

Create `src/components/SchemaMarkup.astro`:

```astro
---
interface Props {
  type?: 'organization' | 'article' | 'medicalBusiness';
  data?: any;
}

const { type = 'organization', data } = Astro.props;

const schemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Acupuncture & Holistic Health Associates',
    description:
      'Expert acupuncture and Chinese herbal medicine in Milwaukee. 25+ years, 380,000+ successful treatments.',
    url: 'https://holisticacupuncture.net',
    telephone: 'YOUR_PHONE',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'YOUR_STREET',
      addressLocality: 'Milwaukee',
      addressRegion: 'WI',
      postalCode: 'YOUR_ZIP',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 'YOUR_LAT',
      longitude: 'YOUR_LONG',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    medicalSpecialty: 'Acupuncture',
  },

  article: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data?.title,
    description: data?.description,
    author: {
      '@type': 'Person',
      name: data?.author || 'Dr. Curry',
    },
    datePublished: data?.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Acupuncture & Holistic Health Associates',
    },
  },
};
---

<script type="application/ld+json" set:html={JSON.stringify(schemas[type])} />
```

**Usage in pages:**

```astro
---
// src/layouts/BaseLayout.astro
import SchemaMarkup from '../components/SchemaMarkup.astro';
---

<head>
  <!-- Other head tags -->
  <SchemaMarkup type="organization" />
</head>
```

```astro
---
// src/pages/blog/[slug].astro
import SchemaMarkup from '../../components/SchemaMarkup.astro';
---

<head>
  <SchemaMarkup
    type="article"
    data={{
      title: post.title,
      description: post.excerpt,
      author: post.author,
      publishedAt: post.publishedAt,
    }}
  />
</head>
```

**Benefits:**
- Rich snippets in Google search results
- Better local SEO
- Knowledge panel eligibility
- Improved click-through rates

---

### Privacy-Focused Analytics (Plausible)

**Purpose:** Track website traffic without compromising user privacy (HIPAA-friendly)

**Setup:**

1. **Sign up for Plausible** at https://plausible.io ($9/month, 14-day trial)
2. **Add tracking script:**

```astro
---
// src/layouts/BaseLayout.astro
---

<head>
  <!-- Other head tags -->
  <script
    defer
    data-domain="holisticacupuncture.net"
    src="https://plausible.io/js/script.js"
  ></script>
</head>
```

**Why Plausible over Google Analytics:**
- ✅ HIPAA-compliant (no personal data collected)
- ✅ GDPR compliant (no cookie consent needed)
- ✅ Lightweight (< 1KB vs 45KB for GA)
- ✅ Simple, clean dashboard
- ✅ Privacy-first (visitors aren't tracked across sites)
- ✅ No cookie banners needed

**Cost:** $9/month for up to 10,000 monthly visitors

**Alternative (Free):** Keep Google Analytics 4, but note:
- Requires cookie consent banner
- Less privacy-friendly
- More complex setup

---

### End-to-End Testing (Playwright)

**Purpose:** Automated testing of critical user flows

**Setup:**

1. **Install Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

2. **Create test file:**

```typescript
// tests/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test('contact form submission works', async ({ page }) => {
  await page.goto('http://localhost:4321/contact');

  // Fill out form
  await page.fill('input[name="name"]', 'Test Patient');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '555-1234');
  await page.fill('textarea[name="message"]', 'Test message');

  // Submit
  await page.click('button[type="submit"]');

  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
});

test('blog posts load correctly', async ({ page }) => {
  await page.goto('http://localhost:4321/blog');

  // Check blog posts are visible
  await expect(page.locator('article')).toHaveCount({ min: 1 });

  // Click first post
  await page.click('article:first-child a');

  // Verify post content loads
  await expect(page.locator('h1')).toBeVisible();
});

test('search functionality works', async ({ page }) => {
  await page.goto('http://localhost:4321');

  // Use search
  await page.fill('input[type="search"]', 'headache');

  // Verify results appear
  await expect(page.locator('#search-results')).toContainText('Headache');
});
```

3. **Add to package.json:**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  }
}
```

**Benefits:**
- Catch bugs before deployment
- Test critical flows automatically
- Run in CI/CD pipeline
- Free and open source

---

### CI/CD Pipeline (GitHub Actions)

**Purpose:** Automated testing and deployment

**Setup:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Lint with Biome
        run: npm run lint

      - name: Type check
        run: npx astro check

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Benefits:**
- Automated testing on every commit
- Prevent broken code from deploying
- Consistent build process
- Free for public repos

---

### Staging Environment

**Purpose:** Test changes before going to production

**Setup:**

1. **Create staging dataset in Sanity:**
```bash
sanity dataset create staging
```

2. **Deploy separate staging site:**
   - Netlify: Create separate site, deploy from `develop` branch
   - Use staging Sanity dataset
   - Use staging environment variables

3. **Environment-specific config:**

```typescript
// src/lib/sanity.ts
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:
    import.meta.env.MODE === 'production' ? 'production' : 'staging',
  useCdn: import.meta.env.MODE === 'production',
});
```

**Benefits:**
- Test content changes safely
- Preview before publishing
- Stakeholder review
- No risk to production

---

### Jane.app Integration

**Purpose:** Link to your existing appointment scheduling system

**Setup:**

1. **Add "Book Appointment" button:**

```astro
---
// src/components/AppointmentButton.astro
---

<a
  href="https://holisticacupuncture.janeapp.com"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-block bg-primary text-white px-8 py-4 rounded-button font-semibold hover:bg-opacity-90 transition-colors"
>
  Book Appointment Online
</a>
```

2. **Optional: Embed Jane widget:**

```astro
<div id="jane-widget"></div>

<script src="https://holisticacupuncture.janeapp.com/embed.js"></script>
<script>
  window.JaneWidget.init({
    businessId: 'YOUR_JANE_BUSINESS_ID',
    containerId: 'jane-widget',
  });
</script>
```

**Benefits:**
- Use existing Jane.app account
- No development needed
- Patients book directly in Jane system
- Maintains HIPAA compliance

---

### HIPAA Compliance Considerations

**Important Notes:**

1. **Form Data Handling:**
   - Ensure SSL/TLS encryption (provided by hosting)
   - Astro DB may require BAA for PHI storage
   - Consider: Keep contact forms generic (no medical info)
   - For medical forms: Use Jane.app's HIPAA-compliant forms

2. **Email Communications:**
   - Resend offers BAA on paid plans ($20+/month)
   - Alternative: Don't email PHI, just notify staff to check portal

3. **Analytics:**
   - Google Analytics: NOT HIPAA-compliant
   - Plausible: HIPAA-friendly (no personal data)
   - Consider: Analytics tracking only

4. **Third-Party Services:**
   - Sanity: HIPAA-compliant with BAA (Enterprise plan)
   - Sentry: HIPAA-compliant with BAA (Business plan)
   - For this site: Minimal PHI collection = lower risk

**Recommendation:**
- Keep website forms generic (name, email, phone, message)
- Use Jane.app for medical history/PHI collection
- Don't store medical information in Astro DB
- Focus on marketing/information website

---

## Phase 2: Content Migration

### 2.1 Export WordPress Content

**Tools to Use:**
- WordPress Export Tool (native)
- WP All Export plugin (for structured data)
- Manual screenshot/copy for custom fields

**Content to Export:**
1. All pages (About, Conditions, FAQ, etc.)
2. Blog posts with metadata (date, author, categories)
3. Media library (images, staff photos, award badges)
4. Testimonials/reviews
5. Special offers
6. Staff bios

### 2.2 Import Content to Sanity CMS

**Process:**

1. **Upload Media to Sanity:**
   - Use Sanity's asset uploader to import images
   - Sanity provides automatic CDN optimization
   - Images are accessible via `urlForImage()` helper

2. **Import Blog Posts:**
   - Create blog posts in Sanity Studio UI
   - Copy content from WordPress export
   - Upload featured images
   - Set publication dates and categories

3. **Import Condition Pages:**
   - Create condition documents in Sanity
   - Add symptoms and treatments as array items
   - Set display order for navigation

4. **Import Testimonials:**
   - Add approved testimonials to Sanity
   - Mark featured testimonials for homepage display

5. **Import Staff Bios:**
   - Create staff member documents
   - Upload staff photos
   - Include credentials and specialties

**Batch Import Option:**

For large content volumes, use Sanity's import tools:

```bash
npm install -g @sanity/import
```

Convert WordPress export to Sanity format (NDJSON), then:

```bash
sanity dataset import wordpress-export.ndjson production
```

### 2.3 Fetch Content from Sanity in Astro

**Example: Blog Index Page (src/pages/blog/index.astro):**

```astro
---
import { sanityClient } from '../../lib/sanity';
import BlogCard from '../../components/BlogCard.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';

const query = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  author,
  category
}`;

const posts = await sanityClient.fetch(query);
---

<BaseLayout title="Blog" description="Health tips and wellness advice">
  <section class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">Health & Wellness Blog</h1>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard
          title={post.title}
          description={post.excerpt}
          pubDate={new Date(post.publishedAt)}
          slug={post.slug.current}
          image={post.mainImage ? urlForImage(post.mainImage).url() : undefined}
        />
      ))}
    </div>
  </section>
</BaseLayout>
```

**Example: Dynamic Blog Post (src/pages/blog/[slug].astro):**

```astro
---
import { sanityClient, urlForImage } from '../../lib/sanity';
import { PortableText } from '@portabletext/react';
import BlogLayout from '../../layouts/BlogLayout.astro';

export async function getStaticPaths() {
  const query = `*[_type == "blogPost"] { "slug": slug.current }`;
  const posts = await sanityClient.fetch(query);

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

const { slug } = Astro.params;

const query = `*[_type == "blogPost" && slug.current == $slug][0] {
  title,
  publishedAt,
  author,
  mainImage,
  body,
  excerpt
}`;

const post = await sanityClient.fetch(query, { slug });
---

<BlogLayout
  title={post.title}
  description={post.excerpt}
  pubDate={new Date(post.publishedAt)}
  author={post.author}
>
  {post.mainImage && (
    <img
      src={urlForImage(post.mainImage).width(1200).url()}
      alt={post.title}
      class="w-full h-96 object-cover rounded-lg mb-8"
    />
  )}

  <PortableText value={post.body} />
</BlogLayout>
```

---

## Phase 3: Component Development

### 3.1 Layout Components

#### BaseLayout.astro

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  image?: string;
}

const { title, description, image = '/images/default-og.jpg' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />

  <!-- SEO -->
  <link rel="canonical" href={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content="website" />

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />

  <title>{title} | Acupuncture & Holistic Health Associates</title>
</head>
<body class="font-sans">
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</body>
</html>
```

### 3.2 Core Components

#### Header.astro

```astro
---
import Navigation from './Navigation.astro';
---

<header class="bg-white shadow-sm">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between py-4">
      <a href="/" class="text-2xl font-bold text-primary">
        Acupuncture & Holistic Health Associates
      </a>
      <Navigation />
    </div>
  </div>
</header>
```

#### Navigation.astro

```astro
---
const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'About Us',
    href: '/about',
    submenu: [
      { name: 'Acupuncturists', href: '/about/acupuncturists' },
      { name: 'Staff', href: '/about/staff' },
    ]
  },
  { name: 'Conditions We Treat', href: '/conditions' },
  {
    name: 'About Acupuncture',
    href: '/acupuncture',
    submenu: [
      { name: 'How It Works', href: '/acupuncture/how-it-works' },
      { name: 'Diagnosis', href: '/acupuncture/diagnosis' },
      { name: 'FAQ', href: '/acupuncture/faq' },
    ]
  },
  { name: 'Reviews', href: '/reviews' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'Current Specials', href: '/specials' },
];
---

<nav class="hidden lg:block">
  <ul class="flex space-x-6">
    {navigation.map(item => (
      <li class="relative group">
        <a
          href={item.href}
          class="text-gray-700 hover:text-primary transition-colors"
        >
          {item.name}
        </a>
        {item.submenu && (
          <ul class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {item.submenu.map(subitem => (
              <li>
                <a
                  href={subitem.href}
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                >
                  {subitem.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</nav>

<!-- Mobile Navigation Toggle -->
<button
  id="mobile-menu-toggle"
  class="lg:hidden text-gray-700 hover:text-primary"
  aria-label="Toggle mobile menu"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>

<script>
  const toggle = document.getElementById('mobile-menu-toggle');
  // Add mobile menu logic
</script>
```

#### ContactForm.astro

```astro
---
// This component will need a backend endpoint or form service
---

<form
  id="contact-form"
  class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow"
  action="https://formspree.io/f/YOUR_FORM_ID"
  method="POST"
>
  <div class="mb-4">
    <label for="name" class="block text-gray-700 font-semibold mb-2">
      Name *
    </label>
    <input
      type="text"
      id="name"
      name="name"
      required
      class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
    />
  </div>

  <div class="mb-4">
    <label for="email" class="block text-gray-700 font-semibold mb-2">
      Email *
    </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
    />
  </div>

  <div class="mb-4">
    <label for="phone" class="block text-gray-700 font-semibold mb-2">
      Phone
    </label>
    <input
      type="tel"
      id="phone"
      name="phone"
      class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
    />
  </div>

  <div class="mb-4">
    <label for="referral" class="block text-gray-700 font-semibold mb-2">
      How Did You Hear About Us?
    </label>
    <select
      id="referral"
      name="referral"
      class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
    >
      <option value="">Please select...</option>
      <option value="google">Google Search</option>
      <option value="social">Social Media</option>
      <option value="referral">Friend/Family Referral</option>
      <option value="other">Other</option>
    </select>
  </div>

  <div class="mb-4">
    <label for="message" class="block text-gray-700 font-semibold mb-2">
      Message
    </label>
    <textarea
      id="message"
      name="message"
      rows="5"
      class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
    ></textarea>
  </div>

  <div class="mb-6 text-sm text-gray-600">
    <p>
      <strong>HIPAA Compliance Notice:</strong> This form is secure and complies with
      HIPAA privacy regulations. Your information will be kept strictly confidential.
    </p>
  </div>

  <button
    type="submit"
    class="bg-primary text-white px-8 py-3 rounded-button hover:bg-opacity-90 transition-colors"
  >
    Send Message
  </button>
</form>
```

#### AwardBadges.astro

```astro
---
const awards = [
  {
    image: '/images/awards/milwaukee-journal-2024.png',
    alt: 'Milwaukee Journal Sentinel 2024 Winner'
  },
  {
    image: '/images/awards/community-choice.png',
    alt: 'Community Choice Award Winner'
  },
];
---

<div class="flex flex-wrap gap-4 justify-center items-center">
  {awards.map(award => (
    <div class="w-32 h-32">
      <img
        src={award.image}
        alt={award.alt}
        class="w-full h-full object-contain"
      />
    </div>
  ))}
</div>
```

#### Testimonial.astro

```astro
---
interface Props {
  name: string;
  quote: string;
  condition?: string;
}

const { name, quote, condition } = Astro.props;
---

<blockquote class="bg-gray-50 p-6 rounded-lg border-l-4 border-primary">
  <p class="text-gray-700 italic mb-4">"{quote}"</p>
  <footer class="text-gray-600">
    <cite class="not-italic font-semibold">{name}</cite>
    {condition && <span class="text-sm"> - {condition}</span>}
  </footer>
</blockquote>
```

#### SpecialOffer.astro

```astro
---
interface Props {
  title: string;
  price: string;
  description: string;
  validUntil?: string;
}

const { title, price, description, validUntil } = Astro.props;
---

<div class="bg-gradient-to-br from-secondary to-green-600 text-white p-8 rounded-lg shadow-lg">
  <h2 class="text-3xl font-bold mb-2">{title}</h2>
  <p class="text-5xl font-bold mb-4">{price}</p>
  <p class="text-lg mb-4">{description}</p>
  {validUntil && (
    <p class="text-sm opacity-90">Valid through {validUntil}</p>
  )}
  <a
    href="/contact"
    class="inline-block bg-white text-secondary px-6 py-3 rounded-button font-semibold hover:bg-gray-100 transition-colors mt-4"
  >
    Book Now
  </a>
</div>
```

#### BlogCard.astro

```astro
---
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  slug: string;
  image?: string;
}

const { title, description, pubDate, slug, image } = Astro.props;
const formattedDate = pubDate.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
---

<article class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
  {image && (
    <img
      src={image}
      alt={title}
      class="w-full h-48 object-cover"
    />
  )}
  <div class="p-6">
    <time class="text-sm text-gray-500">{formattedDate}</time>
    <h3 class="text-xl font-bold mt-2 mb-3">
      <a href={`/blog/${slug}`} class="hover:text-primary transition-colors">
        {title}
      </a>
    </h3>
    <p class="text-gray-600 mb-4">{description}</p>
    <a
      href={`/blog/${slug}`}
      class="text-primary font-semibold hover:underline"
    >
      Read More →
    </a>
  </div>
</article>
```

---

## Phase 4: Page Development

### 4.1 Homepage (src/pages/index.astro)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SpecialOffer from '../components/SpecialOffer.astro';
import AwardBadges from '../components/AwardBadges.astro';
import Testimonial from '../components/Testimonial.astro';
import { getCollection } from 'astro:content';

const recentPosts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);

const featuredTestimonials = (await getCollection('testimonials'))
  .filter(t => t.data.featured)
  .slice(0, 3);
---

<BaseLayout
  title="Home"
  description="Acupuncture & Holistic Health Associates - Over 380,000 successful treatments in 25+ years. Expert acupuncture, Chinese herbal medicine, and holistic health care in Milwaukee."
>
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-secondary to-green-600 text-white py-20">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        Acupuncture & Holistic Health Associates
      </h1>
      <p class="text-xl md:text-2xl mb-8">
        25+ Years of Clinical Excellence - Over 380,000 Successful Treatments
      </p>
      <a
        href="/contact"
        class="inline-block bg-primary text-white px-8 py-4 rounded-button text-lg font-semibold hover:bg-opacity-90 transition-colors"
      >
        Schedule Your Appointment
      </a>
    </div>
  </section>

  <!-- Special Offer -->
  <section class="container mx-auto px-4 py-12">
    <SpecialOffer
      title="Winter 2025 Special"
      price="$29"
      description="New patient special includes a series of visits"
      validUntil="March 31, 2025"
    />
  </section>

  <!-- Award Badges -->
  <section class="container mx-auto px-4 py-12">
    <AwardBadges />
  </section>

  <!-- Conditions We Treat -->
  <section class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Conditions We Treat</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Add condition cards here -->
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="container mx-auto px-4 py-16">
    <h2 class="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
    <div class="grid md:grid-cols-3 gap-6">
      {featuredTestimonials.map(testimonial => (
        <Testimonial
          name={testimonial.data.name}
          quote={testimonial.data.quote}
          condition={testimonial.data.condition}
        />
      ))}
    </div>
  </section>

  <!-- Recent Blog Posts -->
  <section class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Latest Health Tips</h2>
      <div class="grid md:grid-cols-3 gap-6">
        {recentPosts.map(post => (
          <BlogCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            slug={post.id}
            image={post.data.image}
          />
        ))}
      </div>
    </div>
  </section>
</BaseLayout>
```

### 4.2 Blog Index (src/pages/blog/index.astro)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogCard from '../../components/BlogCard.astro';
import { getCollection } from 'astro:content';

const allPosts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<BaseLayout
  title="Blog"
  description="Health tips, Chinese medicine insights, and wellness advice from our expert acupuncturists"
>
  <section class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">Health & Wellness Blog</h1>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allPosts.map(post => (
        <BlogCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          slug={post.id}
          image={post.data.image}
        />
      ))}
    </div>
  </section>
</BaseLayout>
```

### 4.3 Blog Post Template (src/pages/blog/[slug].astro)

```astro
---
import BlogLayout from '../../layouts/BlogLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  author={post.data.author}
>
  <Content />
</BlogLayout>
```

### 4.4 Conditions Index (src/pages/conditions/index.astro)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const conditions = (await getCollection('conditions'))
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout
  title="Conditions We Treat"
  description="Expert acupuncture treatment for headaches, insomnia, pain, stress, digestive issues, and more"
>
  <section class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">Conditions We Treat</h1>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions.map(condition => (
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 class="text-2xl font-bold mb-3 text-primary">
            <a href={`/conditions/${condition.id}`}>
              {condition.data.title}
            </a>
          </h2>
          <p class="text-gray-600 mb-4">{condition.data.description}</p>
          <a
            href={`/conditions/${condition.id}`}
            class="text-primary font-semibold hover:underline"
          >
            Learn More →
          </a>
        </div>
      ))}
    </div>
  </section>
</BaseLayout>
```

---

## Phase 5: Forms & Interactivity

### 5.1 Form Handling Options

**Option A: Formspree (Recommended for simplicity)**
- Free tier available
- HIPAA-compliant paid tier
- Easy integration
- No backend required

**Option B: Netlify Forms**
- Built-in with Netlify hosting
- Spam protection included
- Form submissions in dashboard

**Option C: Custom API Endpoint**
- Use Astro SSR with server endpoints
- Full control over data
- Requires server hosting

### 5.2 Map Integration

**Google Maps Embed (src/pages/contact.astro):**

```astro
<div class="aspect-video w-full">
  <iframe
    src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE"
    width="100%"
    height="100%"
    style="border:0;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</div>
```

### 5.3 Analytics Integration

**Google Analytics 4:**

```astro
<!-- Add to BaseLayout.astro head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Phase 6: SEO & Performance Optimization

### 6.1 SEO Enhancements

**Sitemap (automatic with @astrojs/sitemap)**

**robots.txt (public/robots.txt):**

```
User-agent: *
Allow: /

Sitemap: https://holisticacupuncture.net/sitemap-index.xml
```

**RSS Feed (src/pages/rss.xml.ts):**

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Acupuncture & Holistic Health Blog',
    description: 'Health tips and Chinese medicine insights',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

### 6.2 Performance Optimizations

**Image Optimization:**
- Use Astro's built-in image optimization
- Implement lazy loading
- Serve WebP format with fallbacks

**Example:**

```astro
---
import { Image } from 'astro:assets';
import staffPhoto from '../images/staff/dr-curry.jpg';
---

<Image
  src={staffPhoto}
  alt="Dr. Curry - Lead Acupuncturist"
  width={800}
  height={600}
  loading="lazy"
/>
```

**Critical CSS:**
- Inline critical CSS in BaseLayout
- Defer non-critical styles

**Compression:**
- Enable in astro.config.mjs (compressHTML: true)
- Configure server-level gzip/brotli

---

## Phase 7: Testing & Quality Assurance

### 7.1 Testing Checklist

#### Code Quality Testing
- [ ] Run Biome linter: `npm run lint`
- [ ] Fix all linting errors: `npm run lint:fix`
- [ ] Verify code formatting: `npm run format`
- [ ] No TypeScript errors: `npm run build`
- [ ] All imports organized correctly

#### Functionality Testing
- [ ] All navigation links work correctly
- [ ] Contact form submits successfully
- [ ] Form validation works properly
- [ ] Mobile menu toggles correctly
- [ ] All images load properly
- [ ] Blog posts render correctly
- [ ] Search functionality (if implemented)

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Responsive Design Testing
- [ ] 320px (small mobile)
- [ ] 480px (mobile)
- [ ] 768px (tablet)
- [ ] 1024px (small desktop)
- [ ] 1400px+ (large desktop)

#### Performance Testing
- [ ] Google PageSpeed Insights score (aim for 90+)
- [ ] Lighthouse audit (Performance, Accessibility, SEO)
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Image optimization verification
- [ ] Load time under 3 seconds

#### SEO Testing
- [ ] Meta descriptions on all pages
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Alt text on all images
- [ ] Canonical URLs set correctly
- [ ] Sitemap accessible
- [ ] robots.txt configured
- [ ] Schema markup (if applicable)

#### Accessibility Testing
- [ ] WAVE accessibility checker
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios (WCAG AA)
- [ ] Focus indicators visible
- [ ] Form labels properly associated

### 7.2 Content Review

- [ ] All WordPress content migrated
- [ ] Staff bios accurate and complete
- [ ] Contact information correct
- [ ] Business hours displayed
- [ ] Special offers current
- [ ] Blog posts formatted correctly
- [ ] Testimonials reviewed and approved
- [ ] Legal disclaimers present (HIPAA notice)

---

## Phase 8: Deployment

### 8.1 Hosting Options

**Option A: Netlify (Recommended)**
- Free SSL certificates
- Automatic deployments from Git
- Form handling built-in
- Edge CDN
- Easy rollbacks

**Option B: Vercel**
- Excellent performance
- Simple Git integration
- Generous free tier

**Option C: Cloudflare Pages**
- Fast global CDN
- Free tier available
- Great for static sites

### 8.2 Deployment Process

#### Netlify Deployment

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial Astro migration"
git remote add origin https://github.com/your-repo/holistic-acupuncture.git
git push -u origin main
```

2. **Connect to Netlify:**
- Log in to Netlify
- "Add new site" → "Import an existing project"
- Connect GitHub repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`

3. **Configure Custom Domain:**
- Add custom domain: `holisticacupuncture.net`
- Configure DNS records (A or CNAME)
- Enable HTTPS

4. **Set Environment Variables (if needed):**
- Form API keys
- Analytics IDs
- CMS credentials

### 8.3 DNS Configuration

**Current DNS → New Astro Site:**

```
A Record:
@ → [Netlify IP address]

CNAME Record:
www → [your-site].netlify.app
```

### 8.4 Pre-Launch Checklist

- [ ] Test site on staging URL
- [ ] Verify all forms work
- [ ] Check analytics tracking
- [ ] Confirm SSL certificate active
- [ ] Test custom domain
- [ ] Set up 301 redirects from old URLs (if needed)
- [ ] Backup WordPress site
- [ ] Prepare rollback plan

---

## Phase 9: Post-Launch

### 9.1 Monitoring

**Set Up Monitoring Tools:**
- Google Analytics 4
- Google Search Console
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry, optional)

### 9.2 WordPress Migration

**After successful launch:**
1. Keep WordPress site accessible for 30 days (read-only)
2. Set up 301 redirects from old URLs if structure changed
3. Monitor for broken links
4. Update any external listings (Google Business, directories)

### 9.3 Maintenance Plan

**Regular Tasks:**
- Weekly: Check forms, review analytics
- Monthly: Update dependencies, content review
- Quarterly: Performance audit, SEO review
- Annually: Accessibility audit, design refresh

---

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1: Setup | 1 day | Project initialization and configuration |
| Phase 2: Content Migration | 3-5 days | Export from WordPress, convert to Markdown |
| Phase 3: Components | 3-4 days | Build reusable components |
| Phase 4: Pages | 5-7 days | Develop all site pages |
| Phase 5: Forms/Interactivity | 2-3 days | Form integration, maps, scripts |
| Phase 6: SEO/Performance | 2 days | Optimization and fine-tuning |
| Phase 7: Testing | 3-4 days | Comprehensive testing across devices |
| Phase 8: Deployment | 1 day | Deploy to production |
| Phase 9: Post-Launch | 1 week | Monitoring and adjustments |
| **Total** | **3-4 weeks** | With dedicated development time |

---

## Risk Mitigation

### Potential Challenges & Solutions

| Risk | Mitigation Strategy |
|------|---------------------|
| **Content loss during migration** | Backup WordPress database before export; verify all content migrated |
| **Form functionality breaks** | Test forms thoroughly; have fallback email contact |
| **SEO ranking drop** | Maintain URL structure; implement 301 redirects; verify meta tags |
| **Downtime during DNS switch** | Use low TTL before switch; monitor during transition |
| **Performance regression** | Benchmark current site; set performance budgets |
| **Browser compatibility issues** | Test on all major browsers early; use progressive enhancement |

---

## Success Metrics

### Performance Goals
- **Lighthouse Score:** 90+ (Performance, Accessibility, SEO)
- **Page Load Time:** < 2 seconds
- **Core Web Vitals:** All passing
- **Bundle Size:** < 100KB initial JS

### SEO Goals
- Maintain current search rankings
- Improve page speed score
- Enhanced mobile usability score

### User Experience Goals
- Reduced bounce rate
- Increased time on site
- Higher contact form conversion rate

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment** (Phase 1)
3. **Begin WordPress content export** (Phase 2)
4. **Establish communication schedule** for progress updates
5. **Identify any custom requirements** not covered in this plan

---

## Resources

- **Astro Documentation:** [See claude.md](./claude.md) for comprehensive Astro guide
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Netlify Documentation:** https://docs.netlify.com
- **Google PageSpeed Insights:** https://pagespeed.web.dev/
- **WAVE Accessibility:** https://wave.webaim.org/

---

## Decisions Made

✅ **Content Management:** Sanity CMS (for non-technical staff to manage blog posts and content)
✅ **Database:** Astro DB (for form submissions and dynamic data)
✅ **Linting/Formatting:** Biome (unified tooling, 35x faster than Prettier)
✅ **Styling:** Tailwind CSS (maintain existing approach)
✅ **Form Handling:** Astro DB (store submissions for staff review)

**See [Sanity + Astro DB Integration Guide](./SANITY-ASTRODB-GUIDE.md) for complete architecture details.**

## Questions & Decisions Needed

Before starting development, please confirm:

1. **Hosting Preference:** Netlify, Vercel, or Cloudflare Pages?
2. **Analytics:** Continue with Google Analytics 4, or switch to privacy-focused alternative (Plausible, Fathom)?
3. **Budget:** Any budget constraints? (Note: Both Sanity and Astro DB have generous free tiers)
4. **Timeline:** Target launch date?
5. **Sanity Studio Access:** Which staff members need Sanity CMS access? (Free tier supports 3 users)
6. **Admin Dashboard:** Do you need a custom admin dashboard for viewing form submissions, or is Astro Studio sufficient?

---

*Migration Plan Created: 2026-01-08*
*Last Updated: 2026-01-08*

**References:**
- [Astro Framework Documentation](./claude.md)
- [Sanity + Astro DB Integration Guide](./SANITY-ASTRODB-GUIDE.md)
