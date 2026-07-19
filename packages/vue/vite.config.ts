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
      // The root tsconfig maps @treeui/* to each package's src/ so typecheck
      // works without building dependencies first. dts would bake those aliases
      // into the emitted declarations as relative paths (../../../icons/src),
      // which point outside the published tarball — consumers then silently get
      // `any` for types like TIconName under skipLibCheck. These are real
      // dependencies, so keep them as bare specifiers.
      aliasesExclude: [/^@treeui\//],
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
