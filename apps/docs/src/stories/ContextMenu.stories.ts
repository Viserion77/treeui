import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TContextMenu } from '@treeui/vue';

const menuItems = [
  { label: 'Cut', value: 'cut' },
  { label: 'Copy', value: 'copy' },
  { label: 'Paste', value: 'paste' },
  { label: 'Delete', value: 'delete' },
];

const meta = {
  title: 'Components/ContextMenu',
  component: TContextMenu,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    items: menuItems,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TContextMenu },
    setup: () => {
      const selected = ref('');
      return { args, selected, menuItems };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TContextMenu
          :size="args.size"
          :disabled="args.disabled"
          :items="menuItems"
          @select="selected = $event"
        >
          <div
            style="
              padding: var(--tree-space-6);
              border: 1px dashed var(--tree-color-border-default);
              border-radius: var(--tree-radius-md);
              text-align: center;
              color: var(--tree-color-text-muted);
              user-select: none;
            "
          >
            Right-click here to open the context menu
          </div>
        </TContextMenu>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Last selected: {{ selected || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TContextMenu },
    setup: () => ({ menuItems }),
    template: `
      <div style="display: flex; gap: 1rem;">
        <TContextMenu size="sm" :items="menuItems">
          <div style="padding: var(--tree-space-4); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
            Small
          </div>
        </TContextMenu>
        <TContextMenu size="md" :items="menuItems">
          <div style="padding: var(--tree-space-4); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
            Medium
          </div>
        </TContextMenu>
        <TContextMenu size="lg" :items="menuItems">
          <div style="padding: var(--tree-space-4); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
            Large
          </div>
        </TContextMenu>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { TContextMenu },
    setup: () => ({ menuItems }),
    template: `
      <TContextMenu disabled :items="menuItems">
        <div style="padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); opacity: 0.5; user-select: none;">
          Right-click disabled
        </div>
      </TContextMenu>
    `,
  }),
};

export const DisabledItems: Story = {
  render: () => ({
    components: { TContextMenu },
    setup: () => ({
      items: [
        { label: 'Cut', value: 'cut' },
        { label: 'Copy', value: 'copy', disabled: true },
        { label: 'Paste', value: 'paste' },
        { label: 'Delete', value: 'delete', disabled: true },
      ],
    }),
    template: `
      <TContextMenu :items="items">
        <div style="padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
          Right-click here (some items disabled)
        </div>
      </TContextMenu>
    `,
  }),
};
