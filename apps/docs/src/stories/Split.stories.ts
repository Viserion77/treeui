import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSplit } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/Split',
  component: TSplit,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    gap: 'var(--tree-space-5)',
    ratio: 2,
    minWidth: '18rem',
    side: 'end',
    align: 'start',
  },
  argTypes: {
    side: { control: 'select', options: ['start', 'end'] },
    ratio: { control: { type: 'number', min: 1, step: 0.1 } },
  },
} satisfies Meta<typeof TSplit>;

export default meta;

type Story = StoryObj<typeof meta>;

const box = (label: string, h = '8rem') =>
  `<div style="padding:1rem;min-height:${h};background:var(--tree-color-bg-surface);border:1px solid var(--tree-color-border-default);border-radius:0.75rem;">${label}</div>`;

/**
 * A responsive two-pane layout: a wider main pane and a narrower aside that sit
 * side by side, then stack to one column when the container gets too narrow —
 * no media query, driven purely by `minWidth`. Narrow the canvas to see it wrap.
 */
export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSplit },
    setup: () => ({ args, main: box('Main content', '12rem'), aside: box('Aside') }),
    template: `
      <div style="padding: 1.5rem;">
        <TSplit v-bind="args">
          <div v-html="main" />
          <template #aside><div v-html="aside" /></template>
        </TSplit>
      </div>
    `,
  }),
};

export const AsideOnStart: Story = {
  args: { side: 'start' },
  render: (args: Record<string, unknown>) => ({
    components: { TSplit },
    setup: () => ({ args, main: box('Main content', '12rem'), aside: box('Aside (left)') }),
    template: `
      <div style="padding: 1.5rem;">
        <TSplit v-bind="args">
          <div v-html="main" />
          <template #aside><div v-html="aside" /></template>
        </TSplit>
      </div>
    `,
  }),
};
