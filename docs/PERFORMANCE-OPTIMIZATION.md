# Performance Optimization Guide

**Last Updated:** January 10, 2026
**Project:** Holistic Acupuncture Website

## Overview

This document outlines all performance optimizations implemented and provides guidelines for maintaining optimal performance.

---

## Implemented Optimizations

### 1. Image Optimization

#### Responsive Image Components

Created specialized components for optimal image delivery:

**`OptimizedImage.astro`**
- Native lazy loading (`loading="lazy"`)
- Async decoding (`decoding="async"`)
- Aspect ratio preservation
- Responsive sizing support
- Object-fit controls

**`SanityImage.astro`**
- Automatic WebP conversion with fallbacks
- Responsive srcset generation (400w, 800w, 1200w, 1600w)
- Quality optimization (default 80%)
- Lazy loading enabled by default
- Smart sizing with `sizes` attribute

#### Usage Examples

```astro
<!-- For Sanity CMS images -->
<SanityImage
  image={post.featuredImage}
  alt={post.title}
  width={800}
  height={450}
  aspectRatio="16/9"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

<!-- For static images -->
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  aspectRatio="2/1"
  loading="eager"
/>
```

#### Image Optimization Checklist

- [x] Lazy loading enabled on all images
- [x] Responsive srcset for multiple screen sizes
- [x] WebP format with automatic fallback
- [x] Proper aspect ratios to prevent layout shift
- [x] Descriptive alt text for accessibility
- [ ] Serve images via CDN (Sanity provides this)
- [ ] Replace placeholder images with optimized photos

---

### 2. Font Optimization

#### Strategy

- **Preconnect:** Early connection to Google Fonts servers
- **Font Display:** Using `display=swap` to prevent render blocking
- **Link Tag:** Moved from CSS @import to HTML link tag for better performance

#### Implementation

```html
<!-- BaseLayout.astro -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Inter:wght@400;500;600&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap"
  rel="stylesheet"
/>
```

#### Font Weights Used

- **Sora:** 300, 400, 600, 700
- **Inter:** 400, 500, 600
- **Crimson Pro:** 400, 600, 400 italic

**Optimization Tip:** Only load the weights you actually use.

---

### 3. Build Optimization

#### Astro Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto', // Inline small CSS files
  },
  vite: {
    build: {
      cssCodeSplit: true,      // Split CSS for better caching
      minify: 'esbuild',       // Fast minification
      chunkSizeWarningLimit: 1000,
    },
  },
  prefetch: {
    prefetchAll: false,        // Only prefetch on hover
    defaultStrategy: 'hover',
  },
  compressHTML: true,          // Minify HTML output
});
```

#### Benefits

- **CSS Code Splitting:** Better caching, smaller initial load
- **Esbuild Minification:** Fast build times, smaller bundles
- **Smart Prefetching:** Only prefetch when user shows intent
- **HTML Compression:** Smaller file sizes

---

### 4. Content Delivery

#### Sanity CMS Optimization

All images served through Sanity's global CDN with:
- Automatic format conversion (WebP, AVIF)
- On-the-fly image resizing
- Global edge caching
- Brotli/Gzip compression

#### Asset Strategy

```
Static Assets    → /public folder → Astro build pipeline
Sanity Images    → Sanity CDN → Global edge network
Google Fonts     → Google Fonts CDN → Font optimization
```

---

### 5. Code Optimization

#### Component Strategy

- **Static by Default:** Astro components render to HTML at build time
- **React Only for Sanity:** React integration only for Sanity Studio
- **No Client-Side JS:** Most components have zero JavaScript
- **Progressive Enhancement:** Forms work without JavaScript

#### Bundle Size Management

```bash
# Check bundle size
npm run build

# Look for warnings about chunk sizes
# Keep JavaScript bundles under 100KB (gzipped)
```

---

## Performance Targets

### Lighthouse Scores (Goal: 90+)

| Metric | Target | Strategy |
|--------|--------|----------|
| Performance | 95+ | Lazy loading, optimized images, minimal JS |
| Accessibility | 100 | Semantic HTML, ARIA labels, alt text |
| Best Practices | 95+ | HTTPS, no console errors, proper headers |
| SEO | 100 | Meta tags, structured data, sitemap |

### Core Web Vitals

| Metric | Target | Current Strategy |
|--------|--------|------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Optimized images, font display swap |
| FID (First Input Delay) | < 100ms | Minimal JavaScript |
| CLS (Cumulative Layout Shift) | < 0.1 | Aspect ratios, no layout shift |

---

## Testing & Monitoring

### Pre-Deployment Checklist

```bash
# 1. Build the site
npm run build

# 2. Preview production build
npm run preview

# 3. Test on localhost:4321
# - Navigate through all pages
# - Check image loading
# - Test forms
# - Verify no console errors
```

### Tools for Performance Testing

1. **Lighthouse (Chrome DevTools)**
   ```
   1. Open Chrome DevTools (F12)
   2. Go to "Lighthouse" tab
   3. Select "Performance" + "SEO" + "Accessibility"
   4. Generate report
   ```

2. **WebPageTest** (https://www.webpagetest.org)
   - Test from multiple locations
   - Simulate different connection speeds
   - Get detailed waterfall charts

3. **PageSpeed Insights** (https://pagespeed.web.dev)
   - Google's official performance tool
   - Real-world user data (CrUX)
   - Mobile + Desktop testing

4. **GTmetrix** (https://gtmetrix.com)
   - Performance scores
   - Historical tracking
   - Video playback of page load

---

## Optimization Opportunities

### High Priority

- [ ] **Add Compression Headers** (Netlify/Vercel handles this automatically)
  ```toml
  # netlify.toml
  [[headers]]
    for = "/*"
    [headers.values]
      X-Content-Type-Options = "nosniff"
      X-Frame-Options = "DENY"
      X-XSS-Protection = "1; mode=block"
  ```

- [ ] **Implement HTTP/2 Server Push** (for critical CSS/fonts)
- [ ] **Add Resource Hints**
  ```html
  <link rel="dns-prefetch" href="https://cdn.sanity.io">
  <link rel="preload" as="font" href="/fonts/sora.woff2" crossorigin>
  ```

### Medium Priority

- [ ] **Self-Host Fonts** (eliminate Google Fonts network request)
  ```bash
  # Download fonts and serve from /public/fonts
  # Update BaseLayout to use local fonts
  ```

- [ ] **Optimize SVG Icons**
  - Inline critical SVGs
  - Sprite sheet for reused icons
  - Compress SVG files

- [ ] **Implement Service Worker** (for offline support)
  ```javascript
  // Cache static assets
  // Offline fallback page
  // Background sync for forms
  ```

### Low Priority

- [ ] **Add Image Placeholders** (blur-up effect)
  ```astro
  <!-- Low-quality placeholder while loading -->
  <SanityImage
    image={post.featuredImage}
    placeholder="blur"
  />
  ```

- [ ] **Optimize Google Maps** (lazy load iframe)
  ```astro
  <!-- Load map only when visible -->
  <div id="map-container" data-lazy-load>
  ```

---

## Performance Budget

Set limits to prevent performance regression:

| Resource Type | Budget | Current |
|--------------|--------|---------|
| Total Page Size | < 1MB | TBD |
| JavaScript | < 100KB | ~50KB |
| CSS | < 50KB | ~30KB |
| Images | < 500KB | Varies |
| Fonts | < 100KB | ~80KB |
| HTML | < 50KB | ~20KB |

### Monitoring Budget

```bash
# After build, check sizes
npm run build
ls -lh dist/**/*.{js,css}

# Set up CI checks to fail if budget exceeded
```

---

## Best Practices

### Images

1. **Always use OptimizedImage or SanityImage components**
2. **Set explicit width/height** to prevent layout shift
3. **Use appropriate aspect ratios** (16:9 for featured images, 1:1 for avatars)
4. **Lazy load below-the-fold images** (default behavior)
5. **Use `loading="eager"` only for hero images**

### Code

1. **Minimize client-side JavaScript** - Astro islands architecture
2. **Code split by route** - Astro handles this automatically
3. **Tree-shake unused code** - Vite handles this
4. **Compress all assets** - Enable in hosting platform

### Fonts

1. **Limit font weights** - Only load what you use
2. **Use font-display: swap** - Prevent invisible text
3. **Consider self-hosting** - Eliminate third-party request
4. **Subset fonts** - Only include needed characters

### Third-Party Scripts

1. **Defer non-critical scripts** - Use `defer` or `async`
2. **Lazy load analytics** - Load after page interactive
3. **Self-host when possible** - Reduce DNS lookups
4. **Monitor third-party impact** - Regular performance audits

---

## Production Deployment Optimizations

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Vercel

Vercel automatically handles:
- Brotli/Gzip compression
- HTTP/2
- Smart CDN caching
- Edge functions
- Image optimization (when using Vercel Image)

---

## Maintenance

### Monthly Tasks

- [ ] Run Lighthouse audit on all key pages
- [ ] Check bundle sizes haven't increased
- [ ] Review new content for optimization
- [ ] Update dependencies (security + performance)

### Quarterly Tasks

- [ ] Full performance audit (WebPageTest, GTmetrix)
- [ ] Review Core Web Vitals in Search Console
- [ ] Analyze real user metrics (if analytics enabled)
- [ ] Optimize new content added to CMS

### Annual Tasks

- [ ] Comprehensive performance review
- [ ] Update performance budget
- [ ] Review and update optimization strategies
- [ ] Consider new performance technologies

---

## Resources

- [Astro Performance Guide](https://docs.astro.build/en/guides/performance/)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Docs](https://developer.chrome.com/docs/lighthouse/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)

---

## Summary

This website is optimized for performance with:
- ✅ Lazy loading images with responsive srcset
- ✅ Optimized font loading
- ✅ Minimal JavaScript (mostly static)
- ✅ Build-time rendering
- ✅ Code splitting and minification
- ✅ HTML compression

**Next Steps:**
1. Run Lighthouse audit after deployment
2. Monitor Core Web Vitals
3. Implement recommended optimizations based on real data
