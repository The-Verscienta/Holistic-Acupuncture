# Deployment (Cloudflare Pages)

## Contact form

The contact form sends email via [Resend](https://resend.com). To avoid **500 errors** and "Failed to send message" on submit, set these in **Cloudflare Pages → your project → Settings → Environment variables**:

**Important:** Cloudflare Pages injects env vars at **runtime** via `locals.runtime.env`, not at build time via Vite’s `import.meta.env`. The API routes read `RESEND_API_KEY` from `locals.runtime.env` first, then fall back to `import.meta.env` for local dev. So you must add the variables in the Cloudflare dashboard (not only in `.env`); otherwise the worker won’t see them.

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | **Yes** | API key from [Resend → API Keys](https://resend.com/api-keys). Create one and paste the key. |
| `PUBLIC_ADMIN_EMAIL` | Recommended | Where contact submissions are sent (e.g. `info@holisticacupuncture.net`). Defaults to `info@holisticacupuncture.net` if unset. |
| `RESEND_FROM_EMAIL` | If needed | Sender address; must use a [verified domain](https://resend.com/domains) in Resend. Defaults to `noreply@holisticacupuncture.net`. |
| `RESEND_FROM_NAME` | Optional | Sender name (e.g. "Holistic Acupuncture Website"). |

**Steps:**

1. Sign up at [resend.com](https://resend.com) and add/verify your domain (e.g. `holisticacupuncture.net`).
2. Create an API key under **API Keys** and copy it.
3. In Cloudflare Pages → **Settings** → **Environment variables**, add `RESEND_API_KEY` with that value for **Production** (and **Preview** if you want the form to work on branch deploys).
4. Add `PUBLIC_ADMIN_EMAIL` with the inbox that should receive contact form submissions.
5. Redeploy the project (or trigger a new build).

After that, the contact form should submit successfully and you’ll receive emails at `PUBLIC_ADMIN_EMAIL`.
