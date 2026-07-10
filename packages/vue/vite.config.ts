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
      cssFileName: 'style',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@treeui/tokens', '@treeui/utils', '@treeui/icons'],
      // preserveModules keeps one output file per source module so consumer
      // bundlers can tree-shake unused components instead of pulling the
      // whole library through a single monolithic bundle.
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: resolveFromPackage('./src'),
          entryFileNames: '[name].js',
          exports: 'named',
        },
        {
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: resolveFromPackage('./src'),
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
    },
  },
});
