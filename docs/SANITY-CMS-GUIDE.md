# Sanity CMS Integration Guide

Complete guide for setting up and using Sanity CMS with the Holistic Acupuncture website.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Initial Setup](#initial-setup)
3. [Content Types](#content-types)
4. [Managing Content](#managing-content)
5. [Querying Data](#querying-data)
6. [Deploying Sanity Studio](#deploying-sanity-studio)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

Sanity CMS is a headless CMS that provides a powerful content management interface (Sanity Studio) and a flexible API for fetching content.

### Why Sanity?
- ✅ **Flexible content modeling** - Define exactly what fields you need
- ✅ **Real-time collaboration** - Multiple editors can work simultaneously
- ✅ **Powerful querying** - GROQ query language for precise data fetching
- ✅ **Media management** - Built-in image optimization and hosting
- ✅ **Versioning** - Track changes and rollback if needed
- ✅ **Free tier** - Generous free plan for small teams

---

## Initial Setup

### Step 1: Create a Sanity Account

1. Visit [https://www.sanity.io](https://www.sanity.io)
2. Sign up for a free account
3. Create a new project:
   - Project name: "Holistic Acupuncture"
   - Dataset: "production"
   - Template: "Clean project with no predefined schemas"

### Step 2: Get Your Project Credentials

After creating your project, you'll receive:
- **Project ID**: A unique identifier (e.g., `abc123de`)
- **Dataset**: Usually "production"

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Sanity credentials in `.env`:
   ```env
   PUBLIC_SANITY_PROJECT_ID=your-project-id-here
   PUBLIC_SANITY_DATASET=production
   ```

3. Update `sanity.config.ts` with your project ID:
   ```typescript
   projectId: 'your-project-id-here',
   dataset: 'production',
   ```

### Step 4: Start Sanity Studio

Run Sanity Studio locally:
```bash
npm run sanity
```

The studio will open at `http://localhost:3333`

### Step 5: Deploy Sanity Studio (Optional)

Deploy your studio to Sanity's hosting:
```bash
npm run sanity:deploy
```

You'll get a URL like: `https://holisticacupuncture.sanity.studio`

---

## Content Types

We've created 5 content types for managing website content:

### 1. Blog Posts (`blogPost`)

Manage blog articles with rich content.

**Fields:**
- `title` - Post title
- `slug` - URL-friendly identifier
- `author` - Reference to team member
- `category` - Post category (Wellness, Pain Management, etc.)
- `excerpt` - Short summary (max 200 chars)
- `featuredImage` - Main image with alt text
- `content` - Rich text content with images
- `readTime` - Estimated reading time in minutes
- `publishedAt` - Publication date
- `featured` - Display prominently on blog page
- `seo` - Meta title and description

**Usage:**
```typescript
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/sanityQueries';

// Get all posts
const posts = await getAllBlogPosts();

// Get specific post
const post = await getBlogPostBySlug('benefits-of-acupuncture');
```

### 2. Testimonials (`testimonial`)

Patient reviews and success stories.

**Fields:**
- `author` - Patient name (use initials for privacy)
- `condition` - Condition treated
- `quote` - Testimonial text (50-500 chars)
- `rating` - Star rating (1-5)
- `date` - Review date
- `featured` - Show on homepage
- `verified` - Mark as verified patient
- `avatar` - Optional patient photo

**Usage:**
```typescript
import { getFeaturedTestimonials } from '@/lib/sanityQueries';

const testimonials = await getFeaturedTestimonials(6);
```

### 3. Conditions (`condition`)

Conditions treated with acupuncture.

**Fields:**
- `name` - Condition name
- `slug` - URL identifier
- `category` - Pain, Mental Health, Women's Health, etc.
- `description` - Short description for cards
- `icon` - SVG path for icon
- `detailedDescription` - Full explanation
- `symptoms` - List of symptoms
- `howAcupunctureHelps` - Treatment explanation
- `treatmentDuration` - Typical treatment length
- `relatedConditions` - References to related conditions
- `featuredOnHomepage` - Show on homepage
- `order` - Display order
- `seo` - Meta title and description

**Usage:**
```typescript
import { getFeaturedConditions, getConditionBySlug } from '@/lib/sanityQueries';

const featured = await getFeaturedConditions(6);
const condition = await getConditionBySlug('chronic-migraines');
```

### 4. Team Members (`teamMember`)

Practitioner profiles and staff information.

**Fields:**
- `name` - Full name
- `slug` - URL identifier
- `role` - Job title
- `credentials` - Professional credentials
- `photo` - Headshot with alt text
- `bio` - Full biography (rich text)
- `shortBio` - Brief bio for cards (max 200 chars)
- `specialties` - Areas of expertise
- `certifications` - Professional certifications
- `education` - Educational background
- `yearsExperience` - Years practicing
- `languages` - Languages spoken
- `email` - Contact email
- `phone` - Direct phone number
- `order` - Display order
- `active` - Currently practicing

**Usage:**
```typescript
import { getAllTeamMembers, getTeamMemberBySlug } from '@/lib/sanityQueries';

const team = await getAllTeamMembers();
const member = await getTeamMemberBySlug('david-curry');
```

### 5. FAQs (`faq`)

Frequently asked questions organized by category.

**Fields:**
- `question` - The question
- `answer` - The answer (text)
- `category` - Category (About Acupuncture, Treatment, Insurance, etc.)
- `order` - Display order within category
- `featured` - Show on homepage

**Usage:**
```typescript
import { getAllFAQs, getFAQsByCategory } from '@/lib/sanityQueries';

const allFAQs = await getAllFAQs();
const insuranceFAQs = await getFAQsByCategory('insurance-payment');
```

---

## Managing Content

### Adding New Blog Post

1. Open Sanity Studio (`npm run sanity`)
2. Click "Blog Posts" in the sidebar
3. Click "Create new document"
4. Fill in all required fields:
   - Write your title
   - Click "Generate" next to Slug
   - Select an author
   - Choose a category
   - Write the excerpt
   - Upload a featured image
   - Write your content using the rich text editor
   - Set read time
   - Set publication date
5. Click "Publish"

**Tips:**
- Use H2 for main sections, H3 for subsections
- Add images inline with captions
- Link to related blog posts or pages
- Preview before publishing

### Adding Testimonials

1. Navigate to "Testimonials"
2. Create new document
3. Enter patient name (e.g., "Sarah M.")
4. Describe condition treated
5. Write quote (be authentic!)
6. Set rating (usually 5 stars)
7. Set date
8. Check "Featured" to show on homepage
9. Publish

**Best Practices:**
- Always get patient permission
- Use first name + last initial for privacy
- Keep quotes authentic and specific
- Include variety of conditions
- Update regularly

### Managing Conditions

1. Navigate to "Conditions"
2. Create or edit condition
3. Set category appropriately
4. Write clear, patient-friendly description
5. Add symptoms list
6. Explain how acupuncture helps
7. Set display order (lower = first)
8. Check "Featured" for homepage display
9. Publish

### Updating Team Members

1. Navigate to "Team Members"
2. Create or edit member
3. Upload professional photo
4. Fill in all credentials
5. Write comprehensive bio
6. List specialties
7. Set display order
8. Ensure "Active" is checked
9. Publish

---

## Querying Data

### Using Query Helpers

We've created helper functions in `src/lib/sanityQueries.ts` for common queries:

```typescript
// In your .astro file
---
import { getAllBlogPosts, getFeaturedTestimonials } from '@/lib/sanityQueries';

const posts = await getAllBlogPosts();
const testimonials = await getFeaturedTestimonials(6);
---

<!-- Use in your template -->
{posts.map(post => (
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
))}
```

### Working with Images

Use the `urlFor` helper to generate optimized image URLs:

```typescript
---
import { urlFor } from '@/lib/sanity';

const imageUrl = urlFor(post.featuredImage)
  .width(800)
  .height(600)
  .auto('format')
  .url();
---

<img src={imageUrl} alt={post.featuredImage.alt} />
```

### Custom GROQ Queries

For advanced queries, use GROQ directly:

```typescript
import { sanityClient } from '@/lib/sanity';

const query = `*[_type == "blogPost" && featured == true] {
  title,
  slug,
  excerpt,
  "authorName": author->name
}`;

const results = await sanityClient.fetch(query);
```

### Portable Text Rendering

For rich text content, install a renderer:

```bash
npm install @portabletext/react
```

Or use our helper to extract plain text:

```typescript
import { toPlainText } from '@/lib/sanity';

const plainText = toPlainText(post.content);
```

---

## Deploying Sanity Studio

### Option 1: Deploy to Sanity (Recommended)

```bash
npm run sanity:deploy
```

This gives you a hosted studio at `your-project.sanity.studio`.

**Benefits:**
- No hosting costs
- Automatic updates
- SSL included
- Fast global CDN

### Option 2: Self-Host

You can host Sanity Studio anywhere that supports static sites:

1. Build the studio:
   ```bash
   npm run sanity:build
   ```

2. Deploy the `dist` folder to:
   - Netlify
   - Vercel
   - Any static host

---

## Production Configuration

### Configuring CORS for Production

When deploying your website to production, you must configure Sanity to accept requests from your production domain.

**Step 1: Access Sanity Project Settings**

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project (Holistic Acupuncture CMS)
3. Navigate to **API** settings in the left sidebar

**Step 2: Add CORS Origins**

Under "CORS Origins", add the following domains:

| Domain | Purpose | Credentials Allowed |
|--------|---------|-------------------|
| `http://localhost:4321` | Local development | Yes |
| `http://localhost:3000` | Sanity Studio dev | Yes |
| `https://holisticacupuncture.net` | Production website | Yes |
| `https://www.holisticacupuncture.net` | Production website (www) | Yes |
| `https://your-project.sanity.studio` | Hosted Sanity Studio | Yes |

**Step 3: Save and Test**

1. Click "Add origin" for each domain
2. Enable "Allow credentials" for all origins
3. Save your changes
4. Test your production site to ensure content loads correctly

### Environment Variables for Production

Ensure these environment variables are set in your production deployment (Netlify, Vercel, etc.):

```env
PUBLIC_SANITY_PROJECT_ID=6b7j3cf0
PUBLIC_SANITY_DATASET=production
```

**Netlify:**
- Go to Site Settings → Build & Deploy → Environment
- Add the variables above

**Vercel:**
- Go to Project Settings → Environment Variables
- Add the variables for Production environment

### API Token (Optional)

For read operations, no API token is required since the dataset is public. However, if you need to perform write operations from your website (e.g., form submissions that create content), you'll need to:

1. Go to **API** settings in Sanity
2. Click "Add API token"
3. Name it (e.g., "Production Website")
4. Select "Editor" or "Viewer" permissions
5. Copy the token and add it to your environment variables:
   ```env
   SANITY_API_TOKEN=your_token_here
   ```

**Important:** Keep API tokens secret! Never commit them to version control or expose them in client-side code.

---

## Troubleshooting

### Common Issues

#### 1. "Project ID not found"

**Problem:** Environment variables not loaded.

**Solution:**
- Ensure `.env` file exists
- Restart dev server after changing `.env`
- Verify `PUBLIC_SANITY_PROJECT_ID` is set correctly

#### 2. "CORS Error" in Console

**Problem:** Sanity project not configured to allow requests from your domain.

**Solution:**
1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project
3. Go to "API" settings
4. Add your domains to CORS origins:
   - `http://localhost:4321` (development)
   - `https://holisticacupuncture.net` (production)

#### 3. Images Not Loading

**Problem:** Image URLs not generated correctly.

**Solution:**
- Ensure `urlFor()` is used to generate image URLs
- Check that images have been uploaded to Sanity
- Verify project ID is correct

#### 4. Content Not Updating

**Problem:** CDN caching or query cache.

**Solution:**
- Set `useCdn: false` in `src/lib/sanity.ts` during development
- Clear browser cache
- Wait a few seconds for API to update

---

## Next Steps

### 1. Import Existing Content

You can bulk import content using Sanity's import tools:

```bash
sanity dataset import data.ndjson production
```

### 2. Add Content Validation

Enhance schemas with custom validation:

```typescript
defineField({
  name: 'email',
  type: 'string',
  validation: (Rule) => Rule.required().email()
})
```

### 3. Create Custom Previews

Add live previews for your content:

```typescript
preview: {
  select: {
    title: 'title',
    subtitle: 'author.name',
    media: 'featuredImage'
  }
}
```

### 4. Set Up Webhooks

Trigger builds when content changes:

1. Go to Sanity project settings
2. Add webhook for your hosting platform
3. Set trigger events (create, update, delete)

### 5. Add Content Workflows

Set up approval workflows for content:
- Draft/Published states
- Scheduled publishing
- Content approval processes

---

## Resources

- **Sanity Documentation:** https://www.sanity.io/docs
- **GROQ Cheat Sheet:** https://www.sanity.io/docs/query-cheat-sheet
- **Schema Types:** https://www.sanity.io/docs/schema-types
- **Image URLs:** https://www.sanity.io/docs/image-url
- **Portable Text:** https://www.sanity.io/docs/presenting-block-text

---

## Support

For questions or issues with Sanity integration:
1. Check Sanity documentation
2. Visit Sanity Slack community
3. Contact development team

**Remember:** Never commit your `.env` file to version control!
