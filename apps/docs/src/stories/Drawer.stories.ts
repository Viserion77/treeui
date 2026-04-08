import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TDrawer, TInput } from '@treeui/vue';

const meta = {
  title: 'Components/Overlay/Drawer',
  component: TDrawer,
  tags: ['autodocs'],
  args: {
    size: 'md',
    side: 'right',
    disabled: false,
    title: 'Settings',
    description: 'Manage your preferences and account details.',
    closeOnEscape: true,
    closeOnOverlay: true,
    showCloseButton: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
} satisfies Meta<typeof TDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TDrawer, TInput },
    setup: () => {
      const open = ref(false);

      return { args, open };
    },
    template: `
      <TDrawer
        :open="open"
        :size="args.size"
        :side="args.side"
        :disabled="args.disabled"
        :title="args.title"
        :description="args.description"
        :close-on-escape="args.closeOnEscape"
        :close-on-overlay="args.closeOnOverlay"
        :show-close-button="args.showCloseButton"
        @update:open="open = $event"
      >
        <template #trigger>
          <TButton variant="outline">Open drawer</TButton>
        </template>

        <template #content>
          <div style="display: grid; gap: 1rem;">
            <TInput
              aria-label="Display name"
              placeholder="Your display name"
            />
            <TInput
              aria-label="Email"
              placeholder="name@company.com"
            />
            <p style="margin: 0; color: var(--tree-color-text-muted); font-size: var(--tree-font-size-sm);">
              The drawer slides in from the chosen side and traps focus until dismissed.
            </p>
          </div>
        </template>

        <template #footer>
          <TButton variant="ghost" @click="open = false">
            Cancel
          </TButton>
          <TButton @click="open = false">
            Save changes
          </TButton>
        </template>
      </TDrawer>
    `,
  }),
};

export const Sides: Story = {
  render: () => ({
    components: { TButton, TDrawer },
    setup: () => {
      const rightOpen = ref(false);
      const leftOpen = ref(false);
      const topOpen = ref(false);
      const bottomOpen = ref(false);

      return { rightOpen, leftOpen, topOpen, bottomOpen };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TDrawer
          title="Right drawer"
          description="This is the default side."
          side="right"
          :open="rightOpen"
          @update:open="rightOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Right</TButton>
          </template>
          <p style="margin: 0;">Content slides in from the right edge.</p>
        </TDrawer>

        <TDrawer
          title="Left drawer"
          description="Useful for navigation panels."
          side="left"
          :open="leftOpen"
          @update:open="leftOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Left</TButton>
          </template>
          <p style="margin: 0;">Content slides in from the left edge.</p>
        </TDrawer>

        <TDrawer
          title="Top drawer"
          description="Anchored to the top of the viewport."
          side="top"
          :open="topOpen"
          @update:open="topOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Top</TButton>
          </template>
          <p style="margin: 0;">Content slides down from the top edge.</p>
        </TDrawer>

        <TDrawer
          title="Bottom drawer"
          description="Anchored to the bottom of the viewport."
          side="bottom"
          :open="bottomOpen"
          @update:open="bottomOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Bottom</TButton>
          </template>
          <p style="margin: 0;">Content slides up from the bottom edge.</p>
        </TDrawer>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TButton, TDrawer },
    setup: () => {
      const smOpen = ref(false);
      const mdOpen = ref(false);
      const lgOpen = ref(false);

      return { smOpen, mdOpen, lgOpen };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TDrawer
          title="Small drawer"
          size="sm"
          :open="smOpen"
          @update:open="smOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Small</TButton>
          </template>
          <p style="margin: 0;">Narrow panel for quick actions.</p>
        </TDrawer>

        <TDrawer
          title="Medium drawer"
          size="md"
          :open="mdOpen"
          @update:open="mdOpen = $event"
        >
          <template #trigger>
            <TButton>Medium</TButton>
          </template>
          <p style="margin: 0;">Default size, balanced for most content.</p>
        </TDrawer>

        <TDrawer
          title="Large drawer"
          size="lg"
          :open="lgOpen"
          @update:open="lgOpen = $event"
        >
          <template #trigger>
            <TButton variant="soft">Large</TButton>
          </template>
          <p style="margin: 0;">Wider panel for complex forms or detailed views.</p>
        </TDrawer>
      </div>
    `,
  }),
};
