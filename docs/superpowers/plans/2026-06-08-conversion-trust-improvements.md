# Conversion & Trust Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce booking friction with a branded `/book` interstitial, point the new-patient CTA at booking, add a verified Google reviews link (and fix review-count inconsistencies), surface evening-hours availability, and make the FAQ more visible on the homepage.

**Architecture:** Astro static/SSR site in `virtual-velocity/`. All shared values live in `src/lib/config.ts`. A new `src/pages/book.astro` interstitial is the single in-site booking destination; it is the only place that links out to Jane App (in a new tab). Every other booking button becomes an internal same-tab link to `/book`.

**Tech Stack:** Astro 5, Tailwind CSS 4, Sanity CMS. No unit-test framework — verification is `npm run check` (astro typecheck) + `npm run build`, plus the browser preview tools.

**Working directory note:** All `npm` commands run from `virtual-velocity/`. All file paths below are relative to `virtual-velocity/` unless noted. The repo root is `C:\Github\holistic-acupuncture`; the plan/spec live under `docs/superpowers/` at the repo root.

---

## Task 1: Add config constants

**Files:**
- Modify: `src/lib/config.ts`

- [ ] **Step 1: Add `BOOK_PATH` next to the Jane URL**

In `src/lib/config.ts`, immediately after the `JANE_BOOKING_URL` export (currently line 8), add:

```ts
// Internal booking interstitial. All in-site "Book" CTAs point here; the /book
// page itself is the only place that links out to JANE_BOOKING_URL (new tab).
export const BOOK_PATH = '/book';
```

- [ ] **Step 2: Add Google review URLs and review stats after the `CONTACT` block**

After the `CONTACT` export object (the block ending around line 46), add:

```ts
// Verified Google Business reviews, derived from the Place ID above.
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${CONTACT.address.googlePlaceId}`;
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${CONTACT.address.googlePlaceId}`;

// Review stats — single source of truth. Keep in sync with the aggregateRating
// in src/components/StructuredData.astro.
export const REVIEW_STATS = {
  rating: 4.8,
  count: 171,
  recommendPct: 98,
};
```

- [ ] **Step 3: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS (no new errors). Pre-existing warnings unrelated to these files are acceptable.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/lib/config.ts
git commit -m "feat: add BOOK_PATH, Google review URLs, and REVIEW_STATS to config"
```

---

## Task 2: Create the `/book` interstitial page

**Files:**
- Create: `src/pages/book.astro`

- [ ] **Step 1: Create `src/pages/book.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';
import Card from '../components/Card.astro';
import Button from '../components/Button.astro';
import { JANE_BOOKING_URL, CONTACT, NEW_PATIENT_SPECIAL } from '../lib/config';
---

<BaseLayout
  title="Book an Appointment"
  description="Book your acupuncture appointment online through Jane, our secure scheduling system, or call us directly."
  breadcrumbs={[{name:'Home',url:'/'},{name:'Book an Appointment'}]}
>
  <section class="py-16 md:py-24 bg-gradient-to-br from-sage-50 via-warm-white to-sage-100">
    <Container>
      <Card variant="elevated" padding="lg" class="max-w-2xl mx-auto bg-white text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 rounded-full text-sage-700 text-sm font-medium mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Secure &amp; HIPAA-compliant booking</span>
        </div>

        <h1 class="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-4">
          Book Your Appointment
        </h1>
        <p class="text-lg text-gray-700 mb-2">
          You're about to head to <strong>Jane</strong>, our secure online scheduling system, where you can pick a time that works for you.
        </p>
        <p class="text-sm text-gray-500 mb-8">Opens in a new tab, so this page stays open for reference.</p>

        <Button variant="primary" size="lg" icon="external" iconPosition="right" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
          Continue to Online Booking
        </Button>

        <div class="mt-10 text-left">
          <h2 class="text-lg font-heading font-semibold text-charcoal text-center mb-4">What to expect</h2>
          <ul class="space-y-3 text-gray-700 text-sm max-w-md mx-auto">
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>New patient? Your first visit includes a comprehensive assessment plus your first treatment for just <strong>${NEW_PATIENT_SPECIAL.price}</strong> (a ${NEW_PATIENT_SPECIAL.savings} savings).</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Working full-time? We hold <strong>evening appointments until 7&nbsp;PM, Monday&ndash;Thursday</strong>.</span>
            </li>
          </ul>
        </div>

        <div class="mt-10 pt-8 border-t border-sage-200">
          <p class="text-gray-700 mb-3">Prefer to talk to someone?</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="tertiary" size="md" icon="phone" href={`tel:${CONTACT.phoneRaw}`}>
              Call {CONTACT.phone}
            </Button>
            <Button variant="tertiary" size="md" icon="mail" href="/contact">
              Send Us a Message
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/book.astro
git commit -m "feat: add branded /book booking interstitial page"
```

---

## Task 3: Route all in-site booking buttons to `/book`

Each booking button currently links to `JANE_BOOKING_URL` and opens in a new tab. Change each to an internal same-tab link to `BOOK_PATH` (remove the `target`/`rel` so it navigates in place). For every file, also update the `config` import: swap `JANE_BOOKING_URL` for `BOOK_PATH` (keep any other imported names).

> When editing multi-line attribute blocks, match the file's existing indentation. The "after" collapses the three `href`/`target`/`rel` lines into a single `href={BOOK_PATH}` line.

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/services.astro`
- Modify: `src/pages/holistic-acupuncture.astro`
- Modify: `src/pages/team/[slug].astro`

- [ ] **Step 1: Header.astro**

Change the import (line 5):
```astro
import { CONTACT, JANE_BOOKING_URL } from '../lib/config';
```
to:
```astro
import { CONTACT, BOOK_PATH } from '../lib/config';
```

The string `href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer"` appears 3 times (lines 68, 91, 157), each identical. Replace all occurrences with:
```astro
href={BOOK_PATH}
```

- [ ] **Step 2: Footer.astro**

Change the import (line 2):
```astro
import { JANE_BOOKING_URL, CONTACT } from '../lib/config';
```
to:
```astro
import { BOOK_PATH, CONTACT } from '../lib/config';
```

Replace the booking anchor's attributes (lines 138–140):
```astro
          href={JANE_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
```
with:
```astro
          href={BOOK_PATH}
```
(Leave the maps link's `target="_blank"` at line 107 untouched.)

- [ ] **Step 3: BaseLayout.astro (mobile sticky book bar)**

The import on line 8 includes many names; remove `JANE_BOOKING_URL` from it and add `BOOK_PATH`. The current line is:
```astro
import { SITE_URL, SOCIAL, DEFAULT_OG_IMAGE, CONTACT, JANE_BOOKING_URL } from '../lib/config';
```
Change to:
```astro
import { SITE_URL, SOCIAL, DEFAULT_OG_IMAGE, CONTACT, BOOK_PATH } from '../lib/config';
```

Replace the booking anchor's attributes (lines 220–222):
```astro
        href={JANE_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
```
with:
```astro
        href={BOOK_PATH}
```

- [ ] **Step 4: index.astro**

Change the import (line 9):
```astro
import { JANE_BOOKING_URL } from '../lib/config';
```
to:
```astro
import { BOOK_PATH } from '../lib/config';
```
(Task 6 extends this import again — that's fine.)

Replace the hero button (line 64):
```astro
            <Button variant="primary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
```
with:
```astro
            <Button variant="primary" size="lg" icon="calendar" href={BOOK_PATH}>
```

Replace the CTASection primary button (line 158):
```astro
    primaryButton={{ label: 'Schedule Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
```
with:
```astro
    primaryButton={{ label: 'Schedule Appointment', href: BOOK_PATH }}
```

- [ ] **Step 5: services.astro**

Change the import (line 8):
```astro
import { JANE_BOOKING_URL } from '../lib/config';
```
to:
```astro
import { BOOK_PATH } from '../lib/config';
```

Replace the "Book Now" anchor attributes (lines 253–255):
```astro
                      href={JANE_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
```
with:
```astro
                      href={BOOK_PATH}
```

Replace the package "Get Started" Button attributes (lines 329–331):
```astro
                href={JANE_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
```
with:
```astro
                href={BOOK_PATH}
```

Replace the CTASection primary button (line 398):
```astro
    primaryButton={{ label: 'Book Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
```
with:
```astro
    primaryButton={{ label: 'Book Appointment', href: BOOK_PATH }}
```

- [ ] **Step 6: holistic-acupuncture.astro**

Change the import (line 14):
```astro
import { JANE_BOOKING_URL, CONTACT } from '../lib/config';
```
to:
```astro
import { BOOK_PATH, CONTACT } from '../lib/config';
```

Replace the hero button (line 82):
```astro
      <Button variant="primary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
```
with:
```astro
      <Button variant="primary" size="lg" icon="calendar" href={BOOK_PATH}>
```

Replace the CTASection primary button (line 235):
```astro
    primaryButton={{ label: 'Book Your Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
```
with:
```astro
    primaryButton={{ label: 'Book Your Appointment', href: BOOK_PATH }}
```

- [ ] **Step 7: team/[slug].astro**

Change the import (line 9):
```astro
import { JANE_BOOKING_URL, CONTACT } from '../../lib/config';
```
to:
```astro
import { BOOK_PATH, CONTACT } from '../../lib/config';
```

Replace the Button attributes (lines 163–165):
```astro
              href={JANE_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
```
with:
```astro
              href={BOOK_PATH}
```

Replace the second booking button (line 276):
```astro
        <Button variant="secondary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
```
with:
```astro
        <Button variant="secondary" size="lg" icon="calendar" href={BOOK_PATH}>
```
(If line 276 wraps differently, replace the `href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer"` substring with `href={BOOK_PATH}`.)

- [ ] **Step 8: Verify no stray `JANE_BOOKING_URL` references remain outside `book.astro` and `config.ts`**

Run (from repo root or `virtual-velocity/`): search for `JANE_BOOKING_URL`.
Expected: matches only in `src/lib/config.ts` (definition) and `src/pages/book.astro` (usage). No other files.

- [ ] **Step 9: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS (no "JANE_BOOKING_URL is declared but never read" or unresolved `BOOK_PATH` errors).

- [ ] **Step 10: Commit**

```bash
git add virtual-velocity/src/components/Header.astro virtual-velocity/src/components/Footer.astro virtual-velocity/src/layouts/BaseLayout.astro virtual-velocity/src/pages/index.astro virtual-velocity/src/pages/services.astro virtual-velocity/src/pages/holistic-acupuncture.astro "virtual-velocity/src/pages/team/[slug].astro"
git commit -m "feat: route all in-site booking buttons through /book interstitial"
```

---

## Task 4: Point the new-patient special CTA at `/book`

**Files:**
- Modify: `src/components/NewPatientSpecial.astro`

- [ ] **Step 1: Import `BOOK_PATH`**

Change the import (line 5):
```astro
import { NEW_PATIENT_SPECIAL } from '../lib/config';
```
to:
```astro
import { NEW_PATIENT_SPECIAL, BOOK_PATH } from '../lib/config';
```

- [ ] **Step 2: Change the CTA target**

Replace the button (line 43):
```astro
        <Button variant="primary" size="lg" icon="calendar" href="/contact">
```
with:
```astro
        <Button variant="primary" size="lg" icon="calendar" href={BOOK_PATH}>
```

- [ ] **Step 3: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/components/NewPatientSpecial.astro
git commit -m "feat: send new-patient special CTA to /book instead of contact form"
```

---

## Task 5: Verified Google reviews link + fix review-count inconsistency

**Files:**
- Modify: `src/pages/reviews.astro`

- [ ] **Step 1: Add config imports**

After the existing imports (after line 12), add:
```astro
import { REVIEW_STATS, GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL, BOOK_PATH } from '../lib/config';
```

- [ ] **Step 2: Add a review breakdown derived from the real count**

In the frontmatter, after the `const reviews = await getAllTestimonials();` line (line 15), add:
```astro
// Approximate star distribution applied to the real review count so the
// breakdown sums to REVIEW_STATS.count (no fabricated totals).
const ratingBreakdown = [
  { stars: 5, percentage: 97 },
  { stars: 4, percentage: 2 },
  { stars: 3, percentage: 1 },
  { stars: 2, percentage: 0 },
  { stars: 1, percentage: 0 },
].map((r) => ({ ...r, count: Math.round((r.percentage / 100) * REVIEW_STATS.count) }));
```

- [ ] **Step 3: Use `REVIEW_STATS` in the hero stats**

Replace the hero stats block (lines 34–47):
```astro
    <div class="flex items-center justify-center gap-8 text-gray-700 mt-4">
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">4.8</div>
        <div class="text-sm">Average Rating</div>
      </div>
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">171</div>
        <div class="text-sm">Reviews</div>
      </div>
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">98%</div>
        <div class="text-sm">Would Recommend</div>
      </div>
    </div>
```
with:
```astro
    <div class="flex items-center justify-center gap-8 text-gray-700 mt-4">
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">{REVIEW_STATS.rating}</div>
        <div class="text-sm">Average Rating</div>
      </div>
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">{REVIEW_STATS.count}</div>
        <div class="text-sm">Google Reviews</div>
      </div>
      <div>
        <div class="text-3xl font-heading font-bold text-sage-600">{REVIEW_STATS.recommendPct}%</div>
        <div class="text-sm">Would Recommend</div>
      </div>
    </div>
```

- [ ] **Step 4: Drive the Rating Breakdown from `ratingBreakdown`**

Replace the hardcoded array (lines 58–64):
```astro
          {[
            { stars: 5, count: 487, percentage: 97 },
            { stars: 4, count: 12, percentage: 2 },
            { stars: 3, count: 1, percentage: 0.2 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 },
          ].map(rating => (
```
with:
```astro
          {ratingBreakdown.map(rating => (
```

- [ ] **Step 5: Add a "Read all reviews on Google" button under the breakdown card**

The Rating Breakdown `<Card>...</Card>` is inside a `<Container>` (closes around line 82). Immediately after the closing `</Card>` and before `</Container>`, add:
```astro
        <div class="text-center mt-8">
          <Button variant="primary" size="lg" icon="external" iconPosition="right" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            Read all {REVIEW_STATS.count} reviews on Google
          </Button>
        </div>
```

- [ ] **Step 6: Fix the "Write a Google Review" link**

Replace the button (line 116):
```astro
          <Button variant="primary" size="lg" icon="external" href="https://www.google.com/search?q=acupuncture+holistic+health+associates+milwaukee" target="_blank">
```
with:
```astro
          <Button variant="primary" size="lg" icon="external" href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
```

- [ ] **Step 7: Fix the "Top Rated" award card rating**

Replace (line 185):
```astro
          <p class="text-sm text-gray-600">4.8 Stars on Google</p>
```
with:
```astro
          <p class="text-sm text-gray-600">{REVIEW_STATS.rating} Stars on Google</p>
```

- [ ] **Step 8: Fix the final CTA copy and route it to `/book`**

Replace the CTASection (lines 191–196):
```astro
  <CTASection
    heading="Join Our Happy Patients"
    description="Experience the same exceptional care that has earned us over 500 five-star reviews."
    primaryButton={{ label: 'Book Your Appointment Today', href: '/contact' }}
  />
```
with:
```astro
  <CTASection
    heading="Join Our Happy Patients"
    description={`Experience the same care that earned our ${REVIEW_STATS.rating}★ rating across ${REVIEW_STATS.count} Google reviews.`}
    primaryButton={{ label: 'Book Your Appointment Today', href: BOOK_PATH }}
  />
```

- [ ] **Step 9: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add virtual-velocity/src/pages/reviews.astro
git commit -m "feat: verified Google reviews links + reconcile review counts to 171/4.8"
```

---

## Task 6: Homepage Google reviews link + FAQ teaser

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Extend imports**

After Task 3, the config import in `index.astro` reads:
```astro
import { BOOK_PATH } from '../lib/config';
```
Change it to:
```astro
import { BOOK_PATH, REVIEW_STATS, GOOGLE_REVIEWS_URL } from '../lib/config';
```

Add a `Card` import (the FAQ teaser needs it). After the `import Button ...` line (line 6), add:
```astro
import Card from '../components/Card.astro';
```

- [ ] **Step 2: Add the FAQ teaser data to the frontmatter**

After the `conditions` array (before the closing `---` at line 25), add:
```astro
const faqTeasers = [
  {
    question: 'Does acupuncture hurt?',
    answer: 'Most people feel little to nothing. Acupuncture needles are hair-thin — far finer than the needles used for injections or blood draws. You may notice a slight pinch or a warm, dull sensation, and many patients find treatment deeply relaxing.',
  },
  {
    question: 'How many sessions will I need?',
    answer: 'It depends on your condition. Acute issues may resolve in 3–5 sessions, while chronic conditions often take 8–12 or more. Many patients notice improvement after just a few visits — we create a personalized plan and adjust it as you progress.',
  },
  {
    question: 'Is acupuncture covered by insurance?',
    answer: 'Many plans now cover acupuncture, especially for pain management. We are in-network with several major providers and can provide superbills for out-of-network reimbursement. Contact us and we will help verify your benefits.',
  },
];
```

- [ ] **Step 3: Add a reviews link under the testimonials grid**

The Testimonials section grid closes at line 151 (`</div>`), followed by `</Container>` (152) and `</section>` (153). Insert, between the grid's closing `</div>` (line 151) and `</Container>` (line 152):
```astro
      <div class="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="tertiary" size="lg" icon="arrow-right" iconPosition="right" href="/reviews">
          See all patient reviews
        </Button>
        <Button variant="tertiary" size="lg" icon="external" iconPosition="right" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
          Read all {REVIEW_STATS.count} reviews on Google
        </Button>
      </div>
```

- [ ] **Step 4: Add the "Common Questions" section before the final CTA**

Immediately before the final `<CTASection ... />` (line 155), insert:
```astro
  <!-- Common Questions (FAQ teaser) -->
  <section class="py-16 md:py-20 lg:py-24 bg-white">
    <Container>
      <SectionHeader title="Common Questions" subtitle="Quick answers to what new patients ask most. Visit our FAQ for the full list." />
      <div class="max-w-3xl mx-auto space-y-4">
        {faqTeasers.map(faq => (
          <Card variant="bordered" padding="none" class="bg-white overflow-hidden">
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer p-6 hover:bg-sage-50 transition-colors list-none">
                <h3 class="text-lg font-heading font-semibold text-charcoal pr-4">{faq.question}</h3>
                <svg class="w-6 h-6 text-sage-600 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div class="px-6 pb-6 pt-2">
                <p class="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          </Card>
        ))}
      </div>
      <div class="text-center mt-10">
        <Button variant="primary" size="lg" icon="arrow-right" iconPosition="right" href="/faq">
          See all FAQs
        </Button>
      </div>
    </Container>
  </section>
```

- [ ] **Step 5: Add the disclosure-marker style**

At the very end of the file, after the closing `</BaseLayout>`, add (mirrors `faq.astro` so the default triangle is hidden):
```astro
<style>
  details summary::-webkit-details-marker { display: none; }
  details summary::marker { display: none; }
</style>
```

- [ ] **Step 6: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add virtual-velocity/src/pages/index.astro
git commit -m "feat: homepage Google reviews link and Common Questions FAQ teaser"
```

---

## Task 7: Evening-hours reassurance in OfficeHoursCard

**Files:**
- Modify: `src/components/OfficeHoursCard.astro`

- [ ] **Step 1: Add the note to the `card` variant**

In the `card` variant, replace the closing of the hours block (lines 37–38):
```astro
    </div>
  </Card>
```
with:
```astro
    </div>
    <p class="mt-3 text-xs text-sage-700 bg-sage-100 rounded-md px-3 py-2">
      <strong>Evening appointments</strong> available until 7&nbsp;PM, Mon&ndash;Thu.
    </p>
  </Card>
```

- [ ] **Step 2: Add the note to the `footer` variant**

In the `footer` variant, the `<ul>` closes at line 61 (`</ul>`). Immediately after it (before the closing `</div>` on line 62), insert:
```astro
    <p class="text-sage-100 text-xs mb-6">
      <strong>Evening appointments</strong> until 7&nbsp;PM, Mon&ndash;Thu.
    </p>
```
Then remove the now-duplicate bottom margin on the `<ul>` so spacing stays even: change `class="space-y-2 text-sage-100 text-sm mb-6"` (line 44) to `class="space-y-2 text-sage-100 text-sm mb-3"`.

- [ ] **Step 3: Verify typecheck passes**

Run (from `virtual-velocity/`): `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/components/OfficeHoursCard.astro
git commit -m "feat: surface evening-appointment availability in office hours card"
```

---

## Task 8: Verify structured data + full build + browser check

**Files:**
- Verify only: `src/components/StructuredData.astro`

- [ ] **Step 1: Confirm aggregateRating matches `REVIEW_STATS`**

Open `src/components/StructuredData.astro` and confirm `aggregateRating` still reads `ratingValue: "4.8"` and `reviewCount: "171"`. It already does — no edit expected. If it ever diverges from `REVIEW_STATS` (4.8 / 171), update the string literals to match.

- [ ] **Step 2: Full build**

Run (from `virtual-velocity/`): `npm run build`
Expected: build completes successfully and `/book` appears in the build output (a `book` route/page is emitted).

- [ ] **Step 3: Browser verification (preview tools)**

Start the dev server (`npm run dev` via preview_start) and verify:
- `/book` renders; "Continue to Online Booking" points at the Jane URL and has `target="_blank"`.
- Homepage hero "Book Your Appointment", the new-patient special "Schedule Your Consultation", header/footer "Book Appointment", and the mobile sticky book bar all navigate to `/book` (same tab, no new tab).
- `/reviews`: hero shows 4.8 / 171 / 98%, the rating breakdown counts sum to 171, "Read all 171 reviews on Google" and "Write a Google Review" links resolve to the real Google listing.
- Homepage: "Read all 171 reviews on Google" link and the "Common Questions" accordion render; "See all FAQs" links to `/faq`.
- Office-hours card (contact page + footer) shows the evening-appointments note.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found during booking/reviews/FAQ verification"
```
(If no fixes were needed, skip this commit.)

---

## Self-Review Notes

- **Spec coverage:** #1 (Task 2, 3), #2 (Task 4), #3 (Task 1, 5, 6, 8), #5 (Task 2, 7), #6 (Task 6). #4 and #7 intentionally out of scope.
- **Naming consistency:** `BOOK_PATH`, `GOOGLE_REVIEWS_URL`, `GOOGLE_WRITE_REVIEW_URL`, `REVIEW_STATS` are defined in Task 1 and used with identical names everywhere after.
- **No placeholders:** every code step contains the literal code to write.
- **Unused-import guard:** Task 3 swaps `JANE_BOOKING_URL` out of each modified file's import; only `config.ts` and `book.astro` keep it (Task 3 Step 8 verifies this).
