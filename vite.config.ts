import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative so the site works from a GitHub Pages
// project subpath (e.g. user.github.io/bazaarsearch/) without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // The bundled dataset chunks are intentionally large and lazy-loaded.
    chunkSizeWarningLimit: 1100,
  },
  resolve: {
    // Vite 8 resolves tsconfig `paths` (our `store/...`, `components/...`) natively.
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Allows `@use 'styles/theme' as *;` from any .scss file.
        loadPaths: [resolve(import.meta.dirname, 'src')],
      },
    },
  },
});
