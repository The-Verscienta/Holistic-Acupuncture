# Sanity → Cloudflare Pages Auto-Rebuild Webhook Setup

This guide explains how to automatically rebuild your site when content changes in Sanity CMS, ensuring new blog posts and content updates go live automatically.

## How It Works

1. You publish a change in Sanity Studio
2. Sanity sends a webhook to Cloudflare Pages
3. Cloudflare triggers a new deployment from the `main` branch
4. The build runs `npm run build` and deploys the updated static site
5. New/updated content is live

## Step 1: Create a Cloudflare Pages Deploy Hook

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → your project
3. Go to **Settings** → **Builds & Deployments** → **Deploy hooks**
4. Click **Add deploy hook**
5. Name it `Sanity` and select the `main` branch
6. Copy the generated URL

> **Security Note:** Keep this URL secret - anyone with it can trigger deployments.

## Step 2: Add Webhook in Sanity

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Navigate to **API** → **Webhooks**
4. Click **Add Webhook**

### Webhook Configuration

| Field | Value |
|-------|-------|
| **Name** | `Cloudflare Deploy` |
| **URL** | Your Cloudflare deploy hook URL from Step 1 |
| **Trigger on** | Create, Update, Delete |
| **Filter** | See options below |
| **Projection** | Leave empty |
| **HTTP method** | `POST` |
| **HTTP Headers** | Leave empty |
| **API version** | `v2021-03-25` (or latest) |
| **Draft** | Unchecked (only published content) |
| **Status** | Enabled |

### Filter Options

**Option A: All Content (Recommended for small sites)**
Leave the filter empty to rebuild on any content change.

**Option B: Specific Content Types**
Only rebuild when blog posts, conditions, or team members change:
```groq
_type in ["blog", "condition", "teamMember", "testimonial", "faq"]
```

**Option C: Exclude Drafts and System Documents**
```groq
!(_id in path("drafts.**")) && !(_type match "system.*")
```

## Step 3: Test the Webhook

1. Open Sanity Studio
2. Make a small edit to any document (e.g., add a period to a blog post)
3. Click **Publish**
4. Go to Cloudflare dashboard → **Workers & Pages** → your project → **Deployments**
5. Verify a new deployment has started

## Troubleshooting

### Webhook Not Triggering

1. Check webhook is **Enabled** in Sanity
2. Verify the Cloudflare deploy hook URL is correct
3. Check Sanity webhook logs: **API** → **Webhooks** → Click your webhook → **Logs**

### Deployment Failing

1. Check Cloudflare Pages deployment logs
2. Common issues:
   - Build errors in code
   - Missing environment variables in Cloudflare Pages settings
   - Sanity API rate limits (unlikely)

### Too Many Deployments

If you're making many edits at once:
1. Cloudflare Pages will queue deployments if one is already running
2. Batch your edits and publish once at the end to minimize rebuilds

## Quick Reference

| Service | URL |
|---------|-----|
| Sanity Manage | https://sanity.io/manage |
| Sanity Webhooks | https://sanity.io/manage → Project → API → Webhooks |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Sanity Studio | https://holistic-acupuncture.sanity.studio |
