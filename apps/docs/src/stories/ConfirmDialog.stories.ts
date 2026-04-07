import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TButton, TConfirmDialog } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Overlay/ConfirmDialog',
  component: TConfirmDialog,
  tags: ['autodocs'],
  args: {
    size: 'sm',
    disabled: false,
    title: 'Delete component',
    description: 'This action removes the component from the registry and cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    confirmDisabled: false,
    cancelDisabled: false,
    loading: false,
    closeOnEscape: true,
    closeOnOverlay: false,
    showCloseButton: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    confirmVariant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft', 'danger'],
    },
  },
} satisfies Meta<typeof TConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { InfoIcon, TButton, TConfirmDialog },
    setup: () => {
      const open = ref(false);
      const result = ref('Waiting for action');

      return { args, iconProps, open, result };
    },
    template: `
      <div style="display: grid; gap: 0.75rem; justify-items: start;">
        <TConfirmDialog
          :open="open"
          :size="args.size"
          :disabled="args.disabled"
          :title="args.title"
          :description="args.description"
          :confirm-label="args.confirmLabel"
          :cancel-label="args.cancelLabel"
          :confirm-variant="args.confirmVariant"
          :confirm-disabled="args.confirmDisabled"
          :cancel-disabled="args.cancelDisabled"
          :loading="args.loading"
          :close-on-escape="args.closeOnEscape"
          :close-on-overlay="args.closeOnOverlay"
          :show-close-button="args.showCloseButton"
          @update:open="open = $event"
          @confirm="result = 'Confirmed destructive action'"
          @cancel="result = 'Cancelled action'"
        >
          <template #trigger>
            <TButton variant="danger">Open confirm dialog</TButton>
          </template>

          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>

          <p style="margin: 0; color: var(--tree-color-text-muted);">
            Existing links, embeds, and documentation references will stop resolving immediately.
          </p>
        </TConfirmDialog>

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Last action: {{ result }}
        </div>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => ({
      archiveOpen: ref(false),
      deleteOpen: ref(false),
    }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TConfirmDialog
          title="Archive release"
          description="You can restore this release later from archived items."
          confirm-label="Archive"
          confirm-variant="solid"
          :open="archiveOpen"
          @update:open="archiveOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Archive</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Delete release"
          description="Deleting permanently removes release notes, linked tasks, and timeline history."
          confirm-label="Delete"
          confirm-variant="danger"
          :open="deleteOpen"
          @update:open="deleteOpen = $event"
        >
          <template #trigger>
            <TButton variant="danger">Delete</TButton>
          </template>
        </TConfirmDialog>
      </div>
    `,
  }),
};

export const CustomActions: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => ({
      open: ref(false),
    }),
    template: `
      <TConfirmDialog
        title="Publish release"
        description="Publishing makes this release visible to the entire organization."
        confirm-label="Publish"
        confirm-variant="solid"
        :open="open"
        @update:open="open = $event"
      >
        <template #trigger>
          <TButton>Publish</TButton>
        </template>

        <template #actions="{ confirm, cancel }">
          <TButton variant="ghost" @click="cancel()">Not now</TButton>
          <TButton variant="outline" @click="confirm()">Publish release</TButton>
        </template>
      </TConfirmDialog>
    `,
  }),
};
