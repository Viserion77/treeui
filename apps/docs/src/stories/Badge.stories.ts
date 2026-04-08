import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Data Display/Badge',
  component: TBadge,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    size: 'md',
  },
} satisfies Meta<typeof TBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { InfoIcon, TBadge },
    setup: () => ({ args, iconProps }),
    template: `
      <TBadge v-bind="args">
        <template #icon>
          <InfoIcon v-bind="iconProps" />
        </template>
        Stable foundation
      </TBadge>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TBadge },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TBadge variant="solid">Solid</TBadge>
        <TBadge variant="outline">Outline</TBadge>
        <TBadge variant="ghost">Ghost</TBadge>
        <TBadge variant="soft">Soft</TBadge>
        <TBadge variant="danger">Danger</TBadge>
      </div>
    `,
  }),
};
