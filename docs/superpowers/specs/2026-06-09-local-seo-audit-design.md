# Local SEO Audit Remediation — Design Spec

**Date:** 2026-06-09
**Status:** Approved (design)
**Scope:** Full remediation of the 10-priority local-SEO audit for the Holistic Acupuncture
(Acupuncture & Holistic Health Associates) site — Astro + Sanity, deployed on Cloudflare Pages.

## Goal

Lift the site's local-SEO competitiveness for "acupuncture Milwaukee" and adjacent suburb
queries by: expanding thin pages, adding local body signals + FAQ schema, differentiating two
cannibalizing pages, creating neighborhood landing pages, and enriching CMS content
(condition prose, blog internal links, blog titles).

## Constraints & Environment

- Build root: `virtual-velocity/`.
- Condition pages and blog posts are **CMS-driven** (Sanity). Their body copy is *data*, not code.
- This dev environment has **no `.env`** → no Sanity read/write from here. CMS work is delivered as
  runnable scripts under `scripts/`; user supplies `SANITY_API_TOKEN` + `PUBLIC_SANITY_PROJECT_ID`
  in a local `.env` and we run/verify them.
- Source-of-truth rules (from project memory): hours/contact/social all come from
  `src/lib/config.ts`; condition category labels from `src/types/sanity.ts`; blog queries use
  `_type == "blog"`. Never hardcode hours/contact.

## Phases

The audit is decomposed into four independently-shippable phases. A/B/C are pure code
(verifiable via `astro build` + preview). D requires the Sanity token.

### Phase A — Static-page SEO (code only)

- **A1 (P2) `acupuncture.astro`** — Retitle to `Acupuncture in Milwaukee, WI | Acupuncture &
  Holistic Health Associates`. Expand visible copy to **1,500+ words** with H2 sections: why
  Milwaukee/Glendale residents seek acupuncture, what to expect at the Glendale clinic, conditions
  treated (cross-links to `/conditions/*`), insurance/cost overview. Meta description includes city.
- ~~**A3 (P3)**~~ **CORRECTION — moved to Phase D (D4).** `faq.astro` is CMS-driven
  (`getAllFAQs()`, `_type == "faq"`) and **already emits FAQPage JSON-LD**. The ~186-word audit
  reading means there are near-zero `faq` documents in Sanity. So P3 is a *content-seeding* task,
  not a code edit. The file's legacy `_oldFaqCategories` array (~35 written Q&As) is ready-made
  seed content; add ~6–8 new local Q&As (Shorewood/Whitefish Bay, Milwaukee cost, WI insurance).
- **A2 (P5) cannibalization** — **Differentiate, do not 301.** `/acupuncture/` = general clinical
  pillar targeting "acupuncture Milwaukee"; `/holistic-acupuncture/` retains "holistic acupuncture /
  Chinese medicine Milwaukee". Ensure distinct H1s/titles/intro content and add a cross-link between
  the two pages. Rationale: the holistic page already ranks (1,258 words); preserving the exact-match
  `/acupuncture/` URL for the head term beats collapsing it.
- **A5 (P6) meta descriptions** — Audit key pages (services, acupuncture, and any missing city).
  Each meta description 145–160 chars and includes "Milwaukee" or "Glendale, WI" + a benefit.
- **A4 (P9) `reviews.astro`** — Retitle to `Patient Reviews — Best Acupuncture in Milwaukee, WI`
  (or close). Add an intro paragraph with location + rating context (sourced from `REVIEW_STATS` —
  single source of truth, per recent refactor; do not hardcode the rating/count).
- **A6 (P10) GBP in schema** — Add the Google Business Profile URL to `sameAs` in
  `StructuredData.astro`. **Resolved:** `config.ts` already has `CONTACT.address.googlePlaceId`
  (`ChIJpwaRdmAeBYgRadfuDNZDi_4`); build a stable canonical URL from it —
  `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}` — exposed via a new
  `GOOGLE_BUSINESS_URL` const in `config.ts`. No fragile `share.google` link needed.

### Phase B — Condition-page template upgrade (code; lifts every condition at once) — P1 structural

One edit to `src/pages/conditions/[slug].astro`. Generated from `condition.name` / `condition.symptoms`:

- A **"Why Milwaukee & Glendale patients choose acupuncture for {name}"** H2 section with genuine
  area signals (Shorewood, Whitefish Bay, Mequon, Glendale).
- A **condition-specific FAQ** block (e.g. "How many acupuncture sessions for {name}?",
  "Is acupuncture for {name} covered by insurance in Wisconsin?") + **FAQPage / MedicalWebPage
  JSON-LD**.
- Natural Milwaukee/Glendale mentions in the hero intro and CTA copy.

This addresses Priority 1's structural gap (local signals, word count floor, FAQ schema) for all
condition pages without CMS access. Generic-but-personalized copy is acceptable here; Phase D
deepens unique per-condition prose. Keep template additions clearly bounded (a helper that builds
the local section + FAQ from the condition) so the file stays focused.

### Phase C — Neighborhood landing pages (code; new files) — P7

- New data file `src/data/locations.ts` listing suburbs (Shorewood, Whitefish Bay, Mequon, Glendale,
  Fox Point, Bayside, etc., aligned with the schema's `areaServed`), each with name, slug, blurb,
  distance/landmark context.
- New template `src/pages/acupuncture/[location].astro` generating a 600+ word page per location,
  each linking to `/services`, key `/conditions/*`, and `/contact`. Distinct title/meta/H1 per city.
- Verify routing does not collide with `acupuncture.astro` (it won't — `/acupuncture/` vs
  `/acupuncture/{slug}`), and add the new URLs to the sitemap if the sitemap is manually maintained.

### Phase D — Sanity migrations (scripts + token)

All scripts idempotent, dry-run-capable, and following existing `scripts/*.js` patch conventions.

- **D1 (P4) `scripts/link-blog-posts.js`** — For each `_type == "blog"` post: scan portable-text
  body, map keywords → target condition/service pages, insert **2–3** descriptive internal links
  (skip if already linked), optionally add **1–2** authority links (PubMed/NIH). Report
  added/skipped counts. Patches published doc + draft (per the known null-field/draft caveat).
- **D2 (P1 deep) `scripts/seed-condition-content.js`** — For condition docs with thin/empty
  `detailedDescription` / `howAcupunctureHelps`, generate quality portable-text personalized by
  name + symptoms (700–1,200 words target). Never overwrite substantial existing prose without a
  flag.
- **D3 (P8) `scripts/localize-blog-titles.js`** — Heuristically classify symptom/condition posts vs
  pure-TCM/philosophy posts; append `| Acupuncture in Milwaukee, WI` to the former only. Idempotent
  (skip if already localized). Report reclassification counts.
- **D4 (P3) `scripts/seed-faqs.js`** — Seed `_type == "faq"` documents (the page is CMS-driven and
  the FAQPage schema already exists; it just has no data). Source the ~35 Q&As from the legacy
  `_oldFaqCategories` array in `faq.astro` (question/answer/category map to the faq schema) plus
  ~6–8 new local Q&As. Idempotent via deterministic `_id` per question (skip existing). After
  seeding succeeds, delete the dead `_oldFaqCategories` array from `faq.astro` (code cleanup).

## Data Flow

- Code pages: Astro SSG → static HTML at build. Condition/blog data fetched from Sanity at build
  time via `sanityClient` (`src/lib/sanity.ts`).
- JSON-LD: emitted in page `<head>` (FAQ pages, condition pages) and via `StructuredData.astro`
  (org/GBP). Validate with `scripts/validate-structured-data.js`.
- Phase D scripts: write directly to Sanity via `@sanity/client` with `SANITY_API_TOKEN`.

## Error Handling

- Phase D scripts: dry-run mode default OR explicit `--apply` flag; print a diff/summary; exit
  non-zero on auth/connection failure; never partial-write a single doc (patch atomically).
- Template (Phase B): guard all generated sections so a condition missing `symptoms` still renders
  cleanly (no empty FAQ/heading).

## Testing / Verification

- A/B/C: `npm run build` (or `astro build`) succeeds; preview the affected routes; confirm word
  counts and that JSON-LD validates (`validate-structured-data.js` + manual Rich Results check).
  Confirm no hardcoded hours/contact/rating — all from config / `REVIEW_STATS`.
- D: run each script in dry-run first; verify before/after counts; spot-check 3–5 docs in Studio;
  confirm idempotency (second run = zero changes).

## Inputs Required From User

1. **GBP URL** for A6 (P10). Provided: `https://share.google/ZFyNAWjBqCDWWmMmG` (confirmed →
   "Acupuncture & Holistic Health Associates"). Use as the working `sameAs` value; swap in the
   canonical `https://maps.google.com/?cid=…` URL (copyable from the Maps address bar) during
   implementation if available — more stable than a `share.google` redirect.
2. `.env` with `SANITY_API_TOKEN` + `PUBLIC_SANITY_PROJECT_ID` (+ dataset) for Phase D.

## Out of Scope

- Visual/design redesign of pages (content + SEO structure only).
- Off-site SEO (link building, GBP post management).
- Unrelated refactors beyond what each touched file needs.

## Sequencing

A → B → C ship as code PR(s) and can land before the token arrives. D runs once `.env` is provided.
Each phase is independently verifiable and revertible.
