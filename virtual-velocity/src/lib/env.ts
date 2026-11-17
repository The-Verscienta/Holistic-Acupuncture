/**
 * Runtime environment for SSR routes and API endpoints on Cloudflare Workers.
 *
 * Variables and secrets set on the Worker (dashboard or `wrangler secret put`)
 * arrive here at request time. Locally, `astro dev` / `astro preview` read
 * them from `.dev.vars` (falling back to `.env`).
 *
 * Never read secrets via `import.meta.env`: since Astro 6 non-public
 * `import.meta.env` values are inlined at build time, so a secret present in
 * the build environment would be baked into the Worker bundle.
 * `import.meta.env.PUBLIC_*` is fine — those are public by definition.
 */
import { env } from 'cloudflare:workers';

export interface RuntimeEnv {
  KILN_API_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
  PUBLIC_ADMIN_EMAIL?: string;
  META_CONVERSIONS_API_TOKEN?: string;
  META_DATASET_ID?: string;
  INDEXNOW_WEBHOOK_SECRET?: string;
}

export const runtimeEnv = env as unknown as RuntimeEnv;
