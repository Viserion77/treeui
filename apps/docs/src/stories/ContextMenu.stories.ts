import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TContextMenu, TKbd } from '@treeui/vue';

const menuItems = [
  { label: 'Cut', value: 'cut' },
  { label: 'Copy', value: 'copy' },
  { label: 'Paste', value: 'paste' },
  { label: 'Delete', value: 'delete' },
];

const meta = {
  title: 'Components/Overlay/ContextMenu',
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
      return { args, selected };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TContextMenu
          :size="args.size"
          :disabled="args.disabled"
          :items="args.items"
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

export const CustomItems: Story = {
  render: () => ({
    components: { TContextMenu, TKbd },
    setup: () => ({
      items: [
        { label: 'Cut', value: 'cut' },
        { label: 'Copy', value: 'copy' },
        { label: 'Paste', value: 'paste', disabled: true },
        { label: 'Delete', value: 'delete' },
      ],
      shortcuts: { cut: '⌘X', copy: '⌘C', paste: '⌘V', delete: 'Del' } as Record<string, string>,
    }),
    template: `
      <TContextMenu :items="items">
        <template #item="{ item, index }">
          <span style="width: 1rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">{{ index + 1 }}</span>
          <span>{{ item.label }}</span>
          <TKbd style="margin-left: auto;">{{ shortcuts[item.value] }}</TKbd>
        </template>
        <div style="padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
          Right-click here (custom item rendering)
        </div>
      </TContextMenu>
    `,
  }),
};

export const EmptyItems: Story = {
  render: () => ({
    components: { TContextMenu },
    template: `
      <TContextMenu :items="[]">
        <div style="padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
          Right-click here (no items provided)
        </div>
      </TContextMenu>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { TContextMenu },
    setup: () => {
      const open = ref(false);
      const changes = ref(0);
      return { open, changes, menuItems };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Open: <code>{{ open }}</code> · open-change events: <code>{{ changes }}</code>
        </div>
        <TContextMenu v-model:open="open" :items="menuItems" @open-change="changes++">
          <div style="padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
            Right-click here (open state owned by the parent)
          </div>
        </TContextMenu>
      </div>
    `,
  }),
};

export const KeyboardNavigation: Story = {
  render: () => ({
    components: { TContextMenu, TKbd },
    setup: () => ({
      items: [
        { label: 'Cut', value: 'cut' },
        { label: 'Copy', value: 'copy', disabled: true },
        { label: 'Paste', value: 'paste' },
        { label: 'Delete', value: 'delete' },
      ],
    }),
    template: `
      <TContextMenu :items="items">
        <div style="display: grid; gap: var(--tree-space-3); padding: var(--tree-space-6); border: 1px dashed var(--tree-color-border-default); border-radius: var(--tree-radius-md); text-align: center; color: var(--tree-color-text-muted); user-select: none;">
          <span>Right-click here, then drive the menu with the keyboard</span>
          <div style="display: flex; flex-wrap: wrap; gap: var(--tree-space-3); justify-content: center; font-size: var(--tree-font-size-sm);">
            <span><TKbd>↓</TKbd> <TKbd>↑</TKbd> move (skips disabled)</span>
            <span><TKbd>Home</TKbd> <TKbd>End</TKbd> first / last enabled</span>
            <span><TKbd>Enter</TKbd> <TKbd>Space</TKbd> select</span>
            <span><TKbd>Esc</TKbd> close</span>
          </div>
        </div>
      </TContextMenu>
    `,
  }),
};
