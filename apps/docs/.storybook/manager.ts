import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    colorPrimary: '#3f82ff',
    colorSecondary: '#3f82ff',
    brandTitle: 'TreeUI',
    brandUrl: './',
    brandImage: './treeui-logo.png',
  }),
});
