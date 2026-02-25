# Deployment: Cloudflare Pages + Sanity.io

This project is deployed on **Cloudflare Pages** with content from **Sanity.io**.

## Quick setup

### 1. Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the **holistic-acupuncture** repo and configure:

| Setting | Value |
|--------|--------|
| **Production branch** | `main` |
| **Root directory** | `virtual-velocity` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

3. Add **Environment variables** (Settings → Environment variables):

**Required (Sanity):**
```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
```

**Optional:**
```env
SANITY_API_TOKEN=your_write_token
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_JANE_BOOKING_URL=https://yourpractice.janeapp.com
```

4. Deploy. The site will be available at `https://<project>.pages.dev` (or your custom domain).

### 2. Sanity.io

- Content is managed in [Sanity](https://sanity.io). Use your existing Sanity project; the site reads from it at build time.
- For full CMS setup and schemas, see **docs/** (e.g. [Sanity CMS Guide](docs/SANITY-CMS-GUIDE.md)).

### 3. Rebuild when content changes (optional)

To trigger a new Cloudflare Pages deploy when you publish in Sanity:

1. Create a **Deploy hook** in Cloudflare Pages (Settings → Builds & Deployments → Deploy hooks).
2. Add a **webhook** in Sanity that calls that URL on publish.

Step-by-step: **[virtual-velocity/docs/sanity-cloudflare-webhook-setup.md](virtual-velocity/docs/sanity-cloudflare-webhook-setup.md)**.

---

## More detail

- **Full deployment guide** (Netlify, Vercel, Cloudflare, env vars, domains): [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)
- **Docs index**: [docs/CLAUDE.md](docs/CLAUDE.md)
