import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TSteps } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const items = [
  { value: 'profile', label: 'Profile', description: 'Basic account details' },
  { value: 'workspace', label: 'Workspace', description: 'Team and workspace setup' },
  { value: 'billing', label: 'Billing', description: 'Plan and payment method' },
  { value: 'launch', label: 'Launch', description: 'Final review and activation' },
];

const meta = {
  title: 'Components/Navigation/Steps',
  component: TSteps,
  parameters: {
    docs: { description: { component: practiceNote('TSteps') } },
  },
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

export const StaticSequence: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A sequence to READ, which is the default. With `interactive` off the steps are inert `<li>` boxes: no control reaches the accessibility tree, nothing is washed out as unavailable, and no step is elected current on its own — a described flow has no visitor standing in it. Turn `interactive` on for a wizard, where each step is a destination.',
      },
    },
  },
  render: () => ({
    components: { TSteps },
    setup: () => ({
      items: [
        { value: 'connect', label: 'Connect', description: 'Point it at your account.' },
        { value: 'pick', label: 'Pick', description: 'Choose what to watch.' },
        { value: 'ship', label: 'Ship', description: 'It runs from there.' },
      ],
    }),
    template: `<TSteps :items="items" />`,
  }),
};

export const ColumnsAndWrapWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A strip that can only wrap by available width leaves the last step alone on its own row. `columns` declares the shape ("3 + 3"); `minItemWidth` moves the width at which the strip wraps. Both are the axes `TGrid` already has, so neither needs the component declared twice inside TShow/THide.',
      },
    },
  },
  render: () => ({
    components: { TSteps },
    setup: () => ({
      items: [
        { value: '1', label: 'Collect', description: 'Read the sources.' },
        { value: '2', label: 'Normalise', description: 'One shape for all of them.' },
        { value: '3', label: 'Enrich', description: 'Add what is missing.' },
        { value: '4', label: 'Score', description: 'Rank what matters.' },
        { value: '5', label: 'Route', description: 'Send it where it goes.' },
        { value: '6', label: 'Report', description: 'Say what happened.' },
      ],
    }),
    template: `<TSteps :items="items" :columns="3" />`,
  }),
};
