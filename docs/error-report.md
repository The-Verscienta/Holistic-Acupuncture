# Error Report - Holistic Acupuncture Project

**Date:** 2026-02-15
**Scope:** Full project scan of `virtual-velocity/`

---

## Errors (TypeScript & Runtime)

### 1. `db/config.ts:1` - Cannot find module `astro:db`
- **Severity:** Error
- **File:** `db/config.ts`
- **Issue:** Uses Astro DB (`import { defineDb, defineTable, column } from 'astro:db'`) which isn't installed or configured in the project.
- **Fix:** Remove this file if Astro DB is not being used, or install `@astrojs/db`.

### 2. `src/pages/blog/[slug].astro:125` - `post.updatedAt` does not exist on `BlogPost`
- **Severity:** Error
- **File:** `src/pages/blog/[slug].astro`
- **Issue:** `post.updatedAt` is referenced in the article structured data schema, but the GROQ query in `sanityQueries.ts` never fetches `updatedAt`, and it's not defined in the `BlogPost` type (`src/types/sanity.ts`). Falls back to `publishedAt` silently but structured data never reflects actual modification dates.
- **Fix:** Either add `updatedAt` to the BlogPost type and GROQ query, or remove the reference and use `publishedAt` explicitly.

### 3. Email failures silently return success to users
- **Severity:** Critical
- **Files:** `src/lib/email.ts` (lines 41-109), `src/pages/api/contact.ts` (lines 126-146), `src/pages/api/testimonial.ts` (lines 132-152)
- **Issue:** `sendEmail()` returns `false` on failure (never throws). The API routes wrap calls in `try/catch`, so the catch block never fires on email failure. Users see a success response even when no email was sent.
- **Fix:** Either have `sendEmail()` throw on failure, or check the return value: `const sent = await sendContactFormNotification(...); if (!sent) { return error response; }`.

### 4. Search API generates broken `/conditions/[slug]` URLs (404s)
- **Severity:** Error
- **File:** `src/pages/api/search.ts:113`
- **Issue:** Generates URLs like `/conditions/${condition.slug.current}`, but there is no `src/pages/conditions/[slug].astro` route. Only a static `src/pages/conditions.astro` exists. Clicking any condition search result leads to a 404.
- **Fix:** Either create a `conditions/[slug].astro` dynamic route, or change the URL to `/conditions#${condition.slug.current}`.

### 5. Blog newsletter error shows wrong field name
- **Severity:** Error
- **File:** `src/pages/blog/index.astro:362`
- **Issue:** Reads `data.message` on error, but the newsletter API returns errors in `data.error`. Users always see generic "Subscription failed" instead of the actual error message.
- **Fix:** Change `data.message` to `data.error`.

### 6. Share buttons are non-functional
- **Severity:** Error
- **File:** `src/pages/blog/[slug].astro:232-248`
- **Issue:** Three social share buttons (Facebook, Twitter/X, LinkedIn) are `<button>` elements with no click handlers, hrefs, or JavaScript. They render icons but do nothing when clicked.
- **Fix:** Add proper share URLs or click handlers that open share dialogs.

---

## Warnings (Inconsistencies & UX Issues)

### 7. Inconsistent office hours across 4 locations
- **Severity:** Warning
- **Files:**
  - `src/lib/config.ts` (lines 28-36): Mon-Thu 9AM-6PM, Fri 9AM-5PM
  - `src/pages/contact.astro` (lines 74, 100-114): Mon-Thu 9AM-7PM, Fri & Sat By Appointment
  - `src/components/Footer.astro` (lines 104-115): Mon-Fri 9AM-5PM, Sat By Appointment
  - `src/components/StructuredData.astro` (lines 39-52): Mon-Fri 9AM-5PM, Sat 9AM-3PM
- **Fix:** Use the `HOURS` object from `config.ts` as the single source of truth in all locations.

### 8. Conflicting street addresses
- **Severity:** Warning
- **Files:**
  - `src/pages/contact.astro` (lines 53-55): "500 W Silver Spring Dr, Suite K-205, Glendale, WI 53217"
  - `src/lib/config.ts` (line 19): "5800 N Bayshore Drive"
  - `src/components/StructuredData.astro` (line 28): "5800 N Bayshore Drive"
  - `src/lib/email.ts` (line 520): "5800 N Bayshore Drive"
- **Fix:** Determine the correct address and update all locations to match.

### 9. Mobile navigation missing "Services" link
- **Severity:** Warning
- **Files:** `src/components/Navigation.astro` (desktop nav includes Services), `src/components/Header.astro` (lines 68-91, mobile menu omits Services)
- **Fix:** Add Services link to the mobile menu.

### 10. `tel:` links missing country code
- **Severity:** Warning
- **Files:**
  - `src/pages/services.astro:395` - produces `tel:4143328888` (no `+1`)
  - `src/components/Footer.astro:85` - produces `tel:4143328888` (no `+1`)
  - `src/pages/contact.astro:70` - correctly uses `tel:+14143328888`
- **Fix:** Add `+1` prefix to all `tel:` links.

### 11. "Load More Reviews" button is non-functional
- **Severity:** Warning
- **File:** `src/pages/reviews.astro:106-109`
- **Issue:** Button renders but has no JavaScript handler or href. All reviews are already rendered server-side.
- **Fix:** Either implement pagination/lazy-loading logic or remove the button.

### 12. In-memory rate limiting is ineffective on Cloudflare Workers
- **Severity:** Warning
- **Files:** All 4 API routes (`contact.ts`, `newsletter.ts`, `search.ts`, `testimonial.ts`)
- **Issue:** Uses `Map` for rate limiting, which resets per isolate and is not shared between Cloudflare Workers. Provides essentially no protection in production.
- **Fix:** Use Cloudflare KV, Durable Objects, or an external rate limiting service.

---

## Lower Priority Issues

### 13. Sanity CDN disabled in production
- **File:** `src/lib/sanity.ts:15`
- **Issue:** `useCdn: false` means every query hits Sanity's origin API instead of CDN, increasing latency.
- **Fix:** Set `useCdn: true` for production or use `import.meta.env.PROD`.

### 14. Blog index fetches all posts on every request
- **File:** `src/pages/blog/index.astro:12,23`
- **Issue:** SSR page (`prerender = false`) calls `getAllBlogPosts()` on every request. A `getPaginatedBlogPosts()` function exists in `sanityQueries.ts` but is unused.
- **Fix:** Use `getPaginatedBlogPosts()` or switch to static prerendering.

### 15. Contact form maps "Reason" to `referralSource`
- **File:** `src/pages/contact.astro:550`
- **Issue:** "Reason for Contact" dropdown value is sent as `referralSource`, which the admin email displays as "How They Found Us".
- **Fix:** Use a separate field name for the contact reason.

### 16. Gallery pages lack standard layout
- **Files:** `src/pages/image-gallery.astro`, `src/pages/cloudflare-gallery.astro`
- **Issue:** Render full HTML without `BaseLayout.astro`. Missing SEO tags, header, footer, analytics.
- **Fix:** Remove if they are dev-only pages, or wrap in `BaseLayout` if user-facing.

### 17. `formatRelativeDate` can produce "NaN years ago"
- **File:** `src/lib/sanity.ts:35-47`
- **Issue:** If `review.date` is null/undefined, `new Date(undefined)` produces Invalid Date and the function returns "NaN years ago".
- **Fix:** Add `if (!dateString) return '';` at the start.

### 18. Duplicate `escapeHtml` function
- **Files:** `src/lib/email.ts:714-721`, `src/lib/sanitize.ts:9-16`
- **Issue:** Identical implementations in two files. Maintenance risk if one is updated and the other isn't.
- **Fix:** Have `email.ts` import from `sanitize.ts`.

### 19. `decodeHtmlEntities` risks double-decoding
- **File:** `src/lib/sanity.ts:50-66`
- **Issue:** Decoding `&lt;` to `<` in blog titles used in meta tags could reintroduce HTML in non-escaped contexts.
- **Fix:** Use a DOM-based decoder or only decode safe entities.

### 20. Blog type mismatch between queries and type definition
- **Files:** `src/lib/sanityQueries.ts:6` (filters `_type == "blog"`), `src/types/sanity.ts:31` (defines `_type: 'blogPost' | 'blog'`)
- **Issue:** Documents with `_type: 'blogPost'` would never be fetched by any GROQ query.
- **Fix:** Either update queries to include both types or remove `blogPost` from the type union.

### 21. Contact form `maxLength` mismatch
- **Files:** `src/pages/contact.astro:217` (1000 chars), `src/pages/api/contact.ts:13` (5000 chars)
- **Issue:** HTML limits input to 1000 but API allows 5000. Additionally, the form prepends reason/condition text to the message.
- **Fix:** Align the limits or document the intentional difference.

---

## Priority Order for Fixes

1. **#3** - Email failures silently succeeding (users think messages sent, but they weren't)
2. **#4** - Broken search result URLs (404s)
3. **#8** - Conflicting street addresses (patient confusion)
4. **#7** - Inconsistent office hours
5. **#9** - Mobile nav missing Services
6. **#5** - Newsletter error message wrong field
7. **#6** - Non-functional share buttons
8. **#10** - Tel links missing country code
9. **#1** - Unused db/config.ts
10. **#2** - updatedAt type error
11. Remaining items as time permits
