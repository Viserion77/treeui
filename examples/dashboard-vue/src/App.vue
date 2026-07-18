<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  TAppShell,
  TAvatar,
  TBadge,
  TButton,
  TDropdown,
  TInput,
  TNavMenu,
  TProgress,
  TToastProvider,
  TTooltip,
  useToast,
} from '@treeui/vue';
import type { TNavMenuItem } from '@treeui/vue';
import logoUrl from './assets/treeui-logo.svg';
import { useDashboardConfig } from './composables/useDashboardConfig';
import {
  IconBell,
  IconGear,
  IconHome,
  IconMoon,
  IconOrders,
  IconSearch,
  IconSidebar,
  IconSun,
  IconUsers,
} from './icons';
import SettingsDrawer from './components/SettingsDrawer.vue';
import OverviewView from './views/OverviewView.vue';
import OrdersView from './views/OrdersView.vue';
import CustomersView from './views/CustomersView.vue';

const { config } = useDashboardConfig();
const toast = useToast();

const view = ref('overview');
const settingsOpen = ref(false);
const search = ref('');

function onNotifications() {
  toast.add({
    title: "You're all caught up",
    description: 'No new notifications right now.',
    variant: 'info',
  });
}

const navItems: TNavMenuItem[] = [
  { label: 'Overview', value: 'overview', icon: IconHome, description: 'Metrics and activity' },
  { label: 'Orders', value: 'orders', icon: IconOrders, badge: 37 },
  { label: 'Customers', value: 'customers', icon: IconUsers },
];

const views = {
  overview: OverviewView,
  orders: OrdersView,
  customers: CustomersView,
} as const;

const currentView = computed(
  () => views[view.value as keyof typeof views] ?? OverviewView,
);

const viewTitles: Record<string, string> = {
  overview: 'Overview',
  orders: 'Orders',
  customers: 'Customers',
};

const isDark = computed(() => config.theme === 'dark');

function toggleTheme() {
  config.theme = isDark.value ? 'light' : 'dark';
}

const userMenu = [
  { label: 'Profile', value: 'profile' },
  { label: 'Sign out', value: 'sign-out' },
];

function onUserMenu(action: string) {
  toast.add({
    title: action === 'profile' ? 'This is just a demo profile' : 'Signed out (not really)',
    variant: 'info',
  });
}

function selectView(value: string, closeSidebar: () => void) {
  view.value = value;
  closeSidebar();
}
</script>

<template>
  <TToastProvider position="bottom-right">
    <TAppShell
      collapsible
      sidebar-label="Dashboard navigation"
      menu-label="Open navigation"
      class="app"
    >
      <template #header="{ mobile, collapsed, toggleCollapsed }">
        <div class="topbar">
          <div class="page-title">
            <h1>{{ viewTitles[view] }}</h1>
            <TBadge
              tone="info"
              size="sm"
            >
              Demo
            </TBadge>
          </div>

          <div class="topbar__search">
            <TInput
              v-model="search"
              type="search"
              size="sm"
              class="navbar-search"
              placeholder="Search orders, customers…"
              aria-label="Search"
            >
              <template #prefix>
                <IconSearch
                  width="16"
                  height="16"
                />
              </template>
              <template #suffix>
                <kbd class="navbar-search__kbd">⌘K</kbd>
              </template>
            </TInput>
          </div>

          <!--
            On mobile the header has no room for these; they move into the
            navigation drawer (see the #sidebar slot) so nothing overflows.
          -->
          <div
            v-if="!mobile"
            class="navbar-actions"
          >
            <TTooltip :content="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
              <TButton
                variant="ghost"
                size="sm"
                :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                @click="toggleCollapsed"
              >
                <IconSidebar />
              </TButton>
            </TTooltip>
            <TTooltip content="Notifications">
              <TButton
                variant="ghost"
                size="sm"
                aria-label="Notifications"
                @click="onNotifications"
              >
                <IconBell />
              </TButton>
            </TTooltip>
            <TTooltip :content="isDark ? 'Switch to light theme' : 'Switch to dark theme'">
              <TButton
                variant="ghost"
                size="sm"
                :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
                @click="toggleTheme"
              >
                <component :is="isDark ? IconSun : IconMoon" />
              </TButton>
            </TTooltip>
            <TTooltip content="Customize dashboard">
              <TButton
                variant="ghost"
                size="sm"
                aria-label="Customize dashboard"
                @click="settingsOpen = true"
              >
                <IconGear />
              </TButton>
            </TTooltip>
            <TDropdown
              :items="userMenu"
              size="sm"
              label="Jef"
              aria-label="User menu"
              @select="onUserMenu"
            />
          </div>
        </div>
      </template>

      <template #sidebar="{ mobile, collapsed, closeSidebar }">
        <div
          class="sidebar"
          :class="{ 'sidebar--collapsed': collapsed }"
        >
          <div class="brand">
            <img
              :src="logoUrl"
              alt=""
              class="brand__logo"
            >
            <span
              v-if="!collapsed"
              class="brand__name"
            >Orchard</span>
          </div>

          <TNavMenu
            :model-value="view"
            aria-label="Dashboard sections"
            :items="navItems"
            :size="config.density"
            @update:model-value="(value) => selectView(value, closeSidebar)"
          />

          <div class="sidebar__footer">
            <!-- Header actions that don't fit the mobile top bar live here. -->
            <div
              v-if="mobile"
              class="drawer-actions"
            >
              <TButton
                variant="ghost"
                :size="config.density"
                @click="() => { onNotifications(); closeSidebar(); }"
              >
                <template #icon>
                  <IconBell />
                </template>
                Notifications
              </TButton>
              <TButton
                variant="ghost"
                :size="config.density"
                @click="toggleTheme"
              >
                <template #icon>
                  <component :is="isDark ? IconSun : IconMoon" />
                </template>
                {{ isDark ? 'Light theme' : 'Dark theme' }}
              </TButton>
              <TButton
                variant="ghost"
                :size="config.density"
                @click="() => { settingsOpen = true; closeSidebar(); }"
              >
                <template #icon>
                  <IconGear />
                </template>
                Settings
              </TButton>
            </div>

            <div
              v-if="!collapsed"
              class="storage"
            >
              <span class="storage__label">Storage</span>
              <TProgress
                :value="64"
                label="Storage used"
                size="sm"
              />
              <span class="storage__meta">6.4 GB of 10 GB used</span>
            </div>
            <div class="sidebar-foot">
              <TAvatar
                initials="JA"
                status="online"
                size="sm"
                alt="Jef Almeida"
              />
              <span
                v-if="!collapsed"
                class="sidebar-foot__name"
              >Jef Almeida</span>
            </div>
          </div>
        </div>
      </template>

      <template #default>
        <div class="content">
          <component
            :is="currentView"
            @navigate="view = $event"
          />
        </div>
      </template>
    </TAppShell>

    <SettingsDrawer v-model:open="settingsOpen" />
  </TToastProvider>
</template>

<style scoped>
.app {
  font-family: var(--tree-font-family-sans);
}

/* Header (spans the full width of the shell frame) */
.topbar {
  display: flex;
  align-items: center;
  gap: var(--tree-space-4);
  width: 100%;
  min-width: 0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--tree-space-3);
  flex-shrink: 0;
}

.page-title h1 {
  margin: 0;
  font-size: var(--tree-font-size-lg);
  letter-spacing: -0.01em;
}

.topbar__search {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.navbar-search {
  width: min(22rem, 100%);
}

.navbar-search__kbd {
  font-family: var(--tree-font-family-mono);
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-sm);
  padding: 0 var(--tree-space-1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
  flex-shrink: 0;
}

/* Sidebar (below the header on the left of the frame) */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--tree-space-4);
  flex: 1;
  min-height: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
  min-width: 0;
  min-height: 2rem;
}

.brand__logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.brand__name {
  font-weight: var(--tree-font-weight-semibold, 600);
  letter-spacing: -0.01em;
}

.sidebar__footer {
  margin-top: auto;
  display: grid;
  gap: var(--tree-space-3);
  min-width: 0;
}

.storage {
  display: grid;
  gap: var(--tree-space-1);
  padding: var(--tree-space-3);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-lg);
  background: var(--tree-color-bg-surface);
}

.storage__label {
  font-size: var(--tree-font-size-sm);
  font-weight: var(--tree-font-weight-semibold, 600);
}

.storage__meta {
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
}

.sidebar-foot {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
  min-width: 0;
}

.sidebar-foot__name {
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* When collapsed, center the logo and avatar on the same axis as the
   (now icon-only) nav items, so the whole rail lines up. */
.sidebar--collapsed .brand,
.sidebar--collapsed .sidebar-foot {
  justify-content: center;
}

/* Header actions relocated into the mobile drawer */
.drawer-actions {
  display: grid;
  gap: var(--tree-space-1);
  padding-block-end: var(--tree-space-2);
  border-bottom: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
}

.drawer-actions :deep(.t-button) {
  width: 100%;
  justify-content: flex-start;
}

/* Content panel (inset area to the right of the frame) */
.content {
  padding: var(--tree-space-6);
}

@media (max-width: 768px) {
  .topbar__search {
    display: none;
  }
}
</style>
