import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import type { StorybookConfig } from '@storybook/vue3-vite';

const packageDistStylePath = fileURLToPath(
  new URL('../../../packages/vue/dist/style.css', import.meta.url),
);

// Stories import components from the `@treeui/vue` barrel, which resolves to
// `dist/index.js` through the package exports map. Bundled output carries no
// `__docgenInfo`, and Storybook's docgen plugin only transforms `.vue` files —
// so resolving the barrel to source is what makes autodocs generate the props,
// slots and events tables at all.
const packageSrcPath = fileURLToPath(
  new URL('../../../packages/vue/src/index.ts', import.meta.url),
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
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      // Pinned deliberately. `vue-component-meta` resolves imported aliases like
      // `TSize` into real `sm | md | lg` unions, but it only appends docgen when
      // `_sfc_main` is a *local* binding. In a production build `plugin-vue`
      // splits the SFC, so the `.vue` module is just
      // `import _sfc_main from './X.vue?vue&type=script'; export default _sfc_main`
      // — an imported binding — and every component silently loses its docs.
      // `vue-docgen-api` appends unconditionally, so props, slots and events
      // survive into the static Storybook we deploy. The cost is that imported
      // type aliases render as `TSize` rather than the union; the hand-written
      // `argTypes` selects in the stories already cover those controls.
      docgen: 'vue-docgen-api',
    },
  },
  viteFinal(config) {
    config.resolve ??= {};
    // Array form: the bare `@treeui/vue` specifier needs an exact-match regex so
    // it does not also swallow the `@treeui/vue/style.css` subpath.
    config.resolve.alias = [
      { find: '@treeui/vue/style.css', replacement: packageDistStylePath },
      { find: /^@treeui\/vue$/, replacement: packageSrcPath },
      ...Object.entries((config.resolve.alias as Record<string, string>) ?? {}).map(
        ([find, replacement]) => ({ find, replacement }),
      ),
    ];
    // @storybook/vue3-vite does not register the Vue SFC plugin itself, so add it
    // here to compile local .vue blocks (apps/docs/src/blocks) imported by stories.
    config.plugins ??= [];
    config.plugins.push(vue());
    return config;
  },
};

export default config;
