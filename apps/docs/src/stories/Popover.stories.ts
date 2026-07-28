import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, TPopover, TInput } from '@treeui/vue';

const meta = {
  title: 'Components/Overlay/Popover',
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

export const ProgrammaticClose: Story = {
  render: () => ({
    components: { TButton, TPopover },
    template: `
      <TPopover>
        <template #trigger><TButton variant="outline">Actions</TButton></template>
        <template #default="{ close }">
          <div style="display: grid; gap: 0.5rem; min-width: 12rem;">
            <TButton block variant="ghost" @click="close()">Rename</TButton>
            <TButton block variant="ghost" @click="close()">Duplicate</TButton>
            <TButton block variant="ghost" @click="close({ restoreFocus: false })">Open in new tab</TButton>
          </div>
        </template>
      </TPopover>
    `,
  }),
};

export const WideLauncherGrid: Story = {
  render: () => ({
    components: { TButton, TPopover },
    template: `
      <TPopover width="content">
        <template #trigger><TButton variant="outline">Apps</TButton></template>
        <template #default>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem;">
            <a v-for="n in 8" :key="n" href="#" style="text-decoration:none; color:inherit; border:1px solid var(--tree-color-border-default); border-radius: var(--tree-radius-md); padding: 0.75rem;">
              <div style="font-weight:600;">App {{ n }}</div>
              <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">Descrição do app {{ n }}</div>
            </a>
          </div>
        </template>
      </TPopover>
    `,
  }),
};
