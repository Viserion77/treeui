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
    sourcemap: true,
    lib: {
      entry: resolveFromPackage('./src/index.ts'),
      name: 'TreeUIVue',
      fileName: (format) => format === 'cjs' ? 'index.cjs' : 'index.js',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@treeui/tokens', '@treeui/utils', '@treeui/icons'],
    },
  },
});
