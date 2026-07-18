import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TStack, TStackItem, TInput, TButton } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/StackItem',
  component: TStackItem,
  tags: ['autodocs'],
  args: {
    grow: false,
  },
  argTypes: {
    grow: { control: 'boolean' },
  },
} satisfies Meta<typeof TStackItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `TStackItem` controls how a single child behaves inside a `TStack` — grow,
 * shrink, basis, min width, align-self. Here the search field grows to fill the
 * toolbar while the button keeps its natural size.
 */
export const GrowingSearch: Story = {
  render: () => ({
    components: { TStack, TStackItem, TInput, TButton },
    template: `
      <TStack direction="horizontal" align="center" gap="var(--tree-space-3)">
        <TStackItem grow min-width="14rem">
          <TInput placeholder="Search…" aria-label="Search" style="width:100%" />
        </TStackItem>
        <TButton>New</TButton>
      </TStack>
    `,
  }),
};
