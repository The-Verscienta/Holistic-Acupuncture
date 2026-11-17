# Migration plan: Astro 5 → 7 and Cloudflare Pages → Workers

_Written 2026-11-14. Current: astro 5.16.7, @astrojs/cloudflare 12.6.12. Target: astro 7.4.x, @astrojs/cloudflare 14.4.x._

## Why this is one project, not two

`@astrojs/cloudflare` v13+ (required by Astro 6+) **removed Cloudflare Pages support**. So we can't upgrade Astro without also moving hosting from Pages to Workers (static assets + a Worker for SSR routes). We do both in one go, on a branch, then switch the domain over.

**Cost:** expected $0 change. Static asset requests are free on Workers just as on Pages. SSR/API requests are already billed as Workers requests today, because Pages Functions are Workers. Two settings to keep as they are (see [Cost guards](#cost-guards)).

**Estimated effort:** ~1–2 days of code + Cloudflare setup, then a few days running on a test URL before switching the domain.

---

## What has to change (from the codebase audit)

| Area | Today (Pages) | After (Workers) |
|---|---|---|
| Runtime secrets | `locals.runtime.env` in 9 files | `import { env } from 'cloudflare:workers'` (the `runtime` object is removed) |
| SSR routing | `scripts/fix-cloudflare-routes.js` writes `_routes.json` so only `/api/*` and `/blog*` hit the Function, excluding static `/blog/<slug>/` redirect pages | Workers serves a matching static file **before** the Worker by default, so static blog redirect pages win automatically. `_routes.json` isn't used → delete the script |
| `_redirects` / `_headers` | Pages features | Supported natively by Workers static assets, with the same caveat as today: not applied to Worker (SSR) responses |
| Build output | `dist/` is the static root | Adapter v14 outputs static files to `dist/client/` (verify). `build-search-index.js` hard-codes `dist/` |
| Deploys | Pages Git build + Pages deploy hook (Kiln webhook) | Workers Builds (Git) + Workers deploy hook → update the Kiln webhook URL |
| Node | Pages build image (`netlify.toml` says 20, probably unused) | Astro 7 requires Node ≥ 22 → set in Workers Builds |
| `@astrojs/node` fallback | Windows ARM64 local-build fallback in `astro.config.mjs` | Drop it (dev is on macOS now). Or bump to v11 if still wanted |
| Compiler | Go compiler that auto-corrects invalid HTML | Rust compiler: **unclosed tags fail the build**, invalid nesting (e.g. `<div>` in `<p>`) is no longer silently restructured |
| `import.meta.env` | Non-public vars become `process.env` refs | Astro 6+ **inlines** values at build time and no longer converts them to booleans/numbers. The `?? import.meta.env.RESEND_API_KEY` fallbacks would bake any build-time secret into the Worker bundle → remove them |

Checked and **not affected**: no content collections, `Astro.glob`, Zod schemas, `astro:transitions`, `src/fetch.ts`, `server:defer`, middleware, or `Astro` used inside `getStaticPaths`. `Astro.url.pathname` (Header/Nav/BaseLayout canonical) only changes for percent-encoded paths, which we don't use. Zaraz (Meta Pixel) is configured at the zone level, so it isn't affected by the move.

Files reading `locals.runtime.env`:
`src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/api/{search,contact,newsletter,testimonial,phone-click,indexnow-webhook}.ts`, plus the comment-documented pattern in `src/lib/email.ts` / `src/lib/kiln.ts`.

---

## Progress log

**2026-11-16 — Phases 0.1, 1, 2 and 3 done in code** (Cloudflare setup, Phases 4+, not started):
- Baseline recorded: `scripts/baseline-urls.json` (717 URLs from prod) + `scripts/check-urls.js record|compare`. Note: >3 concurrent SSR requests made the Kiln backend return spurious 500s, so the script defaults to concurrency 3 and retries 5xx.
- Installed astro 7.4.12, @astrojs/cloudflare 14.4.8, Vite 8.3, Tailwind 4.3.5, wrangler 4.163. Dropped `@astrojs/node`, the Linux binary pins (the lockfile carries them now), `netlify.toml`, `vercel.json`. Added `.nvmrc` (22) and `engines`.
- Confirmed: static output is `dist/client/`; the adapter writes `dist/server/wrangler.json` and `.wrangler/deploy/config.json` so a plain `wrangler deploy` picks it up.
- The adapter turns on sessions by default with a `SESSION` KV binding, which wrangler would auto-provision. Set `session: false` since sessions are unused.
- `wrangler.jsonc`: name `holistic-acupuncture`, `nodejs_compat`, observability on.
- Env: `src/lib/env.ts` (`runtimeEnv` from `cloudflare:workers`). All `locals.runtime.env` reads and secret `import.meta.env` fallbacks removed. Locally the build copies `.dev.vars` (or `.env`) into `dist/server/.dev.vars`, so **rebuild after editing `.dev.vars`** before `astro preview`.
- Rust compiler: 2 errors fixed (HTML comment inside a JSX expression in `CookieConsent.astro`, unclosed `<div>` in `Header.astro`). Normalised HTML diff of all 316 prerendered pages vs the Astro 5 build: no structural changes (only `&`→`&amp;` in attributes, whitespace, and the random testimonial picks).
- Local `check-urls compare` vs prod. The differences that matter:
  - **Trailing-slash redirects:** Workers' `html_handling` redirects `/acid-reflux` → `/acid-reflux/` with a 307 (temporary) where Pages used 308. Fixed by `scripts/finalize-redirects.js` (postbuild), which writes explicit `/dir /dir/ 301` rules.
  - **`_redirects` was mostly not loading, on Pages too.** Cloudflare treats every rule after the first wildcard as dynamic and silently skips everything past the 100th dynamic rule. `public/_redirects` has its first wildcard on rule 15, so about 160 exact-path rules never loaded. `finalize-redirects.js` moves static rules ahead of wildcards, which matches how the runtime already prioritises them. It also fails the build if a Workers limit (2000 static / 100 dynamic) would be exceeded.
  - Some of those dormant rules point at posts that were never migrated. Where a rule's target isn't a built page or sitemap URL, the script uses the destination of the meta-refresh page at the same path instead, and it warns about any rule with no fallback (currently none).
  - Result vs prod, following every baseline URL's full chain: every redirect is now a single permanent hop. `/3d-still-showing-sciatica-nerve` and `/blog/page/*` no longer 404. 11 legacy slugs (e.g. `/acupuncture-for-allergies`, `/athletes-tendon-ligament-injuries`) now land on their matching blog post instead of `/conditions`. Everything else ends where it does today.
  - `/blog/page/*` now 301s to `/blog` (the existing `_redirects` rule) where Pages returned 404.
  - Cosmetic: redirect responses have no `content-type`; `robots.txt` is `max-age=0` instead of 4h.
- Unmatched paths (404s, bot probes) now reach the Worker (billable request) instead of Pages' free static 404. Expected to be negligible at this traffic level.

## Phase 0: Preparation (no code changes)

1. **Record current behaviour as a baseline**, to diff against after the move:
   - URL list = sitemap URLs + every source in `public/_redirects` + every `public/**/index.html` redirect page + a handful of `/blog/<slug>/` and `/api/*` paths.
   - For each URL, record status, `Location`, and key headers (`Content-Security-Policy`, `Cache-Control`) from prod. Save as `scripts/baseline-urls.json` with a small `scripts/check-urls.js` that can re-run against any host.
2. **List Pages env vars/secrets** from the dashboard (Production + Preview): `KILN_API_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `PUBLIC_ADMIN_EMAIL`, `META_CONVERSIONS_API_TOKEN`, `META_DATASET_ID`, `INDEXNOW_WEBHOOK_SECRET`, `PUBLIC_*` build vars, `NODE_VERSION`, and anything else there.
3. **Check the Workers plan** on the account (Free vs Paid $5). Either is fine; it only sets the daily request cap for SSR/API.

## Phase 1: Dependency upgrade (branch `feat/astro-7-workers`)

1. Bump: `astro@7.4.x`, `@astrojs/cloudflare@14.4.x`, `@astrojs/sitemap@latest`, `@astrojs/check@latest`, `@tailwindcss/vite` / `tailwindcss` (confirm Vite 8 compatibility), `typescript`. Add `wrangler` as a devDependency (adapter peer dep `^4.125`).
2. Remove `@astrojs/node` and the try/catch adapter fallback. Simplify `astro.config.mjs` to:
   ```js
   adapter: cloudflare({ imageService: 'compile' }),
   ```
   (`platformProxy` is gone; v14 runs dev in `workerd` through the Cloudflare Vite plugin.)
3. Update the `optionalDependencies` Linux binary pins to match the new lockfile, or drop them if Workers Builds doesn't need them.
4. Add `.nvmrc` → `22` (or 24 LTS) and remove the stale `NODE_VERSION = "20"` from `netlify.toml`. Also delete `netlify.toml`/`vercel.json` if they're truly unused.
5. Add `wrangler.jsonc` (name, `compatibility_date`, `nodejs_compat` if the Resend SDK needs it). Check what the adapter generates automatically first and only override what's needed. **Don't** set `run_worker_first: true` or `not_found_handling` (see Cost guards / Risks).

## Phase 2: Code changes

1. **Env access:** add `src/lib/env.ts` wrapping `import { env } from 'cloudflare:workers'` with a typed getter. Replace every `(locals as any).runtime?.env` read with it and delete the `?? import.meta.env.<SECRET>` fallbacks for secrets. Keep `import.meta.env.PUBLIC_*` (build-time, fine to inline). Local dev secrets move to `.dev.vars` (gitignored). Run `wrangler types` for typings.
   - `kiln.ts`: build-time SSG still reads `import.meta.env.KILN_API_URL`. That's fine since it's a URL, not a secret. The runtime override comes from `env.KILN_API_URL`.
2. **Rust compiler:** run `astro build` and fix every unclosed-tag error. Then diff prerendered HTML from the old build against the new one (normalize whitespace) to catch invalid-nesting output changes, e.g. `<div>`/`<ul>` inside `<p>` in components and CMS-rendered rich text wrappers.
3. **Build scripts:**
   - `build-search-index.js`: point `distDir` at the static output directory (`dist/client` if confirmed). Make sure the `search-index/blog` shadow pages are still removed **before** deploy.
   - Delete `fix-cloudflare-routes.js` and its `postbuild` entry.
   - Check `generate-*-redirect*.js` / `convert-logo-to-webp.js` write to `public/` (they do), so they're unaffected.
   - Confirm `_redirects`, `_headers` and `pagefind/` end up in the static output directory.
4. **Optional hardening:** move secrets to `astro:env` (`envField.string({ context: 'server', access: 'secret' })`), which gives build-time validation that they're declared.

## Phase 3: Local verification

1. `npm run build && npx astro preview` (now runs in real `workerd`).
2. With `.dev.vars` populated using **test** values: submit contact/newsletter/testimonial (Resend test mode or a test inbox), hit `/api/search`, `/api/phone-click`, and `/api/indexnow-webhook` with a bad secret (expect 401).
3. Load `/blog/` and a few `/blog/<slug>/` posts. Load a legacy static page under `/blog/…/` and confirm it's served as the static file, not a 404 from the SSR route.
4. Run `scripts/check-urls.js` against `localhost` and diff against the baseline.
5. `npm run check` (astro check) clean.

## Phase 4: Cloudflare setup (alongside Pages; production untouched)

1. Workers & Pages → Create → **Worker** → connect the same GitHub repo. Root dir `virtual-velocity`, build `npm run build`, deploy `npx wrangler deploy`, preview `npx wrangler preview`. Set `NODE_VERSION` build variable if `.nvmrc` isn't picked up.
2. Add **variables** (plain) and **secrets** (encrypted) from the Phase 0 list. Build-time `PUBLIC_*` vars go in the **build** variables.
3. Enable preview builds for non-`main` branches. Deploy the branch and test on the `*.workers.dev` / preview URL.
4. Create a **Deploy Hook** (Settings → Builds → Deploy Hooks) for `main`. Keep the URL secret; don't add it to Kiln yet.

## Phase 5: Testing on the preview URL

Run on the workers.dev / preview URL for a few days:
- `check-urls.js` diff vs baseline: redirects (wildcards in `_redirects` still win over static files, per `redirects-architecture`), CSP and cache headers on static pages.
- Publish a test/draft post in Kiln and confirm `/blog/<new-slug>/` renders on the Worker **without a rebuild** (SSR).
- Forms send real email to an internal address; Meta CAPI phone-click returns 2xx.
- Pagefind search returns blog posts under `/blog/<slug>/`.
- Lighthouse/LCP spot-check vs prod (inline stylesheets, compressHTML unchanged).
- Workers dashboard: errors = 0, CPU per request well under the limit.

Known gap: Zaraz/GA only run on the real zone hostname, so verify them right after the switch.

## Phase 6: Switching production over (low-traffic window)

1. Merge the branch to `main`. Workers Builds deploys the Worker; the Pages project also builds, but nothing points at the Worker yet.
2. Move custom domains `holisticacupuncture.net` (+ `www`) from the Pages project to the Worker (Worker → Settings → Domains & Routes). Expect seconds to minutes of switchover.
3. Immediately: re-run `check-urls.js` against prod, submit the contact form, and check Zaraz fires (`/cdn-cgi/zaraz/t` 200) and GA4 realtime shows the hit.
4. In Kiln (api.verscienta.com), **replace** the Pages deploy-hook URL in the webhook endpoint with the Workers deploy-hook URL. Publish a trivial content edit to confirm a Workers build runs. The IndexNow webhook URL is on the site's own domain, so it's unchanged.
5. Pause automatic builds on the Pages project but **keep it** for rollback.

**Rollback:** move the custom domains back to the Pages project and point Kiln back at the Pages hook. Prod is back on the last Pages deploy (Astro 5) within minutes.

## Phase 7: Cleanup (after ~2 weeks stable)

- Delete the Pages project and its deploy hook.
- Update `DEPLOYMENT.md` (Pages → Workers instructions) and the deploy-pipeline / redirects memory notes.
- Turn on Workers Logs/observability if wanted.
- Re-run `npm audit` and confirm the critical/high Astro, adapter and Vite advisories are cleared.

---

## Cost guards

- Keep `imageService: 'compile'`. The v14 default `cloudflare-binding` bills Cloudflare Images transformations.
- Don't enable **Workers Cache**. It bills every request, including normally free static ones.
- Don't set `run_worker_first: true`. It routes all static traffic through the Worker (billable, and on Free plan returns 429s once over the daily cap).

## Risks / things to verify early

- **Static output directory and generated wrangler config for adapter v14.** Confirm in Phase 1 before touching scripts.
- **`not_found_handling: "404-page"`** must not be set. With navigation-prefers-assets, navigations to a not-yet-built `/blog/<new-slug>/` would get the static 404 instead of the SSR route. Test a fresh post in Phase 5.
- **Tailwind 4 Vite plugin on Vite 8.** Check for a compatible release before starting.
- **Resend SDK on workerd.** It may need `nodejs_compat`. It works today on Pages, so mirror whatever flags the Pages project has under Settings → Runtime.
- **`/blog` vs `/blog/` trailing slash** behaviour may differ between Pages and Workers asset routing. It's covered by the URL baseline diff.
