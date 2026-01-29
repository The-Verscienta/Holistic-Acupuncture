# Spacing Guide

## Overview

This guide ensures consistent spacing throughout the Holistic Acupuncture website using a systematic approach based on an 8px grid system.

---

## Base Unit

**Base Unit:** 8px

All spacing should be multiples of 8px (or 4px for micro-adjustments).

---

## Spacing Scale

### Tailwind Spacing Utilities

```css
space-1  = 4px   (0.25rem) - Micro spacing
space-2  = 8px   (0.5rem)  - Tiny spacing
space-3  = 12px  (0.75rem) - Small spacing
space-4  = 16px  (1rem)    - Base spacing
space-6  = 24px  (1.5rem)  - Medium spacing
space-8  = 32px  (2rem)    - Large spacing
space-12 = 48px  (3rem)    - XL spacing
space-16 = 64px  (4rem)    - 2XL spacing
space-20 = 80px  (5rem)    - 3XL spacing
space-24 = 96px  (6rem)    - 4XL spacing
space-32 = 128px (8rem)    - 5XL spacing
```

---

## Section Spacing

### Vertical Section Padding

**Pattern:** `py-16 md:py-20 lg:py-24`

```astro
<!-- Standard Section -->
<section class="py-16 md:py-20 lg:py-24">
  <Container>
    <!-- Content -->
  </Container>
</section>

<!-- Hero Section (Larger) -->
<section class="py-16 md:py-24 lg:py-32">
  <Container>
    <!-- Content -->
  </Container>
</section>

<!-- Compact Section -->
<section class="py-12 md:py-16">
  <Container>
    <!-- Content -->
  </Container>
</section>
```

### Section Gaps

Between major content sections, use natural spacing via section padding (no additional margins needed).

---

## Container Spacing

### Container Component

Already includes responsive horizontal padding:
- Mobile: `px-4` (16px)
- Tablet: `sm:px-6` (24px)
- Desktop: `lg:px-8` (32px)

**Usage:**
```astro
<Container>
  <!-- Content automatically padded -->
</Container>

<!-- Custom max-width -->
<Container size="md">
  <!-- Narrower content -->
</Container>
```

---

## Component Internal Spacing

### Cards

**Padding Pattern:** `p-6 md:p-8`

```astro
<!-- ServiceCard, TestimonialCard -->
<div class="p-6 md:p-8">
  <!-- Content with proper breathing room -->
</div>

<!-- Compact Card -->
<Card padding="sm">  <!-- p-4 -->

<!-- Standard Card -->
<Card padding="md">  <!-- p-6 -->

<!-- Spacious Card -->
<Card padding="lg">  <!-- p-8 -->
```

### Forms

**Vertical Spacing:** `space-y-6`

```astro
<form class="space-y-6">
  <TextInput ... />
  <TextInput ... />
  <Select ... />
  <TextArea ... />
  <Button ... />
</form>

<!-- Large Form -->
<form class="space-y-8">
  <!-- More breathing room -->
</form>
```

### Input Components

Internal spacing in form components:
- Label margin: `mb-2`
- Help text/error margin: `mt-2`
- Input padding: `px-4 py-3`

---

## Typography Spacing

### Headings

```astro
<!-- H1 (Page Title) -->
<h1 class="mb-4">Title</h1>

<!-- H2 (Section Title) -->
<h2 class="mb-4">Section</h2>

<!-- H2 with Subtitle -->
<h2 class="mb-2">Title</h2>
<p class="text-gray-600 mb-8">Subtitle</p>

<!-- H3 (Subsection) -->
<h3 class="mb-3">Subsection</h3>

<!-- H4 (Card Title) -->
<h4 class="mb-2">Card Title</h4>
```

### Paragraphs

```astro
<!-- Standard Paragraph -->
<p class="mb-4">Text content...</p>

<!-- Lead Paragraph -->
<p class="text-xl mb-6">Intro text...</p>

<!-- Compact Paragraph -->
<p class="mb-3">Short text...</p>
```

### Lists

```astro
<!-- Vertical List -->
<ul class="space-y-2">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Spacious List -->
<ul class="space-y-4">
  <li>Item with more content</li>
</ul>
```

---

## Grid Spacing

### Grid Gaps

**Pattern:** `gap-6 md:gap-8`

```astro
<!-- Standard Grid -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>

<!-- Spacious Grid -->
<div class="grid md:grid-cols-2 gap-8 md:gap-12">
  <!-- Items -->
</div>

<!-- Compact Grid -->
<div class="grid md:grid-cols-3 gap-4">
  <!-- Items -->
</div>
```

### Flex Gaps

```astro
<!-- Button Group -->
<div class="flex gap-4">
  <Button>Primary</Button>
  <Button>Secondary</Button>
</div>

<!-- Icon with Text -->
<div class="flex items-center gap-2">
  <Icon />
  <span>Text</span>
</div>

<!-- Large Gap -->
<div class="flex gap-8">
  <!-- Items -->
</div>
```

---

## Responsive Spacing

### Mobile-First Approach

Always start with mobile spacing, then increase for larger screens:

```astro
<!-- Section Padding -->
class="py-12 md:py-16 lg:py-20"

<!-- Grid Gap -->
class="gap-4 md:gap-6 lg:gap-8"

<!-- Margin Bottom -->
class="mb-8 md:mb-12 lg:mb-16"

<!-- Padding -->
class="p-4 md:p-6 lg:p-8"
```

### Breakpoints

- Mobile: Default (no prefix)
- Small: `sm:` - 640px
- Medium: `md:` - 768px
- Large: `lg:` - 1024px
- XL: `xl:` - 1280px
- 2XL: `2xl:` - 1536px

---

## Common Patterns

### Hero Section

```astro
<section class="py-16 md:py-24 lg:py-32">
  <Container>
    <div class="space-y-8">
      <h1 class="mb-4">Hero Title</h1>
      <p class="text-xl mb-8">Hero description</p>
      <div class="flex gap-4">
        <Button>CTA</Button>
        <Button>Secondary</Button>
      </div>
    </div>
  </Container>
</section>
```

### Content Section

```astro
<section class="py-16 md:py-20 lg:py-24">
  <Container>
    <div class="text-center mb-12 md:mb-16">
      <h2 class="mb-4">Section Title</h2>
      <p class="text-xl text-gray-600">Description</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <!-- Cards -->
    </div>
  </Container>
</section>
```

### Card Content

```astro
<Card padding="md">
  <div class="space-y-4">
    <h3 class="text-xl mb-2">Card Title</h3>
    <p class="mb-4">Description</p>
    <Button>Action</Button>
  </div>
</Card>
```

### Form Layout

```astro
<div class="max-w-2xl mx-auto">
  <form class="space-y-6">
    <TextInput ... />
    <TextInput ... />
    <Select ... />
    <TextArea ... />

    <div class="pt-4">
      <Button type="submit" fullWidth>Submit</Button>
    </div>
  </form>
</div>
```

---

## Layout Structure

### Page Structure

```astro
<BaseLayout>
  <Header />  <!-- Sticky, no margin -->

  <main class="flex-1">
    <section class="py-16 md:py-20">
      <!-- Hero -->
    </section>

    <section class="py-16 md:py-20 bg-sage-50">
      <!-- Content -->
    </section>

    <section class="py-16 md:py-20">
      <!-- More content -->
    </section>
  </main>

  <Footer />  <!-- mt-auto pushes to bottom -->
</BaseLayout>
```

---

## Best Practices

### ✅ Do

1. **Use consistent scale** - Stick to 4px/8px increments
2. **Use space-y-* utilities** for vertical stacks
3. **Use gap-* for grids/flex** instead of margins
4. **Start mobile-first** and scale up
5. **Group related elements** with consistent spacing
6. **Use Container component** for horizontal padding

### ❌ Don't

1. **Avoid random values** - Use design tokens
2. **Don't use both margin and padding** when one suffices
3. **Avoid px values** in Tailwind classes (use rem-based utilities)
4. **Don't hardcode spacing** - use Tailwind utilities
5. **Avoid inconsistent gaps** between similar elements

---

## Quick Reference

### Micro Spacing (Within Components)
- Between icon and text: `gap-2`
- Between label and input: `mb-2`
- Between form elements: `space-y-6`

### Medium Spacing (Sections)
- Section padding: `py-16 md:py-20 lg:py-24`
- Between cards: `gap-6 md:gap-8`
- Heading to content: `mb-12 md:mb-16`

### Large Spacing (Major Sections)
- Hero sections: `py-16 md:py-24 lg:py-32`
- Between major sections: Natural (via section padding)

---

## Testing Checklist

- [ ] All sections have consistent vertical padding
- [ ] Grids use appropriate gap values
- [ ] Form elements have proper spacing
- [ ] Typography has consistent margins
- [ ] Mobile spacing scales appropriately
- [ ] No awkward white space or cramped areas
- [ ] Related elements are grouped visually
- [ ] Container padding is consistent

---

*Last updated: 2026-01-08*
