import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TDropdown, TButton } from '@treeui/vue';

const menuItems = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Archive', value: 'archive' },
  { label: 'Delete', value: 'delete' },
];

const meta = {
  title: 'Components/Overlay/Dropdown',
  component: TDropdown,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    label: 'Actions',
    items: menuItems,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDropdown },
    setup: () => {
      const selected = ref('');
      return { args, selected, menuItems };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TDropdown
          :label="args.label"
          :size="args.size"
          :disabled="args.disabled"
          :items="menuItems"
          @select="selected = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Last selected: {{ selected || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TDropdown },
    setup: () => ({ menuItems }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: start;">
        <TDropdown size="sm" label="Small" :items="menuItems" />
        <TDropdown size="md" label="Medium" :items="menuItems" />
        <TDropdown size="lg" label="Large" :items="menuItems" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { TDropdown },
    setup: () => ({ menuItems }),
    template: `
      <TDropdown disabled label="Disabled" :items="menuItems" />
    `,
  }),
};

export const DisabledItems: Story = {
  render: () => ({
    components: { TDropdown },
    setup: () => ({
      items: [
        { label: 'Edit', value: 'edit' },
        { label: 'Duplicate', value: 'duplicate', disabled: true },
        { label: 'Archive', value: 'archive' },
        { label: 'Delete', value: 'delete', disabled: true },
      ],
    }),
    template: `
      <TDropdown label="With disabled items" :items="items" />
    `,
  }),
};

export const CustomTrigger: Story = {
  render: () => ({
    components: { TDropdown, TButton },
    setup: () => ({ menuItems }),
    template: `
      <TDropdown :items="menuItems" label="File actions">
        <template #trigger="{ isOpen }">
          <TButton :variant="isOpen ? 'solid' : 'outline'">
            {{ isOpen ? 'Close menu' : 'Open menu' }}
          </TButton>
        </template>
      </TDropdown>
    `,
  }),
};
