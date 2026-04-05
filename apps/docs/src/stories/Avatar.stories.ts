import type { Meta, StoryObj } from '@storybook/vue3';
import { TAvatar } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Avatar',
  component: TAvatar,
  tags: ['autodocs'],
  args: {
    size: 'md',
    alt: 'Jane Doe',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: [undefined, 'online', 'offline', 'busy', 'away'] },
    square: { control: 'boolean' },
  },
} satisfies Meta<typeof TAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAvatar },
    setup: () => ({ args }),
    template: `<TAvatar v-bind="args" />`,
  }),
  args: {
    src: 'https://i.pravatar.cc/150?u=jane',
    alt: 'Jane Doe',
  },
};

export const WithInitials: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Jane Doe" size="sm" />
        <TAvatar alt="Jane Doe" size="md" />
        <TAvatar alt="Jane Doe" size="lg" />
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Online User" initials="ON" status="online" />
        <TAvatar alt="Offline User" initials="OF" status="offline" />
        <TAvatar alt="Busy User" initials="BU" status="busy" />
        <TAvatar alt="Away User" initials="AW" status="away" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Small" initials="SM" size="sm" />
        <TAvatar alt="Medium" initials="MD" size="md" />
        <TAvatar alt="Large" initials="LG" size="lg" />
      </div>
    `,
  }),
};

export const Square: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Square" initials="SQ" square />
        <TAvatar alt="Square" initials="SQ" square size="lg" />
      </div>
    `,
  }),
};
