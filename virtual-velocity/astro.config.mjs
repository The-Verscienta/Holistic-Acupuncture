// @ts-check
import { defineConfig, envField, fontProviders, memoryCache } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://holisticacupuncture.net',
  integrations: [
    sitemap({
      // Blog posts are SSR; their prerendered shadow copies (see
      // src/pages/search-index/blog/[slug].astro) stand in at the real URL.
      serialize(item) {
        item.url = item.url.replace('/search-index/blog/', '/blog/');
        return item;
      },
    }),
  ],
  // Typed, validated environment (import from astro:env/server or astro:env/client).
  //  - public:  validated and inlined at BUILD time; a missing required value fails the build.
  //  - secret:  read per request from the Worker's runtime env (dashboard vars/secrets;
  //             .dev.vars locally) and never inlined into the bundle. All are optional
  //             because astro:env reads secrets when the module loads: a required one
  //             that is unset would take down every SSR route, not just its own.
  //             Callers handle absence (503 / skip Meta tracking / log and continue).
  env: {
    schema: {
      // Kiln CMS base URL. Same value at build (SSG) and request time (SSR blog,
      // /api/search), so it is inlined; a bare host is tolerated by kilnBaseUrl().
      KILN_API_URL: envField.string({ context: 'server', access: 'public' }),

      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Not secret, but set as Worker runtime vars (keep_vars): read at request time.
      RESEND_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_FROM_NAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_ADMIN_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      META_CONVERSIONS_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      META_DATASET_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      INDEXNOW_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),

      PUBLIC_GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', default: 'G-18D0JDVT23' }),
      PUBLIC_JANE_BOOKING_URL: envField.string({ context: 'client', access: 'public', url: true, default: 'https://ahha.janeapp.com' }),
      // Extra origin allowed by the API CSRF check (e.g. a preview deployment).
      PUBLIC_APP_URL: envField.string({ context: 'client', access: 'public', url: true, optional: true }),
    },
  },
  // Brand fonts, self-hosted from the build (Astro Fonts API). Rendered and
  // preloaded by src/components/SiteFonts.astro. Fallbacks ending in a generic
  // family get metric-matched (size-adjust/ascent/descent) fallback faces.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Jost',
      cssVariable: '--font-jost',
      weights: ['300 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      weights: ['400 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  // Route caching for the SSR blog (issue #55). Per-isolate memory cache, not
  // the adapter's cacheCloudflare(): that turns on Workers Cache, which bills
  // every request including today-free static assets (see wrangler.jsonc).
  // Trade-off: /api/indexnow-webhook can only clear the isolate that receives
  // the publish; other isolates catch up within maxAge. No `swr`: the memory
  // provider revalidates in an unawaited promise, which Workers may cancel
  // once the response is sent.
  // Only `page` and `category` change the rendered output, so they are the
  // only query params in the key (tracking params can't fragment the cache).
  cache: {
    provider: memoryCache({ max: 200, query: { include: ['page', 'category'] } }),
  },
  routeRules: {
    // Same 5 min as the post-list cache in src/lib/kilnQueries.ts.
    '/blog': { maxAge: 300, tags: ['blog'] },
    // Shorter: post bodies were fetched fresh per request before this.
    '/blog/[slug]': { maxAge: 120, tags: ['blog'] },
  },
  output: 'static', // Static by default, use prerender = false for SSR routes
  // Cloudflare Workers (static assets + Worker for SSR routes).
  // Keep imageService 'compile': the v14 default 'cloudflare-binding' bills
  // Cloudflare Images transformations.
  adapter: cloudflare({ imageService: 'compile' }),
  // Sessions are unused. Without this the adapter wires up a SESSION KV
  // binding and wrangler auto-provisions a KV namespace on deploy.
  session: false,
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Enable CSS code splitting for better caching
      cssCodeSplit: true,
      // Minify output for production
      minify: 'esbuild',
      // Set chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
  },
  build: {
    // Inline stylesheets to remove render-blocking CSS request (improves LCP)
    inlineStylesheets: 'always',
  },
  // Prefetch configuration for faster page navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  // Compress HTML output
  compressHTML: true,
});
