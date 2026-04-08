import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSkeleton } from '@treeui/vue';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: TSkeleton,
  tags: ['autodocs'],
  args: {
    width: '100%',
    animation: 'pulse',
  },
  argTypes: {
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
        <TSkeleton width="100%" height="1em" />
        <TSkeleton width="90%" height="1em" />
        <TSkeleton width="60%" height="1em" />
      </div>
    `,
  }),
};

export const WaveAnimation: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 20rem;">
        <TSkeleton animation="wave" width="100%" height="1em" />
        <TSkeleton animation="wave" width="80%" height="1em" />
        <TSkeleton animation="wave" width="60%" height="1em" />
      </div>
    `,
  }),
};

export const CardPlaceholder: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 20rem; padding: 1rem; border: 1px solid #e5e5e5; border-radius: 0.5rem;">
        <TSkeleton width="100%" height="8rem" />
        <TSkeleton width="70%" height="1em" />
        <TSkeleton width="100%" height="1em" />
        <TSkeleton width="40%" height="1em" />
      </div>
    `,
  }),
};

export const TablePlaceholder: Story = {
  render: () => ({
    components: { TSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0; max-width: 36rem; border: 1px solid #e5e5e5; border-radius: 0.5rem; overflow: hidden;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; padding: 0.75rem 1rem; background: #fafafa;">
          <TSkeleton width="60%" height="0.75em" />
          <TSkeleton width="50%" height="0.75em" />
          <TSkeleton width="50%" height="0.75em" />
          <TSkeleton width="40%" height="0.75em" />
        </div>
        <div v-for="row in 5" :key="row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; padding: 0.75rem 1rem; border-top: 1px solid #e5e5e5;">
          <TSkeleton width="80%" height="1em" />
          <TSkeleton width="60%" height="1em" />
          <TSkeleton width="50%" height="1em" />
          <TSkeleton width="40%" height="1em" />
        </div>
      </div>
    `,
  }),
};
