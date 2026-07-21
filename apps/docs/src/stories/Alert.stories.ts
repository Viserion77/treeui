import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TAlert, TButton, TIcon } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';
import { practiceNote } from './practice-refs';

const notices = [
  { id: 1, variant: 'success', message: 'Deployment finished successfully.' },
  { id: 2, variant: 'warning', message: 'Two dependencies are out of date.' },
  { id: 3, variant: 'danger', message: 'Nightly backup failed at 02:14 UTC.' },
];

const meta = {
  title: 'Components/Feedback/Alert',
  component: TAlert,
  parameters: {
    docs: { description: { component: practiceNote('TAlert') } },
  },
  tags: ['autodocs'],
  args: {
    variant: 'info',
    size: 'md',
    dismissible: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { InfoIcon, TAlert },
    setup: () => ({ args, iconProps }),
    template: `
      <TAlert v-bind="args">
        <template #icon>
          <InfoIcon v-bind="iconProps" />
        </template>
        This is an informational alert message.
      </TAlert>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TAlert },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert variant="info">This is an info alert — check it out!</TAlert>
        <TAlert variant="success">This is a success alert — well done!</TAlert>
        <TAlert variant="warning">This is a warning alert — be careful!</TAlert>
        <TAlert variant="danger">This is a danger alert — something went wrong!</TAlert>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TAlert },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert variant="info" size="sm">Small alert</TAlert>
        <TAlert variant="info" size="md">Medium alert</TAlert>
        <TAlert variant="info" size="lg">Large alert</TAlert>
      </div>
    `,
  }),
};

export const Dismissible: Story = {
  render: () => ({
    components: { TAlert },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert variant="info" dismissible>Dismissible info alert.</TAlert>
        <TAlert variant="success" dismissible>Dismissible success alert.</TAlert>
        <TAlert variant="warning" dismissible>Dismissible warning alert.</TAlert>
        <TAlert variant="danger" dismissible>Dismissible danger alert.</TAlert>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { InfoIcon, TAlert },
    setup: () => ({ iconProps }),
    template: `
      <TAlert variant="info" dismissible>
        <template #icon>
          <InfoIcon v-bind="iconProps" />
        </template>
        An alert with an icon and a dismiss button.
      </TAlert>
    `,
  }),
};

export const SemanticIcons: Story = {
  render: () => ({
    components: { TAlert, TIcon },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert variant="info">
          <template #icon>
            <TIcon name="info" />
          </template>
          Scheduled maintenance starts at 22:00 UTC.
        </TAlert>
        <TAlert variant="success">
          <template #icon>
            <TIcon name="check" />
          </template>
          Your changes were published.
        </TAlert>
        <TAlert variant="warning">
          <template #icon>
            <TIcon name="alert-circle" />
          </template>
          Your trial ends in three days.
        </TAlert>
        <TAlert variant="danger">
          <template #icon>
            <TIcon name="alert-circle" />
          </template>
          We could not process your payment.
        </TAlert>
      </div>
    `,
  }),
};

export const CustomDismissIcon: Story = {
  render: () => ({
    components: { TAlert, TIcon },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert variant="info" dismissible>
          Built-in dismiss icon — the default × rendered by TAlert.
        </TAlert>
        <TAlert variant="success" dismissible>
          <template #dismiss-icon>
            <TIcon name="check" :size="16" />
          </template>
          Custom dismiss icon — the dismiss-icon slot replaces the ×, while the
          button keeps its "Dismiss" accessible name.
        </TAlert>
      </div>
    `,
  }),
};

export const DismissToRemove: Story = {
  render: () => ({
    components: { TAlert, TButton },
    setup: () => {
      const visible = ref([...notices]);
      const dismiss = (id: number) => {
        visible.value = visible.value.filter((notice) => notice.id !== id);
      };
      const reset = () => {
        visible.value = [...notices];
      };

      return { dismiss, reset, visible };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TAlert
          v-for="notice in visible"
          :key="notice.id"
          :variant="notice.variant"
          dismissible
          @dismiss="dismiss(notice.id)"
        >
          {{ notice.message }}
        </TAlert>

        <p
          v-if="!visible.length"
          style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);"
        >
          All alerts dismissed.
        </p>

        <div>
          <TButton variant="outline" size="sm" @click="reset">Reset alerts</TButton>
        </div>
      </div>
    `,
  }),
};
