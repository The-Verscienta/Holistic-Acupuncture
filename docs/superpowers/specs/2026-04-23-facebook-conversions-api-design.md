---
name: Facebook Conversions API Integration with Dataset Quality Validation
description: Server-side Conversions API setup for contact form and phone call tracking, with Meta Dataset Quality API validation
type: design
date: 2026-04-23
---

# Facebook Conversions API Integration Design

## Overview

Add server-side Meta Conversions API tracking to the Acupuncture & Holistic Health Associates website to:
- Track contact form submissions as "Contact" conversions
- Track phone call clicks as "Contact" conversions
- Validate conversion data quality using Meta's Dataset Quality API

All tracking is server-side (no client-side Meta SDK), ensuring better data quality and compliance with privacy requirements.

## Goals & Success Criteria

- ✅ Contact form submissions are sent to Meta within seconds of submission
- ✅ Phone call clicks are tracked from all locations (header, footer, contact page, etc.)
- ✅ All events include required customer info (email, phone, IP, user agent)
- ✅ PII is properly hashed (SHA-256) before sending to Meta
- ✅ Meta's Dataset Quality API reports "Good" quality for conversions
- ✅ No breaking changes to existing contact form or phone tracking

## Architecture

### High-Level Flow

```
User Interaction
    ↓
1. Form Submission or Phone Click
    ↓
2. Request to Astro API Endpoint
    ↓
3. Extract Customer Data (email, phone, IP, user agent)
    ↓
4. Hash PII (SHA-256)
    ↓
5. Send Event to Meta Conversions API
    ↓
6. Return Success/Error to Client
    ↓
7. (Admin) Check Meta Dataset Quality Dashboard
```

### Implementation Points

#### 1. New Utility: `src/lib/meta.ts`
Handles all Meta Conversions API communication:
- `sendContactConversion(data)` — sends contact form submissions
- `sendPhoneCallConversion(data)` — sends phone call clicks
- `hashPII(value)` — SHA-256 hashes email/phone
- Error handling and logging

#### 2. Modified: `src/pages/api/contact.ts`
After successful form submission (email sent + Sanity saved):
- Extract customer data from request
- Call `sendContactConversion()` to notify Meta
- Non-critical (won't fail the form submission if Meta call fails)

#### 3. New: `src/pages/api/phone-click.ts`
Lightweight endpoint for phone call tracking:
- Accept phone click events from JavaScript
- Extract IP, user agent, page URL
- Call `sendPhoneCallConversion()` to notify Meta
- Return 200 (fire-and-forget)

#### 4. Modified: Components with Phone Numbers
Add JavaScript to track clicks:
- Header phone link
- Footer phone link
- Contact page hero phone link
- Any other phone number on the site

Pattern:
```javascript
element.addEventListener('click', async () => {
  await fetch('/api/phone-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'header', // or 'footer', 'contact-page', etc.
      sourceUrl: window.location.href
    })
  });
});
```

## Event Data Structure

### Contact Form Submission Event

**Event details:**
- `event_name`: "Contact"
- `event_time`: Unix timestamp (seconds)
- `action_source`: "website"
- `event_id`: UUID (prevents duplicates in Meta)
- `event_source_url`: URL of contact page where form was submitted

**Customer information (hashed):**
- `email`: SHA-256 hashed (required for quality)
- `phone_number`: SHA-256 hashed, E.164 format
- `client_ip_address`: Not hashed (Meta requirement)
- `client_user_agent`: Not hashed (Meta requirement)

**Event parameters:**
- `contact_reason`: Value from form's "reason" field (if available)

### Phone Call Event

**Event details:**
- `event_name`: "Contact"
- `event_time`: Unix timestamp (seconds)
- `action_source`: "website"
- `event_id`: UUID
- `event_source_url`: URL where phone link was clicked

**Customer information:**
- `client_ip_address`: From request headers (not hashed)
- `client_user_agent`: From request headers (not hashed)
- Email & phone are optional for phone-click events (user hasn't provided info yet)

**Event parameters:**
- `contact_type`: "phone_click"
- `contact_location`: "header" | "footer" | "contact-page" | etc.

## Dataset Quality Validation

### What Is Dataset Quality?

Meta's Dataset Quality API measures how well your conversion events can be matched to Meta users. Quality factors:
- Presence of customer data (email, phone, IP, user agent)
- Data format validity (proper email/phone format)
- Event deduplication (no duplicate event_ids)
- Match rate (% of events Meta can match to users)

### How We'll Validate

1. **After deployment**, log into Meta Ads Manager
2. Navigate to: **Settings** → **Data Sources** → **Conversions API** → **Dataset Quality**
3. Check the quality score for your dataset (target: "Good" or "Excellent")
4. Review flagged issues:
   - Low match rate → likely missing email/phone data
   - Invalid data → format issues in hashing or field mapping
   - Duplicates → check event_id generation

### Monitoring

We'll add logging to both API endpoints:
- Log each conversion event sent (event_id, timestamp, customer data fields present)
- Log any errors from Meta's API
- These logs help debug dataset quality issues

## Environment Setup

### Required Secrets (add to Cloudflare Wrangler/Pages)

| Variable | Source | Notes |
|----------|--------|-------|
| `META_CONVERSIONS_API_TOKEN` | Meta Ads Manager → Settings → Data Sources → Conversions API | Keep secure; rotate if leaked |
| `META_DATASET_ID` | Same location in Ads Manager | Your conversion dataset ID (usually 7-8 digits) |

### How It Works in Code

```typescript
// In Astro API routes
const runtimeEnv = (locals as any).runtime?.env ?? {};
const metaToken = runtimeEnv.META_CONVERSIONS_API_TOKEN ?? import.meta.env.META_CONVERSIONS_API_TOKEN;
const metaDatasetId = runtimeEnv.META_DATASET_ID ?? import.meta.env.META_DATASET_ID;
```

This pattern matches your existing RESEND_API_KEY setup, ensuring it works on:
- Local development (`import.meta.env`)
- Cloudflare Pages production (`locals.runtime.env`)

## Data Privacy & Compliance

### PII Handling

- **Email & phone**: SHA-256 hashed before sending to Meta (irreversible)
- **IP & user agent**: Sent unhashed (Meta requirement; used for matching only)
- **No sensitive data stored locally**: conversions are sent immediately, not stored

### GDPR/Privacy Considerations

- Meta will use hashed data to match users; they cannot reverse the hash
- User has already opted in via contact form or phone call intent
- Consider adding privacy policy note about Meta conversion tracking (if not already present)

## Error Handling

### Form Submission Errors
If Meta's API fails:
- Form submission still succeeds (return 200 to user)
- Conversion event is logged as failed
- Admin can retry via Dataset Quality dashboard in Meta

### Phone Click Errors
If Meta's API fails:
- Phone number still calls normally (no client-side blocker)
- Error is logged server-side
- No impact to user experience

Philosophy: **Never block user action because Meta API is slow or down.**

## Testing Strategy

1. **Local development**: Mock Meta API responses
2. **Staging**: Send to test conversion dataset (if available)
3. **Production**: Monitor Dataset Quality dashboard for first 7 days
4. **Validation**: Check that:
   - Form submissions appear in Meta within 60 seconds
   - Phone clicks are tracked
   - Dataset Quality score is "Good" or higher

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `src/lib/meta.ts` | Create | New Meta Conversions API utilities |
| `src/pages/api/contact.ts` | Modify | Add conversion tracking after form success |
| `src/pages/api/phone-click.ts` | Create | New endpoint for phone click tracking |
| Components (Header, Footer, etc.) | Modify | Add phone click event listeners |
| `.env.example` | Update | Add `META_CONVERSIONS_API_TOKEN` and `META_DATASET_ID` |
| Wrangler config | Update | Add secrets to Cloudflare Pages setup |

## Future Enhancements (Out of Scope)

- Track additional events: View Content (service pages), Search (site search)
- Client-side Facebook Pixel SDK (for retargeting pixels)
- Lead value tracking (e.g., $59 for new patient special)
- Lifecycle tracking (Lead → Patient → Returning Patient)

---

**Design approved by:** User  
**Implementation planned:** 2026-04-23  
**Expected completion:** 1-2 days
