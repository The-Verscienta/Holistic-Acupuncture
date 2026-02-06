// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Conditionally import Cloudflare adapter
// On Windows ARM64, workerd is not supported, so we use Node adapter for local builds
// Cloudflare Pages will use the correct adapter when deploying (via wrangler.toml)
let cloudflare;
try {
  cloudflare = (await import('@astrojs/cloudflare')).default;
} catch {
  console.warn('Cloudflare adapter not available (expected on Windows ARM64). Using Node adapter for local builds.');
  cloudflare = null;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://holisticacupuncture.net',
  integrations: [sitemap(), react()],
  output: 'static', // Static by default, use prerender = false for SSR routes
  adapter: cloudflare
    ? cloudflare({
        platformProxy: {
          enabled: false, // Disable local platform proxy
        },
        imageService: 'compile', // Optimize images at build time (sharp not available at runtime)
      })
    : node({
        mode: 'standalone',
      }),
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
    // Inline stylesheets smaller than this size
    inlineStylesheets: 'auto',
  },
  // Prefetch configuration for faster page navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  // Compress HTML output
  compressHTML: true,
});
