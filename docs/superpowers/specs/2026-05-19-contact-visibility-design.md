# Contact Page Visibility — Design

**Date:** 2026-05-19
**Status:** Approved
**Scope:** Astro site at `virtual-velocity/`

## Problem

The site funnels visitors heavily toward the Jane App booking page (`https://ahha.janeapp.com`), but many prospective patients want to talk to the practice before booking. The current UI gives them no equally-visible path:

- **Desktop header:** "Contact" is not in the nav at all. The only conversion action is the filled "Book Appointment" button. The phone number is hidden below the `2xl` breakpoint (~1536px), so most laptop users see neither a phone link nor a contact link.
- **End-of-page CTA sections:** Several pages only pass a `primaryButton` (Book Appointment) to `CTASection.astro` — no secondary action.
- **Mobile menu:** "Contact" exists as a nav link and the phone number is shown, but Book Appointment is the only button-styled CTA, so Contact has visibly less weight.

Goal: make Contact "just as visible as" booking on every conversion surface, without diluting the booking CTA.

## Approach: Twin CTAs

Treat Book and Contact as a peer pair of actions everywhere they appear. Both are buttons. Book stays the filled primary; Contact is a tertiary (white background, sage outline) — visually paired but subordinate, so the booking CTA still wins the eye.

Rejected alternatives:
- Adding "Contact" as a 7th text item in the nav — text links don't read as "ways to reach us", they read as "pages in the site". Fails the visibility goal.
- A top utility bar above the header — adds vertical real estate, feels dated, competes with the main header styling.

## Changes

### 1. Desktop header — `virtual-velocity/src/components/Header.astro`

Right-side desktop cluster, in order:

```
Navigation | Search | Phone (xl+) | Contact button | Book Appointment button
```

- **Phone visibility.** Change the phone link wrapper's responsive class from `hidden 2xl:inline-flex` → `hidden xl:inline-flex`. Phone is then visible on most laptops, not just ultrawide.
- **New Contact button**, inserted immediately before the Book Appointment button:
  - `variant="tertiary"` (white background, sage-300 border, sage-700 text — pairs visually with the primary but doesn't compete)
  - `size="md"` (matches the existing Book Appointment button)
  - `icon="mail"`, `href="/contact"`, label `"Contact Us"`
  - Use `flex-shrink-0` (matches Book Appointment) to prevent collapse
- **Spacing risk.** At the `lg` breakpoint (1024px) the right-side cluster gets tight after adding the new button. If overflow happens in practice, the fallback is reverting the phone link to `2xl`-only (the Contact button is the priority). Verify in a browser before committing.

The desktop `Navigation.astro` component is **not** modified — Contact is a button, not a nav link, by deliberate design choice.

### 2. End-of-page CTA sections

Audit every page that imports `CTASection.astro` and ensure it passes both `primaryButton` (Book) and `secondaryButton` (Contact).

Pages to audit:
- `virtual-velocity/src/pages/index.astro`
- `virtual-velocity/src/pages/about.astro`
- `virtual-velocity/src/pages/services.astro`
- `virtual-velocity/src/pages/conditions.astro`
- `virtual-velocity/src/pages/reviews.astro`
- `virtual-velocity/src/pages/faq.astro`
- `virtual-velocity/src/pages/acupuncture.astro`

Standard pairing to apply:

```astro
<CTASection
  heading="..."
  description="..."
  primaryButton={{
    label: 'Book Appointment',
    href: JANE_BOOKING_URL,
    icon: 'calendar',
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  secondaryButton={{
    label: 'Contact Us',
    href: '/contact',
    icon: 'mail',
    variant: 'outline',
  }}
/>
```

Existing page-specific headings and descriptions are preserved. Existing `primaryButton` definitions stay unchanged where they already exist.

**Replace policy (approved):** If a page currently passes a different `secondaryButton` (e.g., "Learn more about acupuncture"), **replace** it with the Contact pairing above. Consistency across pages reinforces the "Book or Contact" dual-path message. The implementation plan will enumerate each replacement explicitly before making it, so the user can override case-by-case if needed.

The `CTASection.astro` component itself is not modified — it already supports the secondary button shape.

### 3. Mobile menu — `virtual-velocity/src/components/Header.astro`

The mobile menu's bottom action block currently contains:

```
phone link
Book Appointment button (full-width primary)
```

Change to:

```
phone link
Contact Us button (full-width tertiary, icon="mail", href="/contact")
Book Appointment button (full-width primary)  — unchanged
```

Stacked, not side-by-side, to stay readable on narrow phones. The Contact button gets equal visual weight to Book (full width, same size); the variant difference signals which is the primary action.

The mobile `mobileNav` array still contains "Contact" as a nav link — that stays unchanged. The new button is an additional, more prominent path.

## Out of scope

- The homepage hero CTAs ("Book Your Appointment" + "Learn more about acupuncture"). Per scope discussion, the hero stays focused on booking.
- Footer changes — contact info is already prominent there.
- Any change to `/contact` page content itself.
- Any change to `CTASection.astro` component internals.
- Any tracking/analytics changes (Book and Contact clicks may warrant tracking later, but not in this change).

## Acceptance criteria

- On a `lg` (1024px) desktop viewport, the header shows: nav, search, Contact button, Book button. No horizontal overflow.
- On an `xl` (1280px) desktop viewport, the header also shows the phone link.
- The Contact button styling is visually paired with but subordinate to the Book button (tertiary vs primary variants).
- Every page listed in §2 renders an end-of-page CTA section with both Book and Contact buttons.
- The mobile menu's bottom action block shows three stacked items: phone link, Contact button, Book button — in that order.
- No regressions to existing Book Appointment behavior (still opens Jane App in a new tab).
