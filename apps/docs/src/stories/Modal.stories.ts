import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TDatePicker, TInput, TModal, TSelect } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Overlay/Modal',
  component: TModal,
  parameters: {
    docs: { description: { component: practiceNote('TModal') } },
  },
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
        v-model:open="open"
        :size="args.size"
        :disabled="args.disabled"
        :title="args.title"
        :description="args.description"
        :close-on-escape="args.closeOnEscape"
        :close-on-overlay="args.closeOnOverlay"
        :show-close-button="args.showCloseButton"
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
          v-model:open="defaultOpen"
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
          v-model:open="largeOpen"
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

export const AnchoredPanelsInsideAModal: Story = {
  name: 'An anchored panel opened inside the modal stacks above it',
  parameters: {
    docs: {
      description: {
        story:
          "A panel anchored to a trigger renders in a layer no ancestor can clip — it teleports to the body. That also takes it out of the modal's stacking context, where it used to be painted above the dialog for free: as a sibling of the modal it stacks by its own `z-index`, and `--tree-z-dropdown` (1000) is below `--tree-z-modal` (1300). The panel opened BEHIND the dialog and nothing in it could be clicked. `useAnchoredLayer` now reads the stacking level of the layer the trigger sits in and clears it, so this works for `TDrawer` and any layer added later without either side knowing about the other. Open the modal, then open the select and the date picker: both panels must be on top and clickable.",
      },
    },
  },
  render: () => ({
    components: { TButton, TDatePicker, TModal, TSelect },
    setup: () => ({
      open: ref(true),
      kind: ref('meeting'),
      day: ref('2026-03-15'),
      kinds: [
        { label: 'Meeting', value: 'meeting' },
        { label: 'Review', value: 'review' },
        { label: 'Deploy window', value: 'deploy' },
      ],
    }),
    template: `
      <div>
        <TButton @click="open = true">New appointment</TButton>
        <TModal v-model:open="open" title="New appointment">
          <div style="display: grid; gap: var(--tree-space-4);">
            <TSelect v-model="kind" aria-label="Kind" :options="kinds" />
            <TDatePicker v-model="day" aria-label="Day" />
          </div>
          <template #footer>
            <TButton variant="ghost" @click="open = false">Cancel</TButton>
            <TButton @click="open = false">Save</TButton>
          </template>
        </TModal>
      </div>
    `,
  }),
};
