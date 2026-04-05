import type { Meta, StoryObj } from '@storybook/vue3';
import { TSkeleton } from '@treeui/vue';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: TSkeleton,
  tags: ['autodocs'],
  args: {
    variant: 'text',
    width: '100%',
    animation: 'pulse',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
  },
} satisfies Meta<typeof TSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSkeleton },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 20rem;">
        <TSkeleton v-bind="args" />
      </div>
    `,
  }),
};

export const TextLines: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 20rem;">
        <TSkeleton variant="text" width="100%" />
        <TSkeleton variant="text" width="90%" />
        <TSkeleton variant="text" width="60%" />
      </div>
    `,
  }),
};

export const Circular: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <TSkeleton variant="circular" width="2rem" />
        <TSkeleton variant="circular" width="3rem" />
        <TSkeleton variant="circular" width="4rem" />
      </div>
    `,
  }),
};

export const Rectangular: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <TSkeleton variant="rectangular" width="100%" height="8rem" />
    `,
  }),
};

export const WaveAnimation: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 20rem;">
        <TSkeleton variant="text" animation="wave" width="100%" />
        <TSkeleton variant="text" animation="wave" width="80%" />
        <TSkeleton variant="text" animation="wave" width="60%" />
      </div>
    `,
  }),
};

export const CardPlaceholder: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 20rem; padding: 1rem; border: 1px solid #e5e5e5; border-radius: 0.5rem;">
        <TSkeleton variant="rectangular" width="100%" height="8rem" />
        <TSkeleton variant="text" width="70%" />
        <TSkeleton variant="text" width="100%" />
        <TSkeleton variant="text" width="40%" />
      </div>
    `,
  }),
};
