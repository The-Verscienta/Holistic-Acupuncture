# Coolify Deployment Guide

This guide covers deploying the Holistic Acupuncture website to [Coolify](https://coolify.io/), an open-source, self-hostable deployment platform.

## Prerequisites

- A Coolify instance (self-hosted or managed)
- A Git repository (GitHub, GitLab, or Bitbucket)
- Sanity CMS project credentials
- (Optional) Cloudflare Images account
- (Optional) ZeptoMail account for email functionality

## Deployment Methods

Coolify supports two deployment methods for this project:

1. **Dockerfile (Recommended)** - Uses the existing `Dockerfile`
2. **Nixpacks** - Auto-detects Astro and builds automatically

---

## Method 1: Docker Deployment (Recommended)

### Step 1: Create a New Resource

1. Log into your Coolify dashboard
2. Navigate to your project or create a new one
3. Click **"+ Add Resource"** → **"Application"**
4. Select your Git provider and repository

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| Build Pack | **Dockerfile** |
| Dockerfile Location | `Dockerfile` |
| Base Directory | **`/virtual-velocity`** |
| Publish Directory | (leave empty) |

> **Important:** The project files are in the `virtual-velocity/` subdirectory. You must set the Base Directory to `/virtual-velocity` for the build to work correctly.

### Step 3: Configure Environment Variables

Navigate to **Environment Variables** and add:

#### Required Variables

```env
# Sanity CMS (Required)
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production

# Runtime
NODE_ENV=production
HOST=0.0.0.0
PORT=4321
```

#### Optional Variables

```env
# Sanity API Token (for write operations)
SANITY_API_TOKEN=your_sanity_token

# Astro DB (for form submissions)
ASTRO_STUDIO_APP_TOKEN=your_astro_studio_token

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_IMAGES_TOKEN=your_api_token

# Email Service (ZeptoMail)
ZEPTOMAIL_TOKEN=your_zeptomail_token
ZEPTOMAIL_FROM_EMAIL=noreply@yourdomain.com
ZEPTOMAIL_FROM_NAME=Your Business Name

# Admin Dashboard
ADMIN_PASSWORD=your_secure_password
PUBLIC_ADMIN_EMAIL=admin@yourdomain.com

# Analytics
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Jane App Booking
PUBLIC_JANE_BOOKING_URL=https://yourpractice.janeapp.com
```

### Step 4: Configure Network Settings

1. Go to **Settings** → **General**
2. Set **Port Exposes**: `4321`
3. Set **Port Mappings**: `4321:4321`

### Step 5: Configure Domain

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Enable **HTTPS** (Coolify handles SSL automatically via Let's Encrypt)

### Step 6: Deploy

Click **Deploy** to start the build process.

---

## Method 2: Nixpacks Deployment

If you prefer automatic detection without Docker:

### Step 1: Create Application

1. Create a new application in Coolify
2. Select your Git repository

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| Build Pack | **Nixpacks** |
| Base Directory | **`/virtual-velocity`** |
| Build Command | `npm run build` |
| Start Command | `node ./dist/server/entry.mjs` |
| Install Command | `npm install` |

> **Important:** Set the Base Directory to `/virtual-velocity` since the project files are in that subdirectory.

### Step 3: Add Environment Variables

Same as Method 1 above.

### Step 4: Configure Port

Set exposed port to `4321`.

---

## Health Checks

Configure health checks to ensure your application is running:

1. Go to **Settings** → **Health Check**
2. Configure:

| Setting | Value |
|---------|-------|
| Path | `/` |
| Port | `4321` |
| Interval | `30` seconds |
| Timeout | `10` seconds |
| Retries | `3` |

---

## Persistent Storage (Required for Database)

The application uses Astro DB (SQLite) for form submissions and data storage. To persist data across deployments:

1. Go to **Settings** → **Storages**
2. Add a new volume:

| Setting | Value |
|---------|-------|
| Source | `/data/holistic-acupuncture` |
| Destination | `/app/data` |

This ensures contact form submissions, newsletter signups, and testimonials persist across container restarts and redeployments.

---

## Automatic Deployments

### GitHub Webhooks

1. In Coolify, go to **Settings** → **Webhooks**
2. Copy the webhook URL
3. In GitHub, go to **Settings** → **Webhooks** → **Add webhook**
4. Paste the URL and select **Push events**

### Branch-based Deployments

Configure branch triggers in Coolify:

| Branch | Environment |
|--------|-------------|
| `main` | Production |
| `staging` | Staging |
| `develop` | Development |

---

## Resource Limits

Recommended resource configuration:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 0.5 cores | 1 core |
| Memory | 512 MB | 1 GB |
| Storage | 1 GB | 2 GB |

---

## Troubleshooting

### Build Fails - Missing package-lock.json

**Issue:** Build fails with "npm ci can only install with an existing package-lock.json"
```
npm error The `npm ci` command can only install with an existing package-lock.json
```
**Solution:**
1. Ensure **Base Directory** is set to `/virtual-velocity` in Coolify settings
2. The Dockerfile now includes a fallback to `npm install` if the lock file is missing

### Build Fails - Node Version

**Issue:** Build fails during `npm install`
```bash
# Check Node.js version - requires Node 20+
```
**Solution:** Ensure Coolify uses Node 20. Add to environment:
```env
NODE_VERSION=20
```

### Application Won't Start

**Issue:** Container exits immediately
**Solution:** Verify environment variables are set:
```bash
# Check logs for missing variables
PUBLIC_SANITY_PROJECT_ID must be set
```

### Database Connection Issues

**Issue:** Build fails with "Attempting to build without the --remote flag or ASTRO_DATABASE_FILE"
```
[Astro DB Error] Attempting to build without the --remote flag or the ASTRO_DATABASE_FILE environment variable defined.
```
**Solution:** The Dockerfile has been updated to set `ASTRO_DATABASE_FILE=/app/data/astro.db`. Ensure you're using the latest Dockerfile.

**Issue:** Astro DB not persisting data
**Solution:**
1. Add persistent storage volume (see Persistent Storage section above)
2. Mount `/app/data` to a persistent volume in Coolify

### Port Binding Issues

**Issue:** Application unreachable
**Solution:** Verify port configuration:
```env
HOST=0.0.0.0
PORT=4321
```

### Memory Issues During Build

**Issue:** Build killed due to OOM
**Solution:** Increase build resources in Coolify settings to at least 2GB RAM for builds.

---

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate active (HTTPS)
- [ ] Sanity CMS content loading correctly
- [ ] Contact form submissions working
- [ ] Newsletter signup functional
- [ ] Search functionality operational
- [ ] Admin dashboard accessible at `/admin`
- [ ] Health checks passing

---

## Monitoring & Logs

### View Logs

1. Navigate to your application in Coolify
2. Click **Logs** tab
3. View real-time or historical logs

### Metrics

Coolify provides built-in metrics:
- CPU usage
- Memory usage
- Network I/O
- Container restarts

---

## Rollback

To rollback to a previous deployment:

1. Go to **Deployments** tab
2. Find the previous successful deployment
3. Click **Rollback** button

---

## Security Considerations

1. **Environment Variables**: Mark sensitive variables as "Secret" in Coolify
2. **Admin Password**: Use a strong, unique password for `ADMIN_PASSWORD`
3. **API Tokens**: Rotate tokens periodically
4. **Network**: Consider using Coolify's built-in firewall rules

---

## Updating the Application

### Manual Update

1. Push changes to your repository
2. Click **Redeploy** in Coolify

### Automatic Update

With webhooks configured, deployments trigger automatically on push.

---

## Support

- **Coolify Documentation**: https://coolify.io/docs
- **Coolify Discord**: https://coolify.io/discord
- **Astro Documentation**: https://docs.astro.build
