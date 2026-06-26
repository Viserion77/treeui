import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TToastProvider } from '@treeui/vue';
import ConfirmDestructiveAction from '../../blocks/ConfirmDestructiveAction.vue';

const meta = {
  title: 'Patterns/Recipes/Destructive confirmation flow',
  component: ConfirmDestructiveAction,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ConfirmDestructiveAction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { ConfirmDestructiveAction, TToastProvider },
    template: `
      <TToastProvider>
        <ConfirmDestructiveAction />
      </TToastProvider>
    `,
  }),
};
