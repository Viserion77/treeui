import type { Meta, StoryObj } from '@storybook/vue3';
import { TBadge, TButton, TCard, TStack } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/Stack',
  component: TStack,
  tags: ['autodocs'],
  args: {
    direction: 'vertical',
    gap: 'var(--tree-space-4)',
    align: 'stretch',
    justify: 'flex-start',
    wrap: false,
    reverse: false,
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
} satisfies Meta<typeof TStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBadge, TButton, TCard, TStack },
    setup: () => ({ args }),
    template: `
      <TCard>
        <TStack v-bind="args">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <strong>Section header</strong>
            <TBadge size="sm">Recipe</TBadge>
          </div>
          <p style="margin: 0;">
            TStack handles spacing and alignment for sections, actions and small shell compositions.
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <TButton size="sm">Primary action</TButton>
            <TButton size="sm" variant="outline">Secondary</TButton>
          </div>
        </TStack>
      </TCard>
    `,
  }),
};

export const HorizontalActions: Story = {
  render: () => ({
    components: { TButton, TStack },
    template: `
      <TStack direction="horizontal" gap="var(--tree-space-2)" align="center" wrap>
        <TButton size="sm">Create</TButton>
        <TButton size="sm" variant="outline">Share</TButton>
        <TButton size="sm" variant="ghost">Export</TButton>
      </TStack>
    `,
  }),
};

export const Reversed: Story = {
  render: () => ({
    components: { TStack },
    template: `
      <TStack direction="horizontal" reverse gap="var(--tree-space-3)">
        <div style="padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Third</div>
        <div style="padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Second</div>
        <div style="padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">First</div>
      </TStack>
    `,
  }),
};
