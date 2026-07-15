import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TAppShell, TAvatar, TBadge, TButton, TNavMenu } from '@treeui/vue';

const items = [
  { label: 'Overview', value: 'overview', description: 'Summary and recent work', shortLabel: 'O' },
  { label: 'Projects', value: 'projects', description: 'Delivery and planning', shortLabel: 'P' },
  { label: 'Members', value: 'members', description: 'Roles and permissions', shortLabel: 'M' },
  { label: 'Reports', value: 'reports', description: 'Usage and analytics', shortLabel: 'R' },
  { label: 'Settings', value: 'settings', description: 'Workspace configuration', shortLabel: 'S' },
];

const meta = {
  title: 'Components/Layout/AppShell',
  component: TAppShell,
  tags: ['autodocs'],
  parameters: {
    // The shell fills the viewport, so give it the whole canvas.
    layout: 'fullscreen',
  },
  args: {
    side: 'left',
    collapsible: true,
    defaultCollapsed: false,
    breakpoint: '768px',
    sidebarWidth: '17.5rem',
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['left', 'right'],
    },
    mobile: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof TAppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full-viewport application shell: a top header that spans the full width, a
 * persistent left sidebar, and a fluid content area that uses all remaining
 * space. Toggle the `mobile` control (or narrow the viewport past `breakpoint`)
 * to collapse the sidebar into an off-canvas drawer opened from the header.
 */
export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TAvatar, TBadge, TButton, TNavMenu },
    setup: () => ({
      args,
      current: ref('projects'),
      items,
    }),
    template: `
      <TAppShell v-bind="args">
        <template #header="{ mobile, collapsed, toggleCollapsed }">
          <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
            <strong style="font-size: var(--tree-font-size-lg);">TreeUI</strong>
            <TBadge tone="info">Workspace</TBadge>
            <div style="flex: 1 1 auto;"></div>
            <TButton
              v-if="!mobile"
              size="sm"
              variant="ghost"
              @click="toggleCollapsed"
            >
              {{ collapsed ? 'Expand' : 'Collapse' }}
            </TButton>
            <TButton size="sm" variant="soft">Invite</TButton>
            <TAvatar initials="AL" alt="Ada Lovelace" size="sm" />
          </div>
        </template>

        <template #sidebar="{ closeSidebar }">
          <TNavMenu
            aria-label="Workspace navigation"
            :items="items"
            :model-value="current"
            @update:model-value="(value) => { current = value; closeSidebar(); }"
          />
        </template>

        <template #default="{ collapsed }">
          <div style="padding: clamp(1rem, 3vw, 2rem); display: grid; gap: 1.25rem;">
            <div style="display: grid; gap: 0.35rem;">
              <h1 style="margin: 0; font-size: var(--tree-font-size-xl);">
                {{ items.find((item) => item.value === current)?.label }}
              </h1>
              <p style="margin: 0; color: var(--tree-color-text-muted);">
                Sidebar collapsed: {{ collapsed }} — content stretches across the full page width.
              </p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem;">
              <div
                v-for="n in 8"
                :key="n"
                style="padding: 1.25rem; border-radius: 0.75rem; background: var(--tree-color-bg-surface); border: 1px solid var(--tree-color-border-default);"
              >
                Content block {{ n }}
              </div>
            </div>
          </div>
        </template>
      </TAppShell>
    `,
  }),
};

/**
 * Forcing `mobile` presents the sidebar as an off-canvas drawer with a
 * hamburger button, backdrop, focus trap, and Escape-to-close.
 */
export const Mobile: Story = {
  args: {
    mobile: true,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TNavMenu },
    setup: () => ({
      args,
      current: ref('overview'),
      items,
    }),
    template: `
      <TAppShell v-bind="args">
        <template #header>
          <strong>TreeUI</strong>
        </template>

        <template #sidebar="{ closeSidebar }">
          <TNavMenu
            aria-label="Workspace navigation"
            :items="items"
            :model-value="current"
            @update:model-value="(value) => { current = value; closeSidebar(); }"
          />
        </template>

        <div style="padding: 1.5rem;">
          <p style="margin: 0; color: var(--tree-color-text-muted);">
            Tap the menu button in the header to open the navigation drawer.
          </p>
        </div>
      </TAppShell>
    `,
  }),
};

/**
 * The sidebar can sit on the right instead of the left.
 */
export const RightSide: Story = {
  args: {
    side: 'right',
    collapsible: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TNavMenu },
    setup: () => ({
      args,
      current: ref('members'),
      items,
    }),
    template: `
      <TAppShell v-bind="args">
        <template #header>
          <strong>TreeUI</strong>
        </template>

        <template #sidebar="{ closeSidebar }">
          <TNavMenu
            aria-label="Workspace navigation"
            :items="items"
            :model-value="current"
            @update:model-value="(value) => { current = value; closeSidebar(); }"
          />
        </template>

        <div style="padding: 1.5rem;">Main workspace canvas</div>
      </TAppShell>
    `,
  }),
};
