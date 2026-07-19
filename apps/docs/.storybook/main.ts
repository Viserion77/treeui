import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import type { StorybookConfig } from '@storybook/vue3-vite';

const packageDistStylePath = fileURLToPath(
  new URL('../../../packages/vue/dist/style.css', import.meta.url),
);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  // The webfonts are self-hosted and shared with apps/docs-react, so neither
  // Storybook depends on a runtime fetch to fonts.googleapis.com.
  staticDirs: ['../public', { from: '../../../assets/fonts', to: '/fonts' }],
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
  viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      '@treeui/vue/style.css': packageDistStylePath,
    };
    // @storybook/vue3-vite does not register the Vue SFC plugin itself, so add it
    // here to compile local .vue blocks (apps/docs/src/blocks) imported by stories.
    config.plugins ??= [];
    config.plugins.push(vue());
    return config;
  },
};

export default config;
