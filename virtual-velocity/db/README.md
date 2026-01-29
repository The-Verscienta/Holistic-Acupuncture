# Astro DB Configuration

This directory contains your Astro DB configuration and seed data.

## Files

- **config.ts** - Database schema definition with all tables
- **seed.ts** - Sample data for development/testing

## Quick Start

### Step 1: Authenticate with Astro Studio

```bash
npx astro login
```

This will open your browser to authenticate with GitHub.

### Step 2: Link Your Project

```bash
npx astro link
```

Select or create a new Astro Studio project.

### Step 3: Push Schema to Astro Studio

```bash
npx astro db push
```

This creates all the tables defined in `config.ts`:
- ContactSubmission
- TestimonialSubmission
- NewsletterSubscriber
- AppointmentRequest

### Step 4: Start Development

```bash
npm run dev
```

Your database is now ready to use!

## Why Astro Studio?

We're using Astro Studio (remote database) instead of local libSQL because:

1. **Windows ARM64 compatibility** - Works on all platforms
2. **Production-ready** - Same database for dev and production
3. **Team collaboration** - Share database access via Astro Studio
4. **Free tier** - 1B row reads/month, 25M row writes/month
5. **Web dashboard** - View and manage data at studio.astro.build

## Database Tables

### ContactSubmission
Stores contact form submissions from `/api/contact`

### TestimonialSubmission
Stores patient testimonials from `/api/testimonial` (pending approval)

### NewsletterSubscriber
Stores email newsletter subscribers

### AppointmentRequest
Stores appointment booking requests (future feature)

## API Endpoints

Example endpoints have been created:

- `POST /api/contact` - Submit contact form
- `POST /api/testimonial` - Submit testimonial

See the files in `src/pages/api/` for implementation details.

## Environment Variables

After running `npx astro link`, an `.env` file will be created with:

```
ASTRO_STUDIO_APP_TOKEN=your_token_here
```

**Never commit `.env` to git!** (Already in .gitignore)

## Learn More

- [Astro DB Documentation](https://docs.astro.build/en/guides/astro-db/)
- [Astro Studio Dashboard](https://studio.astro.build)
- [Setup Guide](../ASTRO-DB-SETUP.md) - Detailed instructions
