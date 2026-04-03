import type { Meta, StoryObj } from '@storybook/vue3';
import { TButton, TTooltip } from '@treeui/vue';

const meta = {
  title: 'Components/Tooltip',
  component: TTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    content: 'Invite another teammate to the workspace.',
    side: 'top',
    delay: 80,
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'bottom'],
    },
  },
} satisfies Meta<typeof TTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TTooltip },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; justify-content: center; padding: 5rem 2rem 2rem;">
        <TTooltip v-bind="args">
          <template #trigger>
            <TButton variant="outline">Invite teammate</TButton>
          </template>
        </TTooltip>
      </div>
    `,
  }),
};
