import type { Meta, StoryObj } from '@storybook/vue3';
import { TButton, TToastProvider, useToast } from '@treeui/vue';

const meta = {
  title: 'Components/Feedback/Toast',
  component: TToastProvider,
  tags: ['autodocs'],
  args: {
    position: 'bottom-right',
    max: 5,
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-right',
        'top-left',
        'top-center',
        'bottom-right',
        'bottom-left',
        'bottom-center',
      ],
    },
    max: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
} satisfies Meta<typeof TToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TToastProvider },
    setup: () => {
      const toast = useToast();

      function addInfo() {
        toast.add({
          title: 'New update available',
          description: 'A new version has been published.',
          variant: 'info',
        });
      }

      function addSuccess() {
        toast.add({
          title: 'Changes saved',
          description: 'Your settings have been updated successfully.',
          variant: 'success',
        });
      }

      function addWarning() {
        toast.add({
          title: 'Storage almost full',
          description: 'You have used 90% of your available storage.',
          variant: 'warning',
        });
      }

      function addDanger() {
        toast.add({
          title: 'Failed to delete',
          description: 'The file could not be removed. Please try again.',
          variant: 'danger',
        });
      }

      function clearAll() {
        toast.clear();
      }

      return { args, addInfo, addSuccess, addWarning, addDanger, clearAll };
    },
    template: `
      <TToastProvider :position="args.position" :max="args.max" />
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TButton variant="soft" @click="addInfo">Info</TButton>
        <TButton variant="soft" @click="addSuccess">Success</TButton>
        <TButton variant="soft" @click="addWarning">Warning</TButton>
        <TButton variant="outline" @click="addDanger">Danger</TButton>
        <TButton variant="ghost" @click="clearAll">Clear all</TButton>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TButton, TToastProvider },
    setup: () => {
      const toast = useToast();

      function showAll() {
        toast.add({ title: 'Info notification', variant: 'info', duration: 0 });
        toast.add({ title: 'Success notification', variant: 'success', duration: 0 });
        toast.add({ title: 'Warning notification', variant: 'warning', duration: 0 });
        toast.add({ title: 'Danger notification', variant: 'danger', duration: 0 });
      }

      function clearAll() {
        toast.clear();
      }

      return { showAll, clearAll };
    },
    template: `
      <TToastProvider position="top-right" />
      <div style="display: flex; gap: 0.75rem;">
        <TButton @click="showAll">Show all variants</TButton>
        <TButton variant="ghost" @click="clearAll">Clear</TButton>
      </div>
    `,
  }),
};

export const Persistent: Story = {
  render: () => ({
    components: { TButton, TToastProvider },
    setup: () => {
      const toast = useToast();

      function addPersistent() {
        toast.add({
          title: 'Action required',
          description: 'This notification stays until dismissed.',
          variant: 'warning',
          duration: 0,
        });
      }

      return { addPersistent };
    },
    template: `
      <TToastProvider position="bottom-right" />
      <TButton @click="addPersistent">Show persistent toast</TButton>
    `,
  }),
};
