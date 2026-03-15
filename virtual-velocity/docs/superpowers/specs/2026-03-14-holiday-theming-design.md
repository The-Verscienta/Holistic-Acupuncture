# Holiday Theming — Design Spec
**Date:** 2026-03-14
**Status:** Approved

## Overview

Automatically switch the site's visual theme during the week of each holiday. The header and hero section get a full palette swap plus a decorative emoji strip and logo emoji. The rest of the site stays unchanged.

Holiday detection runs client-side using the visitor's local clock, via a synchronous inline script in `<head>`. This is intentional — the site is static (Cloudflare Pages) and the script must run before first paint to avoid a flash of unstyled content.

---

## Holidays & Windows

| Holiday | Window | Date logic |
|---------|--------|------------|
| Christmas | Dec 11 – Jan 1 | Explicit date range (year-boundary safe) |
| Halloween | Oct 27 – Nov 4 | ±4 days around Oct 31 |
| 4th of July | Jun 27 – Jul 11 | ±7 days around Jul 4 |
| St. Patrick's Day | Mar 10 – Mar 24 | ±7 days around Mar 17 |
| Valentine's Day | Feb 7 – Feb 21 | ±7 days around Feb 14 |
| Veterans Day | Nov 4 – Nov 18 | ±7 days around Nov 11 |
| MLK Day | 3rd Monday of January ±3 days | Calculated |
| Chinese New Year | Lunar new year date ±3 days | Lookup table 2024–2040 |

**Overlap rule (priority order, highest first):**
Christmas → Halloween → Chinese New Year → Valentine's Day → St. Patrick's Day → 4th of July → MLK Day → Veterans Day

- Halloween (Oct 27–Nov 4) and Veterans Day (Nov 4–Nov 18) overlap on Nov 4 only; Halloween takes priority via detection order.
- MLK Day (earliest start: Jan 12 — the 3rd Monday is Jan 15 at earliest, minus 3 days) never overlaps Christmas (ends Jan 1).
- Years outside the Chinese New Year lookup table silently produce no CNY theming — acceptable.
- Detection uses the visitor's local clock (client-side `new Date()`). No server-side timezone normalisation is applied.

---

## Intensity: Moderate

- Full palette swap on the header and hero section (background, text, gradient)
- Decorative emoji row above the hero heading — only on pages using `PageHero.astro`; pages without it show no deco row (acceptable)
- Holiday emoji prepended to the logo text in the header
- Mobile menu overlay: themed to match (same nav colors)
- Body, cards, footer, and all sections below the hero: unchanged

---

## Color Palettes

| Holiday | `data-holiday` value | Header/mobile bg | Hero gradient | Accent | Logo emoji | Deco emojis |
|---------|---------------------|-----------------|---------------|--------|-----------|-------------|
| Christmas | `christmas` | `#1a4a1a` | `#0d2b0d` → `#4a1010` | `#c8a83c` | 🎄 | 🎄 ⛄ 🎁 ❄️ |
| Halloween | `halloween` | `#1a1a2e` | `#1a1a2e` → `#2d1b4e` | `#ff6b00` | 🎃 | 🎃 🕸️ 🦇 |
| 4th of July | `july-4th` | `#001f5b` | `#001f5b` → `#8b0000` | `#cc0000` | 🇺🇸 | 🎆 🇺🇸 🎇 ⭐ |
| St. Patrick's | `st-patricks` | `#1a4a1a` | `#0d2b0d` → `#2a5c1a` | `#d4af37` | ☘️ | ☘️ 🍀 🌟 🎶 |
| MLK Day | `mlk` | `#1a0f00` | `#1a0f00` → `#3d2000` | `#d4af37` | 🕊️ | ✊ 🕊️ ⭐ 🌟 |
| Valentine's Day | `valentines` | `#5c0a1e` | `#5c0a1e` → `#8b1a3a` | `#e91e63` | ❤️ | 💕 ❤️ 🌹 💝 |
| Chinese New Year | `chinese-new-year` | `#8b0000` | `#8b0000` → `#3d0000` | `#ffd700` | 🧧 | 🧧 🐉 🏮 🎆 |
| Veterans Day | `veterans` | `#0a1628` | `#0a1628` → `#1a3050` | `#c8a83c` | 🎖️ | 🇺🇸 ⭐ 🎖️ 🦅 |

Note: Christmas and St. Patrick's share the same header background (`#1a4a1a`) and nav text (`#f5e642`) — intentional, they never overlap.

---

## Architecture

### Files changed

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | Add `<script is:inline>` in `<head>` — detects holiday, sets `data-holiday` on `<html>` before first paint |
| `src/styles/global.css` | Add 8 `[data-holiday="x"]` blocks + targeting rules for `#header` and `#mobile-menu` |
| `src/components/Header.astro` | Add `<span id="holiday-emoji" aria-hidden="true"></span>` inside the logo anchor, between the `<picture>` and the brand text spans |
| `src/components/PageHero.astro` | Add `class="holiday-hero"` to the `<section>` element; add `<div id="holiday-deco" aria-hidden="true"></div>` above the `<h1>` |

No new files. All detection and emoji data lives in the inline script (~100 lines of plain JS).

### Inline script (BaseLayout.astro)

Two responsibilities in a single `<script is:inline>`:

**1. Holiday detection — synchronous, before first paint**

```js
(function() {
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();

  // Chinese New Year [month, day] by year — update around 2040
  var cny = {
    2024:[2,10], 2025:[1,29], 2026:[2,17], 2027:[2,6],  2028:[1,26],
    2029:[2,13], 2030:[2,3],  2031:[1,23], 2032:[2,11], 2033:[1,31],
    2034:[2,19], 2035:[2,8],  2036:[1,28], 2037:[2,15], 2038:[2,4],
    2039:[1,24], 2040:[2,12]
  };

  // Emoji data — stored in JS, not CSS, for reliable cross-browser access
  window.__holidayEmojis = {
    'christmas':       { logo: '🎄 ', deco: '🎄 ⛄ 🎁 ❄️' },
    'halloween':       { logo: '🎃 ', deco: '🎃 🕸️ 🦇' },
    'july-4th':        { logo: '🇺🇸 ', deco: '🎆 🇺🇸 🎇 ⭐' },
    'st-patricks':     { logo: '☘️ ', deco: '☘️ 🍀 🌟 🎶' },
    'mlk':             { logo: '🕊️ ', deco: '✊ 🕊️ ⭐ 🌟' },
    'valentines':      { logo: '❤️ ', deco: '💕 ❤️ 🌹 💝' },
    'chinese-new-year':{ logo: '🧧 ', deco: '🧧 🐉 🏮 🎆' },
    'veterans':        { logo: '🎖️ ', deco: '🇺🇸 ⭐ 🎖️ 🦅' }
  };

  // Returns day-of-month of the Nth Monday in a given month
  // Formula: 1 + ((8 - dow) % 7) gives day of first Monday (dow=0..6)
  function nthMonday(year, month, n) {
    var date = new Date(year, month - 1, 1);
    var dow = date.getDay(); // 0=Sun, 1=Mon, …6=Sat
    var firstMonday = 1 + ((8 - dow) % 7);
    return firstMonday + (n - 1) * 7;
  }

  // DST-safe date range check: compares YYYYMMDD integers, not milliseconds
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
    // Christmas is checked first (highest priority) using an explicit date
    // range instead of inWindow() because the window crosses a year boundary
    // (Dec 25 ± 14 days spans into January of the *next* year, which inWindow
    // does not handle). Window: Dec 11–Jan 1 inclusive.
    if ((m === 12 && d >= 11) || (m === 1 && d === 1)) return 'christmas';

    var mlk  = nthMonday(y, 1, 3);
    var cnyd = cny[y];

    // Remaining holidays checked in priority order (highest first):
    if (inWindow(y,m,d, y,10,31, 4))                          return 'halloween';
    if (cnyd && inWindow(y,m,d, y,cnyd[0],cnyd[1], 3))        return 'chinese-new-year';
    if (inWindow(y,m,d, y,2,14,  7))                          return 'valentines';
    if (inWindow(y,m,d, y,3,17,  7))                          return 'st-patricks';
    if (inWindow(y,m,d, y,7,4,   7))                          return 'july-4th';
    if (inWindow(y,m,d, y,1,mlk, 3))                          return 'mlk';
    if (inWindow(y,m,d, y,11,11, 7))                          return 'veterans';
    return null;
  }

  var holiday = detect(y, m, d);
  if (holiday) document.documentElement.dataset.holiday = holiday;
})();
```

**2. DOM emoji injection — after DOMContentLoaded**

```js
document.addEventListener('DOMContentLoaded', function() {
  var h = document.documentElement.dataset.holiday;
  if (!h || !window.__holidayEmojis[h]) return;
  var data = window.__holidayEmojis[h];
  var deco = document.getElementById('holiday-deco');
  var lel  = document.getElementById('holiday-emoji');
  if (deco) deco.textContent = data.deco;
  if (lel)  lel.textContent  = data.logo;
});
```

### CSS structure (global.css)

**Step 1 — Per-holiday custom properties (8 blocks, one per `data-holiday` value):**

```css
[data-holiday="christmas"]       { --holiday-bg: #1a4a1a; --holiday-text: #f5e642; --holiday-hero-from: #0d2b0d; --holiday-hero-to: #4a1010; --holiday-accent: #c8a83c; }
[data-holiday="halloween"]       { --holiday-bg: #1a1a2e; --holiday-text: #ff9500; --holiday-hero-from: #1a1a2e; --holiday-hero-to: #2d1b4e; --holiday-accent: #ff6b00; }
[data-holiday="july-4th"]        { --holiday-bg: #001f5b; --holiday-text: #ffffff; --holiday-hero-from: #001f5b; --holiday-hero-to: #8b0000; --holiday-accent: #cc0000; }
[data-holiday="st-patricks"]     { --holiday-bg: #1a4a1a; --holiday-text: #f5e642; --holiday-hero-from: #0d2b0d; --holiday-hero-to: #2a5c1a; --holiday-accent: #d4af37; }
[data-holiday="mlk"]             { --holiday-bg: #1a0f00; --holiday-text: #d4af37; --holiday-hero-from: #1a0f00; --holiday-hero-to: #3d2000; --holiday-accent: #d4af37; }
[data-holiday="valentines"]      { --holiday-bg: #5c0a1e; --holiday-text: #ffb3c6; --holiday-hero-from: #5c0a1e; --holiday-hero-to: #8b1a3a; --holiday-accent: #e91e63; }
[data-holiday="chinese-new-year"]{ --holiday-bg: #8b0000; --holiday-text: #ffd700; --holiday-hero-from: #8b0000; --holiday-hero-to: #3d0000; --holiday-accent: #ffd700; }
[data-holiday="veterans"]        { --holiday-bg: #0a1628; --holiday-text: #c8a83c; --holiday-hero-from: #0a1628; --holiday-hero-to: #1a3050; --holiday-accent: #c8a83c; }
```

**Step 2 — Element targeting rules (added after the blocks above):**

Rather than modifying Astro component templates with inline styles (which would conflict with Tailwind v4 class utilities), the CSS targets the stable element IDs and the `<section>` in `PageHero.astro` directly from `global.css`:

```css
/* Header and mobile menu background + text */
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

/* PageHero gradient */
[data-holiday] .holiday-hero {
  background: linear-gradient(to bottom right, var(--holiday-hero-from), var(--holiday-hero-to)) !important;
  color: white;
}

/* Deco strip */
#holiday-deco:not(:empty) {
  font-size: 1.5rem;
  letter-spacing: 0.25rem;
  text-align: center;
  margin-bottom: 0.75rem;
}
```

`PageHero.astro` gets a `holiday-hero` class added to its `<section>` element. No other template changes are needed beyond the two new elements (`#holiday-emoji` in Header, `#holiday-deco` in PageHero) and the one new class on PageHero's section.

---

## Accessibility

- `#holiday-emoji` and `#holiday-deco` carry `aria-hidden="true"` — purely decorative
- Color contrast: implementer must verify all `--holiday-text` / `--holiday-bg` pairs meet ≥4.5:1 before merging (e.g. `#ff9500` on `#1a1a2e` for Halloween, `#d4af37` on `#1a0f00` for MLK). Do not ship unverified.
- No motion used (no animations)

---

## Out of scope

- Theming body, cards, footer, or any section below the hero
- Per-page theming variation
- Admin toggle to enable/disable theming
- Seasonal promotions or copy changes
