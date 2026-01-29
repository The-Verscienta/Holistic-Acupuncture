# Sanity → Coolify Auto-Rebuild Webhook Setup

This guide explains how to automatically rebuild your site when content changes in Sanity CMS, ensuring the Pagefind search index stays up-to-date.

## How It Works

1. You publish a change in Sanity Studio
2. Sanity sends a webhook to Coolify
3. Coolify triggers a new deployment
4. The build runs `npm run build` which includes Pagefind indexing
5. Search results now include the new/updated content

## Step 1: Get Your Coolify Webhook URL

1. Log in to your Coolify dashboard
2. Navigate to your **holistic-acupuncture** application
3. Go to **Settings** or **Webhooks** section
4. Find or create a **Deploy Webhook URL**

The URL format looks like:
```
https://your-coolify-domain.com/api/v1/deploy?uuid=YOUR_APP_UUID&token=YOUR_SECRET_TOKEN
```

> **Security Note:** Keep this URL secret - anyone with it can trigger deployments.

## Step 2: Add Webhook in Sanity

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Navigate to **API** → **Webhooks**
4. Click **Add Webhook**

### Webhook Configuration

| Field | Value |
|-------|-------|
| **Name** | `Coolify Deploy` |
| **URL** | Your Coolify webhook URL from Step 1 |
| **Trigger on** | ✅ Create, ✅ Update, ✅ Delete |
| **Filter** | See options below |
| **Projection** | Leave empty |
| **HTTP method** | `POST` |
| **HTTP Headers** | Leave empty |
| **API version** | `v2021-03-25` (or latest) |
| **Draft** | ❌ Unchecked (only published content) |
| **Status** | ✅ Enabled |

### Filter Options

**Option A: All Content (Recommended for small sites)**
Leave the filter empty to rebuild on any content change.

**Option B: Specific Content Types**
Only rebuild when blog posts, conditions, or team members change:
```groq
_type in ["post", "condition", "teamMember", "testimonial"]
```

**Option C: Exclude Drafts and System Documents**
```groq
!(_id in path("drafts.**")) && !(_type match "system.*")
```

## Step 3: Test the Webhook

1. Open Sanity Studio
2. Make a small edit to any document (e.g., add a period to a blog post)
3. Click **Publish**
4. Go to Coolify dashboard
5. Verify a new deployment has started

## Troubleshooting

### Webhook Not Triggering

1. Check webhook is **Enabled** in Sanity
2. Verify the Coolify URL is correct
3. Check Sanity webhook logs: **API** → **Webhooks** → Click your webhook → **Logs**

### Deployment Failing

1. Check Coolify deployment logs
2. Common issues:
   - Build errors in code
   - Missing environment variables
   - Sanity API rate limits (unlikely)

### Too Many Deployments

If you're making many edits at once:
1. Add a debounce/delay in Coolify settings (if available)
2. Or batch your edits and publish once at the end

## Rate Limiting Considerations

- Sanity webhooks fire on every publish
- Consider adding a filter if you have frequent non-content updates
- Coolify may queue deployments if one is already running

## Alternative: Scheduled Rebuilds

If webhooks aren't working for your use case, you can set up scheduled rebuilds:

1. In Coolify, set up a cron schedule for deployments
2. Example: Rebuild every night at 2 AM
   ```
   0 2 * * *
   ```

This ensures search is updated at least daily, even if webhooks fail.

---

## Quick Reference

| Service | URL |
|---------|-----|
| Sanity Manage | https://sanity.io/manage |
| Sanity Webhooks | https://sanity.io/manage → Project → API → Webhooks |
| Coolify Dashboard | (your Coolify instance URL) |

---

*Last updated: January 2025*
