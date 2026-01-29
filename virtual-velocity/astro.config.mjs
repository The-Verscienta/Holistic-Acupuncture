// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
// NOTE: Astro DB import is conditionally included based on environment
// The libsql module doesn't support Windows ARM64, so db is disabled locally
// Production builds in Docker (Coolify) will work with db enabled
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Check if we should include db (not on Windows ARM64)
const isWindowsArm = process.platform === 'win32' && process.arch === 'arm64';
const integrations = [sitemap(), react()];

// Only add db on supported platforms
if (!isWindowsArm) {
  try {
    const { default: db } = await import('@astrojs/db');
    // @ts-ignore - db() returns AstroIntegration, push is valid
    integrations.push(db());
  } catch (e) {
    console.warn('Astro DB not available, running without database support');
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://holisticacupuncture.net',
  integrations,
  output: 'static', // Static mode with on-demand SSR for routes with prerender = false
  adapter: node({
    mode: 'standalone'
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