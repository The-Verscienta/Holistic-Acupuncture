# Facebook Conversions API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side Facebook Conversions API tracking for contact form submissions and phone calls, with support for Meta's Dataset Quality validation.

**Architecture:** Create a new `meta.ts` utility module that handles all Meta API communication. Hook into the existing contact form endpoint and create a new phone-click endpoint. Both send events server-side to Meta's Conversions API with proper PII hashing and customer data extraction.

**Tech Stack:** TypeScript, Astro API routes, SHA-256 hashing (Node.js crypto), fetch API

---

## File Structure

```
src/lib/meta.ts                    (new) Meta Conversions API utilities
src/pages/api/contact.ts           (modify) Add Meta conversion tracking after form success
src/pages/api/phone-click.ts       (new) Track phone call clicks from client
src/components/Header.astro        (modify) Add phone click event listener
src/components/Footer.astro        (modify) Add phone click event listener
src/pages/contact.astro            (modify) Add phone click event listener
.env.example                       (modify) Add META_CONVERSIONS_API_TOKEN, META_DATASET_ID
```

---

## Task 1: Create Meta Conversions API Utility Module

**Files:**
- Create: `src/lib/meta.ts`

- [ ] **Step 1: Create the file with SHA-256 hashing utility**

Create `src/lib/meta.ts`:

```typescript
import crypto from 'crypto';

/**
 * SHA-256 hash a string (for PII like email, phone)
 */
function hashSHA256(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

/**
 * Normalize and hash email (lowercase, trim, hash)
 */
function normalizeAndHashEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return hashSHA256(normalized);
}

/**
 * Normalize and hash phone number (remove non-digits, hash)
 */
function normalizeAndHashPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, '');
  if (normalized.length < 10) {
    throw new Error('Invalid phone number');
  }
  return hashSHA256(normalized);
}

export { hashSHA256, normalizeAndHashEmail, normalizeAndHashPhone };
```

- [ ] **Step 2: Add types for conversion events**

Add to `src/lib/meta.ts` at the end:

```typescript
/**
 * Customer data for a conversion event (hashed PII)
 */
export interface CustomerData {
  email?: string; // SHA-256 hashed
  phone_number?: string; // SHA-256 hashed
  client_ip_address?: string; // Not hashed
  client_user_agent?: string; // Not hashed
}

/**
 * Conversion event sent to Meta
 */
export interface ConversionEvent {
  event_name: 'Contact';
  event_time: number; // Unix timestamp in seconds
  action_source: 'website';
  event_id: string; // UUID
  event_source_url: string;
  custom_data?: {
    contact_reason?: string;
    contact_type?: string;
    contact_location?: string;
  };
  user_data: CustomerData;
}
```

- [ ] **Step 3: Add function to send events to Meta**

Add to `src/lib/meta.ts` at the end:

```typescript
/**
 * Send a conversion event to Meta's Conversions API
 */
export async function sendConversionEvent(
  event: ConversionEvent,
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const apiUrl = `https://graph.facebook.com/v18.0/${datasetId}/events`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Meta API error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Unknown error',
      };
    }

    const result = await response.json();
    console.log('Conversion event sent to Meta:', event.event_id);
    return {
      success: true,
      eventId: event.event_id,
    };
  } catch (error) {
    console.error('Failed to send conversion event to Meta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

- [ ] **Step 4: Add helper function to create contact conversion events**

Add to `src/lib/meta.ts` at the end:

```typescript
import { randomUUID } from 'crypto';

/**
 * Create and send a contact form conversion event
 */
export async function sendContactFormConversion(
  data: {
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
    sourceUrl: string;
    contactReason?: string;
  },
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const eventId = randomUUID();
  const customer_data: CustomerData = {
    client_ip_address: data.clientIp,
    client_user_agent: data.clientUserAgent,
  };

  // Hash PII if provided
  if (data.email) {
    try {
      customer_data.email = normalizeAndHashEmail(data.email);
    } catch (e) {
      console.warn('Failed to hash email:', e);
    }
  }

  if (data.phone) {
    try {
      customer_data.phone_number = normalizeAndHashPhone(data.phone);
    } catch (e) {
      console.warn('Failed to hash phone:', e);
    }
  }

  const event: ConversionEvent = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: eventId,
    event_source_url: data.sourceUrl,
    user_data: customer_data,
    custom_data: data.contactReason
      ? { contact_reason: data.contactReason }
      : undefined,
  };

  return sendConversionEvent(event, accessToken, datasetId);
}

/**
 * Create and send a phone call conversion event
 */
export async function sendPhoneCallConversion(
  data: {
    clientIp?: string;
    clientUserAgent?: string;
    sourceUrl: string;
    location: string;
  },
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const eventId = randomUUID();

  const event: ConversionEvent = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: eventId,
    event_source_url: data.sourceUrl,
    user_data: {
      client_ip_address: data.clientIp,
      client_user_agent: data.clientUserAgent,
    },
    custom_data: {
      contact_type: 'phone_click',
      contact_location: data.location,
    },
  };

  return sendConversionEvent(event, accessToken, datasetId);
}
```

- [ ] **Step 5: Commit the utility module**

```bash
git add src/lib/meta.ts
git commit -m "feat: add Meta Conversions API utilities

- Add SHA-256 hashing for PII (email, phone)
- Add ConversionEvent type and CustomerData interface
- Add sendConversionEvent() for Meta API communication
- Add sendContactFormConversion() helper
- Add sendPhoneCallConversion() helper"
```

---

## Task 2: Modify Contact API Endpoint to Track Conversions

**Files:**
- Modify: `src/pages/api/contact.ts`

- [ ] **Step 1: Add imports for Meta tracking**

At the top of `src/pages/api/contact.ts`, after existing imports:

```typescript
import { sendContactFormConversion } from '../../lib/meta';
```

- [ ] **Step 2: Extract helper to get client IP and user agent**

Add after the `getClientIp()` function in `src/pages/api/contact.ts`:

```typescript
function getClientUserAgent(request: Request): string {
  return request.headers.get('user-agent') || '';
}
```

- [ ] **Step 3: Add Meta conversion tracking after successful email send**

Find this section in the `POST` handler (around line 143-149):

```typescript
    // Send notification email to admin
    const notificationSent = await sendContactFormNotification({
      name,
      email,
      phone: data.phone?.trim().slice(0, MAX_PHONE_LENGTH) || undefined,
      message,
      referralSource: data.referralSource?.trim().slice(0, MAX_REFERRAL_LENGTH) || undefined,
    }, resendApiKey);

    if (!notificationSent) {
```

Replace with:

```typescript
    // Send notification email to admin
    const notificationSent = await sendContactFormNotification({
      name,
      email,
      phone: data.phone?.trim().slice(0, MAX_PHONE_LENGTH) || undefined,
      message,
      referralSource: data.referralSource?.trim().slice(0, MAX_REFERRAL_LENGTH) || undefined,
    }, resendApiKey);

    if (!notificationSent) {
```

Then add this right before the "Return success response" comment (around line 193):

```typescript
    // Send conversion event to Meta (non-critical, don't fail if this doesn't send)
    if (runtimeEnv.META_CONVERSIONS_API_TOKEN && runtimeEnv.META_DATASET_ID) {
      try {
        await sendContactFormConversion(
          {
            email,
            phone: data.phone?.trim().slice(0, MAX_PHONE_LENGTH),
            clientIp: getClientIp(request),
            clientUserAgent: getClientUserAgent(request),
            sourceUrl: request.headers.get('referer') || request.url,
            contactReason: data.referralSource,
          },
          runtimeEnv.META_CONVERSIONS_API_TOKEN,
          runtimeEnv.META_DATASET_ID
        );
      } catch (err) {
        console.error('Failed to send Meta conversion event:', err);
      }
    }
```

- [ ] **Step 4: Verify the modified section looks correct**

Check around line 193-205 that your code looks like this (showing context):

```typescript
    // Save submission to Sanity for record-keeping (non-critical)
    if (sanityWriteToken) {
      try {
        // ... sanity code ...
      } catch (err) {
        console.error('Failed to save contact submission to Sanity:', err);
      }
    }

    // Send conversion event to Meta (non-critical, don't fail if this doesn't send)
    if (runtimeEnv.META_CONVERSIONS_API_TOKEN && runtimeEnv.META_DATASET_ID) {
      try {
        await sendContactFormConversion(
          {
            email,
            phone: data.phone?.trim().slice(0, MAX_PHONE_LENGTH),
            clientIp: getClientIp(request),
            clientUserAgent: getClientUserAgent(request),
            sourceUrl: request.headers.get('referer') || request.url,
            contactReason: data.referralSource,
          },
          runtimeEnv.META_CONVERSIONS_API_TOKEN,
          runtimeEnv.META_DATASET_ID
        );
      } catch (err) {
        console.error('Failed to send Meta conversion event:', err);
      }
    }

    // Return success response
    return new Response(
```

- [ ] **Step 5: Commit the changes**

```bash
git add src/pages/api/contact.ts
git commit -m "feat: add Meta conversion tracking to contact form endpoint

- Send contact form submissions as 'Contact' conversion events
- Track customer info (email, phone, IP, user agent)
- Non-critical: don't fail form submission if Meta API is slow/down"
```

---

## Task 3: Create Phone Click Tracking Endpoint

**Files:**
- Create: `src/pages/api/phone-click.ts`

- [ ] **Step 1: Create the phone-click endpoint**

Create `src/pages/api/phone-click.ts`:

```typescript
import type { APIRoute } from 'astro';
import { sendPhoneCallConversion } from '../../lib/meta';

export const prerender = false;

/**
 * Phone Click Tracking API Endpoint
 *
 * Receives phone click events from JavaScript and sends them to Meta
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const metaToken = runtimeEnv.META_CONVERSIONS_API_TOKEN ?? import.meta.env.META_CONVERSIONS_API_TOKEN;
  const metaDatasetId = runtimeEnv.META_DATASET_ID ?? import.meta.env.META_DATASET_ID;

  try {
    // Parse request
    const data = await request.json();

    // Validate required fields
    if (!data.sourceUrl || !data.location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sourceUrl and location are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send conversion event to Meta (non-critical, fire-and-forget)
    if (metaToken && metaDatasetId) {
      try {
        await sendPhoneCallConversion(
          {
            clientIp: request.headers.get('cf-connecting-ip') ||
                     request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     undefined,
            clientUserAgent: request.headers.get('user-agent') || undefined,
            sourceUrl: data.sourceUrl,
            location: data.location,
          },
          metaToken,
          metaDatasetId
        );
      } catch (err) {
        console.error('Failed to send Meta phone click event:', err);
        // Don't fail the response - this is fire-and-forget
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Phone click endpoint error:', error);
    // Still return 200 - client doesn't care if this fails
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

- [ ] **Step 2: Commit the new endpoint**

```bash
git add src/pages/api/phone-click.ts
git commit -m "feat: add phone-click tracking endpoint

- Receives phone click events from client JavaScript
- Sends to Meta Conversions API as 'Contact' events
- Fire-and-forget: doesn't block user's phone action"
```

---

## Task 4: Add Phone Click Tracking to Header Component

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Find the phone link in Header**

Open `src/components/Header.astro` and locate the phone number link (likely in the navigation or contact section). Look for something like `href="tel:..."` or the phone number.

- [ ] **Step 2: Add a client-side script to track phone clicks**

Add this script to `src/components/Header.astro` (can be added at the end before closing tags):

```astro
<script>
  // Track phone call clicks from header
  document.addEventListener('DOMContentLoaded', () => {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        try {
          await fetch('/api/phone-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'header',
              sourceUrl: window.location.href,
            }),
          });
        } catch (error) {
          console.error('Failed to track phone click:', error);
          // Continue - don't block the phone call
        }
      });
    });
  });
</script>
```

- [ ] **Step 3: Commit the header changes**

```bash
git add src/components/Header.astro
git commit -m "feat: add phone click tracking to Header

- Track when users click phone number in header
- Send location='header' identifier to /api/phone-click"
```

---

## Task 5: Add Phone Click Tracking to Footer Component

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Find the phone link in Footer**

Open `src/components/Footer.astro` and locate the phone number link.

- [ ] **Step 2: Add phone click tracking script**

Add this script to `src/components/Footer.astro`:

```astro
<script>
  // Track phone call clicks from footer
  document.addEventListener('DOMContentLoaded', () => {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        try {
          await fetch('/api/phone-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'footer',
              sourceUrl: window.location.href,
            }),
          });
        } catch (error) {
          console.error('Failed to track phone click:', error);
        }
      });
    });
  });
</script>
```

- [ ] **Step 3: Commit the footer changes**

```bash
git add src/components/Footer.astro
git commit -m "feat: add phone click tracking to Footer

- Track when users click phone number in footer
- Send location='footer' identifier to /api/phone-click"
```

---

## Task 6: Add Phone Click Tracking to Contact Page

**Files:**
- Modify: `src/pages/contact.astro`

- [ ] **Step 1: Find phone elements on contact page**

Open `src/pages/contact.astro` and look for phone number displays or links (likely in the contact information section or hero).

- [ ] **Step 2: Add phone click tracking script**

Add this script to `src/pages/contact.astro`:

```astro
<script>
  // Track phone call clicks from contact page
  document.addEventListener('DOMContentLoaded', () => {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        try {
          await fetch('/api/phone-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'contact-page',
              sourceUrl: window.location.href,
            }),
          });
        } catch (error) {
          console.error('Failed to track phone click:', error);
        }
      });
    });
  });
</script>
```

- [ ] **Step 3: Commit the contact page changes**

```bash
git add src/pages/contact.astro
git commit -m "feat: add phone click tracking to contact page

- Track when users click phone number on contact page
- Send location='contact-page' identifier to /api/phone-click"
```

---

## Task 7: Update Environment Variable Documentation

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Open .env.example and find existing variables**

Open `virtual-velocity/.env.example` and locate the existing environment variables like `RESEND_API_KEY`, `SANITY_WRITE_TOKEN`, etc.

- [ ] **Step 2: Add Meta API variables**

Add these lines to `.env.example` (at the end or near other API keys):

```
# Meta Conversions API
META_CONVERSIONS_API_TOKEN=your_meta_access_token_here
META_DATASET_ID=your_meta_dataset_id_here
```

- [ ] **Step 3: Commit the documentation update**

```bash
git add .env.example
git commit -m "docs: add Meta Conversions API environment variables

- META_CONVERSIONS_API_TOKEN: Meta Business Account access token
- META_DATASET_ID: Conversion dataset ID from Ads Manager"
```

---

## Task 8: Deploy to Cloudflare and Add Secrets

**Files:**
- No code changes (configuration only)

- [ ] **Step 1: Get secrets from Meta**

In Meta Ads Manager:
1. Go to **Settings** → **Data Sources** → **Conversions API**
2. Copy your **Access Token** (long string starting with `EAA...`)
3. Copy your **Dataset ID** (usually 7-8 digits)

- [ ] **Step 2: Add secrets to Cloudflare wrangler config**

If you have `wrangler.toml`, add these under `[env.production]` or top-level:

```toml
[env.production]
vars = { ... existing vars ... }
secrets = [
  "META_CONVERSIONS_API_TOKEN",
  "META_DATASET_ID",
]
```

Or in your Cloudflare Pages project settings:
1. Go to **Settings** → **Environment variables**
2. Add `META_CONVERSIONS_API_TOKEN` with your Meta access token
3. Add `META_DATASET_ID` with your dataset ID

- [ ] **Step 3: Test locally (optional)**

Add to your local `.env` file (not committed):

```
META_CONVERSIONS_API_TOKEN=your_token
META_DATASET_ID=your_dataset_id
```

Run locally:

```bash
npm run dev
```

Submit a test contact form and check:
- Browser console: no errors
- Terminal: logs show "Conversion event sent to Meta"
- Astro dev server: request completes successfully

- [ ] **Step 4: Deploy to Cloudflare**

```bash
git push origin main
```

Cloudflare Pages will auto-deploy. Check:
1. Deployment succeeds
2. Submit a test contact form on production
3. Check Meta Ads Manager → Dataset Quality dashboard
4. Verify conversion events appear within 60 seconds

- [ ] **Step 5: Final verification**

Create a commit noting the deployment (even though secrets aren't in code):

```bash
git log --oneline -1
# Should show your latest code commit, not a secret commit
```

---

## Task 9: Monitor Dataset Quality and Validate Implementation

**Files:**
- No code changes (monitoring/validation only)

- [ ] **Step 1: Wait 5-10 minutes for data to arrive in Meta**

After submitting test conversions, Meta takes a few minutes to process.

- [ ] **Step 2: Check Meta's Dataset Quality Dashboard**

1. Log into Meta Ads Manager
2. Go to **Tools** → **Data Sources**
3. Select your Conversions API data source
4. Click **Dataset Quality** tab
5. Look for these metrics:
   - **Event Quality**: should show "Good" or "Excellent" (green)
   - **Matched Events**: % of events Meta matched to users
   - **Flagged Issues**: any red warnings? (should be none if implementation is correct)

- [ ] **Step 3: Check event details**

In the **Conversions** tab (not Dataset Quality):
1. Verify recent events appear
2. Check timestamps match when you submitted forms
3. Verify event names show "Contact"

- [ ] **Step 4: If quality is poor, investigate**

Common issues and fixes:

| Issue | Cause | Fix |
|-------|-------|-----|
| "Low match rate" | Missing email/phone data | Ensure form captures these fields |
| "Invalid data" | Hashing failed or bad format | Check logs for hashing errors |
| "No events showing" | Access token wrong/expired | Verify token in Cloudflare |
| "Duplicates" | Event IDs colliding | Check UUID generation in code |

View server logs in:
- Cloudflare Pages → Deployments → Recent → View logs
- Search for "Meta" or "conversion"

- [ ] **Step 5: Create final verification commit**

```bash
git log --oneline -5
# Review all commits from this feature
git show --stat HEAD~4..HEAD
# Show summary of changes
```

Your output should show approximately:
- Task 1: meta.ts (new, ~150 lines)
- Task 2: contact.ts (modified, ~30 lines added)
- Task 3: phone-click.ts (new, ~50 lines)
- Task 4-6: 3 component modifications (~10 lines each)
- Task 7: .env.example (modified, ~2 lines added)

---

## Summary of Changes

**New Files:**
- `src/lib/meta.ts` — Meta Conversions API utilities
- `src/pages/api/phone-click.ts` — Phone click tracking endpoint

**Modified Files:**
- `src/pages/api/contact.ts` — Add Meta conversion event after form success
- `src/components/Header.astro` — Track phone clicks from header
- `src/components/Footer.astro` — Track phone clicks from footer
- `src/pages/contact.astro` — Track phone clicks from contact page
- `.env.example` — Document Meta environment variables

**Secrets (not in code):**
- `META_CONVERSIONS_API_TOKEN` — Cloudflare Pages environment variable
- `META_DATASET_ID` — Cloudflare Pages environment variable

**Total commits:** 8
**Expected time:** 2-3 hours (including Meta setup and verification)

---

**Plan saved to:** `docs/superpowers/plans/2026-04-23-facebook-conversions-api.md`
