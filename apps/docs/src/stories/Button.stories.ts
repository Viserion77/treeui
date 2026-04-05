import type { Meta, StoryObj } from '@storybook/vue3';
import { TButton } from '@treeui/vue';
import { CheckIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Actions/Button',
  component: TButton,
  tags: ['autodocs'],
  args: {
    variant: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, CheckIcon },
    setup: () => ({ args, iconProps }),
    template: `
      <TButton v-bind="args">
        <template #icon>
          <CheckIcon v-bind="iconProps" />
        </template>
        Invite teammate
      </TButton>
    `,
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: Playground.render,
};

export const Variants: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TButton variant="solid">Solid</TButton>
        <TButton variant="outline">Outline</TButton>
        <TButton variant="ghost">Ghost</TButton>
        <TButton variant="soft">Soft</TButton>
        <TButton variant="danger">Danger</TButton>
      </div>
    `,
  }),
};
