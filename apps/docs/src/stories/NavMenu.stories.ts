import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TNavMenu } from '@treeui/vue';

const items = [
  { label: 'Overview', value: 'overview', description: 'Summary and activity', badge: '12', shortLabel: 'O' },
  { label: 'Projects', value: 'projects', description: 'Roadmaps and execution', shortLabel: 'P' },
  { label: 'Billing', value: 'billing', description: 'Plan and invoices', badge: 'New', shortLabel: 'B' },
  { label: 'Settings', value: 'settings', description: 'Workspace preferences', disabled: true, shortLabel: 'S' },
];

const meta = {
  title: 'Components/Layout/NavMenu',
  component: TNavMenu,
  tags: ['autodocs'],
  args: {
    size: 'md',
    collapsed: false,
    disabled: false,
    modelValue: 'projects',
    items,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TNavMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TNavMenu },
    setup: () => {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TNavMenu
          aria-label="Workspace sections"
          :size="args.size"
          :collapsed="args.collapsed"
          :disabled="args.disabled"
          :items="args.items"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Current route: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  render: () => ({
    components: { TNavMenu },
    template: `
      <div style="width: 5rem;">
        <TNavMenu aria-label="Collapsed menu" collapsed :items="items" model-value="overview" />
      </div>
    `,
    setup: () => ({ items }),
  }),
};

export const CustomItems: Story = {
  render: () => ({
    components: { TNavMenu },
    setup: () => ({
      value: ref('overview'),
      items,
    }),
    template: `
      <div style="width: 320px;">
        <TNavMenu
          aria-label="Custom nav"
          :items="items"
          :model-value="value"
          @update:model-value="value = $event"
        >
          <template #item="{ item, selected }">
            <span style="display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; width: 100%; align-items: center;">
              <span style="width: 1.9rem; height: 1.9rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--tree-color-bg-subtle);">
                {{ item.shortLabel }}
              </span>
              <span style="display: grid; gap: 0.25rem; min-width: 0;">
                <strong>{{ item.label }}</strong>
                <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">{{ item.description }}</span>
              </span>
              <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
                {{ selected ? 'Current' : item.badge }}
              </span>
            </span>
          </template>
        </TNavMenu>
      </div>
    `,
  }),
};
