import type { Preview } from '@storybook/vue3-vite';
import { treeTokens } from '@treeui/tokens';
import { create } from 'storybook/theming/create';
import '@treeui/vue/style.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
    },
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
        order: [
          'Foundation',
          ['Introduction', 'Philosophy', 'Installation', 'Tokens', 'Theming', 'Accessibility', 'Conventions', 'Components', 'Patterns', 'Roadmap', 'Contribution'],
          'Showcase',
          ['All Components'],
          'Patterns',
          ['Recipes'],
          'Components',
          [
            'Actions', ['Button'],
            'Data Entry', ['Checkbox', 'DatePicker', 'FormField', 'Input', 'Radio', 'Select', 'Switch', 'Textarea'],
            'Data Display', ['Accordion', 'Avatar', 'Badge', 'Card', 'Table', 'Tag'],
            'Feedback', ['Alert', 'Progress', 'Skeleton', 'Spinner', 'Toast'],
            'Navigation', ['Breadcrumb', 'Pagination', 'Tabs'],
            'Overlay', ['ContextMenu', 'Drawer', 'Dropdown', 'Modal', 'Popover', 'Tooltip'],
            'Layout', ['Divider'],
          ],
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
