import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TNavMenu, TSidebar } from '@treeui/vue';

const items = [
  { label: 'Overview', value: 'overview', description: 'Summary and recent work', shortLabel: 'O' },
  { label: 'Projects', value: 'projects', description: 'Delivery and planning', shortLabel: 'P' },
  { label: 'Members', value: 'members', description: 'Roles and permissions', shortLabel: 'M' },
  { label: 'Settings', value: 'settings', description: 'Workspace configuration', shortLabel: 'S' },
];

const meta = {
  title: 'Components/Layout/Sidebar',
  component: TSidebar,
  tags: ['autodocs'],
  args: {
    size: 'md',
    side: 'left',
    sticky: false,
    bordered: true,
    collapsible: true,
    defaultCollapsed: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    side: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
} satisfies Meta<typeof TSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TNavMenu, TSidebar },
    setup: () => ({
      args,
      current: ref('projects'),
      items,
    }),
    template: `
      <div style="display: grid; grid-template-columns: auto 1fr; min-height: 28rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; overflow: hidden; background: var(--tree-color-bg-surface);">
        <TSidebar v-bind="args">
          <template #header="{ collapsed }">
            <div style="display: grid; gap: 0.5rem;">
              <strong>{{ collapsed ? 'T' : 'TreeUI' }}</strong>
              <span v-if="!collapsed" style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                Workspace shell
              </span>
            </div>
          </template>

          <template #default>
            <TNavMenu
              aria-label="Workspace navigation"
              :items="items"
              :model-value="current"
              @update:model-value="current = $event"
            />
          </template>

          <template #footer="{ collapsed }">
            <TButton v-if="!collapsed" size="sm" variant="outline">New project</TButton>
          </template>
        </TSidebar>

        <div style="padding: 1.5rem; display: grid; gap: 1rem;">
          <strong>Content area</strong>
          <p style="margin: 0; color: var(--tree-color-text-muted);">
            Current section: {{ current }}
          </p>
          <div style="display: grid; gap: 0.75rem;">
            <div v-for="n in 4" :key="n" style="padding: 1rem; border-radius: 0.75rem; background: var(--tree-color-bg-subtle);">
              Content block {{ n }}
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    defaultCollapsed: false,
  },
};

export const RightSide: Story = {
  render: () => ({
    components: { TNavMenu, TSidebar },
    setup: () => ({
      current: ref('overview'),
      items,
    }),
    template: `
      <div style="display: grid; grid-template-columns: 1fr auto; min-height: 24rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; overflow: hidden;">
        <div style="padding: 1.25rem;">Main workspace canvas</div>
        <TSidebar side="right" default-collapsed>
          <template #header="{ collapsed }">
            <strong>{{ collapsed ? 'W' : 'Workspace' }}</strong>
          </template>
          <TNavMenu aria-label="Right sidebar menu" :items="items" :model-value="current" @update:model-value="current = $event" />
        </TSidebar>
      </div>
    `,
  }),
};
