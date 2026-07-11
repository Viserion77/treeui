import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    colorPrimary: '#0969da',
    colorSecondary: '#0969da',
    brandTitle: 'TreeUI · React',
    brandUrl: '../',
    brandImage: './treeui-wordmark.svg',
  }),
});
