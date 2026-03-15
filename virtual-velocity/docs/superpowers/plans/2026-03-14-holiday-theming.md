# Holiday Theming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically theme the site header and hero section for 8 holidays using a client-side inline script and CSS custom properties.

**Architecture:** A synchronous `<script is:inline>` in `BaseLayout.astro` sets `data-holiday` on `<html>` before first paint. CSS custom property blocks in `global.css` define per-holiday colors. Two Astro components (`Header.astro`, `PageHero.astro`) get minimal HTML additions for emoji injection.

**Tech Stack:** Astro 5, Tailwind CSS v4, Cloudflare Pages (static output), plain ES5 JS (no bundler, `is:inline`)

**Spec:** `docs/superpowers/specs/2026-03-14-holiday-theming-design.md`

---

## Chunk 1: CSS + HTML Hooks

### Task 1: Add holiday CSS custom properties and targeting rules to global.css

**Files:**
- Modify: `virtual-velocity/src/styles/global.css`

Read `global.css` in full before editing. The holiday blocks go at the **end** of the file.

- [ ] **Step 1: Append the 8 per-holiday custom-property blocks**

Add to the end of `src/styles/global.css`:

```css
/* ============================================================
   Holiday Theming
   Each block sets CSS custom properties consumed by the
   #header, #mobile-menu, and .holiday-hero targeting rules below.
   data-holiday is set on <html> by the inline script in BaseLayout.
   ============================================================ */

[data-holiday="christmas"]        { --holiday-bg: #1a4a1a; --holiday-text: #f5e642; --holiday-hero-from: #0d2b0d; --holiday-hero-to: #4a1010; --holiday-accent: #c8a83c; }
[data-holiday="halloween"]        { --holiday-bg: #1a1a2e; --holiday-text: #ff9500; --holiday-hero-from: #1a1a2e; --holiday-hero-to: #2d1b4e; --holiday-accent: #ff6b00; }
[data-holiday="july-4th"]         { --holiday-bg: #001f5b; --holiday-text: #ffffff; --holiday-hero-from: #001f5b; --holiday-hero-to: #8b0000; --holiday-accent: #cc0000; }
[data-holiday="st-patricks"]      { --holiday-bg: #1a4a1a; --holiday-text: #f5e642; --holiday-hero-from: #0d2b0d; --holiday-hero-to: #2a5c1a; --holiday-accent: #d4af37; }
[data-holiday="mlk"]              { --holiday-bg: #1a0f00; --holiday-text: #d4af37; --holiday-hero-from: #1a0f00; --holiday-hero-to: #3d2000; --holiday-accent: #d4af37; }
[data-holiday="valentines"]       { --holiday-bg: #5c0a1e; --holiday-text: #ffb3c6; --holiday-hero-from: #5c0a1e; --holiday-hero-to: #8b1a3a; --holiday-accent: #e91e63; }
[data-holiday="chinese-new-year"] { --holiday-bg: #8b0000; --holiday-text: #ffd700; --holiday-hero-from: #8b0000; --holiday-hero-to: #3d0000; --holiday-accent: #ffd700; }
[data-holiday="veterans"]         { --holiday-bg: #0a1628; --holiday-text: #c8a83c; --holiday-hero-from: #0a1628; --holiday-hero-to: #1a3050; --holiday-accent: #c8a83c; }

/* Header and mobile menu */
[data-holiday] #header {
  background: var(--holiday-bg) !important;
  color: var(--holiday-text);
}
[data-holiday] #header a,
[data-holiday] #header button {
  color: var(--holiday-text) !important;
}
[data-holiday] #mobile-menu {
  background: var(--holiday-bg) !important;
}
[data-holiday] #mobile-menu a {
  color: var(--holiday-text) !important;
}

/* Hero section */
[data-holiday] .holiday-hero {
  background: linear-gradient(to bottom right, var(--holiday-hero-from), var(--holiday-hero-to)) !important;
  color: white;
}

/* Deco strip — hidden when empty, shown when JS injects emojis */
#holiday-deco:not(:empty) {
  font-size: 1.5rem;
  letter-spacing: 0.25rem;
  text-align: center;
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 2: Verify CSS compiles without errors**

```bash
cd virtual-velocity && npm run check
```

Expected: no TypeScript or Astro errors (CSS errors would surface here too).

- [ ] **Step 3: Smoke-test CSS in browser DevTools**

Run `npm run dev`, open the site, then in the browser console run:

```js
document.documentElement.dataset.holiday = 'halloween'
```

Expected: header turns dark navy (`#1a1a2e`), header links turn orange (`#ff9500`).

Remove it after verifying: `delete document.documentElement.dataset.holiday`

- [ ] **Step 4: Commit**

```bash
cd virtual-velocity
git add src/styles/global.css
git commit -m "feat: add holiday CSS custom properties and targeting rules"
```

---

### Task 2: Add HTML hooks to Header.astro and PageHero.astro

**Files:**
- Modify: `virtual-velocity/src/components/Header.astro`
- Modify: `virtual-velocity/src/components/PageHero.astro`

Read both files in full before editing.

**Header.astro change:** The logo anchor (line ~21) contains a `<picture>` element followed by two `<span>` elements (one for desktop, one for mobile). Insert `<span id="holiday-emoji" aria-hidden="true"></span>` between the `<picture>` closing tag and the first `<span>`:

- [ ] **Step 1: Add holiday-emoji span to Header.astro**

Find this block in `Header.astro`:
```astro
        <picture>
          <source type="image/webp" srcset="/logo.webp" />
          <img src={rootRelativeLogoSrc} alt="Acupuncture & Holistic Health Associates logo" width={40} height={40} class="h-10 w-auto shrink-0" />
        </picture>
        <span class="hidden sm:inline leading-tight">Acupuncture &<br/>Holistic Health Associates</span>
```

Replace with:
```astro
        <picture>
          <source type="image/webp" srcset="/logo.webp" />
          <img src={rootRelativeLogoSrc} alt="Acupuncture & Holistic Health Associates logo" width={40} height={40} class="h-10 w-auto shrink-0" />
        </picture>
        <span id="holiday-emoji" aria-hidden="true"></span>
        <span class="hidden sm:inline leading-tight">Acupuncture &<br/>Holistic Health Associates</span>
```

- [ ] **Step 2: Add holiday-hero class and holiday-deco div to PageHero.astro**

Find this in `PageHero.astro`:
```astro
<section class="relative bg-gradient-to-br from-sage-50 to-warm-white py-16 md:py-20">
  <Container>
    <div class="max-w-3xl mx-auto text-center">
      <slot name="badge" />
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-charcoal mb-6">
```

Replace with:
```astro
<section class="relative bg-gradient-to-br from-sage-50 to-warm-white py-16 md:py-20 holiday-hero">
  <Container>
    <div class="max-w-3xl mx-auto text-center">
      <slot name="badge" />
      <div id="holiday-deco" aria-hidden="true"></div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-charcoal mb-6">
```

- [ ] **Step 3: Verify no build errors**

```bash
cd virtual-velocity && npm run check
```

Expected: no errors.

- [ ] **Step 4: Smoke-test HTML hooks in browser DevTools**

Run `npm run dev`, open any page with a hero (e.g. `/about`), then in the browser console:

```js
document.documentElement.dataset.holiday = 'halloween'
document.getElementById('holiday-emoji').textContent = '🎃 '
document.getElementById('holiday-deco').textContent = '🎃 🕸️ 🦇'
```

Expected: header turns dark, logo shows pumpkin emoji, deco strip appears above the page title.

Remove after: `delete document.documentElement.dataset.holiday`

- [ ] **Step 5: Commit**

```bash
cd virtual-velocity
git add src/components/Header.astro src/components/PageHero.astro
git commit -m "feat: add holiday emoji slots to Header and PageHero"
```

---

## Chunk 2: Detection Script + Integration

### Task 3: Write detection logic tests and verify correctness

**Files:**
- Create: `virtual-velocity/scripts/test-holiday-detection.js`

No test framework is installed. This is a standalone Node.js script (Node 22 available) that imports nothing and exits with code 1 on failure. Run it with `node`.

- [ ] **Step 1: Create the test script**

Create `virtual-velocity/scripts/test-holiday-detection.js`:

```js
#!/usr/bin/env node
// Tests for holiday detection logic.
// Run from virtual-velocity/: node scripts/test-holiday-detection.js
// The cny table covers 2024–2040; years outside that range (e.g. 2023) are
// intentionally absent — tests confirm those return null.

// ── Paste the detection functions here for isolated testing ──────────────────

var cny = {
  2024:[2,10], 2025:[1,29], 2026:[2,17], 2027:[2,6],  2028:[1,26],
  2029:[2,13], 2030:[2,3],  2031:[1,23], 2032:[2,11], 2033:[1,31],
  2034:[2,19], 2035:[2,8],  2036:[1,28], 2037:[2,15], 2038:[2,4],
  2039:[1,24], 2040:[2,12]
};

function nthMonday(year, month, n) {
  var date = new Date(year, month - 1, 1);
  var dow = date.getDay();
  var firstMonday = 1 + ((8 - dow) % 7);
  return firstMonday + (n - 1) * 7;
}

function inWindow(y, m, d, wy, wm, wd, days) {
  function toInt(yy, mm, dd) { return yy * 10000 + mm * 100 + dd; }
  var target = new Date(wy, wm - 1, wd);
  var lo = new Date(target); lo.setDate(target.getDate() - days);
  var hi = new Date(target); hi.setDate(target.getDate() + days);
  var check = toInt(y, m, d);
  return check >= toInt(lo.getFullYear(), lo.getMonth()+1, lo.getDate())
      && check <= toInt(hi.getFullYear(), hi.getMonth()+1, hi.getDate());
}

function detect(y, m, d) {
  // Christmas: Dec 11 – Jan 1 (asymmetric: 14 days before Dec 25, 7 days after)
  if ((m === 12 && d >= 11) || (m === 1 && d === 1)) return 'christmas';
  var mlk  = nthMonday(y, 1, 3);
  var cnyd = cny[y];
  if (inWindow(y,m,d, y,10,31, 4))                          return 'halloween';
  if (cnyd && inWindow(y,m,d, y,cnyd[0],cnyd[1], 3))        return 'chinese-new-year';
  if (inWindow(y,m,d, y,2,14,  7))                          return 'valentines';
  if (inWindow(y,m,d, y,3,17,  7))                          return 'st-patricks';
  if (inWindow(y,m,d, y,7,4,   7))                          return 'july-4th';
  if (inWindow(y,m,d, y,1,mlk, 3))                          return 'mlk';
  if (inWindow(y,m,d, y,11,11, 7))                          return 'veterans';
  return null;
}

// ── Test harness ─────────────────────────────────────────────────────────────

var passed = 0, failed = 0;

function expect(label, result, expected) {
  if (result === expected) {
    console.log('  ✓ ' + label);
    passed++;
  } else {
    console.error('  ✗ ' + label + ' — got ' + JSON.stringify(result) + ', expected ' + JSON.stringify(expected));
    failed++;
  }
}

// ── nthMonday ────────────────────────────────────────────────────────────────
console.log('\nnthMonday:');
// Jan 2026: starts Thursday (dow=4). First Monday = 5. 3rd Monday = 19.
expect('MLK 2026 = Jan 19', nthMonday(2026, 1, 3), 19);
// Jan 2025: starts Wednesday (dow=3). First Monday = 6. 3rd Monday = 20.
expect('MLK 2025 = Jan 20', nthMonday(2025, 1, 3), 20);
// Jan 2024: starts Monday (dow=1). First Monday = 1. 3rd Monday = 15.
expect('MLK 2024 = Jan 15', nthMonday(2024, 1, 3), 15);

// ── Christmas ────────────────────────────────────────────────────────────────
console.log('\nChristmas (Dec 11 – Jan 1):');
expect('Dec 11 = christmas',  detect(2025, 12, 11), 'christmas');
expect('Dec 25 = christmas',  detect(2025, 12, 25), 'christmas');
expect('Dec 31 = christmas',  detect(2025, 12, 31), 'christmas');
expect('Jan 1  = christmas',  detect(2026, 1,  1),  'christmas');
expect('Jan 2  = null',       detect(2026, 1,  2),  null);
expect('Dec 10 = null',       detect(2025, 12, 10), null);

// ── Halloween ────────────────────────────────────────────────────────────────
console.log('\nHalloween (Oct 27 – Nov 4):');
expect('Oct 27 = halloween',  detect(2025, 10, 27), 'halloween');
expect('Oct 31 = halloween',  detect(2025, 10, 31), 'halloween');
expect('Nov 4  = halloween',  detect(2025, 11, 4),  'halloween');
expect('Oct 26 = null',       detect(2025, 10, 26), null);
expect('Nov 5  = null',       detect(2025, 11, 5),  null);

// ── Veterans Day ─────────────────────────────────────────────────────────────
console.log('\nVeterans Day (Nov 4 – Nov 18):');
// Halloween window: Oct 31 ±4 days = Oct 27–Nov 4 (inclusive)
// Veterans Day window: Nov 11 ±7 days = Nov 4–Nov 18 (inclusive)
// Both include Nov 4 — Halloween takes priority because it is checked first in detect()
expect('Nov 4  = halloween (priority over veterans)', detect(2025, 11, 4),  'halloween');
expect('Nov 5  = veterans',  detect(2025, 11, 5),  'veterans');
expect('Nov 11 = veterans',  detect(2025, 11, 11), 'veterans');
expect('Nov 18 = veterans',  detect(2025, 11, 18), 'veterans');
expect('Nov 19 = null',      detect(2025, 11, 19), null);

// ── Chinese New Year ─────────────────────────────────────────────────────────
console.log('\nChinese New Year:');
// 2026: Feb 17 ±3 → Feb 14–20
expect('CNY 2026 Feb 14 = chinese-new-year', detect(2026, 2, 14), 'chinese-new-year');
expect('CNY 2026 Feb 17 = chinese-new-year', detect(2026, 2, 17), 'chinese-new-year');
expect('CNY 2026 Feb 20 = chinese-new-year', detect(2026, 2, 20), 'chinese-new-year');
// Note: Feb 14 is also Valentine's Day — CNY takes priority
expect('CNY wins over valentines on Feb 14 2026', detect(2026, 2, 14), 'chinese-new-year');
expect('CNY 2026 Feb 13 = valentines (outside CNY window)', detect(2026, 2, 13), 'valentines');
// Unknown year: no CNY
// 2023 is intentionally absent from the cny table (table starts at 2024)
expect('CNY 2023 = null (year intentionally absent from table)', detect(2023, 2, 5), null);

// ── Valentine's Day ──────────────────────────────────────────────────────────
console.log('\nValentine\'s Day (Feb 7 – Feb 21):');
expect('Feb 7  = valentines', detect(2025, 2, 7),  'valentines');
expect('Feb 14 = valentines', detect(2025, 2, 14), 'valentines');
expect('Feb 21 = valentines', detect(2025, 2, 21), 'valentines');
expect('Feb 6  = null',       detect(2025, 2, 6),  null);
expect('Feb 22 = null',       detect(2025, 2, 22), null);

// ── St. Patrick's Day ────────────────────────────────────────────────────────
console.log('\nSt. Patrick\'s Day (Mar 10 – Mar 24):');
expect('Mar 10 = st-patricks', detect(2025, 3, 10), 'st-patricks');
expect('Mar 17 = st-patricks', detect(2025, 3, 17), 'st-patricks');
expect('Mar 24 = st-patricks', detect(2025, 3, 24), 'st-patricks');
expect('Mar 9  = null',        detect(2025, 3, 9),  null);
expect('Mar 25 = null',        detect(2025, 3, 25), null);

// ── 4th of July ──────────────────────────────────────────────────────────────
console.log('\n4th of July (Jun 27 – Jul 11):');
expect('Jun 27 = july-4th', detect(2025, 6, 27), 'july-4th');
expect('Jul 4  = july-4th', detect(2025, 7, 4),  'july-4th');
expect('Jul 11 = july-4th', detect(2025, 7, 11), 'july-4th');
expect('Jun 26 = null',     detect(2025, 6, 26), null);
expect('Jul 12 = null',     detect(2025, 7, 12), null);

// ── MLK Day ──────────────────────────────────────────────────────────────────
console.log('\nMLK Day (3rd Monday of January ±3 days):');
// 2026: 3rd Monday = Jan 19. Window: Jan 16–22.
expect('MLK 2026 Jan 16 = mlk', detect(2026, 1, 16), 'mlk');
expect('MLK 2026 Jan 19 = mlk', detect(2026, 1, 19), 'mlk');
expect('MLK 2026 Jan 22 = mlk', detect(2026, 1, 22), 'mlk');
expect('MLK 2026 Jan 15 = null', detect(2026, 1, 15), null);
expect('MLK 2026 Jan 23 = null', detect(2026, 1, 23), null);

// ── Off-season dates ─────────────────────────────────────────────────────────
console.log('\nOff-season (no holiday):');
expect('May 1  = null', detect(2025, 5, 1),  null);
expect('Aug 15 = null', detect(2025, 8, 15), null);
expect('Sep 30 = null', detect(2025, 9, 30), null);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.error('FAIL');
  process.exit(1);
} else {
  console.log('PASS');
}
```

- [ ] **Step 2: Run the tests — expect all to pass**

```bash
cd virtual-velocity && node scripts/test-holiday-detection.js
```

Expected output ends with `PASS`. If any test fails, fix the `detect` / `nthMonday` / `inWindow` logic in the script before proceeding.

- [ ] **Step 3: Commit the test script**

```bash
cd virtual-velocity
git add scripts/test-holiday-detection.js
git commit -m "test: add holiday detection logic tests"
```

---

### Task 4: Add inline script to BaseLayout.astro

**Files:**
- Modify: `virtual-velocity/src/layouts/BaseLayout.astro`

Read `BaseLayout.astro` in full before editing. The `<script is:inline>` goes inside `<head>`, **immediately after `<meta charset="UTF-8" />`** (the charset meta must be first per the HTML spec; the script goes second so it runs before first paint with no intervening stylesheets).

**Prerequisite:** Tasks 2 must already be complete — `#holiday-emoji` and `#holiday-deco` elements must exist in the DOM before the `DOMContentLoaded` handler fires. Confirm `Header.astro` and `PageHero.astro` were updated in Task 2.

- [ ] **Step 1: Add the inline script to BaseLayout.astro**

Find `<meta charset="UTF-8" />` in `BaseLayout.astro` and insert the following block immediately after it:

```astro
  <script is:inline>
    (function () {
      var now = new Date();
      var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();

      // Chinese New Year [month, day] by year — update table around 2040
      var cny = {
        2024:[2,10], 2025:[1,29], 2026:[2,17], 2027:[2,6],  2028:[1,26],
        2029:[2,13], 2030:[2,3],  2031:[1,23], 2032:[2,11], 2033:[1,31],
        2034:[2,19], 2035:[2,8],  2036:[1,28], 2037:[2,15], 2038:[2,4],
        2039:[1,24], 2040:[2,12]
      };

      // Emoji data stored in JS (not CSS) for reliable cross-browser access
      window.__holidayEmojis = {
        'christmas':        { logo: '🎄 ', deco: '🎄 ⛄ 🎁 ❄️' },
        'halloween':        { logo: '🎃 ', deco: '🎃 🕸️ 🦇' },
        'july-4th':         { logo: '🇺🇸 ', deco: '🎆 🇺🇸 🎇 ⭐' },
        'st-patricks':      { logo: '☘️ ',  deco: '☘️ 🍀 🌟 🎶' },
        'mlk':              { logo: '🕊️ ', deco: '✊ 🕊️ ⭐ 🌟' },
        'valentines':       { logo: '❤️ ',  deco: '💕 ❤️ 🌹 💝' },
        'chinese-new-year': { logo: '🧧 ', deco: '🧧 🐉 🏮 🎆' },
        'veterans':         { logo: '🎖️ ', deco: '🇺🇸 ⭐ 🎖️ 🦅' }
      };

      // Returns day-of-month of the Nth Monday in a given month.
      // Formula: 1 + ((8 - dow) % 7) gives the day of the first Monday.
      // Verified: Jan 2026 starts Thu (dow=4) → firstMonday=5 → 3rd=19 ✓
      function nthMonday(year, month, n) {
        var date = new Date(year, month - 1, 1);
        var dow = date.getDay();
        var firstMonday = 1 + ((8 - dow) % 7);
        return firstMonday + (n - 1) * 7;
      }

      // DST-safe date window check using YYYYMMDD integer comparison.
      // NOTE: not safe across year boundaries — Christmas uses an explicit
      // range instead (see detect() below).
      function inWindow(y, m, d, wy, wm, wd, days) {
        function toInt(yy, mm, dd) { return yy * 10000 + mm * 100 + dd; }
        var target = new Date(wy, wm - 1, wd);
        var lo = new Date(target); lo.setDate(target.getDate() - days);
        var hi = new Date(target); hi.setDate(target.getDate() + days);
        var check = toInt(y, m, d);
        return check >= toInt(lo.getFullYear(), lo.getMonth() + 1, lo.getDate())
            && check <= toInt(hi.getFullYear(), hi.getMonth() + 1, hi.getDate());
      }

      function detect(y, m, d) {
        // Christmas window: Dec 11 – Jan 1 (intentionally asymmetric: 14 days
        // before Dec 25, 7 days after). Uses explicit range instead of inWindow()
        // because the window crosses a year boundary.
        if ((m === 12 && d >= 11) || (m === 1 && d === 1)) return 'christmas';

        var mlk  = nthMonday(y, 1, 3);
        var cnyd = cny[y];

        // Priority order (highest first after Christmas):
        if (inWindow(y, m, d, y, 10, 31, 4))                      return 'halloween';
        if (cnyd && inWindow(y, m, d, y, cnyd[0], cnyd[1], 3))    return 'chinese-new-year';
        if (inWindow(y, m, d, y, 2,  14, 7))                      return 'valentines';
        if (inWindow(y, m, d, y, 3,  17, 7))                      return 'st-patricks';
        if (inWindow(y, m, d, y, 7,  4,  7))                      return 'july-4th';
        if (inWindow(y, m, d, y, 1,  mlk, 3))                     return 'mlk';
        if (inWindow(y, m, d, y, 11, 11, 7))                      return 'veterans';
        return null;
      }

      var holiday = detect(y, m, d);
      if (holiday) document.documentElement.dataset.holiday = holiday;

      // Emoji injection runs after the DOM is ready (logo + deco elements exist).
      document.addEventListener('DOMContentLoaded', function () {
        var h = document.documentElement.dataset.holiday;
        if (!h || !window.__holidayEmojis[h]) return;
        var data = window.__holidayEmojis[h];
        var deco = document.getElementById('holiday-deco');
        var lel  = document.getElementById('holiday-emoji');
        if (deco) deco.textContent = data.deco;
        if (lel)  lel.textContent  = data.logo;
      });
    })();
  </script>
```

- [ ] **Step 2: Verify no build errors**

```bash
cd virtual-velocity && npm run check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd virtual-velocity
git add src/layouts/BaseLayout.astro
git commit -m "feat: add holiday detection inline script to BaseLayout"
```

---

### Task 5: End-to-end visual verification

No automated test can verify CSS rendering. Work through each holiday manually using the dev server.

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd virtual-velocity && npm run dev
```

Open http://localhost:4321

- [ ] **Step 2: Test each holiday via DevTools**

For each entry in the table below, open the browser console and run the shown command, then check the expected result. Remove the attribute between checks.

| Holiday | Console command | Check |
|---------|----------------|-------|
| Christmas | `document.documentElement.dataset.holiday='christmas'` | Header: forest green, gold text, 🎄 in logo, deco strip shows |
| Halloween | `document.documentElement.dataset.holiday='halloween'` | Header: near-black, orange text, 🎃 in logo |
| 4th of July | `document.documentElement.dataset.holiday='july-4th'` | Header: deep navy, white text, 🇺🇸 in logo |
| St. Patrick's | `document.documentElement.dataset.holiday='st-patricks'` | Header: forest green, gold text, ☘️ in logo |
| MLK Day | `document.documentElement.dataset.holiday='mlk'` | Header: dark brown, gold text, 🕊️ in logo |
| Valentine's | `document.documentElement.dataset.holiday='valentines'` | Header: deep rose, pink text, ❤️ in logo |
| Chinese New Year | `document.documentElement.dataset.holiday='chinese-new-year'` | Header: crimson, gold text, 🧧 in logo |
| Veterans Day | `document.documentElement.dataset.holiday='veterans'` | Header: midnight blue, brass text, 🎖️ in logo |

Also check on a **page with a hero section** (e.g. `/about`, `/services`) — the hero gradient should change color.

Also check the **mobile menu**: resize to mobile width, open the hamburger menu, and verify the overlay takes the holiday background color.

- [ ] **Step 3: Verify the live detection fires today**

Today is 2026-03-14. St. Patrick's Day window is Mar 10–24. The site should automatically show the St. Patrick's theme without any DevTools intervention when you load the page. Confirm this works.

- [ ] **Step 4: Verify contrast on the two most-likely-to-fail pairs**

Check these two pairs using the browser DevTools accessibility panel or https://webaim.org/resources/contrastchecker/:

| Foreground | Background | Holiday | Required | Pass? |
|-----------|-----------|---------|---------|-------|
| `#ff9500` | `#1a1a2e` | Halloween nav | ≥4.5:1 (WCAG AA normal text) | verify |
| `#d4af37` | `#1a0f00` | MLK nav | ≥4.5:1 (WCAG AA normal text) | verify |

If either fails, adjust the `--holiday-text` value for that holiday in `global.css` until the ratio reaches 4.5:1 or higher.

- [ ] **Step 5: Final commit**

```bash
cd virtual-velocity
git add -A
git commit -m "feat: holiday theming complete"
```

---

## Done

All 5 tasks complete. The site now automatically themes the header and hero for 8 holidays, driven entirely by client-side date detection with no build changes required for new holidays (only a `global.css` value change).

**To update Chinese New Year dates in the future:** edit the `cny` lookup table in `BaseLayout.astro` — the comment says "update around 2040".
