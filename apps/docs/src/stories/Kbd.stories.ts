import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TKbd } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Kbd',
  component: TKbd,
  tags: ['autodocs'],
} satisfies Meta<typeof TKbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => ({
    components: { TKbd },
    template: `<TKbd>⌘K</TKbd>`,
  }),
};

export const Combinations: Story = {
  render: () => ({
    components: { TKbd },
    template: `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <TKbd>Ctrl</TKbd> <span>+</span> <TKbd>C</TKbd>
        <span style="margin-inline-start: 1rem;">Press</span> <TKbd>Esc</TKbd> <span>to close</span>
      </div>
    `,
  }),
};
