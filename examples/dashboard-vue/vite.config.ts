import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Relative base so the example works under the deployed site subpath
// (/examples/dashboard-vue/) and under GitHub Pages project paths.
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@treeui/vue/style.css': fileURLToPath(
        new URL('../../packages/vue/dist/style.css', import.meta.url),
      ),
    },
  },
});
