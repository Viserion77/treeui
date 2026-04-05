import type { Meta, StoryObj } from '@storybook/vue3';
import { TDivider } from '@treeui/vue';

const meta = {
  title: 'Components/Divider',
  component: TDivider,
  tags: ['autodocs'],
  args: {
    orientation: 'horizontal',
    decorative: true,
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof TDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDivider },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 24rem;">
        <p>Content above</p>
        <TDivider v-bind="args" />
        <p>Content below</p>
      </div>
    `,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    components: { TDivider },
    template: `
      <div style="max-width: 24rem;">
        <p>Section one</p>
        <TDivider />
        <p>Section two</p>
        <TDivider />
        <p>Section three</p>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    components: { TDivider },
    template: `
      <div style="display: flex; align-items: center; gap: 0; height: 2rem;">
        <span>Left</span>
        <TDivider orientation="vertical" />
        <span>Center</span>
        <TDivider orientation="vertical" />
        <span>Right</span>
      </div>
    `,
  }),
};
