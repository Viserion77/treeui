import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const resolveFromPackage = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolveFromPackage('./src/index.ts'),
      name: 'TreeUIVue',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@treeui/tokens', '@treeui/utils', '@treeui/icons'],
    },
  },
});

