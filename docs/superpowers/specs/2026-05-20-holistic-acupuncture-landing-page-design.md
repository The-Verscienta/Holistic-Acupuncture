# Design: `/holistic-acupuncture` SEO Landing Page

**Date:** 2026-05-20
**Status:** Approved design — pending implementation plan
**Site:** holisticacupuncture.net (Astro + Sanity, Cloudflare Pages)
**Root:** `virtual-velocity/`

## Goal

Create a new dedicated, indexable landing page that ranks for the head term
**"Holistic Acupuncture"** (blended with Milwaukee local intent). The homepage now
targets "Milwaukee Acupuncture"; this page targets the complementary "Holistic
Acupuncture" query, matching the brand/domain and avoiding cannibalization.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Placement | New dedicated page at `/holistic-acupuncture` |
| Primary keyword | "Holistic Acupuncture" + "Milwaukee" |
| Depth | Comprehensive pillar (~1000–1500 words) |
| Content sourcing | **Approach C (hybrid)** — hardcoded SEO copy; reuse existing Sanity queries (`getRandomTestimonials`, `getAllConditions`) for proof/conditions blocks, mirroring the homepage |
| Internal linking | Add to **footer Quick Links** AND **main nav** |

## Anti-duplication guardrail

The existing `/acupuncture` page ("About Acupuncture") already covers
*what acupuncture is, how it works, what to expect*. To avoid duplicate-content
dilution, this new page is written around a **distinct angle**: the whole-person /
integrative / root-cause *holistic* philosophy. Where mechanics overlap, the page
**links to** `/acupuncture` rather than repeating it.

## File / component plan

**New file**
- `virtual-velocity/src/pages/holistic-acupuncture.astro`

**Reused components** (no changes): `BaseLayout`, `Container`, `PageHero`,
`SectionHeader`, `FeatureCard`, `ServiceCard`, `CTASection`, `NewPatientSpecial`,
`TestimonialCard`, `Button`, `CloudflareImage`.

**Reused Sanity queries** (already exist): `getRandomTestimonials(n)`,
`getAllConditions()`.

**Edited files (internal linking)**
- `virtual-velocity/src/components/Navigation.astro` — add
  `{ name: 'Holistic Acupuncture', href: '/holistic-acupuncture' }` as the first
  nav item.
- `virtual-velocity/src/components/Footer.astro` — add a "Holistic Acupuncture"
  link to the Quick Links list.

## SEO / metadata

- **Title prop:** `Holistic Acupuncture in Milwaukee`
  → renders `Holistic Acupuncture in Milwaukee | Acupuncture & Holistic Health Associates`
- **H1:** `Holistic Acupuncture in Milwaukee`
- **Meta description:** whole-person / integrative angle + Milwaukee, ~150 chars.
- **Breadcrumbs:** `[{name:'Home',url:'/'},{name:'Holistic Acupuncture'}]`
  (uses existing BaseLayout `breadcrumbs` prop → BreadcrumbList schema).
- **FAQPage JSON-LD:** built from a hardcoded array of 4–6 holistic-specific Q&As,
  rendered via `<script type="application/ld+json" set:html={...} />` (same pattern
  as `faq.astro`).
- **No additional `Service`/`MedicalProcedure` JSON-LD** on this page — the
  site-wide `MedicalBusiness` schema (with `makesOffer` + `medicalSpecialty`) already
  renders on every page via `StructuredData.astro`. FAQPage + BreadcrumbList here is
  sufficient. (Deferred to avoid redundant/competing entities.)

## Page structure (sections, in order)

1. **Hero** — use the existing `PageHero` component (consistent with other inner
   pages). H1 "Holistic Acupuncture in Milwaukee" via its `title`, whole-person
   subhead via `description`, and Book (Jane) / Call CTA `Button`s placed in
   `PageHero`'s default slot (same pattern as `conditions.astro`).
2. **What is Holistic Acupuncture?** — defines the whole-person, root-cause,
   integrative philosophy. Distinct from `/acupuncture`'s "what is acupuncture".
3. **The Holistic Difference** — `FeatureCard` grid: whole-person diagnosis ·
   root-cause focus · personalized treatment plans · mind-body-spirit balance.
4. **Integrative Modalities** — cards (`FeatureCard`/`ServiceCard`): Acupuncture ·
   Chinese Herbal Medicine · Cupping · Moxibustion · Nutrition & Lifestyle guidance.
5. **Conditions we address** — pulled via `getAllConditions()`, summarized, linking
   to `/conditions` (and category anchors where useful).
6. **What to expect** — brief overview that **links to `/acupuncture`** for the full
   step-by-step (internal link; avoids duplication).
7. **Why Milwaukee patients choose us** — trust stats (25+ years, 380,000+
   treatments, 4.9★) + service-area mention (Glendale, Whitefish Bay, Shorewood,
   Mequon, Bayside, Fox Point, River Hills, Brown Deer, Wauwatosa) for local intent.
8. **Testimonials** — `getRandomTestimonials(3)` via `TestimonialCard` (reuse).
9. **FAQ** — 4–6 holistic-specific Q&As + FAQPage schema (above).
10. **New Patient Special + final CTA** — `NewPatientSpecial` + `CTASection`.

## Contextual internal links (within page body)

- → `/acupuncture` (acupuncture mechanics / what to expect)
- → `/conditions` (conditions detail)
- → `/services` (pricing & sessions)
- → `/contact` and Jane booking URL (conversions)
- → `/about` (credentials / Dr. David Curry, 25+ yrs)

## Out of scope (YAGNI / deferred)

- No new Sanity `landingPage` document type (Approach B rejected).
- No `aggregateRating`/review-star schema (requires verified review count/source;
  tracked separately).
- No redesign of existing pages or components beyond the two link additions.

## Success criteria

- New page builds and renders (Astro build passes; locally requires Sanity env).
- Valid `FAQPage` + `BreadcrumbList` structured data (project
  `validate:structured-data` script passes on built output).
- Unique H1/title front-loading "Holistic Acupuncture" + "Milwaukee".
- Body copy is original (not duplicated from `/acupuncture`).
- Page reachable from footer Quick Links and main nav; active-state highlighting
  works (nav uses path-prefix `isActive`).
- ~1000–1500 words of substantive, on-topic content.
