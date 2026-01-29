# Google Analytics 4 Setup Guide

**Last Updated:** 2026-01-10
**Service:** Google Analytics 4 (GA4)

## Overview

Google Analytics 4 is already integrated into the website. This guide covers setting up your GA4 account and connecting it to the site.

---

## Quick Setup (10 Minutes)

### Step 1: Create Google Analytics Account

1. Visit [Google Analytics](https://analytics.google.com)
2. Click "Start measuring"
3. Fill in account details:
   - **Account name:** Holistic Acupuncture
   - **Data sharing settings:** (optional, your choice)
4. Click "Next"

### Step 2: Create Property

1. **Property name:** Holistic Acupuncture Website
2. **Reporting time zone:** Central Time (US & Canada)
3. **Currency:** USD - US Dollar
4. Click "Next"

### Step 3: Business Information

1. **Industry:** Health & Fitness
2. **Business size:** Small (1-10 employees)
3. **How you'll use Analytics:** Select relevant options
4. Click "Create"
5. Accept Terms of Service

### Step 4: Set Up Data Stream

1. Choose platform: **Web**
2. **Website URL:** https://holisticacupuncture.net
3. **Stream name:** Holistic Acupuncture Main Site
4. Click "Create stream"

### Step 5: Get Measurement ID

1. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID

### Step 6: Add to Environment Variables

**Development (.env):**
```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Production (Netlify/Vercel):**
1. Go to deployment dashboard
2. Environment Variables section
3. Add: `PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
4. Redeploy site

---

## Features Enabled

The integration includes:

### Privacy-Focused Tracking
- **IP Anonymization:** Enabled
- **Cookieless tracking:** Available
- **GDPR compliant:** Yes
- **Production only:** GA only runs in production, not during development

### Automatic Event Tracking
- **Page views:** Automatically tracked
- **Scrolling:** Depth tracking
- **Outbound clicks:** External link tracking
- **File downloads:** PDF, doc downloads
- **Video engagement:** If videos added

### Custom Events (Optional)

Add custom event tracking:

```typescript
// In any component or page
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Track button click
function trackBookingClick() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'booking_click', {
      event_category: 'engagement',
      event_label: 'Book Appointment Button',
    });
  }
}

// Track form submission
function trackFormSubmit(formName: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'form_submit', {
      event_category: 'lead_generation',
      event_label: formName,
    });
  }
}
```

---

## Recommended Setup in GA4

### 1. Enable Enhanced Measurement

Already enabled by default, but verify:
1. Go to **Admin** → **Data Streams**
2. Click your web stream
3. Click "Enhanced measurement"
4. Ensure these are enabled:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ File downloads
   - ✅ Video engagement

### 2. Create Custom Events

**Goal: Track Appointment Bookings**
1. Go to **Configure** → **Events**
2. Click "Create event"
3. Name: `appointment_booking`
4. Configure matching conditions
5. Mark as **Conversion**

**Goal: Track Contact Form Submissions**
1. Create event: `contact_form_submit`
2. Mark as **Conversion**

### 3. Set Up Conversions

1. Go to **Configure** → **Conversions**
2. Mark these as conversions:
   - `appointment_booking`
   - `contact_form_submit`
   - `phone_click` (if tracked)

### 4. Create Audiences

**Engaged Users:**
- Users who viewed 3+ pages
- Spent 2+ minutes on site

**High Intent:**
- Visited pricing or services page
- Clicked contact information

**Returning Patients:**
- Visited 2+ times
- Engaged with testimonials

### 5. Link Google Search Console

1. Go to **Admin** → **Product Links**
2. Click "Link" next to Search Console
3. Select your Search Console property
4. Click "Confirm"

**Benefits:**
- See organic search queries
- Monitor search performance
- Track keyword rankings

---

## Key Reports to Monitor

### Real-Time Overview
- **Path:** Reports → Realtime
- **Use:** See current visitors, pages, events

### Traffic Sources
- **Path:** Reports → Acquisition → Traffic acquisition
- **Use:** See where visitors come from
  - Organic Search (Google)
  - Direct (typed URL)
  - Social (Facebook, Instagram)
  - Referral (other websites)

### Popular Pages
- **Path:** Reports → Engagement → Pages and screens
- **Use:** See most visited pages
  - Identify popular content
  - Find underperforming pages

### Conversions
- **Path:** Reports → Engagement → Conversions
- **Use:** Track goals achieved
  - Contact form submissions
  - Appointment bookings
  - Phone number clicks

### User Demographics
- **Path:** Reports → User → Demographics
- **Use:** Understand your audience
  - Age ranges
  - Gender
  - Location (city, state)
  - Device type (mobile, desktop)

---

## Privacy & Compliance

### HIPAA Compliance

**Important:** Google Analytics is **NOT HIPAA compliant** by default.

**Do NOT track:**
- Patient names
- Email addresses
- Phone numbers
- Health conditions
- Treatment information
- Any Protected Health Information (PHI)

**Safe to track:**
- Anonymous page views
- Anonymous traffic sources
- Device types
- Geographic location (city/state only)
- Non-PHI events (button clicks, form starts)

### GDPR Compliance

The integration includes:
- **IP anonymization:** Enabled
- **Cookie consent:** Consider adding banner
- **Data retention:** Set to 14 months
- **User data deletion:** Available in GA4

**Optional: Add Cookie Consent Banner**

For EU visitors, consider adding:
```astro
<!-- Example cookie consent (use a library like CookieConsent) -->
<script src="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.umd.js"></script>
<script>
  CookieConsent.run({
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        enabled: false,
        readOnly: false,
      },
    },
    onAccept: function() {
      // Enable Google Analytics when user accepts
      if (CookieConsent.acceptedCategory('analytics')) {
        // Initialize GA4
      }
    },
  });
</script>
```

---

## Alternative: Plausible Analytics

For a privacy-focused, HIPAA-friendly alternative:

### Why Plausible?
- ✅ **Privacy-first:** No cookies
- ✅ **HIPAA compliant:** Can be used with BAA
- ✅ **Simple:** Easy to understand
- ✅ **Lightweight:** <1KB script
- ✅ **GDPR compliant:** No consent needed

### Setup
1. Sign up at [Plausible.io](https://plausible.io)
2. Add site: holisticacupuncture.net
3. Get script tag
4. Add to BaseLayout.astro:

```astro
<!-- Plausible Analytics -->
<script defer data-domain="holisticacupuncture.net" src="https://plausible.io/js/script.js"></script>
```

**Cost:** $9/month for 10k pageviews

---

## Testing Analytics

### Verify Installation

1. **Real-time Report:**
   - Visit https://holisticacupuncture.net
   - Open GA4 → Reports → Realtime
   - Should see your visit

2. **Browser Console:**
   - Open DevTools (F12)
   - Network tab
   - Look for requests to `google-analytics.com`

3. **Google Tag Assistant:**
   - Install [Chrome extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visit your site
   - Check that GA4 tag fires

### Debug Mode

Enable debug mode for testing:

```typescript
gtag('config', gaId, {
  debug_mode: true,  // Add this
  anonymize_ip: true,
  cookie_flags: 'SameSite=None;Secure'
});
```

Then check: **Configure** → **DebugView** in GA4

---

## Monitoring & Reporting

### Set Up Weekly Email Reports

1. Go to **Reports** → Library
2. Create custom report
3. Click **Share** → **Schedule email**
4. Configure:
   - **Frequency:** Weekly
   - **Day:** Monday morning
   - **Recipients:** Your email

### Key Metrics Dashboard

Create a dashboard with:
- **Total visitors** (last 7 days)
- **New vs. returning** visitors
- **Top pages** viewed
- **Conversion rate** (forms submitted/visitors)
- **Traffic sources** breakdown
- **Average session duration**

### Monthly Review Checklist

- [ ] Review traffic trends
- [ ] Check conversion rates
- [ ] Identify top performing pages
- [ ] Find underperforming content
- [ ] Review traffic sources
- [ ] Check mobile vs. desktop
- [ ] Analyze geographic data
- [ ] Review search queries (if Search Console linked)

---

## Support Resources

- **GA4 Help Center:** https://support.google.com/analytics
- **GA4 Academy:** https://analytics.google.com/analytics/academy/
- **GA4 Setup Guide:** https://support.google.com/analytics/answer/9304153
- **Event Tracking:** https://support.google.com/analytics/answer/9267735

---

*Last updated: 2026-01-10*
