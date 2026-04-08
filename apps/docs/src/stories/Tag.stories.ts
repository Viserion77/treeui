import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TTag } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Tag',
  component: TTag,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    size: 'md',
    removable: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'soft'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    removable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTag },
    setup: () => ({ args }),
    template: `<TTag v-bind="args">Label</TTag>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag variant="solid">Solid</TTag>
        <TTag variant="outline">Outline</TTag>
        <TTag variant="soft">Soft</TTag>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
        <TTag size="sm">Small</TTag>
        <TTag size="md">Medium</TTag>
        <TTag size="lg">Large</TTag>
      </div>
    `,
  }),
};

export const Removable: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag removable variant="solid">Solid</TTag>
        <TTag removable variant="outline">Outline</TTag>
        <TTag removable variant="soft">Soft</TTag>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag disabled>Disabled</TTag>
        <TTag disabled removable>Disabled removable</TTag>
      </div>
    `,
  }),
};
