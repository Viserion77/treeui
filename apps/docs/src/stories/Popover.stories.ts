import type { Meta, StoryObj } from '@storybook/vue3';
import { TButton, TPopover, TInput } from '@treeui/vue';

const meta = {
  title: 'Components/Popover',
  component: TPopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    side: 'bottom',
    align: 'center',
    defaultOpen: true,
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
  },
} satisfies Meta<typeof TPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TPopover, TInput },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; justify-content: center; padding: 8rem 2rem;">
        <TPopover v-bind="args">
          <template #trigger="{ isOpen }">
            <TButton variant="outline" :aria-expanded="isOpen">
              Open popover
            </TButton>
          </template>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <p style="margin: 0; font-weight: 500;">Update dimensions</p>
            <p style="margin: 0; font-size: 0.875rem; color: var(--tree-color-text-muted);">Set the width and height of the element.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <TInput aria-label="Width" placeholder="100%" />
              <TInput aria-label="Height" placeholder="auto" />
            </div>
          </div>
        </TPopover>
      </div>
    `,
  }),
};

export const Sides: Story = {
  render: () => ({
    components: { TButton, TPopover },
    template: `
      <div style="display: flex; gap: 3rem; padding: 8rem 2rem; flex-wrap: wrap; justify-content: center;">
        <TPopover side="top" default-open>
          <template #trigger>
            <TButton variant="outline">Top</TButton>
          </template>
          <p style="margin: 0;">Popover on top</p>
        </TPopover>
        <TPopover side="bottom" default-open>
          <template #trigger>
            <TButton variant="outline">Bottom</TButton>
          </template>
          <p style="margin: 0;">Popover on bottom</p>
        </TPopover>
        <TPopover side="left" default-open>
          <template #trigger>
            <TButton variant="outline">Left</TButton>
          </template>
          <p style="margin: 0;">Popover on left</p>
        </TPopover>
        <TPopover side="right" default-open>
          <template #trigger>
            <TButton variant="outline">Right</TButton>
          </template>
          <p style="margin: 0;">Popover on right</p>
        </TPopover>
      </div>
    `,
  }),
};
