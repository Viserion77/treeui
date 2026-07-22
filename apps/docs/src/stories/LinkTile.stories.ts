import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TLinkTile, TGrid, TIcon } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Navigation/LinkTile',
  component: TLinkTile,
  parameters: {
    docs: { description: { component: practiceNote('TLinkTile') } },
  },
  tags: ['autodocs'],
  args: {
    title: 'Queues',
    description: 'SQS message queues',
    tone: 'brand',
    size: 'md',
    current: false,
    href: '#queues',
  },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TLinkTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TLinkTile, TIcon },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 20rem;">
        <TLinkTile v-bind="args">
          <template #leading><TIcon name="inbox" /></template>
        </TLinkTile>
      </div>
    `,
  }),
};

export const LauncherGrid: Story = {
  render: () => ({
    components: { TLinkTile, TGrid, TIcon },
    setup: () => ({
      apps: [
        { id: 'queues', title: 'Queues', description: 'SQS', icon: 'inbox', tone: 'brand', current: true },
        { id: 'lambdas', title: 'Functions', description: 'Lambda', icon: 'zap', tone: 'warning', current: false },
        { id: 'tables', title: 'Tables', description: 'DynamoDB', icon: 'database', tone: 'info', current: false },
      ],
    }),
    template: `
      <TGrid :columns="3" gap="var(--tree-space-4)">
        <TLinkTile
          v-for="app in apps"
          :key="app.id"
          :title="app.title"
          :description="app.description"
          :tone="app.tone"
          :current="app.current"
          :href="'#' + app.id"
        >
          <template #leading><TIcon :name="app.icon" /></template>
        </TLinkTile>
      </TGrid>
    `,
  }),
};
