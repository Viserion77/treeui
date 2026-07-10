<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  TAvatar,
  TBadge,
  TButton,
  TDropdown,
  TInput,
  TNavMenu,
  TNavbar,
  TProgress,
  TSidebar,
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
</script>

<template>
  <TToastProvider position="bottom-right">
    <div class="shell">
      <TSidebar
        sticky
        default-collapsed
        class="shell__sidebar"
      >
        <template #header="{ collapsed }">
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
        </template>

        <TNavMenu
          v-model="view"
          aria-label="Dashboard sections"
          :items="navItems"
          :size="config.density"
        />

        <template #footer="{ collapsed }">
          <div class="sidebar-foot-group">
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
        </template>
      </TSidebar>

      <div class="shell__main">
        <TNavbar
          sticky
          class="shell__navbar"
        >
          <template #start>
            <div class="page-title">
              <h1>{{ viewTitles[view] }}</h1>
              <TBadge
                tone="info"
                size="sm"
              >
                Demo
              </TBadge>
            </div>
          </template>
          <template #center>
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
          </template>
          <template #end>
            <div class="navbar-actions">
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
          </template>
        </TNavbar>

        <main class="shell__content">
          <component
            :is="currentView"
            @navigate="view = $event"
          />
        </main>
      </div>
    </div>

    <SettingsDrawer v-model:open="settingsOpen" />
  </TToastProvider>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--tree-color-bg-primary);
  color: var(--tree-color-text-primary);
  font-family: var(--tree-font-family-sans);
}

.shell__sidebar {
  height: 100vh;
}

.shell__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.shell__content {
  padding: var(--tree-space-6);
  flex: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
  min-width: 0;
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

.sidebar-foot-group {
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

.page-title {
  display: flex;
  align-items: center;
  gap: var(--tree-space-3);
}

.page-title h1 {
  margin: 0;
  font-size: var(--tree-font-size-lg);
  letter-spacing: -0.01em;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
}

.navbar-search {
  width: min(20rem, 100%);
}

.navbar-search__kbd {
  font-family: var(--tree-font-family-mono);
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-sm);
  padding: 0 var(--tree-space-1);
}

@media (max-width: 768px) {
  .navbar-search {
    display: none;
  }
}

</style>
