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

/**
 * Filling `header-start` splits the header into a rail column plus a content
 * column, so branding placed over the sidebar stays aligned with it while the
 * `header` slot lines up with the content panel. `sidebar-header` and
 * `sidebar-footer` pin content above and below the scrolling nav — on desktop
 * the footer shares its row with the built-in collapse toggle.
 */
export const SidebarRegions: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TAvatar, TBadge, TButton, TNavMenu },
    setup: () => ({
      args,
      current: ref('projects'),
      items,
    }),
    template: `
      <TAppShell v-bind="args">
        <template #header-start="{ collapsed }">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <TAvatar initials="T" alt="TreeUI" size="sm" />
            <strong v-if="!collapsed" style="font-size: var(--tree-font-size-lg);">TreeUI</strong>
          </div>
        </template>

        <template #header>
          <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
            <TBadge tone="info">Workspace</TBadge>
            <div style="flex: 1 1 auto;"></div>
            <TButton size="sm" variant="soft">Invite</TButton>
          </div>
        </template>

        <template #sidebar-header="{ collapsed }">
          <strong>{{ collapsed ? 'W' : 'Workspace' }}</strong>
        </template>

        <template #sidebar="{ closeSidebar }">
          <TNavMenu
            aria-label="Workspace navigation"
            :items="items"
            :model-value="current"
            @update:model-value="(value) => { current = value; closeSidebar(); }"
          />
        </template>

        <template #sidebar-footer="{ collapsed }">
          <TButton v-if="!collapsed" size="sm" variant="outline" block align="start">
            New project
          </TButton>
        </template>

        <div style="padding: 1.5rem;">
          <p style="margin: 0; color: var(--tree-color-text-muted);">
            The header mirrors the shell columns, and the sidebar footer sits next to the
            built-in collapse toggle.
          </p>
        </div>
      </TAppShell>
    `,
  }),
};

/**
 * `defaultCollapsed` mounts the desktop rail already collapsed. `sidebarWidth`
 * and `collapsedWidth` size both tracks, and the `collapse-icon` slot replaces
 * the built-in toggle glyph using its `collapsed` scoped prop.
 */
export const Collapsed: Story = {
  args: {
    collapsible: true,
    defaultCollapsed: true,
    sidebarWidth: '20rem',
    collapsedWidth: '5.5rem',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TNavMenu },
    setup: () => ({
      args,
      current: ref('reports'),
      items,
    }),
    template: `
      <TAppShell v-bind="args">
        <template #header>
          <strong>TreeUI</strong>
        </template>

        <template #sidebar-header="{ collapsed }">
          <strong>{{ collapsed ? 'W' : 'Workspace' }}</strong>
        </template>

        <template #sidebar="{ closeSidebar }">
          <TNavMenu
            aria-label="Workspace navigation"
            :items="items"
            :model-value="current"
            @update:model-value="(value) => { current = value; closeSidebar(); }"
          />
        </template>

        <template #collapse-icon="{ collapsed }">
          <span aria-hidden="true" style="font-size: var(--tree-font-size-lg); line-height: 1;">
            {{ collapsed ? '»' : '«' }}
          </span>
        </template>

        <template #default="{ collapsed }">
          <div style="padding: 1.5rem;">
            <p style="margin: 0; color: var(--tree-color-text-muted);">
              Rail collapsed: {{ collapsed }} — 5.5rem collapsed, 20rem expanded.
            </p>
          </div>
        </template>
      </TAppShell>
    `,
  }),
};

/**
 * Controlled rail: `v-model:collapsed` owns the state and `collapse-change`
 * reports every transition. Binding `:show-collapse-button="collapsed"` mirrors
 * the shipped dashboard pattern — a custom footer button collapses the rail, and
 * the built-in toggle takes over once the footer has no room left.
 */
export const ControlledCollapse: Story = {
  args: {
    collapsible: true,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TButton, TNavMenu },
    setup: () => ({
      args,
      collapsed: ref(false),
      lastEvent: ref('none yet'),
      current: ref('members'),
      items,
    }),
    template: `
      <TAppShell
        v-bind="args"
        v-model:collapsed="collapsed"
        :show-collapse-button="collapsed"
        collapse-label="Collapse navigation"
        expand-label="Expand navigation"
        @collapse-change="lastEvent = 'collapse-change: ' + $event"
      >
        <template #header>
          <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
            <strong>TreeUI</strong>
            <div style="flex: 1 1 auto;"></div>
            <TButton size="sm" variant="ghost" @click="collapsed = !collapsed">
              {{ collapsed ? 'Expand' : 'Collapse' }} from outside
            </TButton>
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

        <template #sidebar-footer="{ collapsed: railCollapsed, toggleCollapsed }">
          <TButton
            v-if="!railCollapsed"
            size="sm"
            variant="outline"
            block
            align="start"
            @click="toggleCollapsed"
          >
            Collapse
          </TButton>
        </template>

        <div style="padding: 1.5rem; display: grid; gap: 0.35rem;">
          <p style="margin: 0;">Bound state — collapsed: {{ collapsed }}</p>
          <p style="margin: 0; color: var(--tree-color-text-muted);">Last emit — {{ lastEvent }}</p>
        </div>
      </TAppShell>
    `,
  }),
};

/**
 * `defaultSidebarOpen` mounts the mobile drawer already open, so the backdrop,
 * the `role="dialog"` surface and the close button are visible without a click.
 * `menu-icon` swaps the header glyph from its `sidebarOpen` scoped prop, and the
 * accessible names are localizable. The wrapper's `transform` makes it the
 * containing block for the fixed-position overlay, keeping the drawer inside the
 * story frame instead of covering the whole docs page.
 */
export const MobileDrawerOpen: Story = {
  args: {
    mobile: true,
    defaultSidebarOpen: true,
    menuLabel: 'Open navigation',
    closeLabel: 'Close navigation',
    sidebarLabel: 'Main navigation',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TButton, TNavMenu },
    setup: () => ({
      args,
      current: ref('overview'),
      items,
    }),
    template: `
      <div style="transform: translateZ(0); height: 30rem; overflow: hidden; border-radius: 1rem; border: 1px solid var(--tree-color-border-default);">
        <TAppShell v-bind="args" style="block-size: 100%;">
          <template #menu-icon="{ sidebarOpen }">
            <span aria-hidden="true" style="font-size: var(--tree-font-size-lg); line-height: 1;">
              {{ sidebarOpen ? '✕' : '☰' }}
            </span>
          </template>

          <template #header>
            <strong>TreeUI</strong>
          </template>

          <template #sidebar-header>
            <strong>Workspace</strong>
          </template>

          <template #sidebar="{ closeSidebar }">
            <TNavMenu
              aria-label="Workspace navigation"
              :items="items"
              :model-value="current"
              @update:model-value="(value) => { current = value; closeSidebar(); }"
            />
          </template>

          <template #sidebar-footer="{ closeSidebar }">
            <TButton size="sm" variant="ghost" block align="start" @click="closeSidebar">
              Close navigation
            </TButton>
          </template>

          <div style="padding: 1.5rem;">
            <p style="margin: 0; color: var(--tree-color-text-muted);">
              The drawer traps focus while open; the backdrop and Escape both close it.
            </p>
          </div>
        </TAppShell>
      </div>
    `,
  }),
};

/**
 * Controlled drawer: `v-model:sidebarOpen` owns the open state and
 * `sidebar-open-change` reports it. `show-menu-button` is off so the header
 * supplies its own trigger, and with `close-on-overlay` and `close-on-escape`
 * disabled only an explicit action — the header toggle or the drawer close
 * button — dismisses it.
 */
export const ControlledDrawer: Story = {
  args: {
    mobile: true,
    showMenuButton: false,
    closeOnOverlay: false,
    closeOnEscape: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TButton, TNavMenu },
    setup: () => ({
      args,
      sidebarOpen: ref(false),
      lastEvent: ref('none yet'),
      current: ref('members'),
      items,
    }),
    template: `
      <div style="transform: translateZ(0); height: 30rem; overflow: hidden; border-radius: 1rem; border: 1px solid var(--tree-color-border-default);">
        <TAppShell
          v-bind="args"
          v-model:sidebarOpen="sidebarOpen"
          style="block-size: 100%;"
          @sidebar-open-change="lastEvent = 'sidebar-open-change: ' + $event"
        >
          <template #header="{ toggleSidebar, sidebarOpen: isOpen }">
            <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
              <TButton size="sm" variant="outline" @click="toggleSidebar">
                {{ isOpen ? 'Hide' : 'Show' }} navigation
              </TButton>
              <div style="flex: 1 1 auto;"></div>
              <strong>TreeUI</strong>
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

          <div style="padding: 1.5rem; display: grid; gap: 0.35rem;">
            <p style="margin: 0;">Bound state — sidebarOpen: {{ sidebarOpen }}</p>
            <p style="margin: 0; color: var(--tree-color-text-muted);">Last emit — {{ lastEvent }}</p>
          </div>
        </TAppShell>
      </div>
    `,
  }),
};

export const Immersive: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAppShell, TButton, TNavMenu },
    setup: () => {
      const immersive = ref(false);
      const active = ref('overview');
      return { args, immersive, active, items };
    },
    template: `
      <TAppShell v-bind="args" v-model:immersive="immersive">
        <template #header-start><strong>Orchard</strong></template>
        <template #header><span>Workspace</span></template>
        <template #sidebar>
          <TNavMenu v-model="active" :items="items" />
        </template>
        <template #default="{ immersive: isImmersive, toggleImmersive }">
          <div style="padding: 1.5rem; display: grid; gap: 1rem; justify-items: start;">
            <p style="margin: 0;">
              Chrome is {{ isImmersive ? 'hidden' : 'visible' }}. The content never
              remounts across the toggle, so anything typed below survives it.
            </p>
            <input placeholder="Type here, then toggle" style="padding: 0.5rem;" />
            <TButton @click="toggleImmersive">
              {{ isImmersive ? 'Exit immersive' : 'Enter immersive' }}
            </TButton>
          </div>
        </template>
      </TAppShell>
    `,
  }),
};
