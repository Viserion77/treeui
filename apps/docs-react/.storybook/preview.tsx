import type { Preview } from '@storybook/react-vite';
import { treeTokens } from '@treeui/tokens';
import { create } from 'storybook/theming/create';
import '@treeui/react/style.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      // addon-docs applies its own typography reset to MDX prose through
      // `:where(p, li, h1, …)` selectors, which outrank a plain `html` or `body`
      // rule. Theming it is the only way to reach docs pages.
      theme: create({
        base: 'light',
        fontBase: treeTokens.font.family.sans,
        fontCode: treeTokens.font.family.mono,
      }),
    },
    options: {
      storySort: {
        order: ['Foundation', ['Introduction'], 'Components', ['Button', 'Input', 'Badge', 'Card']],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-tree-theme', context.globals.theme);
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '1.5rem',
            background: 'var(--tree-color-bg)',
            color: 'var(--tree-color-text)',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
