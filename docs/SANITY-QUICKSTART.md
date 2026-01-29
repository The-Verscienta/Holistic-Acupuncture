# Sanity CMS - Quick Start

## ⚡ Quick Setup (5 minutes)

### 1. Create Sanity Project
```bash
# Visit https://www.sanity.io and create account
# Create new project: "Holistic Acupuncture"
# Copy your Project ID
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials:
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
```

### 3. Update Sanity Config
Edit `sanity.config.ts` line 8:
```typescript
projectId: 'your-actual-project-id', // Replace this
```

### 4. Start Sanity Studio
```bash
npm run sanity
# Opens at http://localhost:3333
```

### 5. Add Some Content
- Open studio at localhost:3333
- Click "Blog Posts" → "Create" → Add a post
- Click "Testimonials" → "Create" → Add a review
- Publish!

---

## 📝 Content Types

| Type | Description | Usage |
|------|-------------|-------|
| **Blog Posts** | Articles & news | `getAllBlogPosts()` |
| **Testimonials** | Patient reviews | `getFeaturedTestimonials()` |
| **Conditions** | Treatable conditions | `getFeaturedConditions()` |
| **Team Members** | Practitioner profiles | `getAllTeamMembers()` |
| **FAQs** | Common questions | `getAllFAQs()` |

---

## 🚀 Using in Astro Pages

```astro
---
// src/pages/blog/index.astro
import { getAllBlogPosts } from '@/lib/sanityQueries';

const posts = await getAllBlogPosts();
---

<div>
  {posts.map(post => (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  ))}
</div>
```

---

## 🖼️ Working with Images

```astro
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

---

## 📦 Available Query Functions

```typescript
// Blog Posts
getAllBlogPosts()
getFeaturedBlogPosts(limit)
getBlogPostBySlug(slug)
getBlogPostsByCategory(category)

// Testimonials
getAllTestimonials()
getFeaturedTestimonials(limit)

// Conditions
getAllConditions()
getFeaturedConditions(limit)
getConditionsByCategory(category)
getConditionBySlug(slug)

// Team
getAllTeamMembers()
getTeamMemberBySlug(slug)

// FAQs
getAllFAQs()
getFAQsByCategory(category)
getFeaturedFAQs(limit)

// Homepage aggregate
getHomePageData()
```

---

## 🔧 Common Commands

```bash
# Start dev server (Astro)
npm run dev

# Start Sanity Studio
npm run sanity

# Deploy Sanity Studio
npm run sanity:deploy

# Build for production
npm run build
```

---

## ⚠️ Troubleshooting

### Can't see Sanity Studio?
- Make sure you ran `npm run sanity`
- Check it's running on port 3333
- Try visiting http://localhost:3333

### CORS Errors?
1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project → API → CORS Origins
3. Add these origins with credentials allowed:
   - `http://localhost:4321` (Astro dev)
   - `http://localhost:3000` (Studio dev)
   - `https://holisticacupuncture.net` (Production)
   - `https://www.holisticacupuncture.net` (Production www)
4. Save and restart your dev server

### Content not showing?
- Verify `.env` has correct Project ID
- Restart dev server after changing `.env`
- Check content is published in Sanity Studio
- Set `useCdn: false` in `src/lib/sanity.ts`

---

## 📚 Full Documentation

See [SANITY-CMS-GUIDE.md](../SANITY-CMS-GUIDE.md) for complete documentation.

---

## 🎯 Next Steps

1. ✅ Create Sanity project
2. ✅ Configure environment variables
3. ✅ Start Sanity Studio
4. 📝 Add sample content
5. 🔗 Update Astro pages to use Sanity data
6. 🚀 Deploy Sanity Studio
7. 🌐 Deploy website

---

**Need help?** Check the full guide or Sanity docs at https://www.sanity.io/docs
