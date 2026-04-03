import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const resolveFromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@treeui/tokens': resolveFromRoot('./packages/tokens/src/index.ts'),
      '@treeui/utils': resolveFromRoot('./packages/utils/src/index.ts'),
      '@treeui/icons': resolveFromRoot('./packages/icons/src/index.ts'),
      '@treeui/vue': resolveFromRoot('./packages/vue/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['apps/**', 'tooling/**', '**/*.d.ts'],
    },
  },
});

