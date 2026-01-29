# Email Service Setup Guide

**Last Updated:** 2026-01-10
**Service:** Resend (https://resend.com)

## Overview

This guide covers setting up email notifications for form submissions using Resend, a modern email API service designed for developers.

**Why Resend?**
- ✅ Developer-friendly API
- ✅ Generous free tier (3,000 emails/month)
- ✅ Excellent deliverability
- ✅ No credit card required to start
- ✅ Simple setup (< 10 minutes)
- ✅ Built-in email verification

---

## Quick Setup (5 Minutes)

### Step 1: Create Resend Account

1. Visit [https://resend.com](https://resend.com)
2. Click "Start Building" or "Sign Up"
3. Sign up with GitHub or email
4. Verify your email address

### Step 2: Get API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it: "Holistic Acupuncture - Production"
4. Copy the API key (starts with `re_`)

### Step 3: Add to Environment Variables

**Development (.env file):**
```bash
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin email for notifications
PUBLIC_ADMIN_EMAIL=info@holisticacupuncture.net
```

**Production (Netlify/Vercel):**
1. Go to your deployment dashboard
2. Navigate to Environment Variables
3. Add:
   - `RESEND_API_KEY` = your API key
   - `PUBLIC_ADMIN_EMAIL` = info@holisticacupuncture.net

### Step 4: Verify Domain (Optional but Recommended)

For better deliverability, verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `holisticacupuncture.net`
4. Add DNS records to your domain:
   - **SPF Record:** TXT record
   - **DKIM Record:** CNAME record
   - **DMARC Record:** TXT record (optional)
5. Wait for verification (usually < 1 hour)

**Without domain verification:**
- Emails will be sent from `onboarding@resend.dev`
- Still works fine, but may have lower deliverability

**With domain verification:**
- Emails sent from `noreply@holisticacupuncture.net`
- Better deliverability and trust
- Professional appearance

---

## Email Templates

The email service includes three pre-built templates:

### 1. Contact Form Notification (to Admin)

**Sent to:** `PUBLIC_ADMIN_EMAIL`

**Triggered by:** Contact form submission

**Includes:**
- Name, email, phone
- How they found you
- Message content
- Reply-to set to customer's email

### 2. Testimonial Notification (to Admin)

**Sent to:** `PUBLIC_ADMIN_EMAIL`

**Triggered by:** Testimonial submission

**Includes:**
- Star rating
- Customer name and email
- Condition treated
- Testimonial text
- Link to admin dashboard

### 3. Confirmation Email (to Customer)

**Sent to:** Customer's email

**Triggered by:** Contact form submission

**Includes:**
- Thank you message
- Contact information
- Expected response time
- Professional branding

---

## Usage in API Endpoints

### Contact Form API

**File:** `src/pages/api/contact.ts`

```typescript
import { sendContactFormNotification, sendConfirmationEmail } from '../../lib/email';

export async function POST({ request }) {
  const data = await request.json();

  // Save to database
  // ...

  // Send admin notification
  await sendContactFormNotification({
    name: data.name,
    email: data.email,
    phone: data.phone,
    referralSource: data.referralSource,
    message: data.message,
  });

  // Send customer confirmation
  await sendConfirmationEmail(data.email, data.name);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
```

### Testimonial API

**File:** `src/pages/api/testimonial.ts`

```typescript
import { sendTestimonialNotification } from '../../lib/email';

export async function POST({ request }) {
  const data = await request.json();

  // Save to database
  // ...

  // Send admin notification
  await sendTestimonialNotification({
    name: data.name,
    email: data.email,
    condition: data.condition,
    testimonial: data.testimonial,
    rating: data.rating,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
```

---

## Testing Emails

### Local Development Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Submit test form:**
   - Visit `http://localhost:4321/contact`
   - Fill out form
   - Submit

3. **Check terminal:**
   - Look for email send logs
   - Check for any errors

4. **Check inbox:**
   - Verify email received
   - Check spam folder if not in inbox

### Test with Resend Logs

1. Go to [Resend Logs](https://resend.com/logs)
2. View all sent emails
3. Check delivery status
4. Preview email content

---

## Customizing Email Templates

All email templates are in `src/lib/email.ts`:

### Change Email Styling

```typescript
// Find the <style> section in each email function
const html = `
  <style>
    .header {
      background: linear-gradient(135deg, #7a9063 0%, #657a52 100%);
      /* Change colors here */
    }
  </style>
`;
```

### Change Email Content

```typescript
// Modify the HTML content
<p>Dear ${name},</p>
<p>Thank you for reaching out...</p>
<!-- Edit text here -->
```

### Add New Email Template

```typescript
export async function sendAppointmentReminder(data: AppointmentData): Promise<boolean> {
  const html = `
    <!-- Your custom HTML template -->
  `;

  const text = `
    Your plain text version
  `;

  return sendEmail({
    to: data.patientEmail,
    subject: 'Appointment Reminder',
    text,
    html,
  });
}
```

---

## Troubleshooting

### "RESEND_API_KEY not configured"

**Issue:** API key not found in environment variables.

**Solution:**
1. Check `.env` file exists in project root
2. Verify `RESEND_API_KEY=re_...` is present
3. Restart dev server after adding env variable
4. For production, check deployment platform env vars

### "Email send failed: 401 Unauthorized"

**Issue:** Invalid API key.

**Solution:**
1. Regenerate API key in Resend dashboard
2. Update `.env` file with new key
3. Update deployment environment variables
4. Ensure no extra spaces in API key

### "Email send failed: 403 Forbidden"

**Issue:** Domain not verified or rate limit exceeded.

**Solution:**
1. Check if you exceeded free tier (3,000 emails/month)
2. Verify domain in Resend dashboard
3. Check DNS records are correct
4. Wait if rate limited (resets monthly)

### Emails Going to Spam

**Solution:**
1. **Verify domain** in Resend (most important)
2. Add **SPF, DKIM, DMARC** records
3. Don't use spammy words in subject lines
4. Include unsubscribe link for newsletters
5. Warm up your domain (start with low volume)

### Emails Not Arriving

**Checklist:**
- [ ] Check spam folder
- [ ] Verify email address is correct
- [ ] Check Resend logs for delivery status
- [ ] Verify API key is valid
- [ ] Check domain verification status
- [ ] Ensure no typos in "to" email address

---

## Rate Limits & Pricing

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- Perfect for small businesses

### Paid Plans
If you exceed free tier:
- **$20/month:** 50,000 emails
- **$80/month:** 500,000 emails
- Custom pricing for higher volumes

**For this project:**
Assuming 10 contact forms/day:
- 300 emails/month (well within free tier)

---

## Alternative Email Services

If you prefer a different service:

### SendGrid
```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'admin@example.com',
  from: 'noreply@holisticacupuncture.net',
  subject: 'Contact Form',
  text: 'Message...',
  html: '<p>Message...</p>',
});
```

### Nodemailer (SMTP)
```typescript
// Install: npm install nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: 'noreply@holisticacupuncture.net',
  to: 'admin@example.com',
  subject: 'Contact Form',
  text: 'Message...',
  html: '<p>Message...</p>',
});
```

### Mailgun
```typescript
// Install: npm install mailgun.js form-data
import Mailgun from 'mailgun.js';
import formData from 'form-data';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

await mg.messages.create('holisticacupuncture.net', {
  from: 'noreply@holisticacupuncture.net',
  to: 'admin@example.com',
  subject: 'Contact Form',
  text: 'Message...',
  html: '<p>Message...</p>',
});
```

---

## Best Practices

### Security
- **Never expose** API keys in client-side code
- Use **environment variables** for all secrets
- **Validate** email addresses before sending
- **Sanitize** user input to prevent injection

### Deliverability
- **Verify your domain** for better deliverability
- Add **SPF/DKIM** records
- Use **professional email addresses** (no @gmail.com)
- **Warm up** your domain gradually
- Don't send **spammy content**

### Performance
- Use **async/await** for email sending
- Don't **block** form submission on email send
- Handle **errors gracefully**
- Log **failures** for debugging

### User Experience
- Send **confirmation emails** to users
- Keep email **templates clean** and mobile-friendly
- Include **contact information** in footers
- Set **reply-to** to customer's email for easy responses

---

## Monitoring & Analytics

### Resend Dashboard

Track:
- **Emails sent** (daily/monthly)
- **Delivery rate**
- **Bounce rate**
- **Complaint rate**
- **Click tracking** (if enabled)

### Custom Analytics

Add to your email functions:

```typescript
// Track email sends in analytics
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const success = await sendEmailViaResend(options);

  // Log to analytics
  if (import.meta.env.PROD) {
    await logAnalytics({
      event: 'email_sent',
      email_type: options.subject,
      success,
    });
  }

  return success;
}
```

---

## Support Resources

- **Resend Docs:** https://resend.com/docs
- **Resend API Reference:** https://resend.com/docs/api-reference
- **Email Best Practices:** https://resend.com/docs/knowledge-base
- **Support:** support@resend.com

---

*Last updated: 2026-01-10*
