import type { Preview } from '@storybook/react-vite';
import '@treeui/react/style.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
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
