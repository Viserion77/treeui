import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const reactStylePath = fileURLToPath(
  new URL('../../../packages/react/dist/style.css', import.meta.url),
);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  // The webfonts are self-hosted and shared with apps/docs, so neither Storybook
  // depends on a runtime fetch to fonts.googleapis.com.
  staticDirs: ['../public', { from: '../../../assets/fonts', to: '/fonts' }],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      '@treeui/react/style.css': reactStylePath,
    };
    return config;
  },
};

export default config;
