// Minimal typing for the Workers runtime module used by src/lib/env.ts.
// (`wrangler types` would generate ~10k lines of runtime typings we don't use.)
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
