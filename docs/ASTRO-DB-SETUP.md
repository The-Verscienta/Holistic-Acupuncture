# Astro DB Setup Guide

## Windows ARM64 Compatibility Note

Due to native binary limitations on Windows ARM64, we're using **Astro Studio** (remote/hosted database) instead of local libSQL. This is actually the recommended approach for production anyway!

## Setup Steps

### 1. Create Astro Studio Account

1. Visit [https://studio.astro.build](https://studio.astro.build)
2. Sign in with GitHub
3. Create a new project or link to existing GitHub repo

### 2. Link Your Local Project

Run this command in the `virtual-velocity` directory:

```bash
npx astro login
npx astro link
```

Follow the prompts to connect to your Astro Studio project.

### 3. Push Database Schema

Once linked, push your database schema to Astro Studio:

```bash
npx astro db push
```

This will create the tables defined in `db/config.ts`:
- ContactSubmission
- TestimonialSubmission
- NewsletterSubscriber
- AppointmentRequest

### 4. Seed the Database (Optional)

To populate with sample data:

```bash
npx astro db execute db/seed.ts
```

Or use the Astro Studio web interface to add data manually.

## Database Tables

### ContactSubmission
Stores contact form submissions from the website.

**Columns:**
- `id` (number, primary key)
- `name` (text)
- `email` (text)
- `phone` (text, optional)
- `referralSource` (text, optional)
- `message` (text, optional)
- `submittedAt` (date)
- `status` (text, default: 'new') - values: new, contacted, resolved

### TestimonialSubmission
Stores patient testimonials pending approval.

**Columns:**
- `id` (number, primary key)
- `name` (text)
- `email` (text)
- `condition` (text)
- `testimonial` (text)
- `rating` (number, optional) - 1-5 stars
- `submittedAt` (date)
- `status` (text, default: 'pending') - values: pending, approved, rejected
- `publishedToSanity` (boolean, default: false)

### NewsletterSubscriber
Stores email newsletter subscribers.

**Columns:**
- `id` (number, primary key)
- `email` (text, unique)
- `subscribedAt` (date)
- `active` (boolean, default: true)

### AppointmentRequest
Stores appointment booking requests (future feature).

**Columns:**
- `id` (number, primary key)
- `name` (text)
- `email` (text)
- `phone` (text)
- `preferredDate` (text)
- `preferredTime` (text)
- `condition` (text, optional)
- `message` (text, optional)
- `submittedAt` (date)
- `status` (text, default: 'pending') - values: pending, confirmed, cancelled

## Using the Database

### In API Routes

```typescript
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { db, ContactSubmission } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  await db.insert(ContactSubmission).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    submittedAt: new Date(),
    status: 'new',
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
```

### In Pages (Read Data)

```astro
---
// src/pages/admin/submissions.astro
import { db, ContactSubmission, eq } from 'astro:db';

const newSubmissions = await db
  .select()
  .from(ContactSubmission)
  .where(eq(ContactSubmission.status, 'new'));
---

<div>
  {newSubmissions.map(sub => (
    <div>{sub.name} - {sub.email}</div>
  ))}
</div>
```

## Environment Variables

Astro Studio will automatically configure these after you run `npx astro link`:

- `ASTRO_STUDIO_APP_TOKEN` - Authentication token (stored in `.env`)

**Never commit `.env` to version control!** It's already in `.gitignore`.

## Local Development vs Production

- **Local Development:** Uses Astro Studio (remote database)
- **Production:** Uses Astro Studio (same remote database)
- **Benefits:**
  - Works on all platforms (including Windows ARM64)
  - Data persists between local and production
  - No need to seed database locally
  - Access database from Astro Studio dashboard

## Astro Studio Dashboard

Visit [https://studio.astro.build](https://studio.astro.build) to:
- View and edit database data
- See query logs
- Monitor performance
- Manage team access

## Free Tier Limits

Astro DB Free Tier includes:
- 500 databases
- 1 billion row reads per month
- 25 million row writes per month

This is more than enough for this project!

## Troubleshooting

### "Cannot find module '@libsql/win32-arm64-msvc'"

This error appears on Windows ARM64 when trying to use local libSQL mode. Solution: Use Astro Studio (remote mode) as described above.

### "Not authenticated"

Run `npx astro login` to authenticate with Astro Studio.

### "Project not linked"

Run `npx astro link` to connect your local project to Astro Studio.

### Tables not showing up

Run `npx astro db push` to sync your schema to Astro Studio.

## npm Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "db:push": "astro db push --force-reset",
    "db:seed": "astro db push --force-reset"
  }
}
```

## Next Steps

1. Run `npx astro login`
2. Run `npx astro link`
3. Run `npx astro db push`
4. Start building API endpoints!

For more information, see the [Astro DB documentation](https://docs.astro.build/en/guides/astro-db/).
