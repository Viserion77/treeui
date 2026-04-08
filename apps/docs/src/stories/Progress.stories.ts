import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TProgress } from '@treeui/vue';

const meta = {
  title: 'Components/Feedback/Progress',
  component: TProgress,
  tags: ['autodocs'],
  args: {
    value: 60,
    max: 100,
    size: 'md',
    label: 'Progress',
  },
} satisfies Meta<typeof TProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TProgress },
    setup: () => ({ args }),
    template: `<TProgress v-bind="args" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TProgress },
    template: `
      <div style="display: grid; gap: 1rem; max-width: 24rem;">
        <TProgress :value="45" size="sm" label="Small progress" />
        <TProgress :value="60" size="md" label="Medium progress" />
        <TProgress :value="75" size="lg" label="Large progress" />
      </div>
    `,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    components: { TProgress },
    template: `
      <div style="display: grid; gap: 1rem; max-width: 24rem;">
        <TProgress label="Loading…" />
      </div>
    `,
  }),
};

export const Values: Story = {
  render: () => ({
    components: { TProgress },
    template: `
      <div style="display: grid; gap: 1rem; max-width: 24rem;">
        <TProgress :value="0" label="0%" />
        <TProgress :value="25" label="25%" />
        <TProgress :value="50" label="50%" />
        <TProgress :value="75" label="75%" />
        <TProgress :value="100" label="100%" />
      </div>
    `,
  }),
};
