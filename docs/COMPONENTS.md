# Component Library Documentation

## Overview

This document describes all reusable UI components built for the Holistic Acupuncture website using the 2026 design system.

## Table of Contents

- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [Specialized Components](#specialized-components)

---

## Layout Components

### BaseLayout

Master layout component with SEO, fonts, and site structure.

**Props:**
- `title` (string, required) - Page title
- `description` (string, required) - Meta description
- `image` (string, optional) - OG image URL

**Usage:**
```astro
<BaseLayout title="Home" description="Welcome to our practice">
  <h1>Page content here</h1>
</BaseLayout>
```

### Container

Responsive container with consistent max-width and padding.

**Props:**
- `size` ('sm' | 'md' | 'lg' | 'xl' | 'full', default: 'xl') - Max width
- `class` (string, optional) - Additional CSS classes

**Usage:**
```astro
<Container size="md">
  <p>Centered content with consistent padding</p>
</Container>
```

### Header

Sticky header with navigation, mobile menu, and CTA button.

**Features:**
- Backdrop blur on scroll
- Mobile hamburger menu with overlay
- Desktop dropdown menus
- "Book Appointment" CTA

### Footer

Comprehensive footer with contact info, links, hours, and newsletter.

**Features:**
- 4-column grid (responsive)
- Contact information
- Quick links
- Office hours
- Social proof

### Navigation

Desktop navigation with dropdown menus.

**Features:**
- Hover animations
- Underline effects
- Dropdown support

---

## UI Components

### Button

Versatile button component with multiple variants and sizes.

**Props:**
- `variant` ('primary' | 'secondary' | 'tertiary' | 'outline', default: 'primary')
- `size` ('sm' | 'md' | 'lg', default: 'md')
- `href` (string, optional) - Render as link
- `type` ('button' | 'submit' | 'reset', default: 'button')
- `disabled` (boolean, default: false)
- `fullWidth` (boolean, default: false)
- `icon` ('calendar' | 'phone' | 'mail' | 'arrow-right' | 'info' | 'external', optional)
- `iconPosition` ('left' | 'right', default: 'left')

**Usage:**
```astro
<!-- Primary button with icon -->
<Button variant="primary" icon="calendar">
  Book Appointment
</Button>

<!-- Button as link -->
<Button variant="secondary" href="/contact">
  Contact Us
</Button>

<!-- Full width button -->
<Button variant="primary" fullWidth>
  Submit
</Button>
```

### Card

Flexible card component for content containers.

**Props:**
- `variant` ('default' | 'bordered' | 'elevated' | 'flat', default: 'default')
- `padding` ('none' | 'sm' | 'md' | 'lg', default: 'md')
- `hoverable` (boolean, default: false) - Add hover lift effect
- `href` (string, optional) - Make entire card clickable

**Usage:**
```astro
<!-- Basic card -->
<Card variant="elevated" padding="lg">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</Card>

<!-- Hoverable card as link -->
<Card variant="default" hoverable href="/about">
  <h3>Click Me</h3>
</Card>
```

### Badge

Small labels for status, categories, or tags.

**Props:**
- `variant` ('default' | 'success' | 'warning' | 'error' | 'info', default: 'default')
- `size` ('sm' | 'md' | 'lg', default: 'md')
- `rounded` (boolean, default: true)
- `icon` (boolean, default: false) - Show checkmark icon

**Usage:**
```astro
<Badge variant="success" icon>Verified</Badge>
<Badge variant="warning" size="sm">New</Badge>
```

---

## Form Components

### TextInput

Text input field with label, validation, and error states.

**Props:**
- `id` (string, required)
- `name` (string, required)
- `label` (string, required)
- `type` ('text' | 'email' | 'tel' | 'password' | 'url' | 'number', default: 'text')
- `placeholder` (string, optional)
- `required` (boolean, default: false)
- `disabled` (boolean, default: false)
- `value` (string, default: '')
- `error` (string, optional) - Error message
- `helpText` (string, optional) - Help text

**Usage:**
```astro
<TextInput
  id="email"
  name="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  required
  helpText="We'll never share your email"
/>
```

### TextArea

Multi-line text area with character counter.

**Props:**
- `id` (string, required)
- `name` (string, required)
- `label` (string, required)
- `placeholder` (string, optional)
- `required` (boolean, default: false)
- `disabled` (boolean, default: false)
- `value` (string, default: '')
- `error` (string, optional)
- `helpText` (string, optional)
- `rows` (number, default: 5)
- `maxLength` (number, optional) - Shows character counter

**Usage:**
```astro
<TextArea
  id="message"
  name="message"
  label="Your Message"
  rows={5}
  maxLength={500}
  helpText="Tell us about your health concerns"
/>
```

### Select

Dropdown select with custom styling.

**Props:**
- `id` (string, required)
- `name` (string, required)
- `label` (string, required)
- `options` (Array<{value: string, label: string}>, required)
- `required` (boolean, default: false)
- `disabled` (boolean, default: false)
- `value` (string, default: '')
- `error` (string, optional)
- `helpText` (string, optional)
- `placeholder` (string, default: 'Please select...')

**Usage:**
```astro
<Select
  id="referral"
  name="referral"
  label="How did you hear about us?"
  options={[
    { value: 'google', label: 'Google Search' },
    { value: 'social', label: 'Social Media' },
    { value: 'referral', label: 'Friend/Family' },
  ]}
  required
/>
```

---

## Specialized Components

### ServiceCard

Card component designed for displaying conditions/services.

**Props:**
- `title` (string, required)
- `description` (string, required)
- `href` (string, required)
- `icon` (string, optional) - SVG path data
- `class` (string, optional)

**Features:**
- Icon with circular background
- Hover animations (lift, shadow, color changes)
- "Learn More" link with arrow
- Slot for additional content

**Usage:**
```astro
<ServiceCard
  title="Headaches & Migraines"
  description="Natural, effective treatment for chronic headaches."
  href="/conditions/headaches"
  icon="M9.663 17h4.673M12 3v1m6.364..."
/>
```

### TestimonialCard

Card for displaying patient testimonials and reviews.

**Props:**
- `quote` (string, required)
- `author` (string, required)
- `condition` (string, optional)
- `rating` (number, default: 5) - 1-5 stars
- `avatar` (string, optional) - Image URL
- `class` (string, optional)

**Features:**
- Star rating display
- Serif font for quotes
- Author avatar (image or initial)
- Left border accent

**Usage:**
```astro
<TestimonialCard
  quote="After years of pain, I finally found relief!"
  author="Sarah M."
  condition="Chronic Migraines"
  rating={5}
/>
```

---

## Design Tokens

### Colors

**Primary (Sage Green):**
- `sage-50` to `sage-700`

**Accent (Earth Tones):**
- `earth-orange`
- `earth-terracotta`

**Trust (Blue):**
- `healing-blue`

**Neutrals:**
- `warm-white`
- `charcoal`
- `gray-600`, `gray-400`

**Semantic:**
- `success` - Green
- `warning` - Orange
- `error` - Red/terracotta

### Typography

**Fonts:**
- **Heading:** Sora (300, 400, 600, 700)
- **Body:** Inter (400, 500, 600)
- **Serif:** Crimson Pro (400, 600, italic)

**Sizes (Fluid):**
- `text-xs` to `text-5xl` (responsive clamp values)

### Spacing

**Scale:** 4px base unit
- `space-1` (4px) to `space-32` (128px)

### Border Radius

- `radius-sm` - 6px
- `radius-md` - 8px
- `radius-lg` - 12px
- `radius-xl` - 16px
- `radius-2xl` - 24px
- `radius-button` - Full pill shape

### Shadows

- `shadow-card` - Subtle card shadow
- `shadow-card-hover` - Elevated hover shadow
- `shadow-soft` - Soft diffused shadow

---

## Best Practices

### Accessibility

1. **Always include labels** for form inputs
2. **Use semantic HTML** (button, nav, header, etc.)
3. **Provide error messages** for validation
4. **Include ARIA attributes** when needed
5. **Ensure keyboard navigation** works
6. **Maintain color contrast** (WCAG AA)

### Performance

1. **Use Button href** for links (better SEO)
2. **Lazy load images** below fold
3. **Minimize JavaScript** in components
4. **Use CSS transitions** over JS animations
5. **Respect prefers-reduced-motion**

### Consistency

1. **Use consistent spacing** (space-4, space-6, space-8)
2. **Follow variant patterns** (primary/secondary/tertiary)
3. **Maintain visual hierarchy** with typography scale
4. **Use design tokens** instead of hard-coded values
5. **Test on multiple devices** and screen sizes

---

## Example Patterns

### Hero Section with CTA

```astro
<section class="bg-gradient-to-br from-sage-50 to-sage-100 py-20">
  <Container>
    <h1>Healing Through Balance & Nature</h1>
    <p class="text-xl text-gray-600 mb-8">
      Experience transformative acupuncture care.
    </p>
    <div class="flex gap-4">
      <Button variant="primary" size="lg" icon="calendar">
        Book Appointment
      </Button>
      <Button variant="tertiary" size="lg" icon="info">
        Learn More
      </Button>
    </div>
  </Container>
</section>
```

### Service Grid

```astro
<section class="py-20">
  <Container>
    <h2 class="text-center mb-12">Conditions We Treat</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServiceCard
        title="Headaches"
        description="Relief from chronic headaches and migraines."
        href="/conditions/headaches"
        icon="..."
      />
      <!-- More cards -->
    </div>
  </Container>
</section>
```

### Contact Form

```astro
<form class="max-w-2xl mx-auto space-y-6">
  <TextInput
    id="name"
    name="name"
    label="Full Name"
    required
  />
  <TextInput
    id="email"
    name="email"
    type="email"
    label="Email"
    required
  />
  <Select
    id="reason"
    name="reason"
    label="Reason for Visit"
    options={[...]}
    required
  />
  <TextArea
    id="message"
    name="message"
    label="Message"
    maxLength={500}
  />
  <Button variant="primary" type="submit" fullWidth>
    Send Message
  </Button>
</form>
```

---

## Component Showcase

View all components in action:
**http://localhost:4321/components**

This page displays:
- All button variants and sizes
- Card styles
- Badge variations
- Form inputs with validation
- Service cards
- Testimonial cards
- Typography samples
- Color palette

---

*Last updated: 2026-01-08*
