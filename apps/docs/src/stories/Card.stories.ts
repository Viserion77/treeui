import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TCard } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Card',
  component: TCard,
  tags: ['autodocs'],
  args: {
    variant: 'outline',
    size: 'md',
  },
} satisfies Meta<typeof TCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBadge, TButton, TCard },
    setup: () => ({ args }),
    template: `
      <div style="width: 360px;">
        <TCard v-bind="args">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <strong>TreeUI release plan</strong>
              <TBadge size="sm">Ready</TBadge>
            </div>
          </template>

          <p style="margin: 0;">
            Ship a compact, accessible component library foundation for Vue 3.
          </p>

          <template #footer>
            <div style="display: flex; justify-content: flex-end;">
              <TButton size="sm" variant="outline">Review</TButton>
            </div>
          </template>
        </TCard>
      </div>
    `,
  }),
};
