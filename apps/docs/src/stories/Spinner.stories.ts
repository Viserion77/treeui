import type { Meta, StoryObj } from '@storybook/vue3';
import { TSpinner } from '@treeui/vue';

const meta = {
  title: 'Components/Spinner',
  component: TSpinner,
  tags: ['autodocs'],
  args: {
    size: 'md',
    label: 'Loading',
  },
} satisfies Meta<typeof TSpinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSpinner },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <TSpinner v-bind="args" />
        <span>Fetching release notes</span>
      </div>
    `,
  }),
};
