import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

const resolveFromPackage = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolveFromPackage('./tsconfig.json'),
      entryRoot: resolveFromPackage('./src'),
    }),
  ],
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

