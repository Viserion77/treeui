import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    colorPrimary: '#2057d4',
    colorSecondary: '#2057d4',
    brandTitle: 'TreeUI · React',
    brandUrl: '../',
    brandImage: './treeui-wordmark.svg',
  }),
});
