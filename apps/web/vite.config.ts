import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: '0.0.0.0',
    hmr: {
      host: 'web.app.localhost',
      clientPort: 443,
      protocol: 'wss',
    },
  },
  test: {
    include: ['src/**/*.spec.ts'],
  },
});
