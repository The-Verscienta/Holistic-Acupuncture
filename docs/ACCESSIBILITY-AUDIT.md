# Accessibility Audit & Improvements

**Last Updated:** 2026-01-10
**Project:** Holistic Acupuncture Website
**Standard:** WCAG 2.1 Level AA

## Overview

This document outlines accessibility audit findings and implementation guide for ensuring the Holistic Acupuncture website meets WCAG 2.1 AA compliance standards.

---

## Audit Summary

### Current Status: Good Foundation ✅

**Strengths:**
- ✅ Proper semantic HTML structure
- ✅ Form inputs have labels and ARIA attributes
- ✅ Focus states on interactive elements
- ✅ Good color contrast ratios
- ✅ Responsive text sizing
- ✅ Mobile menu toggle has aria-label and aria-expanded

**Areas for Improvement:**
- ⚠️ Add skip navigation link
- ⚠️ Improve mobile menu keyboard navigation
- ⚠️ Add ARIA landmarks
- ⚠️ Improve image alt text consistency
- ⚠️ Add focus trap for mobile menu
- ⚠️ Test with screen readers

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

#### 1.1 Text Alternatives
- [x] All images have alt attributes
- [ ] Ensure alt text is descriptive (not just "image")
- [x] Decorative images have empty alt=""
- [x] Icons in buttons have aria-hidden or descriptive text

#### 1.3 Adaptable
- [x] Semantic HTML (header, nav, main, footer)
- [ ] Add ARIA landmarks for better navigation
- [x] Logical heading hierarchy (h1 → h2 → h3)
- [x] Form labels properly associated with inputs

#### 1.4 Distinguishable
- [x] Color contrast meets 4.5:1 for normal text
- [x] Color contrast meets 3:1 for large text
- [x] Text can be resized up to 200%
- [ ] No content relies solely on color
- [x] Focus indicators visible

### Operable

#### 2.1 Keyboard Accessible
- [x] All interactive elements keyboard accessible
- [ ] Add skip navigation link
- [ ] Mobile menu needs keyboard navigation improvement
- [ ] Add focus trap for modal/overlay
- [ ] Ensure tab order is logical

#### 2.2 Enough Time
- [x] No time limits on interactions
- [x] Forms don't timeout

#### 2.3 Seizures and Physical Reactions
- [x] No flashing content
- [x] Animations respect prefers-reduced-motion

#### 2.4 Navigable
- [x] Descriptive page titles
- [ ] Add skip to main content link
- [x] Consistent navigation
- [x] Clear link text (not "click here")
- [x] Multiple ways to find content

### Understandable

#### 3.1 Readable
- [x] Page language declared (lang="en")
- [x] Clear, simple language used
- [x] Abbreviations explained

#### 3.2 Predictable
- [x] Consistent navigation across pages
- [x] Consistent component behavior
- [x] No unexpected context changes

#### 3.3 Input Assistance
- [x] Form errors clearly identified
- [x] Labels and instructions provided
- [x] Error messages helpful
- [x] Form validation accessible

### Robust

#### 4.1 Compatible
- [x] Valid HTML
- [x] ARIA used correctly
- [x] Name, role, value for all UI components

---

## Priority Improvements

### HIGH PRIORITY

#### 1. Add Skip Navigation Link

**Issue:** Keyboard users must tab through all navigation on every page.

**Fix:** Add skip link to BaseLayout.astro

```astro
<!-- In BaseLayout.astro, after <body> tag -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sage-700 focus:text-white focus:rounded-md"
>
  Skip to main content
</a>

<!-- Add id to main element -->
<main id="main-content" class="flex-1" tabindex="-1">
  <slot />
</main>
```

**CSS Utility:**
```css
/* Add to global.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

#### 2. Improve Mobile Menu Accessibility

**Issues:**
- No focus trap when menu is open
- No keyboard support to close menu (ESC key)
- Menu items not contained in nav element

**Fix:** Update Header.astro script

```javascript
<script>
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  function toggleMenu(open) {
    if (open) {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu.classList.add('opacity-100');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Set focus to first menu item
      setTimeout(() => {
        focusableElements = Array.from(
          mobileMenu.querySelectorAll('a[href], button')
        );
        firstFocusable = focusableElements[0];
        lastFocusable = focusableElements[focusableElements.length - 1];
        firstFocusable?.focus();
      }, 100);
    } else {
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenu.classList.remove('opacity-100');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      document.body.style.overflow = '';
      mobileMenuToggle.focus();
    }
  }

  // Toggle on button click
  mobileMenuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isOpen);
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    const isOpen = mobileMenuToggle?.getAttribute('aria-expanded') === 'true';

    if (e.key === 'Escape' && isOpen) {
      toggleMenu(false);
    }

    // Focus trap
    if (e.key === 'Tab' && isOpen) {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }
  });

  // Close when clicking outside
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      toggleMenu(false);
    }
  });
</script>
```

**Update mobile menu HTML:**
```astro
<div
  id="mobile-menu"
  class="fixed inset-0 z-40 bg-warm-white/95 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300 lg:hidden"
  role="dialog"
  aria-modal="true"
  aria-label="Mobile navigation menu"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
    <nav aria-label="Mobile navigation">
      <!-- Menu items -->
    </nav>
  </div>
</div>
```

#### 3. Add ARIA Landmarks

**Issue:** Screen reader users benefit from landmarks for easy navigation.

**Fix:** Add ARIA roles to main sections

```astro
<!-- Header.astro -->
<header role="banner">...</header>

<!-- Footer.astro -->
<footer role="contentinfo">...</footer>

<!-- Navigation.astro -->
<nav role="navigation" aria-label="Main navigation">...</nav>

<!-- BaseLayout.astro -->
<main role="main" id="main-content">...</main>
```

### MEDIUM PRIORITY

#### 4. Improve Image Alt Text

**Issue:** Some images may have generic alt text.

**Checklist:**
- [ ] Review all image alt attributes
- [ ] Ensure alt text describes image content/purpose
- [ ] Use empty alt="" for decorative images
- [ ] Add alt text for Sanity CMS images
- [ ] Don't include "image of" or "picture of" in alt text

**Examples:**
```astro
<!-- Bad -->
<img src="photo.jpg" alt="photo" />
<img src="needle.jpg" alt="image of acupuncture needle" />

<!-- Good -->
<img src="photo.jpg" alt="Patient receiving acupuncture treatment on their back" />
<img src="needle.jpg" alt="Acupuncture needle" />
<img src="decorative-leaf.svg" alt="" /> <!-- Decorative -->
```

#### 5. Add Reduced Motion Support

**Issue:** Users with vestibular disorders may prefer reduced animations.

**Fix:** Add to global.css

```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 6. Improve Form Accessibility

**Current state:** Forms have good accessibility, but can be enhanced.

**Enhancements:**
```astro
<!-- Add fieldset for grouped form controls -->
<fieldset>
  <legend class="text-lg font-semibold mb-4">
    Contact Information
  </legend>

  <TextInput
    id="name"
    name="name"
    label="Full Name"
    required
    autocomplete="name"
  />

  <TextInput
    id="email"
    name="email"
    type="email"
    label="Email Address"
    required
    autocomplete="email"
  />
</fieldset>

<!-- Add autocomplete attributes -->
<TextInput autocomplete="tel" />
<TextInput autocomplete="email" />
```

### LOW PRIORITY

#### 7. Add Live Regions for Dynamic Content

**Use case:** Form submission feedback, search results, etc.

```astro
<!-- Success message -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {successMessage && <span>{successMessage}</span>}
</div>

<!-- Error message -->
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  {errorMessage && <span>{errorMessage}</span>}
</div>
```

#### 8. Improve Link Accessibility

**Issue:** Some links may not be descriptive out of context.

**Fix:**
```astro
<!-- Bad -->
<a href="/blog/post">Read more</a>
<a href="/contact">Click here</a>

<!-- Good -->
<a href="/blog/post">Read more about acupuncture for migraines</a>
<a href="/contact">Contact us to schedule an appointment</a>

<!-- Or use aria-label -->
<a href="/blog/post" aria-label="Read more about acupuncture for migraines">
  Read more
</a>
```

---

## Testing Checklist

### Manual Testing

- [ ] **Keyboard Navigation**
  - Tab through entire site
  - Ensure all interactive elements are reachable
  - Verify focus indicators are visible
  - Test with Tab and Shift+Tab
  - Test Enter and Space on buttons/links

- [ ] **Screen Reader**
  - Test with NVDA (Windows)
  - Test with JAWS (Windows)
  - Test with VoiceOver (macOS/iOS)
  - Ensure all content is announced
  - Verify ARIA labels are read correctly

- [ ] **Zoom/Text Resize**
  - Zoom to 200% in browser
  - Verify all content is accessible
  - Check for horizontal scrolling issues
  - Test on mobile devices

- [ ] **Color Contrast**
  - Use browser DevTools
  - Check all text/background combinations
  - Verify 4.5:1 for normal text
  - Verify 3:1 for large text (18pt+)

- [ ] **Forms**
  - Fill forms with keyboard only
  - Trigger validation errors
  - Verify error messages are announced
  - Test autocomplete functionality

### Automated Testing Tools

#### Browser Extensions
1. **axe DevTools** (Chrome/Firefox)
   - Install from Chrome Web Store
   - Run audit on each page
   - Fix critical and serious issues

2. **WAVE** (Chrome/Firefox/Edge)
   - Visual accessibility evaluation
   - Shows errors, alerts, features
   - Useful for quick checks

3. **Lighthouse** (Chrome DevTools)
   - Accessibility score
   - Best practices
   - SEO audit

#### Command Line Tools

```bash
# Install pa11y
npm install -g pa11y

# Test homepage
pa11y http://localhost:4321

# Test all pages
pa11y-ci --sitemap http://localhost:4321/sitemap.xml
```

#### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
name: Accessibility Tests
on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm run preview &
      - run: npx wait-on http://localhost:4321
      - run: npx pa11y-ci http://localhost:4321
```

---

## Implementation Priority

### Phase 1: Critical (This Week)
1. Add skip navigation link
2. Improve mobile menu keyboard navigation
3. Add ARIA landmarks
4. Fix any failing axe DevTools issues

### Phase 2: Important (Next Week)
1. Review and improve all image alt text
2. Test with screen readers
3. Implement reduced motion support
4. Add autocomplete to forms

### Phase 3: Polish (Before Launch)
1. Add live regions for dynamic content
2. Improve link descriptiveness
3. Full keyboard navigation test
4. Cross-browser accessibility testing

---

## Resources

### Official Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Pa11y](https://pa11y.org/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Windows - Free)](https://www.nvaccess.org/)
- [JAWS (Windows - Paid)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS - Built-in)](https://www.apple.com/accessibility/voiceover/)

---

## Sign-off

Before launch, ensure:
- [ ] All high priority issues resolved
- [ ] Tested with keyboard navigation
- [ ] Tested with at least one screen reader
- [ ] axe DevTools shows no critical issues
- [ ] Lighthouse accessibility score 90+
- [ ] Manual review completed

---

*Last updated: 2026-01-10*
