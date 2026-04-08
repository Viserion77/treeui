import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TSteps } from '@treeui/vue';

const items = [
  { value: 'profile', label: 'Profile', description: 'Basic account details' },
  { value: 'workspace', label: 'Workspace', description: 'Team and workspace setup' },
  { value: 'billing', label: 'Billing', description: 'Plan and payment method' },
  { value: 'launch', label: 'Launch', description: 'Final review and activation' },
];

const meta = {
  title: 'Components/Navigation & Disclosure/Steps',
  component: TSteps,
  tags: ['autodocs'],
  args: {
    size: 'md',
    orientation: 'horizontal',
    interactive: true,
    modelValue: 'workspace',
    items,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof TSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSteps },
    setup: () => {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TSteps
          :size="args.size"
          :orientation="args.orientation"
          :interactive="args.interactive"
          :items="args.items"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Current step: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    components: { TSteps },
    setup: () => ({
      value: ref('billing'),
      items,
    }),
    template: `
      <div style="max-width: 420px;">
        <TSteps
          orientation="vertical"
          interactive
          :items="items"
          :model-value="value"
          @update:model-value="value = $event"
        />
      </div>
    `,
  }),
};

export const Statuses: Story = {
  render: () => ({
    components: { TSteps },
    setup: () => ({
      items: [
        { value: 'sync', label: 'Sync repo', status: 'complete', description: 'Repository connected' },
        { value: 'checks', label: 'Run checks', status: 'current', description: 'CI is still running' },
        { value: 'review', label: 'Review output', status: 'error', description: '2 blocking comments' },
        { value: 'ship', label: 'Ship release', status: 'upcoming', description: 'Pending approvals' },
      ],
    }),
    template: `
      <TSteps :items="items" />
    `,
  }),
};
