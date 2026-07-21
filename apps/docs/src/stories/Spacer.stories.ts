import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSpacer, TStack, TButton } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Spacer',
  component: TSpacer,
  parameters: {
    docs: { description: { component: practiceNote('TSpacer') } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TSpacer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A spacer absorbs free space between siblings in a flex layout, pushing items
 * apart without hand-written `margin: auto` or `flex: 1`.
 */
export const Playground: Story = {
  render: () => ({
    components: { TSpacer, TStack, TButton },
    template: `
      <TStack direction="horizontal" align="center" gap="var(--tree-space-2)"
        style="border: 1px dashed var(--tree-color-border-default); padding: 0.75rem;">
        <strong>Title</strong>
        <TSpacer />
        <TButton size="sm" variant="ghost">Cancel</TButton>
        <TButton size="sm">Save</TButton>
      </TStack>
    `,
  }),
};

/**
 * In a vertical stack a spacer pins trailing content to the bottom.
 */
export const PinToBottom: Story = {
  render: () => ({
    components: { TSpacer, TStack, TButton },
    template: `
      <TStack gap="var(--tree-space-2)"
        style="height: 16rem; border: 1px dashed var(--tree-color-border-default); padding: 0.75rem;">
        <strong>Sidebar</strong>
        <span>Item one</span>
        <span>Item two</span>
        <TSpacer />
        <TButton size="sm" block>Footer action</TButton>
      </TStack>
    `,
  }),
};
