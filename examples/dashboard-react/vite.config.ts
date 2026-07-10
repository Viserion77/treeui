import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Relative base so the example works under the deployed site subpath
// (/examples/dashboard-react/). JSX is compiled by Vite's built-in esbuild
// transform, so no React plugin is needed (the trade-off is no fast refresh).
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@treeui/react/style.css': fileURLToPath(
        new URL('../../packages/react/dist/style.css', import.meta.url),
      ),
    },
  },
});
