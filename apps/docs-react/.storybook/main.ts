import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const reactStylePath = fileURLToPath(
  new URL('../../../packages/react/dist/style.css', import.meta.url),
);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  staticDirs: ['../public'],
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
