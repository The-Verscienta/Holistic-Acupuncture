# Deployment: Cloudflare Pages + Kiln CMS

This project is deployed on **Cloudflare Pages** with content from **Kiln CMS** (self-hosted, https://api.verscienta.com).

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

**Required (Kiln — set in BOTH Production and Preview environments; include the `https://`):**
```env
KILN_API_URL=https://api.verscienta.com
```

**Optional:**
```env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_JANE_BOOKING_URL=https://yourpractice.janeapp.com
```

4. Deploy. The site will be available at `https://<project>.pages.dev` (or your custom domain).

### 2. Kiln CMS

- Content is managed in the self-hosted [Kiln CMS](https://api.verscienta.com) (repo: `kiln_cms`, deployed via Coolify with the `PROJECT=acupuncture` overlay). The site reads published content from its JSON:API at build time, plus at runtime for the blog index and search API.

### 3. Rebuild when content changes

Static pages are built at deploy time, so publishing in Kiln needs a new Pages deploy:

1. Create a **Deploy hook** in Cloudflare Pages (Settings → Builds & Deployments → Deploy hooks).
2. Add a **webhook** in Kiln that calls that URL on publish (Admin → Webhooks).

---

## More detail

- **Full deployment guide** (Netlify, Vercel, Cloudflare, env vars, domains): [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)
- **Docs index**: [docs/CLAUDE.md](docs/CLAUDE.md)
