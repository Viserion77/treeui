import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, TTooltip } from '@treeui/vue';

const meta = {
  title: 'Components/Overlay/Tooltip',
  component: TTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    content: 'Invite another teammate to the workspace.',
    side: 'top',
    delay: 80,
    defaultOpen: true,
    open: true,
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
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
        <pre style="position:fixed;bottom:0;left:0;font-size:11px;background:#000;color:#0f0;padding:8px;z-index:9999">args: {{ JSON.stringify(args) }}</pre>
      </div>
    `,
  }),
};
