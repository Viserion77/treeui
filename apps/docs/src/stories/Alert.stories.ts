import type { Meta, StoryObj } from '@storybook/vue3';
import { TAlert } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Alert',
  component: TAlert,
  tags: ['autodocs'],
  args: {
    variant: 'info',
    size: 'md',
    dismissible: false,
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
