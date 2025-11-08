import { defineConfig } from '@tanstack/start/config';

export default defineConfig({
  // Client-only mode (no SSR)
  server: {
    preset: 'static'
  },
  // Enable TypeScript
  typescript: true,
});
