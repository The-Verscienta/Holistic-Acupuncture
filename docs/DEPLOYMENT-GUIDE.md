# Deployment Guide

**Last Updated:** 2026-01-10
**Project:** Holistic Acupuncture Website

## Overview

This guide covers deploying the Holistic Acupuncture website to production using either Netlify or Vercel. Both platforms offer excellent Astro support, automatic HTTPS, and CDN distribution.

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All placeholder content is updated with real information
- [ ] Phone number and email addresses are updated
- [ ] Real staff photos and bios are added
- [ ] Sanity CMS is populated with content
- [ ] Astro DB is linked to Astro Studio
- [ ] Environment variables are documented
- [ ] App icons (PNG files) are generated
- [ ] All forms are tested locally
- [ ] Lighthouse audit shows 90+ scores
- [ ] Accessibility audit is complete
- [ ] Cross-browser testing is done

---

## Option 1: Deploy to Netlify (Recommended)

### Why Netlify?

- **Automatic Astro support** with zero configuration
- **Form handling** built-in (no backend needed)
- **Edge functions** for API endpoints
- **Preview deployments** for every pull request
- **One-click rollbacks**
- **Generous free tier**

### Step 1: Connect Repository

1. **Sign up/Login** to [Netlify](https://www.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your **GitHub** account
4. Select the **holistic-acupuncture** repository
5. Configure build settings:
   - **Base directory:** `virtual-velocity`
   - **Build command:** `npm run build`
   - **Publish directory:** `virtual-velocity/dist`
   - **Node version:** 20

### Step 2: Configure Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**, add:

```bash
# Astro DB (Astro Studio)
ASTRO_STUDIO_APP_TOKEN=your_token_here

# Sanity CMS
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token

# Optional: Analytics
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (2-5 minutes)
3. Site will be live at `https://random-name-12345.netlify.app`

### Step 4: Configure Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter `holisticacupuncture.net`
4. Follow DNS configuration instructions:
   - **A Record:** Point to Netlify's load balancer IP
   - **CNAME Record:** `www` → your-site.netlify.app
5. Wait for DNS propagation (1-48 hours)
6. Enable **HTTPS** (automatic with Let's Encrypt)

### Step 5: Configure Redirects

The `netlify.toml` file already includes:
- www → non-www redirect
- WordPress migration redirects
- API endpoint routing
- Security headers
- Cache control

### Step 6: Enable Form Notifications

1. Go to **Site settings** → **Forms**
2. Click **"Form notifications"**
3. Add email notification for form submissions:
   - **Email to notify:** info@holisticacupuncture.net
   - **Form name:** Contact form

---

## Option 2: Deploy to Vercel

### Why Vercel?

- **Built by Next.js team** (excellent framework support)
- **Serverless functions** for API endpoints
- **Automatic HTTPS**
- **Preview deployments**
- **Fast edge network**

### Step 1: Connect Repository

1. **Sign up/Login** to [Vercel](https://vercel.com)
2. Click **"Add New Project"**
3. Import **holistic-acupuncture** repository from GitHub
4. Configure project:
   - **Framework Preset:** Astro
   - **Root Directory:** `virtual-velocity`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2: Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

```bash
ASTRO_STUDIO_APP_TOKEN=your_token_here
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token
```

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Site live at `https://holistic-acupuncture.vercel.app`

### Step 4: Configure Domain

1. Go to **Settings** → **Domains**
2. Add **holisticacupuncture.net**
3. Configure DNS records at your domain registrar:
   - **A Record:** 76.76.21.21
   - **CNAME:** `www` → cname.vercel-dns.com
4. Enable **HTTPS** (automatic)

### Step 5: Configure Redirects

The `vercel.json` file includes:
- www → non-www redirect
- WordPress migration redirects
- Security headers
- Cache control

**Note:** Vercel does not have built-in form handling. You'll need to use:
- **Astro DB API endpoints** (already implemented)
- **External service** like Formspree or SendGrid

---

## Option 3: Cloudflare Pages

### Why Cloudflare Pages?

- **Free unlimited bandwidth**
- **Global CDN**
- **Built-in analytics**
- **DDoS protection**
- **Simple deployment**

### Quick Setup

1. Sign up at [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repository
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Root directory:** `virtual-velocity`
4. Add environment variables
5. Deploy

---

## Post-Deployment Tasks

### 1. Verify Deployment

- [ ] Visit site and test all pages
- [ ] Test contact form submission
- [ ] Verify Sanity content loads
- [ ] Check images load correctly
- [ ] Test navigation and links
- [ ] Verify mobile responsiveness

### 2. Configure DNS

**At your domain registrar** (GoDaddy, Namecheap, etc.):

#### For Netlify:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

#### For Vercel:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Set Up Monitoring

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) - Free monitoring
- [Pingdom](https://www.pingdom.com) - Advanced monitoring

**Performance Monitoring:**
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### 4. Enable Analytics

Add Google Analytics 4 or Plausible Analytics:

```astro
<!-- In BaseLayout.astro <head> -->
{import.meta.env.PUBLIC_GA_MEASUREMENT_ID && (
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA_MEASUREMENT_ID}`}></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', import.meta.env.PUBLIC_GA_MEASUREMENT_ID);
  </script>
)}
```

### 5. Submit Sitemap

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for `holisticacupuncture.net`
3. Verify ownership (DNS method recommended)
4. Submit sitemap: `https://holisticacupuncture.net/sitemap.xml`

### 6. Set Up SSL Certificate

Both Netlify and Vercel provide **automatic HTTPS** with Let's Encrypt.

Verify:
- Visit `https://holisticacupuncture.net`
- Check for padlock icon in browser
- Ensure redirects from HTTP to HTTPS work

---

## Continuous Deployment

### Automatic Deployments

Both Netlify and Vercel automatically deploy when you:
- **Push to main branch** → Production deployment
- **Open pull request** → Preview deployment
- **Push to staging branch** → Staging deployment (optional)

### Deploy Workflow

```bash
# Make changes
git add .
git commit -m "Update homepage content"
git push origin main

# Automatically triggers:
# 1. Build on Netlify/Vercel
# 2. Run tests (if configured)
# 3. Deploy to production
# 4. Purge CDN cache
```

### Rollback

**Netlify:**
1. Go to **Deploys** tab
2. Find previous deploy
3. Click **"Publish deploy"**

**Vercel:**
1. Go to **Deployments**
2. Find previous deployment
3. Click **"...** → **Promote to Production"**

---

## Staging Environment

### Netlify Branch Deploys

1. Create `staging` branch
2. Netlify automatically creates deploy at `staging--your-site.netlify.app`
3. Use for testing before production

### Vercel Preview Deployments

- Every pull request gets unique preview URL
- Perfect for review before merging

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Astro DB connection failed"**
```bash
# Solution: Check environment variable
# ASTRO_STUDIO_APP_TOKEN must be set in deployment platform
```

### Forms Not Working

**Netlify:**
- Ensure form has `data-netlify="true"` attribute
- Check form name is unique
- Verify in Site settings → Forms

**Vercel:**
- Forms use API endpoints in `/api/` directory
- Check Astro DB connection
- Verify API routes are working

### Images Not Loading

- Check image paths are relative: `/images/photo.jpg`
- Verify images exist in `public/` directory
- Check Sanity image URLs are correct

---

## Security Best Practices

### Environment Variables

- **Never commit** `.env` to Git
- Use **different tokens** for staging/production
- **Rotate secrets** periodically
- Use **environment-specific** configurations

### Headers

Security headers are configured in `netlify.toml` and `vercel.json`:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection` - XSS filter
- `Referrer-Policy` - Controls referrer information

### HTTPS

- Force HTTPS redirects (automatic on Netlify/Vercel)
- Use HSTS header for browsers
- Ensure all external resources use HTTPS

---

## Performance Optimization

### CDN Caching

Cache-Control headers are set in deployment config:
- **Static assets:** 1 year cache
- **HTML pages:** No cache (dynamic content)
- **API responses:** No cache

### Image Optimization

- Use Sanity Image CDN for CMS images
- Optimize static images before upload
- Use WebP format where possible
- Implement lazy loading (already done)

### Build Optimization

```bash
# Check build size
npm run build
du -sh dist/

# Target: < 5MB total
```

---

## Cost Estimates

### Netlify
- **Free Tier:** 100GB bandwidth, 300 build minutes/month
- **Typical Cost:** $0/month (under free tier limits)
- **Pro Plan:** $19/month if needed

### Vercel
- **Free Tier:** Unlimited bandwidth for personal projects
- **Typical Cost:** $0/month
- **Pro Plan:** $20/month for team features

### Cloudflare Pages
- **Free Tier:** Unlimited bandwidth, 500 builds/month
- **Typical Cost:** $0/month

**Recommendation:** Start with free tier, upgrade only if needed.

---

## Maintenance Schedule

### Daily
- Monitor uptime alerts
- Check form submissions

### Weekly
- Review analytics
- Check for broken links
- Monitor site speed

### Monthly
- Update dependencies
- Review security headers
- Check SSL certificate expiration
- Backup Sanity content

### Quarterly
- Performance audit
- Accessibility review
- Content audit
- SEO checkup

---

## Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs
- **Astro Deployment:** https://docs.astro.build/en/guides/deploy/
- **GitHub Actions:** For custom CI/CD workflows

---

*Last updated: 2026-01-10*
