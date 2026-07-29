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
    // Matches the `onXxx` argTypes that docgen derives from each component's
    // emits, so firing an event logs it in the Actions panel. This only has
    // anything to match because the barrel resolves to source in `main.ts`;
    // without docgen there are no emit argTypes and the panel stays empty.
    actions: {
      argTypesRegex: '^on[A-Z].*',
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
          ['Introduction', 'Philosophy', 'Installation', 'Tokens', 'Theming', 'Icons', 'Accessibility', 'Practices', 'Conventions', 'Components', 'Patterns', 'Roadmap', 'Contribution'],
          'Showcase',
          ['All Components'],
          'Patterns',
          ['Recipes'],
          'Components',
          [
            'Actions', ['Button'],
            'Data Entry', ['Checkbox', 'DatePicker', 'FormField', 'Input', 'LanguageSelect', 'Radio', 'Select', 'Switch', 'Textarea'],
            'Data Display', ['Accordion', 'Avatar', 'Badge', 'Card', 'Flag', 'Table', 'Tag'],
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
      // Theme the preview surface on the body so it fills the standalone canvas
      // without forcing every story to be 100vh tall — that min-height left a
      // large empty area under short components, worst of all in autodocs where
      // each embedded story block became a full viewport high.
      document.body.style.background = 'var(--tree-color-bg-primary)';
      document.body.style.color = 'var(--tree-color-text-primary)';

      return {
        components: { story },
        // Content-sized wrapper: just padding, so the canvas hugs the story.
        template: '<div style="padding: 1.5rem;"><story /></div>',
      };
    },
  ],
};

export default preview;
