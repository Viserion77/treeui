import { treeTokens } from '@treeui/tokens';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    colorPrimary: '#3f82ff',
    colorSecondary: '#3f82ff',
    brandTitle: 'TreeUI',
    brandUrl: './',
    brandImage: './treeui-wordmark.svg',
    // Without these the chrome falls back to Storybook's own Nunito Sans.
    fontBase: treeTokens.font.family.sans,
    fontCode: treeTokens.font.family.mono,
  }),
});
