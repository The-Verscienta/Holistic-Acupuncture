# Holistic Acupuncture Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new dedicated, indexable SEO landing page at `/holistic-acupuncture` targeting the "Holistic Acupuncture" + Milwaukee head term, linked from the footer and main nav.

**Architecture:** A single static Astro page (`virtual-velocity/src/pages/holistic-acupuncture.astro`) composed of existing components. Hardcoded SEO copy with a distinct "whole-person/integrative" angle (links to `/acupuncture` instead of duplicating it). Reuses the existing Sanity `getRandomTestimonials()` query for social proof; conditions are a hardcoded curated list (mirrors the homepage teaser) because the Sanity conditions dataset is currently sparse. Adds `FAQPage` JSON-LD; `BreadcrumbList` comes free from the existing `BaseLayout` `breadcrumbs` prop. Two small edits add internal links (nav + footer).

**Tech Stack:** Astro (static output), TypeScript frontmatter, Tailwind CSS, existing component library, Sanity client.

---

## Verification model (read first)

This codebase has **no unit-test harness for `.astro` pages**. The verification gates used throughout this plan are the project's real tooling:

- `npx astro check` — type/syntax check. **Known baseline:** there is exactly **1 pre-existing error** in `astro.config.mjs:35` (`ts(2322)` Vite/Tailwind plugin version skew) that is unrelated to this work. After each task, expect that **same 1 error** and **0 errors in `holistic-acupuncture.astro`**. Unused-import warnings (`ts(6133)`) are acceptable until a later task consumes the import.
- `npx astro build` — compiles all pages. Locally the build's *prerender* step fails on Sanity-backed pages with `Configuration must contain projectId` unless `SANITY_PROJECT_ID`/env is set; this is environmental (Cloudflare Pages has it). "Compiles" = Vite transform completes without error for the new file.
- `npm run build && npm run validate:structured-data` — validates JSON-LD in built HTML. Run in CI/deploy or locally with Sanity env. This is the gate for the FAQPage schema (Task 7 / Task 10).

Run all commands from the `virtual-velocity/` directory.

## File Structure

**Create**
- `virtual-velocity/src/pages/holistic-acupuncture.astro` — the entire landing page. One responsibility: render the `/holistic-acupuncture` route. ~250–320 lines when complete.

**Modify**
- `virtual-velocity/src/components/Navigation.astro:2-9` — add one nav item.
- `virtual-velocity/src/components/Footer.astro:52-88` — add one Quick Links item.

No other files change. No new components, no new Sanity schema.

---

### Task 1: Create page scaffold (frontmatter, imports, Sanity fetch, hero)

**Files:**
- Create: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Create the file with frontmatter + hero**

Create `virtual-velocity/src/pages/holistic-acupuncture.astro` with exactly this content:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';
import SectionHeader from '../components/SectionHeader.astro';
import FeatureCard from '../components/FeatureCard.astro';
import ServiceCard from '../components/ServiceCard.astro';
import StatCard from '../components/StatCard.astro';
import TestimonialCard from '../components/TestimonialCard.astro';
import CTASection from '../components/CTASection.astro';
import NewPatientSpecial from '../components/NewPatientSpecial.astro';
import Button from '../components/Button.astro';
import PageHero from '../components/PageHero.astro';
import { getRandomTestimonials } from '../lib/sanityQueries';
import { JANE_BOOKING_URL, CONTACT } from '../lib/config';

// Social proof reused from Sanity (same pattern as the homepage)
const testimonials = await getRandomTestimonials(3);

// Curated conditions teaser (hardcoded; mirrors the homepage because the
// Sanity conditions dataset is currently sparse). Links into /conditions.
const conditions = [
  { name: 'Headaches & Migraines', description: 'Lasting, drug-free relief from chronic headaches and migraines.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', anchor: 'pain' },
  { name: 'Chronic Pain', description: 'Address the root cause of persistent pain, not just the symptom.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', anchor: 'pain' },
  { name: 'Stress & Anxiety', description: 'Calm the nervous system and restore emotional balance naturally.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', anchor: 'mental-health' },
  { name: 'Insomnia', description: 'Reset healthy sleep patterns without dependence on medication.', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', anchor: 'mental-health' },
  { name: 'Digestive Issues', description: 'Support gut health and restore balance to your digestive system.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', anchor: 'digestive' },
  { name: "Women's Health", description: 'Whole-person support through every stage of life.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', anchor: 'womens-health' },
];
---

<BaseLayout
  title="Holistic Acupuncture in Milwaukee"
  description="Holistic acupuncture in Milwaukee that treats the whole person and the root cause — combining acupuncture, Chinese herbal medicine, cupping, and lifestyle care. 25+ years, 380,000+ treatments."
  breadcrumbs={[{name:'Home',url:'/'},{name:'Holistic Acupuncture'}]}
>
  <!-- Hero -->
  <PageHero
    title="Holistic Acupuncture in Milwaukee"
    description="Whole-person care that treats the root cause, not just the symptom. We combine acupuncture, Chinese herbal medicine, and lifestyle guidance to help your body heal naturally and stay well."
  >
    <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <Button variant="primary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
        Book Your Appointment
      </Button>
      <Button variant="tertiary" size="lg" icon="phone" href={`tel:${CONTACT.phoneRaw}`}>
        Call {CONTACT.phone}
      </Button>
    </div>
  </PageHero>
</BaseLayout>
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check`
Expected: `1 error` total (the pre-existing `astro.config.mjs:35` `ts(2322)`). **Zero** errors in `holistic-acupuncture.astro`. Warnings like `'SectionHeader' is declared but its value is never read` are expected (consumed by later tasks).

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: scaffold /holistic-acupuncture landing page with hero"
```

---

### Task 2: "What is Holistic Acupuncture?" intro section

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert the section before the closing tag**

Use Edit. Replace the single occurrence of `</BaseLayout>` with the following (this appends the section, keeping the closing tag last):

```astro
  <!-- What is Holistic Acupuncture -->
  <section class="py-16 md:py-20 lg:py-24 bg-white">
    <Container>
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-6 text-center">
          What is Holistic Acupuncture?
        </h2>
        <div class="space-y-4 text-gray-700 leading-relaxed text-lg">
          <p>
            Holistic acupuncture treats you as a whole person — body, mind, and spirit — rather than focusing on a single symptom in isolation. Rooted in traditional Chinese medicine, it looks for the underlying imbalances that drive pain, fatigue, stress, or illness, then addresses them at the source.
          </p>
          <p>
            Where a narrow approach might only target the area that hurts, holistic care considers how your sleep, digestion, stress, emotions, and lifestyle all interact. By restoring balance across these systems, your body becomes better able to heal itself and stay well long after treatment ends.
          </p>
          <p>
            At Acupuncture &amp; Holistic Health Associates in Milwaukee, every treatment plan is built around your unique constitution and health goals — blending acupuncture with complementary therapies for results that last.
          </p>
        </div>
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check`
Expected: still `1 error` (pre-existing), 0 in `holistic-acupuncture.astro`.

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add 'what is holistic acupuncture' section"
```

---

### Task 3: "The Holistic Difference" feature grid

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert the section**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <!-- The Holistic Difference -->
  <section class="py-16 md:py-20 lg:py-24 bg-sage-50">
    <Container>
      <SectionHeader title="The Holistic Difference" subtitle="What sets whole-person acupuncture apart from a symptom-only approach." />
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <FeatureCard title="Whole-Person Diagnosis" description="We assess your full health picture — pulse, tongue, history, and lifestyle — not just your chief complaint." icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" layout="centered" cardVariant="elevated" />
        <FeatureCard title="Root-Cause Focus" description="Instead of masking symptoms, we identify and treat the underlying imbalance driving them." icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" layout="centered" cardVariant="elevated" />
        <FeatureCard title="Personalized Plans" description="Your treatment is tailored to your body and goals, and adjusted as you progress." icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" layout="centered" cardVariant="elevated" />
        <FeatureCard title="Mind-Body Balance" description="We support physical, emotional, and mental wellbeing together for lasting whole-person health." icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" layout="centered" cardVariant="elevated" />
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file.

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add 'the holistic difference' feature grid"
```

---

### Task 4: "Integrative Modalities" section

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert the section**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <!-- Integrative Modalities -->
  <section class="py-16 md:py-20 lg:py-24 bg-white">
    <Container>
      <SectionHeader title="Our Integrative Therapies" subtitle="Holistic care often combines several time-tested modalities, chosen for your needs." />
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <FeatureCard title="Acupuncture" description="Ultra-fine, sterile needles stimulate the body's natural healing and restore the healthy flow of Qi." icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" layout="horizontal" cardVariant="elevated" />
        <FeatureCard title="Chinese Herbal Medicine" description="Customized herbal formulas support and extend the benefits of your acupuncture treatments." icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" layout="horizontal" cardVariant="elevated" />
        <FeatureCard title="Cupping Therapy" description="Gentle suction relieves muscle tension, improves circulation, and eases pain." icon="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" layout="horizontal" cardVariant="elevated" />
        <FeatureCard title="Moxibustion" description="Therapeutic warming of acupuncture points invigorates Qi and supports deep healing." icon="M13 10V3L4 14h7v7l9-11h-7z" layout="horizontal" cardVariant="elevated" />
        <FeatureCard title="Nutrition & Lifestyle" description="Practical food and lifestyle guidance rooted in Chinese medicine to keep you in balance." icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" layout="horizontal" cardVariant="elevated" />
        <FeatureCard title="Personalized Care" description="Every plan is built around your constitution, history, and goals — and refined as you heal." icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" layout="horizontal" cardVariant="elevated" />
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file.

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add integrative modalities section"
```

---

### Task 5: "Conditions" teaser + "What to Expect" (links to /acupuncture)

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert both sections**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <!-- Conditions we address -->
  <section class="py-16 md:py-20 lg:py-24 bg-sage-50">
    <Container>
      <SectionHeader title="Conditions We Address" subtitle="Our whole-person approach helps with a wide range of concerns — these are just a few." />
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        {conditions.map((condition) => (
          <ServiceCard
            title={condition.name}
            description={condition.description}
            href={`/conditions#${condition.anchor}`}
            icon={condition.icon}
          />
        ))}
      </div>
      <div class="text-center">
        <Button variant="primary" size="lg" icon="arrow-right" iconPosition="right" href="/conditions">
          View All Conditions We Treat
        </Button>
      </div>
    </Container>
  </section>

  <!-- What to expect (links out to /acupuncture for depth) -->
  <section class="py-16 md:py-20 lg:py-24 bg-white">
    <Container>
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-6">
          What to Expect
        </h2>
        <p class="text-lg text-gray-700 leading-relaxed mb-4">
          Your first visit begins with a thorough consultation to understand your whole health picture — your symptoms, history, and lifestyle — followed by a gentle, deeply relaxing treatment. Most patients feel little to no discomfort, and many fall asleep on the table.
        </p>
        <p class="text-lg text-gray-700 leading-relaxed">
          Want the full step-by-step?
          <a href="/acupuncture" class="text-sage-600 font-semibold hover:text-sage-700 underline">See our detailed guide to what to expect from acupuncture</a>.
        </p>
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file. (`conditions` and `ServiceCard` are now consumed.)

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add conditions teaser and what-to-expect sections"
```

---

### Task 6: "Why Milwaukee chooses us" stats + service area + testimonials

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert both sections**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <!-- Why Milwaukee patients choose us -->
  <section class="py-16 md:py-20 lg:py-24 bg-sage-50">
    <Container>
      <SectionHeader title="Why Milwaukee Chooses Us" subtitle="Authentic, effective holistic care trusted across the greater Milwaukee area for over 25 years." />
      <div class="grid sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-10">
        <StatCard value="25+" label="Years of Experience" />
        <StatCard value="380K+" label="Treatments Delivered" />
        <StatCard value="4.9★" label="Average Patient Rating" />
      </div>
      <p class="text-center text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
        From our Glendale clinic we proudly serve patients across Milwaukee, Whitefish Bay, Shorewood, Mequon, Bayside, Fox Point, River Hills, Brown Deer, and Wauwatosa.
      </p>
    </Container>
  </section>

  <!-- Testimonials (reused from Sanity) -->
  <section class="py-16 md:py-20 lg:py-24 bg-white">
    <Container>
      <SectionHeader title="What Our Patients Say" subtitle="Real stories from real people who found healing through holistic care." />
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {testimonials.map((testimonial) => (
          <TestimonialCard
            quote={testimonial.quote}
            author={testimonial.author}
            condition={testimonial.condition}
            rating={testimonial.rating}
          />
        ))}
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file. (`StatCard`, `TestimonialCard`, `testimonials` now consumed.)

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add why-milwaukee stats, service area, and testimonials"
```

---

### Task 7: FAQ section + FAQPage structured data

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Add the FAQ data + schema to the frontmatter**

Use Edit. Find this line in the frontmatter:

```astro
const testimonials = await getRandomTestimonials(3);
```

Replace it with:

```astro
const testimonials = await getRandomTestimonials(3);

// Holistic-specific FAQs (distinct from /faq and /acupuncture content)
const holisticFaqs = [
  {
    question: "What's the difference between holistic acupuncture and regular acupuncture?",
    answer: "Holistic acupuncture treats the whole person and the root cause of your symptoms — often combining acupuncture with Chinese herbal medicine, cupping, and lifestyle guidance — rather than focusing on a single symptom in isolation.",
  },
  {
    question: "What conditions can holistic acupuncture help with?",
    answer: "It can support chronic pain, headaches and migraines, stress and anxiety, insomnia, digestive issues, women's health, allergies, low energy, and overall wellness. Visit our Conditions page for the full list.",
  },
  {
    question: "Is holistic acupuncture safe?",
    answer: "Yes. When performed by a licensed acupuncturist using single-use, sterile needles, acupuncture is very safe. Side effects are rare and usually limited to minor bruising or temporary soreness at needle sites.",
  },
  {
    question: "How many sessions will I need?",
    answer: "It depends on your condition. Acute issues may resolve in 3-6 sessions, while chronic conditions often need 8-12. We'll create a personalized plan at your first visit.",
  },
  {
    question: "Do you combine acupuncture with herbs and other therapies?",
    answer: "Yes - that's the heart of holistic care. We may combine acupuncture with Chinese herbal medicine, cupping, moxibustion, and nutrition and lifestyle guidance based on your individual needs.",
  },
  {
    question: "Where are you located and who do you serve?",
    answer: "We're located in Glendale, WI, serving the greater Milwaukee area including Whitefish Bay, Shorewood, Mequon, Bayside, and nearby suburbs.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: holisticFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};
```

- [ ] **Step 2: Render the schema script right after the opening BaseLayout tag**

Use Edit. Find:

```astro
  breadcrumbs={[{name:'Home',url:'/'},{name:'Holistic Acupuncture'}]}
>
  <!-- Hero -->
```

Replace with:

```astro
  breadcrumbs={[{name:'Home',url:'/'},{name:'Holistic Acupuncture'}]}
>
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />

  <!-- Hero -->
```

- [ ] **Step 3: Add the visible FAQ section**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <!-- FAQ -->
  <section class="py-16 md:py-20 lg:py-24 bg-sage-50">
    <Container>
      <div class="max-w-3xl mx-auto">
        <SectionHeader title="Holistic Acupuncture FAQs" subtitle="Common questions about the whole-person approach to acupuncture." />
        <div class="space-y-4">
          {holisticFaqs.map((faq) => (
            <div class="bg-white rounded-[var(--radius-lg)] border border-sage-200 shadow-[var(--shadow-card)] p-6 md:p-8">
              <h3 class="text-lg font-heading font-semibold text-charcoal mb-3">{faq.question}</h3>
              <p class="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file.

- [ ] **Step 5: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add holistic FAQ section with FAQPage schema"
```

---

### Task 8: New Patient Special + final CTA

**Files:**
- Modify: `virtual-velocity/src/pages/holistic-acupuncture.astro`

- [ ] **Step 1: Insert the special offer and CTA**

Use Edit. Replace `</BaseLayout>` with:

```astro
  <NewPatientSpecial />

  <CTASection
    heading="Begin Your Holistic Healing Journey"
    description="Experience whole-person acupuncture care in Milwaukee. Book your first visit or call us with any questions."
    primaryButton={{ label: 'Book Your Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
    secondaryButton={{ label: `Call ${CONTACT.phone}`, href: `tel:${CONTACT.phoneRaw}`, icon: 'phone' }}
  />
</BaseLayout>
```

- [ ] **Step 2: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in the file. All imports are now consumed (no more `ts(6133)` warnings for this file).

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/pages/holistic-acupuncture.astro
git commit -m "feat: add new patient special and final CTA to holistic page"
```

---

### Task 9: Internal linking — main nav + footer

**Files:**
- Modify: `virtual-velocity/src/components/Navigation.astro:2-9`
- Modify: `virtual-velocity/src/components/Footer.astro:52-88`

- [ ] **Step 1: Add the nav item**

In `virtual-velocity/src/components/Navigation.astro`, find:

```astro
const navigation = [
  { name: 'About', href: '/about' },
```

Replace with:

```astro
const navigation = [
  { name: 'Holistic Acupuncture', href: '/holistic-acupuncture' },
  { name: 'About', href: '/about' },
```

- [ ] **Step 2: Add the footer Quick Links item**

In `virtual-velocity/src/components/Footer.astro`, find:

```astro
          <li>
            <a href="/acupuncture" class="text-sage-100 hover:text-white transition-colors">
              About Acupuncture
            </a>
          </li>
```

Replace with:

```astro
          <li>
            <a href="/acupuncture" class="text-sage-100 hover:text-white transition-colors">
              About Acupuncture
            </a>
          </li>
          <li>
            <a href="/holistic-acupuncture" class="text-sage-100 hover:text-white transition-colors">
              Holistic Acupuncture
            </a>
          </li>
```

- [ ] **Step 3: Verify** — `npx astro check` → `1 error` (pre-existing), 0 in `Navigation.astro` / `Footer.astro`.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/components/Navigation.astro virtual-velocity/src/components/Footer.astro
git commit -m "feat: link /holistic-acupuncture from nav and footer"
```

---

### Task 10: Full build + structured-data validation

**Files:** none (verification only)

- [ ] **Step 1: Build the site**

Run (from `virtual-velocity/`, with Sanity env available — e.g. `SANITY_PROJECT_ID` set, or run in the deploy environment): `npm run build`
Expected: build completes; `dist/holistic-acupuncture/index.html` exists.

If running locally **without** Sanity env, instead run `npx astro build` and confirm the Vite "building..."/"transformed" phase completes without error for `holistic-acupuncture.astro` (prerender of Sanity pages will fail on `projectId` — that is the known environmental limitation, not a code defect).

- [ ] **Step 2: Validate structured data**

Run: `npm run validate:structured-data`
Expected: PASS, including the new page's `FAQPage` and `BreadcrumbList` JSON-LD. (Requires Step 1's full build to have produced `dist/`.)

- [ ] **Step 3: Manual smoke check (if a preview/dev server with Sanity env is available)**

Run: `npm run preview` (after a full build) and open `/holistic-acupuncture`.
Confirm: H1 reads "Holistic Acupuncture in Milwaukee"; all 10 sections render; nav shows "Holistic Acupuncture" and highlights as active on this route; footer link present; testimonials render.

- [ ] **Step 4: Final commit (only if any fix was needed)**

```bash
git add -A
git commit -m "chore: verify holistic-acupuncture page build + structured data"
```

---

## Self-Review

**Spec coverage:**
- Dedicated page `/holistic-acupuncture` → Task 1. ✓
- Keyword in title/H1 → Task 1 (`title` prop + PageHero `title`). ✓
- Comprehensive pillar, 10 sections → Tasks 1–8 (hero, what-is, difference, modalities, conditions, what-to-expect, why-milwaukee, testimonials, FAQ, special+CTA). ✓
- Approach C (hardcoded copy + reused Sanity testimonials) → Task 1 fetch + Task 6 render; conditions hardcoded per documented data-reality deviation. ✓
- Anti-duplication (link to /acupuncture) → Task 5 what-to-expect. ✓
- FAQPage + BreadcrumbList schema → Task 7 (FAQPage) + Task 1 (`breadcrumbs` prop yields BreadcrumbList). ✓
- No redundant Service schema → honored (not added). ✓
- Footer + main nav links → Task 9. ✓
- Service-area suburbs for local intent → Task 6 + Task 7 FAQ #6. ✓
- Success criteria (build, valid schema, unique H1, original copy, reachable, ~1000–1500 words) → Task 10 + content across tasks. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete markup; FAQ answers and section copy are final. ✓

**Type/name consistency:** `faqSchema`/`holisticFaqs` defined in Task 7 frontmatter and used in Task 7 body. `testimonials` defined Task 1, used Task 6. `conditions` defined Task 1, used Task 5. Component props match verified APIs (`PageHero` title/description + slot; `FeatureCard` title/description/icon/layout/cardVariant; `ServiceCard` title/description/href/icon; `StatCard` value/label; `TestimonialCard` quote/author/condition/rating; `CTASection` heading/description/primaryButton/secondaryButton; `Button` variant/size/icon/iconPosition/href/target/rel). ✓

**Insertion-order note:** Tasks 2–8 each replace the unique `</BaseLayout>` token, appending sections in execution order — must be executed in sequence (1→10).
