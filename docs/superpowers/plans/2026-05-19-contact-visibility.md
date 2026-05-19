# Contact Page Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/contact` page visually peer to the Jane App booking CTA across the desktop header, mobile menu, and the two end-of-page CTA sections that currently bury contact behind a phone link.

**Architecture:** Twin-CTA pairing — Book stays the filled primary button; Contact becomes a tertiary (outlined) button immediately adjacent to it. No layout reflow beyond adding one button per surface; no new components.

**Tech Stack:** Astro 5, Tailwind CSS, existing `Button.astro` component (uses `tertiary`/`outline` variants), no JS framework changes.

**Spec:** [docs/superpowers/specs/2026-05-19-contact-visibility-design.md](../specs/2026-05-19-contact-visibility-design.md)

**Audit refinement (decided post-spec):** Only `index.astro` and `services.astro` need CTA-section updates. The other 4 audited pages (`about`, `conditions`, `reviews`, `acupuncture`, plus `faq`) already make `/contact` the primary or secondary CTA — touching them would reduce, not increase, Contact visibility.

**Testing approach:** This project has no JS unit test framework (only `astro check` for types and `astro build` for the production build). TDD doesn't apply to visual button changes. Each task verifies with `astro check` after the edit; a final task does a full `astro build` and a manual browser sweep against the spec's acceptance criteria.

---

## File Structure

Files modified by this plan:

- `virtual-velocity/src/components/Header.astro` — desktop header right-cluster, mobile menu bottom block
- `virtual-velocity/src/pages/index.astro` — swap end-of-page CTASection secondary from phone to Contact
- `virtual-velocity/src/pages/services.astro` — swap end-of-page CTASection secondary from phone to Contact

No files created. No files deleted.

---

## Task 1: Promote phone link from `2xl` to `xl` in desktop header

**Files:**
- Modify: `virtual-velocity/src/components/Header.astro:53`

This is the smallest change and is independent of everything else. Doing it first means even if later tasks slip, this small win is already in.

- [ ] **Step 1: Make the edit**

In `virtual-velocity/src/components/Header.astro`, change the phone link's responsive visibility class.

Find this line (line 53):

```html
          class="hidden 2xl:inline-flex items-center gap-2 text-sage-700 hover:text-sage-600 font-semibold whitespace-nowrap transition-colors flex-shrink-0"
```

Replace `hidden 2xl:inline-flex` with `hidden xl:inline-flex`:

```html
          class="hidden xl:inline-flex items-center gap-2 text-sage-700 hover:text-sage-600 font-semibold whitespace-nowrap transition-colors flex-shrink-0"
```

- [ ] **Step 2: Type-check**

Run from `virtual-velocity/`:

```bash
npm run check
```

Expected: passes with no new errors. (Pre-existing warnings unrelated to this file are fine.)

- [ ] **Step 3: Commit**

```bash
git add virtual-velocity/src/components/Header.astro
git commit -m "Show header phone link from xl breakpoint, not just 2xl"
```

---

## Task 2: Add Contact button to desktop header

**Files:**
- Modify: `virtual-velocity/src/components/Header.astro:63-65`

- [ ] **Step 1: Make the edit**

In `virtual-velocity/src/components/Header.astro`, locate the desktop CTA block (currently just the Book Appointment button) on lines 62-65:

```astro
        <!-- CTA Button -->
        <Button variant="primary" size="md" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer" class="flex-shrink-0">
          <span class="holiday-btn-emoji" aria-hidden="true"></span>Book Appointment
        </Button>
```

Replace with a wrapping flex container that holds both buttons side-by-side:

```astro
        <!-- CTA Buttons: Contact (secondary) + Book (primary) — twin CTAs -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <Button variant="tertiary" size="md" icon="mail" href="/contact" class="flex-shrink-0">
            Contact Us
          </Button>
          <Button variant="primary" size="md" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer" class="flex-shrink-0">
            <span class="holiday-btn-emoji" aria-hidden="true"></span>Book Appointment
          </Button>
        </div>
```

Notes:
- `variant="tertiary"` renders `bg-white text-sage-700 border-2 border-sage-300` (defined in `Button.astro:37`) — visually pairs with the primary but doesn't compete.
- `icon="mail"` is already defined in the Button component's icon set (`Button.astro:58`).
- The wrapping `div` with `gap-2` keeps the two buttons tight together as a pair rather than spaced like nav items.

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 3: Visual check at lg breakpoint**

Start the dev server:

```bash
npm run dev
```

Open the site in a browser and resize the window to ~1024-1100px wide (the `lg` breakpoint). Verify:
- The right cluster shows: Navigation, search icon, Contact button, Book Appointment button (phone link is hidden — it appears at `xl`/1280px+).
- No horizontal overflow; no nav items wrap or get cut off.
- Buttons sit side-by-side as a visual pair, not separated by big gaps.

If overflow happens at `lg`, revert Task 1 (move phone back to `2xl:`) and re-check. The Contact button is the priority.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/components/Header.astro
git commit -m "Add Contact CTA button to desktop header alongside Book Appointment"
```

---

## Task 3: Add Contact button to mobile menu

**Files:**
- Modify: `virtual-velocity/src/components/Header.astro:128-143`

- [ ] **Step 1: Make the edit**

In `virtual-velocity/src/components/Header.astro`, locate the mobile menu's bottom action block (currently lines ~128-143). It looks like this:

```astro
      <!-- Mobile: Phone & CTA -->
      <div class="mt-6 flex flex-col gap-3">
        <a
          href={`tel:+1${CONTACT.phone.replace(/\D/g, '')}`}
          class="flex items-center justify-center gap-2 text-lg font-medium text-sage-700 hover:text-sage-600 py-3"
          aria-label={`Call us at ${CONTACT.phone}`}
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          {CONTACT.phone}
        </a>
        <Button variant="primary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer" class="w-full justify-center">
          <span class="holiday-btn-emoji" aria-hidden="true"></span>Book Appointment
        </Button>
      </div>
```

Add a Contact button between the phone link and the Book Appointment button. The new block should look like this (only the inserted `<Button>` is new):

```astro
      <!-- Mobile: Phone & CTAs (twin: Contact + Book) -->
      <div class="mt-6 flex flex-col gap-3">
        <a
          href={`tel:+1${CONTACT.phone.replace(/\D/g, '')}`}
          class="flex items-center justify-center gap-2 text-lg font-medium text-sage-700 hover:text-sage-600 py-3"
          aria-label={`Call us at ${CONTACT.phone}`}
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          {CONTACT.phone}
        </a>
        <Button variant="tertiary" size="lg" icon="mail" href="/contact" class="w-full justify-center">
          Contact Us
        </Button>
        <Button variant="primary" size="lg" icon="calendar" href={JANE_BOOKING_URL} target="_blank" rel="noopener noreferrer" class="w-full justify-center">
          <span class="holiday-btn-emoji" aria-hidden="true"></span>Book Appointment
        </Button>
      </div>
```

The existing `mobileNav` array (which already includes a "Contact" text link near the top of the menu, defined at lines 12-22) is **not** modified — the new button is an additional, more prominent path.

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 3: Visual check on mobile**

With `npm run dev` running, open the site in a browser and resize to a phone width (e.g., 375px or use DevTools device emulation). Tap the hamburger to open the mobile menu. Verify:
- Three stacked items appear at the bottom of the menu, in order: phone link → "Contact Us" (white outlined button) → "Book Appointment" (filled green button).
- Both buttons are full-width.
- Tapping "Contact Us" navigates to `/contact` and closes the menu.
- Tapping "Book Appointment" opens Jane in a new tab.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/components/Header.astro
git commit -m "Add Contact CTA button to mobile menu alongside Book Appointment"
```

---

## Task 4: Swap secondary CTA on homepage from phone to Contact

**Files:**
- Modify: `virtual-velocity/src/pages/index.astro:155-160`

- [ ] **Step 1: Make the edit**

In `virtual-velocity/src/pages/index.astro`, find the `<CTASection>` block (lines ~155-160):

```astro
  <CTASection
    heading="Ready to Begin Your Healing Journey?"
    description="Take the first step towards better health and wellness. Our experienced team is here to help you achieve your health goals."
    primaryButton={{ label: 'Schedule Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
    secondaryButton={{ label: 'Call Us (414) 332-8888', href: 'tel:+14143328888', icon: 'phone' }}
  />
```

Replace the `secondaryButton` line. Heading, description, and primaryButton are unchanged:

```astro
  <CTASection
    heading="Ready to Begin Your Healing Journey?"
    description="Take the first step towards better health and wellness. Our experienced team is here to help you achieve your health goals."
    primaryButton={{ label: 'Schedule Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
    secondaryButton={{ label: 'Contact Us', href: '/contact', icon: 'mail', variant: 'outline' }}
  />
```

The phone number is still prominently shown in the header (Task 1) and footer; removing it as a secondary here trades one phone surface for the contact-form path the spec is about. The CTASection sits on a dark gradient background (`from-sage-600 to-healing-blue` — see `CTASection.astro:25`), so `variant="outline"` (white border, transparent background) is the readable choice — `tertiary` would be invisible on dark.

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 3: Visual check**

With `npm run dev` running, navigate to `http://localhost:4321/` and scroll to the bottom CTA section. Verify:
- "Schedule Appointment" button (filled, on the left at desktop) opens Jane in a new tab when clicked.
- "Contact Us" button (white outline, with mail icon) navigates to `/contact` when clicked.
- Both buttons are visually balanced on the dark gradient background.

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/pages/index.astro
git commit -m "Pair homepage end-CTA with Contact instead of phone-call secondary"
```

---

## Task 5: Swap secondary CTA on services page from phone to Contact

**Files:**
- Modify: `virtual-velocity/src/pages/services.astro:395-400`

- [ ] **Step 1: Make the edit**

In `virtual-velocity/src/pages/services.astro`, find the `<CTASection>` block (lines ~395-400):

```astro
  <CTASection
    heading="Ready to Start Your Healing Journey?"
    description="Book your appointment today and take the first step towards better health."
    primaryButton={{ label: 'Book Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
    secondaryButton={{ label: `Call ${CONTACT.phone}`, href: `tel:+1${CONTACT.phone.replace(/[^0-9]/g, '')}`, icon: 'phone' }}
  />
```

Replace the `secondaryButton` line:

```astro
  <CTASection
    heading="Ready to Start Your Healing Journey?"
    description="Book your appointment today and take the first step towards better health."
    primaryButton={{ label: 'Book Appointment', href: JANE_BOOKING_URL, target: '_blank', rel: 'noopener noreferrer' }}
    secondaryButton={{ label: 'Contact Us', href: '/contact', icon: 'mail', variant: 'outline' }}
  />
```

If the `CONTACT` import on this page is now unused (the page may use `CONTACT` elsewhere — check before removing), leave it. Don't introduce an unrelated cleanup. Run a quick search to confirm: `grep -n "CONTACT" virtual-velocity/src/pages/services.astro` — if there are other usages, leave the import alone.

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: passes. If a warning appears about an unused `CONTACT` import, only then remove the import line.

- [ ] **Step 3: Visual check**

With `npm run dev` running, navigate to `http://localhost:4321/services` and scroll to the bottom. Verify the same things as Task 4 step 3 (Schedule → Jane, Contact → /contact, both buttons balanced).

- [ ] **Step 4: Commit**

```bash
git add virtual-velocity/src/pages/services.astro
git commit -m "Pair services end-CTA with Contact instead of phone-call secondary"
```

---

## Task 6: Final verification — full build and acceptance criteria sweep

This task has no code changes; it verifies the whole plan against the spec's acceptance criteria.

- [ ] **Step 1: Full production build**

```bash
cd virtual-velocity
npm run build
```

Expected: build completes without errors. (Warnings about pre-existing issues unrelated to header/index/services pages are fine.)

- [ ] **Step 2: Acceptance-criteria sweep**

Start the production preview or dev server:

```bash
npm run dev
```

Walk through each acceptance criterion from the spec ([docs/superpowers/specs/2026-05-19-contact-visibility-design.md](../specs/2026-05-19-contact-visibility-design.md)) and confirm in the browser:

1. **Desktop `lg` (1024px) viewport:** header shows nav, search, Contact button, Book button — no overflow, no wrapping. ✓ / ✗
2. **Desktop `xl` (1280px) viewport:** header *also* shows the phone link to the left of the Contact button. ✓ / ✗
3. **Visual hierarchy:** Contact button (white outlined) is clearly paired with but subordinate to the filled Book button. They look like a unit. ✓ / ✗
4. **Mobile menu:** three stacked items at the bottom — phone link, Contact button, Book button — in that order. ✓ / ✗
5. **Homepage end-CTA:** Schedule (Jane) + Contact Us pairing. ✓ / ✗
6. **Services page end-CTA:** Book (Jane) + Contact Us pairing. ✓ / ✗
7. **No regression on Book:** clicking Book Appointment anywhere still opens `https://ahha.janeapp.com` in a new tab. ✓ / ✗
8. **No regression on the four pages we deliberately left alone** (`about`, `conditions`, `reviews`, `acupuncture`): their end-of-page CTAs still render and `/contact` is still the primary CTA target. ✓ / ✗

- [ ] **Step 3: Report results**

If all 8 criteria pass, the plan is complete. If any fail, file the failure as a follow-up task and decide whether to revert or patch in this branch before merging.

No commit for this task (verification only).

---

## Out-of-scope reminders

These were considered and deliberately excluded from this plan:

- Homepage hero CTAs — stays focused on booking.
- Footer changes — contact already prominent there.
- Changes to `/contact` page content.
- Modifications to `CTASection.astro` or `Button.astro` components.
- Analytics/click tracking on the new Contact buttons (a reasonable follow-up but not in this change).
- Adding a phone-link secondary back to pages where we replaced phone with Contact — the header now shows phone at `xl+`, and the footer carries it; phone visibility is not regressing in aggregate.
