# Conversion & Trust Improvements — Design

**Date:** 2026-06-08
**Status:** Approved (design), pending implementation plan

## Background

A site review of the Acupuncture & Holistic Health Associates website (Astro +
Sanity, in `virtual-velocity/`) surfaced seven conversion/trust gaps. This spec
covers the five being implemented now:

- **#1** Booking sends users off-site to Jane App with no transition.
- **#2** New-patient special CTA goes to the contact form, not booking.
- **#3** No verified-source link for the 4.8★ / 171 Google reviews.
- **#5** Limited hours (Mon–Thu) objection is never addressed.
- **#6** FAQ exists but could be more visible (top-of-funnel objection handling).

Out of scope:
- **#4** Team bios — already completed (no "Bio coming soon" placeholders remain).
- **#7** Countdown timer credibility — deferred by request.

## Goals

- Reduce booking friction and reassure users before they leave for Jane App.
- Make the new-patient offer lead straight to booking.
- Back up the review claims with a real, clickable Google source and remove the
  171-vs-500 numeric inconsistency.
- Acknowledge the Mon–Thu hours objection with an evening-availability message.
- Surface FAQ content earlier in the funnel.

## Non-Goals

- No embedded Jane booking widget (chose a branded interstitial instead).
- No third-party / paid Google reviews widget (chose a verified link instead).
- No changes to the countdown timer behavior.
- No cleanup of the legacy `_oldFaqCategories` block in `faq.astro` (unused, marked
  for removal; contains a stale address — flagged, not fixed here).

---

## Item #1 + #2 — Branded `/book` interstitial

### New page: `src/pages/book.astro`

A calm, on-brand transition page (uses `BaseLayout`) that prepares the user before
handing off to Jane App:

- Headline + reassurance: e.g. *"You'll book through Jane, our secure,
  HIPAA-compliant scheduling system."*
- Primary button **"Continue to Online Booking →"** → `JANE_BOOKING_URL`,
  **opens in a new tab** (`target="_blank" rel="noopener noreferrer"`) with explicit
  "opens in a new tab" helper text, so the clinic site stays open.
- Reassurance bullets: secure/HIPAA, what to expect on a first visit, the $59
  new-patient special (`NEW_PATIENT_SPECIAL`).
- Evening-hours reassurance line (also serves #5).
- Phone fallback: *"Prefer to talk to someone? Call (414) 332-8888"* using
  `CONTACT.phoneRaw` / `CONTACT.phone`, plus a link to `/contact`.

### Config

Add `BOOK_PATH = '/book'` to `src/lib/config.ts`. The `/book` page itself is the
only place that continues to reference `JANE_BOOKING_URL` for the off-site jump.

### Route in-site booking buttons to `/book`

Replace every in-site `JANE_BOOKING_URL` booking button with an internal link to
`BOOK_PATH` (same tab, drop `target`/`rel`). Locations:

| File | Count |
|------|-------|
| `src/components/Header.astro` | 3 |
| `src/components/Footer.astro` | 1 |
| `src/layouts/BaseLayout.astro` | 1 |
| `src/pages/index.astro` | 2 |
| `src/pages/services.astro` | 3 |
| `src/pages/holistic-acupuncture.astro` | 2 |
| `src/pages/team/[slug].astro` | 2 |

`JANE_BOOKING_URL` remains exported and used only by `book.astro`.

### #2 — New-patient CTA

In `src/components/NewPatientSpecial.astro`, change the "Schedule Your
Consultation" button href from `/contact` to `BOOK_PATH`. Countdown timer
untouched.

---

## Item #3 — Verified Google reviews link

### Config

Derive from the existing `CONTACT.address.googlePlaceId`
(`ChIJpwaRdmAeBYgRadfuDNZDi_4`):

- `GOOGLE_REVIEWS_URL` — read all reviews
  (`https://search.google.com/local/reviews?placeid=<id>`).
- `GOOGLE_WRITE_REVIEW_URL` — leave a review
  (`https://search.google.com/local/writereview?placeid=<id>`).
- `REVIEW_STATS = { rating: 4.8, count: 171, recommendPct: 98 }` — single source of
  truth for rating/count/recommend figures.

### `src/pages/reviews.astro`

- Hero stats (rating, count, recommend %) read from `REVIEW_STATS`.
- Add a prominent **"Read all 171 reviews on Google ★"** button →
  `GOOGLE_REVIEWS_URL` (new tab).
- Fix the existing "Write a Google Review" button — currently points to a generic
  Google *search* URL — to use `GOOGLE_WRITE_REVIEW_URL`.
- Reconcile the **171-vs-500 inconsistency**:
  - Rating Breakdown currently has fabricated absolute counts summing to 500
    (487 / 12 / 1). Derive counts from `REVIEW_STATS.count` × per-star percentage so
    they sum to ~171, eliminating the 500 total.
  - Final CTA copy "over 500 five-star reviews" reworded to reflect 4.8★ / 171
    Google reviews.

### `src/pages/index.astro`

Add a "Read all 171 reviews on Google" verified-source link beneath the homepage
testimonials grid.

### Verification

Confirm `src/components/StructuredData.astro` aggregateRating (if present) matches
`REVIEW_STATS` (4.8 / 171); update if inconsistent.

---

## Item #5 — Hours objection messaging

Add an evening-availability reassurance line — e.g. *"Working full-time? Evening
appointments until 7 PM, Mon–Thu."* — in:

- `src/components/OfficeHoursCard.astro` (`card` and `footer` variants).
- The `/book` interstitial page.

Phrasing must stay consistent with `HOURS` in config (no hardcoded contradictions).

---

## Item #6 — Make FAQ more visible

FAQ is already in the top nav (`Navigation.astro`) and footer (`Footer.astro`).
Add a **"Common Questions" teaser section** to `src/pages/index.astro`:

- 3–4 top objection questions (*Does acupuncture hurt? How many sessions will I
  need? Is it covered by insurance?*).
- Links to `/faq` (and optionally to specific category anchors).
- Placed before the final homepage CTA section.

Lightweight static content is acceptable (no need to fetch all FAQs on the
homepage); a "See all FAQs" button links to `/faq`.

---

## Files Touched (summary)

**New:**
- `src/pages/book.astro`

**Modified:**
- `src/lib/config.ts` — `BOOK_PATH`, `GOOGLE_REVIEWS_URL`, `GOOGLE_WRITE_REVIEW_URL`, `REVIEW_STATS`
- `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro` — booking links → `/book`
- `src/pages/index.astro` — booking links → `/book`; Google reviews link; FAQ teaser
- `src/pages/services.astro`, `src/pages/holistic-acupuncture.astro`, `src/pages/team/[slug].astro` — booking links → `/book`
- `src/components/NewPatientSpecial.astro` — CTA → `/book`
- `src/pages/reviews.astro` — `REVIEW_STATS`, Google links, breakdown/CTA reconciliation
- `src/components/OfficeHoursCard.astro` — evening-hours note
- `src/components/StructuredData.astro` — verify/align aggregateRating (only if inconsistent)

## Testing / Verification

- Dev server: confirm `/book` renders, "Continue to Online Booking" opens Jane in a
  new tab, and all booking buttons across pages land on `/book`.
- Confirm new-patient special CTA lands on `/book`.
- Confirm reviews page shows 171/4.8 consistently (hero, breakdown, CTA) and the
  Google "read all" / "write a review" links resolve to the real listing.
- Confirm evening-hours note appears in office-hours card, footer, and `/book`.
- Confirm homepage FAQ teaser renders and links to `/faq`.
- Build passes (`npm run build`).
