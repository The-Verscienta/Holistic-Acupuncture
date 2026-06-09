# Local SEO Audit Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all 10 priorities of the local-SEO audit — expand thin pages, add local body signals + FAQ schema, differentiate two competing pages, add neighborhood landing pages, and enrich Sanity content (FAQs, condition prose, blog internal links, blog titles).

**Architecture:** Four phases. **A/B/C are code** (Astro pages/components/data) verified via `npm run check`, dev preview, and `npm run validate:structured-data`. **D is Sanity migration scripts** (ESM + `@sanity/client` + `dotenv`, `--dry-run` first) run with the user's `SANITY_API_TOKEN`.

**Tech Stack:** Astro 5, Tailwind v4, Sanity CMS (`@sanity/client` ^7), `@astrojs/sitemap` (auto), Node ESM scripts.

**Working directory:** `virtual-velocity/` (all paths below are relative to it unless noted). Branch: `seo/local-audit-remediation`.

**Environment note:** `astro build`/`dev` fetch Sanity data at build time, so even code-side preview needs at least `PUBLIC_SANITY_PROJECT_ID` + `PUBLIC_SANITY_DATASET` in `.env`. `npm run check` (astro type-check) works without data. Phase D additionally needs `SANITY_API_TOKEN`.

**Source-of-truth rules (do not violate):** hours/contact/social/review-stats come from `src/lib/config.ts`; review rating/count from `REVIEW_STATS`; condition category labels from `src/types/sanity.ts`; blog queries use `_type == "blog"`. Never hardcode these.

---

## Phase A — Static-page SEO (code only)

### Task A1: Google Business Profile URL in schema `sameAs` (P10)

**Files:**
- Modify: `src/lib/config.ts` (after the `GOOGLE_WRITE_REVIEW_URL` line, ~line 54)
- Modify: `src/components/StructuredData.astro:2` (import) and `sameAs` array (~line 127–132)

- [ ] **Step 1: Add a canonical GBP URL const built from the existing Place ID**

In `src/lib/config.ts`, immediately after the `GOOGLE_WRITE_REVIEW_URL` definition, add:

```ts
// Canonical Google Business Profile URL for schema.org sameAs (stable, derived from Place ID).
export const GOOGLE_BUSINESS_URL = `https://www.google.com/maps/place/?q=place_id:${CONTACT.address.googlePlaceId}`;
```

- [ ] **Step 2: Import and add it to `sameAs`**

In `src/components/StructuredData.astro` line 2, add `GOOGLE_BUSINESS_URL` to the import:

```astro
import { CONTACT, HOURS, SITE_URL, SOCIAL, REVIEW_STATS, GOOGLE_BUSINESS_URL } from '../lib/config';
```

Then update the `sameAs` array (currently lines ~127–132) to:

```astro
  sameAs: [
    SOCIAL.facebook,
    SOCIAL.instagram,
    SOCIAL.linkedin,
    SOCIAL.twitterUrl,
    GOOGLE_BUSINESS_URL,
  ],
```

- [ ] **Step 3: Type-check and validate structured data**

Run: `npm run check`
Expected: 0 errors.
Run: `npm run validate:structured-data`
Expected: passes; the GBP URL appears in the org `sameAs` output. (If the validator needs a built `dist/`, run `npm run build` first when env is available.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/config.ts src/components/StructuredData.astro
git commit -m "feat(seo): add Google Business Profile URL to schema sameAs (P10)"
```

---

### Task A2: Expand & retitle `/acupuncture/` to a Milwaukee pillar page (P2, + P6 meta)

**Files:**
- Modify: `src/pages/acupuncture.astro` (BaseLayout props lines 15–19; add new sections; PageHero lines 21–24)

**Target visible word count: 1,500+** (currently ~705). All new copy must read naturally — no keyword stuffing.

- [ ] **Step 1: Retitle and rewrite the meta description (P2 + P6)**

Replace the `<BaseLayout ...>` opening props (lines 15–19) so `title` and `description` become:

```astro
<BaseLayout
  title="Acupuncture in Milwaukee, WI | Acupuncture & Holistic Health Associates"
  description="Acupuncture in Milwaukee & Glendale, WI. Licensed acupuncturists with 25+ years' experience treating pain, stress, fertility & more. Book your first visit today."
  breadcrumbs={[{name:'Home',url:'/'},{name:'Acupuncture in Milwaukee'}]}
>
```

(Meta description is 152 chars — within the 145–160 target and includes the city.)

- [ ] **Step 2: Localize the hero**

Change the `PageHero` (lines 21–24) to:

```astro
  <PageHero
    title="Acupuncture in Milwaukee, WI"
    description="Trusted acupuncture and traditional Chinese medicine for Milwaukee and Glendale residents — natural, lasting relief from pain, stress, and chronic conditions."
  />
```

- [ ] **Step 3: Add a "Why Milwaukee residents choose acupuncture" section**

Insert a new `<section>` immediately AFTER the "What is Acupuncture" section (after line 82, before the "How Acupuncture Works" section). Use the existing markup idiom (`<section class="py-16 md:py-20 lg:py-24 bg-white">` ... `<Container>` ... `<SectionHeader .../>`). Content brief — write ~250–300 words covering:
  - H2: **"Why Milwaukee Residents Choose Acupuncture"**
  - Milwaukee's climate (long winters) and lifestyle factors that drive chronic pain, stress, and seasonal allergies.
  - Growing demand for drug-free, non-surgical care among Milwaukee-area patients.
  - Mention the clinic serves patients from **Milwaukee, Glendale, Shorewood, Whitefish Bay, Mequon, Bayside, Fox Point, and Wauwatosa** (match `areaServed` in StructuredData.astro — do not invent cities).
  - Natural references to "acupuncture in Milwaukee" / "Milwaukee acupuncture clinic".

- [ ] **Step 4: Add a "What to expect at our Glendale clinic" section**

After the existing "What to Expect During Your Visit" section (after line 137). Content brief — ~200–250 words:
  - H2: **"What to Expect at Our Glendale Clinic"**
  - Location context: in Glendale, WI, minutes from Milwaukee's north side and the North Shore suburbs; free parking; calm, comfortable treatment rooms.
  - Hours framing must come from config semantics (Mon–Thu appointments incl. evenings; Friday admin day) — describe generally, do NOT hardcode the hour strings (they live in `HOURS`).
  - Insurance/cost overview (in-network with major providers; verify coverage) — keep consistent with FAQ/services copy.
  - Link to `/services` ("see our transparent pricing") and `/contact`.

- [ ] **Step 5: Add a "Conditions we treat with acupuncture in Milwaukee" cross-link section**

After the section from Step 4. Content brief — ~150–200 words + links:
  - H2: **"Conditions We Treat with Acupuncture"**
  - 2–3 sentences, then descriptive internal links to key condition pages, e.g. `<a href="/conditions">explore all conditions we treat</a>` plus a few specific ones if known slugs exist (use `/conditions` as the safe hub link if unsure of slugs).

- [ ] **Step 6: Add the P5 cross-link to the holistic page**

Within the Step 5 section (or as a short paragraph above the final CTA), add one sentence linking to the holistic page with descriptive anchor text:

```astro
<p class="text-gray-700 leading-relaxed mt-4">
  Interested in a whole-person approach? Learn about our
  <a href="/holistic-acupuncture" class="text-sage-600 hover:text-sage-700 underline">holistic acupuncture and Chinese medicine in Milwaukee</a>.
</p>
```

- [ ] **Step 7: Verify word count and type-check**

Run: `npm run check`
Expected: 0 errors.
Run (rough visible-word estimate, strips tags): `node -e "const fs=require('fs');const t=fs.readFileSync('src/pages/acupuncture.astro','utf8').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');console.log('approx words:',t.split(' ').length)"`
Expected: comfortably above the prior count; confirm the prose sections are the bulk. Preview `/acupuncture` in `npm run dev` if env available and visually confirm sections render.

- [ ] **Step 8: Commit**

```bash
git add src/pages/acupuncture.astro
git commit -m "feat(seo): retitle /acupuncture for Milwaukee + expand to pillar page (P2, P6)"
```

---

### Task A3: Differentiate `/holistic-acupuncture/` from `/acupuncture/` (P5)

**Files:**
- Modify: `src/pages/holistic-acupuncture.astro` (BaseLayout props + add reciprocal cross-link)

The holistic page is already strong (~1,258 words, own FAQ array). Goal: lock distinct keyword targets and add a reciprocal cross-link — NOT a rewrite.

- [ ] **Step 1: Read the page's current BaseLayout `title`/`description` and H1/PageHero**

Run: `grep -n "title=\|description=\|<h1\|PageHero" src/pages/holistic-acupuncture.astro | head`
Confirm the title/H1 target "holistic" + "Milwaukee" (e.g. "Holistic Acupuncture in Milwaukee"). If the `<title>` lacks "Milwaukee", update it to:
`title="Holistic Acupuncture & Chinese Medicine in Milwaukee, WI | Acupuncture & Holistic Health Associates"`
and ensure the meta description includes "Milwaukee"/"Glendale" + "Chinese medicine" / "whole-person". Only change if not already distinct from A2's title.

- [ ] **Step 2: Add a reciprocal cross-link to `/acupuncture`**

Near the intro or before the final CTA, add a descriptive link so the two pages reference each other (avoids cannibalization, helps Google understand the relationship):

```astro
<p class="text-gray-700 leading-relaxed mt-4">
  New to acupuncture? Start with our overview of
  <a href="/acupuncture" class="text-sage-600 hover:text-sage-700 underline">acupuncture in Milwaukee</a>,
  then explore how our holistic, whole-person approach goes further.
</p>
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: 0 errors. Confirm `/acupuncture` and `/holistic-acupuncture` now have distinct titles and link to each other.

- [ ] **Step 4: Commit**

```bash
git add src/pages/holistic-acupuncture.astro
git commit -m "feat(seo): differentiate holistic vs general acupuncture pages w/ cross-links (P5)"
```

---

### Task A4: Reviews page title + local intro (P9)

**Files:**
- Modify: `src/pages/reviews.astro` (BaseLayout props lines 29–33; add intro paragraph after the hero stats block, ~line 59)

- [ ] **Step 1: Retitle + meta (P9 + P6)**

Replace lines 29–33 BaseLayout props:

```astro
<BaseLayout
  title="Patient Reviews — Best Acupuncture in Milwaukee, WI | Acupuncture & Holistic Health Associates"
  description="Read real patient reviews of our Milwaukee & Glendale, WI acupuncture clinic. See why patients rate our care 4.8 stars across 171 Google reviews."
  breadcrumbs={[{name:'Home',url:'/'},{name:'Patient Reviews'}]}
>
```

NOTE: the rating/count in the meta description mirror `REVIEW_STATS` (4.8 / 171). If those values differ from `REVIEW_STATS` at implementation time, update the meta text to match — `REVIEW_STATS` is the source of truth.

- [ ] **Step 2: Add a location/rating intro paragraph using `REVIEW_STATS` (no hardcoded numbers in body)**

Immediately after the closing `</PageHero>` (line 59), add a short intro section:

```astro
  <section class="py-10 md:py-12 bg-white">
    <Container>
      <p class="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed">
        Serving Milwaukee, Glendale, and the North Shore suburbs, our {REVIEW_STATS.rating}-star
        rating across {REVIEW_STATS.count} Google reviews reflects the trust patients place in our
        acupuncture and traditional Chinese medicine care. Here's what they have to say.
      </p>
    </Container>
  </section>
```

(Do NOT invent a founding year — none is verified in config. Location + `REVIEW_STATS` context only.)

- [ ] **Step 3: Type-check and commit**

Run: `npm run check` → 0 errors.

```bash
git add src/pages/reviews.astro
git commit -m "feat(seo): reviews title + local intro for Milwaukee intent (P9)"
```

---

### Task A5: Meta-description local specificity sweep (P6)

**Files:**
- Modify: `src/pages/services.astro:152` (description)
- Verify/modify: other key pages' BaseLayout `description` props as found.

- [ ] **Step 1: Fix the services meta description (title already has "Milwaukee")**

Replace line 152 description with (153 chars, adds Glendale + benefit):

```astro
  description="Acupuncture services & transparent pricing in Milwaukee & Glendale, WI — consultations, treatment packages, cupping & herbal medicine. See costs & book today."
```

- [ ] **Step 2: Sweep remaining key pages for missing city in meta**

Run: `grep -rn "description=" src/pages/*.astro | grep -iv "milwaukee\|glendale\|wisconsin"`
For each result that is a primary landing page (e.g. `conditions.astro`, `team/*`, `index.astro` if applicable), update the description to include "Milwaukee" or "Glendale, WI" + a benefit, 145–160 chars. Do NOT touch legal pages (`privacy.astro`, `terms.astro`, `404.astro`) or `contact-success.astro`. Write the exact replacement string for each in the commit.

- [ ] **Step 3: Type-check and commit**

Run: `npm run check` → 0 errors.

```bash
git add src/pages
git commit -m "feat(seo): add Milwaukee/Glendale to meta descriptions on key pages (P6)"
```

---

## Phase B — Condition-page template upgrade (P1 structural)

### Task B1: Local-SEO sections + condition FAQ + FAQ schema in `[slug].astro`

**Files:**
- Modify: `src/pages/conditions/[slug].astro` (frontmatter ~line 56; add helper + sections; add JSON-LD)

This lifts **every** condition page at once: local signals, a condition FAQ block, and FAQPage JSON-LD — all generated from `condition.name`. Guard everything so a condition with no `symptoms` still renders cleanly.

- [ ] **Step 1: Build a condition-FAQ + local-areas helper in frontmatter**

In the frontmatter (after line 56, after `categoryLabel`), add:

```ts
// Suburbs we serve — keep in sync with areaServed in StructuredData.astro.
const SERVICE_AREAS = ['Milwaukee', 'Glendale', 'Shorewood', 'Whitefish Bay', 'Mequon', 'Bayside', 'Fox Point', 'Wauwatosa'];

// Generated, condition-specific FAQ (used for both on-page UI and JSON-LD).
const conditionFaqs = [
  {
    question: `Can acupuncture help with ${condition.name.toLowerCase()} in Milwaukee?`,
    answer: `Yes. Our licensed acupuncturists in Glendale, WI regularly treat ${condition.name.toLowerCase()} for patients across the Milwaukee area, using acupuncture and traditional Chinese medicine to address both symptoms and root causes.`,
  },
  {
    question: `How many acupuncture sessions are needed for ${condition.name.toLowerCase()}?`,
    answer: condition.treatmentDuration
      ? `Most patients follow a course of ${condition.treatmentDuration}. We create a personalized plan at your first visit and adjust it based on your progress.`
      : `It varies by individual. Acute issues may improve in 3–6 sessions, while chronic conditions often need 8–12. We create a personalized plan at your first visit.`,
  },
  {
    question: `Is acupuncture for ${condition.name.toLowerCase()} covered by insurance in Wisconsin?`,
    answer: `Many Wisconsin insurance plans cover acupuncture, especially for pain-related conditions. We're in-network with several major providers and can help verify your coverage before you book.`,
  },
];

const conditionFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: conditionFaqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};
```

- [ ] **Step 2: Emit the FAQPage JSON-LD**

Immediately inside `<BaseLayout ...>` (right after the opening tag on line 59), add:

```astro
  <script type="application/ld+json" set:html={JSON.stringify(conditionFaqSchema)} />
```

- [ ] **Step 3: Add a localized "Why Milwaukee patients choose acupuncture for {name}" section**

Inside the main content `<div class="max-w-3xl">`, after the `howHelpsHtml` block (after line 103), add:

```astro
        <div class="mb-12">
          <h2 class="text-2xl font-heading font-bold text-charcoal mb-4">
            Why Milwaukee &amp; Glendale Patients Choose Acupuncture for {condition.name}
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            At Acupuncture &amp; Holistic Health Associates in Glendale, WI, we help patients
            throughout the Milwaukee area find natural relief from {condition.name.toLowerCase()}.
            Our licensed acupuncturists combine acupuncture with traditional Chinese medicine to
            treat the root cause — not just the symptoms.
          </p>
          <p class="text-gray-700 leading-relaxed">
            We welcome patients from {SERVICE_AREAS.slice(1).join(', ')} and across greater Milwaukee.
            Conveniently located with free parking, our calm clinic makes it easy to fit care into
            your week. <a href="/contact" class="text-sage-600 hover:text-sage-700 underline">Contact us</a>
            or <a href="/services" class="text-sage-600 hover:text-sage-700 underline">view our pricing</a> to get started.
          </p>
        </div>
```

- [ ] **Step 4: Add the condition FAQ UI block**

After the Step 3 block (still inside `max-w-3xl`, before the related-conditions block at line 113), add:

```astro
        <div class="mb-12">
          <h2 class="text-2xl font-heading font-bold text-charcoal mb-4">Frequently Asked Questions</h2>
          <div class="space-y-4">
            {conditionFaqs.map((faq) => (
              <Card variant="bordered" padding="none" class="bg-white overflow-hidden">
                <details class="group">
                  <summary class="flex items-center justify-between cursor-pointer p-5 hover:bg-sage-50 transition-colors list-none">
                    <h3 class="text-base md:text-lg font-heading font-semibold text-charcoal pr-4">{faq.question}</h3>
                    <svg class="w-5 h-5 text-sage-600 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </summary>
                  <div class="px-5 pb-5 pt-1"><p class="text-gray-700 leading-relaxed">{faq.answer}</p></div>
                </details>
              </Card>
            ))}
          </div>
        </div>
```

- [ ] **Step 5: Type-check**

Run: `npm run check`
Expected: 0 errors. (`Card` is already imported at line 4.)

- [ ] **Step 6: Verify rendering (needs Sanity read env)**

If `.env` has `PUBLIC_SANITY_PROJECT_ID`: `npm run dev`, open any `/conditions/<slug>`, confirm the new H2, FAQ accordion, and (via view-source) the FAQPage JSON-LD render. Run `npm run validate:structured-data` after a build to confirm no schema errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/conditions/[slug].astro
git commit -m "feat(seo): local sections + FAQ + FAQPage schema on all condition pages (P1)"
```

---

## Phase C — Neighborhood landing pages (P7)

### Task C1: Locations data file

**Files:**
- Create: `src/data/locations.ts`

- [ ] **Step 1: Create the data file**

Cities align with `areaServed` in `StructuredData.astro`. `blurb` and `landmark` must be factual/neutral (no invented claims).

```ts
export interface LocationEntry {
  slug: string;        // URL segment under /acupuncture/
  name: string;        // City name
  metaTitle: string;
  metaDescription: string;  // 145–160 chars
  intro: string;       // hero/intro paragraph
  proximity: string;   // factual proximity-to-Glendale-clinic sentence
}

export const LOCATIONS: LocationEntry[] = [
  {
    slug: 'shorewood',
    name: 'Shorewood',
    metaTitle: 'Acupuncture in Shorewood, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Looking for acupuncture in Shorewood, WI? Our Glendale clinic is minutes away — pain relief, stress, fertility & more. Book your first visit today.',
    intro: 'Acupuncture and traditional Chinese medicine for Shorewood, WI residents — natural relief from pain, stress, and chronic conditions, just minutes from the village.',
    proximity: 'Our clinic in Glendale is a short drive north of Shorewood, making regular acupuncture care easy to fit into your routine.',
  },
  {
    slug: 'whitefish-bay',
    name: 'Whitefish Bay',
    metaTitle: 'Acupuncture in Whitefish Bay, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture for Whitefish Bay, WI residents at our nearby Glendale clinic. Drug-free relief for pain, stress, headaches, fertility & more. Book today.',
    intro: 'Trusted acupuncture and Chinese medicine for Whitefish Bay, WI — whole-person care for pain, stress, sleep, and wellness, close to home.',
    proximity: 'Whitefish Bay neighbors Glendale, so our clinic is only a few minutes away for convenient, consistent treatment.',
  },
  {
    slug: 'mequon',
    name: 'Mequon',
    metaTitle: 'Acupuncture near Mequon, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Mequon, WI at our Glendale clinic — licensed acupuncturists treating pain, stress, fertility & more. Free parking. Book your visit.',
    intro: 'Acupuncture and traditional Chinese medicine for Mequon, WI residents — natural, lasting relief at our nearby Glendale clinic.',
    proximity: 'Just south of Mequon, our Glendale location offers an easy drive down for appointments.',
  },
  {
    slug: 'glendale',
    name: 'Glendale',
    metaTitle: 'Acupuncture in Glendale, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture in Glendale, WI — our clinic is right here in your community. Pain, stress, fertility & wellness care from licensed acupuncturists. Book today.',
    intro: 'Your local acupuncture clinic in Glendale, WI — acupuncture and traditional Chinese medicine for pain, stress, and whole-person wellness.',
    proximity: 'Our clinic is located right here in Glendale with free parking and flexible weekday and evening appointments.',
  },
  {
    slug: 'bayside',
    name: 'Bayside',
    metaTitle: 'Acupuncture near Bayside, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Bayside, WI at our Glendale clinic. Drug-free relief for chronic pain, stress, headaches & more from licensed acupuncturists. Book today.',
    intro: 'Acupuncture and Chinese medicine for Bayside, WI residents — natural relief and whole-person care at our nearby Glendale clinic.',
    proximity: 'A short drive south brings Bayside residents to our Glendale clinic.',
  },
  {
    slug: 'fox-point',
    name: 'Fox Point',
    metaTitle: 'Acupuncture near Fox Point, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Fox Point, WI at our Glendale clinic — pain, stress, sleep & fertility care from licensed acupuncturists. Free parking. Book today.',
    intro: 'Acupuncture and traditional Chinese medicine for Fox Point, WI — natural, lasting relief close to home.',
    proximity: 'Fox Point is just minutes from our Glendale clinic for convenient, regular care.',
  },
];
```

- [ ] **Step 2: Type-check and commit**

Run: `npm run check` → 0 errors.

```bash
git add src/data/locations.ts
git commit -m "feat(seo): add neighborhood locations data for landing pages (P7)"
```

---

### Task C2: Neighborhood landing-page template

**Files:**
- Create: `src/pages/acupuncture/[location].astro`

Route `/acupuncture/{slug}` does NOT collide with the static `/acupuncture` page. The sitemap (`@astrojs/sitemap`) auto-includes these new routes — no manual sitemap edit needed.

- [ ] **Step 1: Create the template (600+ words per page via shared sections + per-city copy)**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/Container.astro';
import Button from '../../components/Button.astro';
import CTASection from '../../components/CTASection.astro';
import { LOCATIONS } from '../../data/locations';
import { CONTACT } from '../../lib/config';

export function getStaticPaths() {
  return LOCATIONS.map((loc) => ({ params: { location: loc.slug }, props: { loc } }));
}

const { loc } = Astro.props;
---

<BaseLayout
  title={loc.metaTitle}
  description={loc.metaDescription}
  breadcrumbs={[{name:'Home',url:'/'},{name:'Acupuncture',url:'/acupuncture'},{name:loc.name}]}
>
  <section class="bg-gradient-to-br from-sage-50 to-warm-white py-12 md:py-16">
    <Container>
      <h1 class="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">Acupuncture in {loc.name}, WI</h1>
      <p class="text-lg text-gray-600 max-w-2xl">{loc.intro}</p>
    </Container>
  </section>

  <section class="py-12 md:py-16 bg-white">
    <Container>
      <div class="max-w-3xl space-y-6 text-gray-700 leading-relaxed">
        <p>{loc.proximity} At Acupuncture &amp; Holistic Health Associates, our licensed acupuncturists bring 25+ years of experience treating chronic pain, headaches, stress and anxiety, insomnia, digestive issues, women's health concerns, and more with acupuncture and traditional Chinese medicine.</p>

        <h2 class="text-2xl font-heading font-bold text-charcoal pt-4">Acupuncture Care for {loc.name} Residents</h2>
        <p>Whether you're dealing with a long-standing injury, recurring migraines, or the everyday stress of a busy life, acupuncture offers a safe, drug-free path to relief. We treat the whole person — not just the symptom — and build a personalized plan around your goals. Many {loc.name} patients come to us after trying conventional approaches and looking for a natural complement to their care.</p>

        <h2 class="text-2xl font-heading font-bold text-charcoal pt-4">What to Expect</h2>
        <p>Your first visit includes a thorough consultation and your first treatment. We use ultra-fine, single-use sterile needles, and most patients find sessions deeply relaxing. We'll explain your plan, expected timeline, and anything you can do at home to support your results. Explore <a href="/services" class="text-sage-600 hover:text-sage-700 underline">our services and transparent pricing</a> or browse the <a href="/conditions" class="text-sage-600 hover:text-sage-700 underline">conditions we treat</a>.</p>

        <h2 class="text-2xl font-heading font-bold text-charcoal pt-4">Convenient for the Milwaukee North Shore</h2>
        <p>Serving {loc.name} and the surrounding Milwaukee North Shore communities, our Glendale clinic offers free parking and flexible weekday and evening appointments. New to acupuncture? Start with our overview of <a href="/acupuncture" class="text-sage-600 hover:text-sage-700 underline">acupuncture in Milwaukee</a>, or learn about our <a href="/holistic-acupuncture" class="text-sage-600 hover:text-sage-700 underline">holistic, whole-person approach</a>.</p>

        <div class="pt-4">
          <Button variant="primary" size="lg" href="/contact">Book Your First Visit</Button>
        </div>
      </div>
    </Container>
  </section>

  <CTASection
    heading={`Ready to try acupuncture in ${loc.name}?`}
    description="Schedule a consultation and discover how acupuncture can help you feel your best."
    primaryButton={{ label: 'Contact Us', href: '/contact' }}
    secondaryButton={{ label: `Call ${CONTACT.phone}`, href: `tel:+1${CONTACT.phone.replace(/\D/g, '')}`, icon: 'phone' }}
  />
</BaseLayout>
```

- [ ] **Step 2: Type-check + word-count spot check**

Run: `npm run check` → 0 errors.
Each rendered page = per-city intro/proximity + ~450 shared words ≈ 600+ words with distinct H1/title/meta. Confirm by previewing `/acupuncture/shorewood` if env available.

- [ ] **Step 3: Commit**

```bash
git add src/pages/acupuncture/[location].astro
git commit -m "feat(seo): neighborhood acupuncture landing pages (P7)"
```

---

## Phase D — Sanity content migrations (require `SANITY_API_TOKEN`)

**Prereq:** `.env` with `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`. All scripts: ESM (`type: module`), `dotenv.config()`, `--dry-run` default-safe, env guard that exits non-zero if missing, atomic per-doc patch. Pattern mirrors `scripts/fix-null-images.js`.

### Task D1: Seed FAQ documents (P3)

**Files:**
- Create: `scripts/seed-faqs.js`
- Modify (after seeding verified): `src/pages/faq.astro` (remove dead `_oldFaqCategories` array, lines 50–212)

- [ ] **Step 1: Write the seeding script**

Extract the ~35 Q&As from the `_oldFaqCategories` array in `src/pages/faq.astro` and map each category title to its schema value key (`faqCategories` in `src/types/sanity.ts`): About Acupuncture→`about-acupuncture`, Treatment & Process→`treatment-process`, Insurance & Payment→`insurance-payment`, Appointments & Policies→`appointments-policies`, Safety & Side Effects→`safety-side-effects`, Our Practice→`our-practice`. Append ~6–8 NEW local Q&As (see Step 2). Each doc gets a deterministic `_id` so re-runs are idempotent.

```js
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});
const dryRun = process.argv.includes('--dry-run');

// slugify question -> stable id
const idFor = (q) => 'faq-' + q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

// FAQS: [{question, answer, category}], category = schema value key.
// Copy the ~35 entries verbatim from _oldFaqCategories in src/pages/faq.astro,
// plus the new local Q&As from Step 2.
const FAQS = [
  // { question: '...', answer: '...', category: 'about-acupuncture' },
];

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---');
  const existing = await client.fetch(`*[_type == "faq"]._id`);
  const existingSet = new Set(existing);
  let created = 0, skipped = 0, order = 0;
  for (const f of FAQS) {
    const _id = idFor(f.question);
    if (existingSet.has(_id)) { skipped++; continue; }
    const doc = { _id, _type: 'faq', question: f.question, answer: f.answer, category: f.category, order: order++, featured: false };
    console.log(`${dryRun ? '[dry] would create' : 'creating'}: ${f.question}`);
    if (!dryRun) await client.createIfNotExists(doc);
    created++;
  }
  console.log(`\nDone. created=${created} skipped=${skipped} total=${FAQS.length}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Add the new local Q&As to the `FAQS` array**

Add these (each 80–150 words when written out; expand answers to full length, category in parens):
  - "Is there an acupuncture clinic near Shorewood or Whitefish Bay?" (our-practice) — yes; Glendale location minutes away; serves North Shore.
  - "How much does acupuncture cost in Milwaukee?" (insurance-payment) — give the same ranges used elsewhere; mention insurance/packages.
  - "Does insurance cover acupuncture in Wisconsin?" (insurance-payment) — many WI plans do, esp. pain; in-network providers; we verify.
  - "Where is your acupuncture clinic located?" (our-practice) — Glendale, WI address from `CONTACT.address.full`; free parking; serves Milwaukee area. (Hardcode the address string in the script is fine; or read from config — script can't import the .astro, so paste the verified address.)
  - "Do you offer evening acupuncture appointments?" (appointments-policies) — Mon–Thu including evenings; Friday admin day. Describe generally; don't invent exact times beyond what `HOURS` implies.
  - "Can acupuncture help with seasonal allergies in Wisconsin?" (about-acupuncture) — yes; Wisconsin spring/fall allergies; link concept to conditions.

- [ ] **Step 3: Dry-run, then live**

Run: `node scripts/seed-faqs.js --dry-run`
Expected: lists ~41 "would create" entries, `skipped=0` on first run.
Run: `node scripts/seed-faqs.js`
Expected: `created=~41 skipped=0`.
Re-run live to confirm idempotency:
Run: `node scripts/seed-faqs.js`
Expected: `created=0 skipped=~41`.

- [ ] **Step 4: Verify on the page + remove dead code**

With env set: `npm run dev`, open `/faq`, confirm all categories now render with questions, and the FAQPage JSON-LD includes them (view source). Then delete the now-dead `_oldFaqCategories` array (lines ~50–212) from `src/pages/faq.astro`. Run `npm run check` → 0 errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-faqs.js src/pages/faq.astro
git commit -m "feat(seo): seed FAQ documents into Sanity + remove dead static array (P3)"
```

---

### Task D2: Blog internal-link enrichment (P4)

**Files:**
- Create: `scripts/link-blog-posts.js`

Inserts 2–3 descriptive internal links + up to 2 authority links into each `_type == "blog"` post's portable-text body. Idempotent (skip a target if its URL already appears as a link in the body). Conservative: only links the FIRST plain-text occurrence of a mapped keyword per post, and only adds a link mark — never rewrites text.

- [ ] **Step 1: Write the keyword→URL map and the linker**

```js
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});
const dryRun = process.argv.includes('--dry-run');

// Ordered: most specific first. URLs are internal site pages.
const KEYWORD_LINKS = [
  { re: /\bchronic pain\b/i, href: '/conditions' },
  { re: /\bback pain\b/i, href: '/conditions' },
  { re: /\bneck pain\b/i, href: '/conditions' },
  { re: /\bheadaches?\b/i, href: '/conditions' },
  { re: /\bmigraines?\b/i, href: '/conditions' },
  { re: /\b(stress|anxiety)\b/i, href: '/conditions' },
  { re: /\binsomnia|sleep\b/i, href: '/conditions' },
  { re: /\bfertility\b/i, href: '/conditions' },
  { re: /\bacupuncture\b/i, href: '/acupuncture' },
  { re: /\bholistic\b/i, href: '/holistic-acupuncture' },
  { re: /\b(pricing|cost|insurance)\b/i, href: '/services' },
];
const MAX_INTERNAL = 3;

// NOTE: refine condition hrefs to specific slugs once `node -e` confirms slugs via
// `*[_type=="condition"]{slug}`. Until then /conditions is a safe, valid hub link.

function existingLinkHrefs(block) {
  return new Set((block.markDefs || []).filter((m) => m._type === 'link').map((m) => m.href));
}

function linkifyPost(body) {
  let added = 0;
  const usedHref = new Set();
  // collect hrefs already linked anywhere in the post
  for (const blk of body) if (blk._type === 'block') for (const h of existingLinkHrefs(blk)) usedHref.add(h);

  for (const blk of body) {
    if (added >= MAX_INTERNAL) break;
    if (blk._type !== 'block' || !Array.isArray(blk.children)) continue;
    for (const map of KEYWORD_LINKS) {
      if (added >= MAX_INTERNAL || usedHref.has(map.href)) continue;
      // find first text span matching, not already marked as a link
      const spanIdx = blk.children.findIndex(
        (c) => c._type === 'span' && map.re.test(c.text || '') && !(c.marks || []).some((mk) => (blk.markDefs || []).some((d) => d._key === mk && d._type === 'link'))
      );
      if (spanIdx === -1) continue;
      const span = blk.children[spanIdx];
      const m = span.text.match(map.re);
      const start = m.index, end = start + m[0].length;
      const keyBase = 'lnk' + Math.abs(hashStr(map.href + blk._key)).toString(36);
      const markDef = { _key: keyBase, _type: 'link', href: map.href };
      // split span into before / linked / after
      const before = { ...span, _key: span._key + 'a', text: span.text.slice(0, start) };
      const linked = { ...span, _key: span._key + 'b', text: span.text.slice(start, end), marks: [...(span.marks || []), keyBase] };
      const after = { ...span, _key: span._key + 'c', text: span.text.slice(end) };
      const replacement = [before, linked, after].filter((s) => s.text.length > 0);
      blk.children.splice(spanIdx, 1, ...replacement);
      blk.markDefs = [...(blk.markDefs || []), markDef];
      usedHref.add(map.href);
      added++;
    }
  }
  return added;
}

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---');
  const posts = await client.fetch(`*[_type == "blog" && defined(body)]{ _id, title, body }`);
  let changed = 0, totalLinks = 0;
  for (const p of posts) {
    const added = linkifyPost(p.body);
    if (added > 0) {
      changed++; totalLinks += added;
      console.log(`${dryRun ? '[dry] ' : ''}${p.title}: +${added} link(s)`);
      if (!dryRun) await client.patch(p._id).set({ body: p.body }).commit();
    }
  }
  console.log(`\nDone. posts changed=${changed} links added=${totalLinks} of ${posts.length} posts.`);
}
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Confirm condition slugs, then optionally specialize hrefs**

Run: `node -e "import('@sanity/client').then(async({createClient})=>{require('dotenv').config();const c=createClient({projectId:process.env.PUBLIC_SANITY_PROJECT_ID,dataset:'production',apiVersion:'2024-01-01',useCdn:true});console.log(await c.fetch('*[_type==\"condition\"]{name,\"s\":slug.current}'))})"`
Expected: list of conditions + slugs. If a "Back Pain" → `back-pain` slug exists, change that map entry's `href` to `/conditions/back-pain`, etc. Otherwise keep `/conditions`.

- [ ] **Step 3: Dry-run on the full set**

Run: `node scripts/link-blog-posts.js --dry-run`
Expected: per-post `+N link(s)` lines and a summary; sanity-check a few titles. No writes.

- [ ] **Step 4: Spot-check ONE post live, then full run**

Temporarily limit to one post for a safe live check (add `[0...1]` to the GROQ in Step 1, run live, inspect that doc in Studio: links present, text intact, marks valid), then restore the query. Then:
Run: `node scripts/link-blog-posts.js`
Expected: summary with `posts changed` ≈ most posts, `links added` ≈ 2–3× that.
Re-run to confirm idempotency:
Run: `node scripts/link-blog-posts.js --dry-run`
Expected: near-zero additions (hrefs already present are skipped).

- [ ] **Step 5: Verify rendering**

`npm run dev`, open 2–3 blog posts, confirm internal links render with correct anchor text and destinations, and body text is unbroken.

- [ ] **Step 6: Commit**

```bash
git add scripts/link-blog-posts.js
git commit -m "feat(seo): internal-link enrichment script for blog posts (P4)"
```

---

### Task D3: Per-condition prose seeder (P1 deep)

**Files:**
- Create: `scripts/seed-condition-content.js`

Fills `detailedDescription` / `howAcupunctureHelps` (portable-text block arrays) ONLY for condition docs where those fields are empty/very short. Never overwrites substantial existing prose unless `--force`.

- [ ] **Step 1: Write the seeder**

```js
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

let keyN = 0;
const block = (text, style = 'normal') => ({
  _type: 'block', _key: 'b' + keyN++, style,
  markDefs: [], children: [{ _type: 'span', _key: 's' + keyN++, text, marks: [] }],
});

// Generic-but-personalized portable text from the condition's own fields.
function detailedFor(c) {
  const name = c.name, lower = name.toLowerCase();
  const sx = (c.symptoms || []).join(', ');
  return [
    block(`Understanding ${name}`, 'h2'),
    block(`${name} affects many people across the Milwaukee area, and it can interfere with work, sleep, and everyday life. ${c.description || ''}`.trim()),
    block(sx ? `Common signs include ${sx}. Left unaddressed, ${lower} can become a chronic pattern that's harder to resolve.` : `Left unaddressed, ${lower} can become a chronic pattern that's harder to resolve.`),
    block(`At Acupuncture & Holistic Health Associates in Glendale, WI, we take time to understand the root cause of your ${lower} — not just the symptoms — so we can build a treatment plan tailored to you.`),
  ];
}
function helpsFor(c) {
  const lower = c.name.toLowerCase();
  return [
    block(`Acupuncture supports the body's natural ability to heal and regulate itself. For ${lower}, treatment can help reduce pain and inflammation, calm the nervous system, improve circulation, and restore balance.`),
    block(`We often combine acupuncture with traditional Chinese medicine techniques — such as cupping, herbal medicine, and lifestyle guidance — for a whole-person approach. ${c.treatmentDuration ? `Most patients follow a course of ${c.treatmentDuration}.` : 'Your plan and timeline are personalized at your first visit.'}`),
    block(`If you're dealing with ${lower} in the Milwaukee or Glendale area, we'd be glad to help you explore whether acupuncture is right for you.`),
  ];
}

const isThin = (arr) => !Array.isArray(arr) || arr.length === 0 ||
  arr.reduce((n, b) => n + ((b.children || []).reduce((m, s) => m + (s.text || '').length, 0)), 0) < 200;

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---', force ? '(force)' : '');
  const conds = await client.fetch(`*[_type == "condition"]{ _id, name, description, symptoms, treatmentDuration, detailedDescription, howAcupunctureHelps }`);
  let patched = 0;
  for (const c of conds) {
    const patch = {};
    if (force || isThin(c.detailedDescription)) patch.detailedDescription = detailedFor(c);
    if (force || isThin(c.howAcupunctureHelps)) patch.howAcupunctureHelps = helpsFor(c);
    if (Object.keys(patch).length === 0) { console.log(`skip (has content): ${c.name}`); continue; }
    console.log(`${dryRun ? '[dry] would patch' : 'patching'}: ${c.name} [${Object.keys(patch).join(', ')}]`);
    if (!dryRun) await client.patch(c._id).set(patch).commit();
    patched++;
  }
  console.log(`\nDone. patched=${patched} of ${conds.length} conditions.`);
}
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Dry-run, review which conditions are thin**

Run: `node scripts/seed-condition-content.js --dry-run`
Expected: lists conditions that would be patched vs skipped. Review the list — if a condition you expected to have content shows as thin, inspect it in Studio first.

- [ ] **Step 3: Live run + verify**

Run: `node scripts/seed-condition-content.js`
Expected: `patched=N`. Then `npm run dev`, open a patched `/conditions/<slug>`, confirm the detailed description + "How Acupuncture Helps" now render with the new prose alongside the Phase B local section + FAQ.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-condition-content.js
git commit -m "feat(seo): seed per-condition detailed prose for thin condition docs (P1)"
```

---

### Task D4: Localize blog titles for symptom/condition posts (P8)

**Files:**
- Create: `scripts/localize-blog-titles.js`

Appends ` | Acupuncture in Milwaukee, WI` to titles of symptom/condition posts only. Idempotent (skip if already contains "Milwaukee"). Leaves pure-TCM/philosophy posts untouched.

- [ ] **Step 1: Write the classifier + updater**

```js
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});
const dryRun = process.argv.includes('--dry-run');

const SUFFIX = ' | Acupuncture in Milwaukee, WI';
// Symptom/condition signal words → localize. Philosophy/TCM-only posts won't match.
const CLINICAL = /\b(pain|headache|migraine|anxiety|stress|insomnia|sleep|fertility|allergy|allergies|arthritis|sciatica|fibromyalgia|nausea|digestive|ibs|depression|menopause|pms|injury|inflammation|neck|back|shoulder|knee)\b/i;

async function run() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  console.log(dryRun ? '--- DRY RUN ---' : '--- LIVE RUN ---');
  const posts = await client.fetch(`*[_type == "blog"]{ _id, title }`);
  let updated = 0, skippedLocal = 0, skippedNonClinical = 0;
  for (const p of posts) {
    if (!p.title) continue;
    if (/milwaukee/i.test(p.title)) { skippedLocal++; continue; }
    if (!CLINICAL.test(p.title)) { skippedNonClinical++; continue; }
    const next = p.title + SUFFIX;
    console.log(`${dryRun ? '[dry] ' : ''}"${p.title}" -> "${next}"`);
    if (!dryRun) await client.patch(p._id).set({ title: next }).commit();
    updated++;
  }
  console.log(`\nDone. updated=${updated} skipped(local)=${skippedLocal} skipped(non-clinical)=${skippedNonClinical} total=${posts.length}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Dry-run and eyeball the classification**

Run: `node scripts/localize-blog-titles.js --dry-run`
Expected: a list of clinical posts being localized; verify philosophy posts (e.g. "Yin and Yang") are skipped as non-clinical. If misclassified, adjust the `CLINICAL` regex and re-dry-run.

- [ ] **Step 3: Live run + idempotency check**

Run: `node scripts/localize-blog-titles.js`
Expected: `updated=N`. Re-run:
Run: `node scripts/localize-blog-titles.js --dry-run`
Expected: `updated=0` (all now contain "Milwaukee").

- [ ] **Step 4: Commit**

```bash
git add scripts/localize-blog-titles.js
git commit -m "feat(seo): localize symptom/condition blog titles for Milwaukee (P8)"
```

---

## Final verification (after all phases)

- [ ] Run `npm run check` → 0 errors.
- [ ] Run `npm run build` (with full `.env`) → succeeds; confirm new `/acupuncture/*` routes appear in `dist/`.
- [ ] Run `npm run validate:structured-data` → org `sameAs` includes GBP URL; FAQPage schema valid on `/faq` and condition pages.
- [ ] Spot-check live word counts: `/acupuncture` ≥1,500; each `/acupuncture/<city>` ≥600; condition pages substantially longer than before.
- [ ] Use the `superpowers:finishing-a-development-branch` skill to decide merge/PR.

## Plan ↔ Spec coverage check

- P1 → Task B1 (structural) + Task D3 (deep prose) ✓
- P2 → Task A2 ✓
- P3 → Task D1 (CMS seeding; schema already existed) ✓
- P4 → Task D2 ✓
- P5 → Task A2 Step 6 + Task A3 ✓
- P6 → Task A2 Step 1 + Task A5 ✓
- P7 → Task C1 + C2 ✓
- P8 → Task D4 ✓
- P9 → Task A4 ✓
- P10 → Task A1 ✓
