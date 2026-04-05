import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TButton, TInput, TModal } from '@treeui/vue';

const meta = {
  title: 'Components/Overlay/Modal',
  component: TModal,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    title: 'Invite teammate',
    description: 'Share access with a teammate without leaving the current flow.',
    closeOnEscape: true,
    closeOnOverlay: true,
    showCloseButton: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TInput, TModal },
    setup: () => {
      const open = ref(false);
      const email = ref('annie@treeui.dev');

      return { args, email, open };
    },
    template: `
      <TModal
        :open="open"
        :size="args.size"
        :disabled="args.disabled"
        :title="args.title"
        :description="args.description"
        :close-on-escape="args.closeOnEscape"
        :close-on-overlay="args.closeOnOverlay"
        :show-close-button="args.showCloseButton"
        @update:open="open = $event"
      >
        <template #trigger>
          <TButton variant="outline">Open modal</TButton>
        </template>

        <template #content>
          <div style="display: grid; gap: 1rem;">
            <TInput
              aria-label="Invite email"
              placeholder="name@company.com"
              :model-value="email"
              @update:model-value="email = $event"
            />
            <p style="margin: 0; color: var(--tree-color-text-muted); font-size: var(--tree-font-size-sm);">
              TreeUI keeps the API small while still supporting accessible overlay patterns.
            </p>
          </div>
        </template>

        <template #footer>
          <TButton variant="ghost" @click="open = false">
            Cancel
          </TButton>
          <TButton @click="open = false">
            Send invite
          </TButton>
        </template>
      </TModal>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TButton, TModal },
    setup: () => {
      const defaultOpen = ref(false);
      const largeOpen = ref(false);

      return { defaultOpen, largeOpen };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TModal
          title="Default modal"
          description="Balanced spacing and quiet contrast for product work."
          :open="defaultOpen"
          @update:open="defaultOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Default</TButton>
          </template>
          <p style="margin: 0;">This is the standard modal surface.</p>
        </TModal>

        <TModal
          size="lg"
          title="Large modal"
          description="Use a larger surface when the task needs richer content."
          :open="largeOpen"
          @update:open="largeOpen = $event"
        >
          <template #trigger>
            <TButton>Large</TButton>
          </template>
          <p style="margin: 0;">Large keeps the same API, only the surface width changes.</p>
        </TModal>

        <TModal
          title="Disabled trigger"
          description="Disabled prevents the trigger interaction."
          disabled
        >
          <template #trigger>
            <TButton variant="soft">Disabled</TButton>
          </template>
          <p style="margin: 0;">You should never see this modal open.</p>
        </TModal>
      </div>
    `,
  }),
};
