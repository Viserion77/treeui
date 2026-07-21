import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TConfirmDialog } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Overlay/ConfirmDialog',
  component: TConfirmDialog,
  parameters: {
    docs: { description: { component: practiceNote('TConfirmDialog') } },
  },
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
    closeLabel: 'Close dialog',
    closeOnConfirm: true,
    closeOnCancel: true,
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
          :close-label="args.closeLabel"
          :close-on-confirm="args.closeOnConfirm"
          :close-on-cancel="args.closeOnCancel"
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
      duplicateOpen: ref(false),
      snoozeOpen: ref(false),
      pinOpen: ref(false),
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
          title="Duplicate release"
          description="A copy is created as a draft you can edit before publishing."
          confirm-label="Duplicate"
          confirm-variant="outline"
          :open="duplicateOpen"
          @update:open="duplicateOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Duplicate</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Snooze release"
          description="Reminders pause until the next planning cycle."
          confirm-label="Snooze"
          confirm-variant="ghost"
          :open="snoozeOpen"
          @update:open="snoozeOpen = $event"
        >
          <template #trigger>
            <TButton variant="ghost">Snooze</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Pin release"
          description="Pinned releases stay at the top of the roadmap for everyone."
          confirm-label="Pin"
          confirm-variant="soft"
          :open="pinOpen"
          @update:open="pinOpen = $event"
        >
          <template #trigger>
            <TButton variant="soft">Pin</TButton>
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

export const Sizes: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => ({
      smOpen: ref(false),
      mdOpen: ref(false),
      lgOpen: ref(false),
    }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TConfirmDialog
          title="Small dialog"
          description="Default size, tuned for a single yes or no decision."
          size="sm"
          confirm-label="Delete"
          :open="smOpen"
          @update:open="smOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Small</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Medium dialog"
          description="Use md when the description needs a couple of sentences of context."
          size="md"
          confirm-label="Delete"
          :open="mdOpen"
          @update:open="mdOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Medium</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Large dialog"
          description="Large only widens the surface; the confirm and cancel contract is unchanged."
          size="lg"
          confirm-label="Delete"
          :open="lgOpen"
          @update:open="lgOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Large</TButton>
          </template>
        </TConfirmDialog>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => ({
      guardedOpen: ref(false),
      lockedOpen: ref(false),
    }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TConfirmDialog
          title="Type the project name to continue"
          description="confirm-disabled keeps the confirm button inert and swallows the confirm emit."
          confirm-label="Delete"
          confirm-disabled
          :open="guardedOpen"
          @update:open="guardedOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Confirm disabled</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Finish the migration"
          description="cancel-disabled blocks the cancel emit, so the flow can only move forward."
          confirm-label="Continue"
          confirm-variant="solid"
          cancel-disabled
          :open="lockedOpen"
          @update:open="lockedOpen = $event"
        >
          <template #trigger>
            <TButton variant="outline">Cancel disabled</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Never opens"
          description="disabled stops the trigger from opening the dialog at all."
          disabled
        >
          <template #trigger>
            <TButton variant="soft">Disabled trigger</TButton>
          </template>
        </TConfirmDialog>
      </div>
    `,
  }),
};

export const AsyncConfirm: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => {
      const deleteOpen = ref(false);
      const deleteLoading = ref(false);
      const transferOpen = ref(false);
      const transferLoading = ref(false);

      const runDelete = () => {
        deleteLoading.value = true;
        window.setTimeout(() => {
          deleteLoading.value = false;
          deleteOpen.value = false;
        }, 1200);
      };

      const runTransfer = () => {
        transferLoading.value = true;
        window.setTimeout(() => {
          transferLoading.value = false;
          transferOpen.value = false;
        }, 1200);
      };

      return {
        deleteOpen,
        deleteLoading,
        transferOpen,
        transferLoading,
        runDelete,
        runTransfer,
      };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TConfirmDialog
          title="Delete workspace"
          description="close-on-confirm=false keeps the dialog open while the request runs; close it once the promise settles."
          confirm-label="Delete workspace"
          :open="deleteOpen"
          :loading="deleteLoading"
          :close-on-confirm="false"
          @update:open="deleteOpen = $event"
          @confirm="runDelete"
        >
          <template #trigger>
            <TButton variant="danger">Async confirm</TButton>
          </template>
        </TConfirmDialog>

        <TConfirmDialog
          title="Transfer ownership"
          description="A replaced footer can read loading from the actions slot scope to stay in sync."
          confirm-variant="solid"
          :open="transferOpen"
          :loading="transferLoading"
          :close-on-confirm="false"
          @update:open="transferOpen = $event"
          @confirm="runTransfer"
        >
          <template #trigger>
            <TButton variant="outline">Loading-aware actions</TButton>
          </template>

          <template #actions="{ confirm, cancel, loading }">
            <TButton variant="ghost" :disabled="loading" @click="cancel()">Keep ownership</TButton>
            <TButton :loading="loading" @click="confirm()">Transfer</TButton>
          </template>
        </TConfirmDialog>
      </div>
    `,
  }),
};

export const Uncontrolled: Story = {
  render: () => ({
    components: { TButton, TConfirmDialog },
    setup: () => ({
      lastEvent: ref('Waiting for open-change'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; justify-items: start;">
        <TConfirmDialog
          title="Reset filters"
          description="Without an open binding the dialog owns its state; open-change still reports every transition."
          confirm-label="Reset"
          confirm-variant="solid"
          show-close-button
          close-label="Close reset dialog"
          @open-change="lastEvent = $event ? 'Opened' : 'Closed'"
        >
          <template #trigger>
            <TButton variant="outline">Open uncontrolled dialog</TButton>
          </template>
        </TConfirmDialog>

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Last open-change: {{ lastEvent }}
        </div>
      </div>
    `,
  }),
};
