// @ts-check
import { defineConfig } from 'astro/config';
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
