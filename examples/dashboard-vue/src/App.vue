<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  TAppShell,
  TAvatar,
  TBadge,
  TButton,
  TCard,
  TDivider,
  TDropdown,
  TInput,
  TKbd,
  TNavMenu,
  TPage,
  TProgress,
  TSpacer,
  TStack,
  TText,
  TToastProvider,
  TTooltip,
  useToast,
} from '@treeui/vue';
import type { TNavMenuItem } from '@treeui/vue';
import logoUrl from './assets/treeui-logo.svg';
import { useAppTheme, useDashboardConfig } from './composables/useDashboardConfig';
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

const theme = useAppTheme();
const isDark = computed(() => theme.resolved.value === 'dark');

function toggleTheme() {
  theme.setMode(isDark.value ? 'light' : 'dark');
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
    >
      <template #header="{ mobile, collapsed, toggleCollapsed }">
        <TStack
          direction="horizontal"
          align="center"
          gap="var(--tree-space-4)"
        >
          <TStack
            direction="horizontal"
            align="center"
            gap="var(--tree-space-3)"
          >
            <TText
              as="h1"
              size="lg"
              weight="semibold"
            >
              {{ viewTitles[view] }}
            </TText>
            <TBadge
              tone="info"
              size="sm"
            >
              Demo
            </TBadge>
          </TStack>

          <TSpacer />

          <TInput
            v-if="!mobile"
            v-model="search"
            type="search"
            size="sm"
            width="lg"
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
              <TKbd>⌘K</TKbd>
            </template>
          </TInput>

          <TSpacer v-if="!mobile" />

          <!-- On mobile these move into the drawer (see #sidebar) — no room here. -->
          <TStack
            v-if="!mobile"
            direction="horizontal"
            align="center"
            gap="var(--tree-space-2)"
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
          </TStack>
        </TStack>
      </template>

      <template #sidebar="{ mobile, collapsed, closeSidebar }">
        <TStack
          grow
          gap="var(--tree-space-4)"
        >
          <TStack
            direction="horizontal"
            align="center"
            :justify="collapsed ? 'center' : 'flex-start'"
            gap="var(--tree-space-2)"
          >
            <img
              :src="logoUrl"
              alt=""
              width="28"
              height="28"
            >
            <TText
              v-if="!collapsed"
              weight="semibold"
            >
              Orchard
            </TText>
          </TStack>

          <TNavMenu
            :model-value="view"
            aria-label="Dashboard sections"
            :items="navItems"
            :size="config.density"
            @update:model-value="(value) => selectView(value, closeSidebar)"
          />

          <TSpacer />

          <TStack gap="var(--tree-space-3)">
            <!-- Header actions that don't fit the mobile top bar live here. -->
            <template v-if="mobile">
              <TStack gap="var(--tree-space-1)">
                <TButton
                  block
                  align="start"
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
                  block
                  align="start"
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
                  block
                  align="start"
                  variant="ghost"
                  :size="config.density"
                  @click="() => { settingsOpen = true; closeSidebar(); }"
                >
                  <template #icon>
                    <IconGear />
                  </template>
                  Settings
                </TButton>
              </TStack>
              <TDivider />
            </template>

            <TCard
              v-if="!collapsed"
              variant="outline"
            >
              <TStack gap="var(--tree-space-1)">
                <TText weight="semibold">
                  Storage
                </TText>
                <TProgress
                  :value="64"
                  label="Storage used"
                  size="sm"
                />
                <TText
                  as="small"
                  tone="muted"
                >
                  6.4 GB of 10 GB used
                </TText>
              </TStack>
            </TCard>

            <TStack
              direction="horizontal"
              align="center"
              :justify="collapsed ? 'center' : 'flex-start'"
              gap="var(--tree-space-2)"
            >
              <TAvatar
                initials="JA"
                status="online"
                size="sm"
                alt="Jef Almeida"
              />
              <TText
                v-if="!collapsed"
                as="small"
                tone="muted"
                truncate
              >
                Jef Almeida
              </TText>
            </TStack>
          </TStack>
        </TStack>
      </template>

      <template #default>
        <TPage width="full">
          <component
            :is="currentView"
            @navigate="view = $event"
          />
        </TPage>
      </template>
    </TAppShell>

    <SettingsDrawer v-model:open="settingsOpen" />
  </TToastProvider>
</template>
