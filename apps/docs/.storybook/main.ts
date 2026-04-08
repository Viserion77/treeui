import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/vue3-vite';

const packageDistStylePath = fileURLToPath(
  new URL('../../../packages/vue/dist/style.css', import.meta.url),
);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            providerImportSource: '@storybook/addon-docs/mdx-react-shim',
          },
        },
      },
    },
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      '@treeui/vue/style.css': packageDistStylePath,
    };
    return config;
  },
};

export default config;
