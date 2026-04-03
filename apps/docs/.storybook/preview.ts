import type { Preview } from '@storybook/vue3';
import '@treeui/vue/style.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
    },
    options: {
      storySort: {
        order: [
          'Foundation',
          ['Introduction', 'Philosophy', 'Installation', 'Tokens', 'Theming', 'Accessibility', 'Components', 'Roadmap', 'Contribution'],
          'Components',
          ['Button', 'Input', 'Card', 'Badge', 'Spinner', 'Tooltip'],
        ],
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
    (story, context) => {
      document.documentElement.setAttribute('data-tree-theme', context.globals.theme);

      return {
        components: { story },
        template:
          '<div style="min-height: 100vh; padding: 1.5rem; background: var(--tree-color-bg); color: var(--tree-color-text);"><story /></div>',
      };
    },
  ],
};

export default preview;
