<script setup lang="ts">
// SidebarShell — implements recipe "sidebar-shell".
// A full application shell with a collapsible TSidebar (whose collapsed state is
// inherited by TNavMenu), a top TNavbar, and a width-constrained TContainer main area.
import { ref } from 'vue';
import {
  TSidebar,
  TNavMenu,
  TNavbar,
  TContainer,
  type TreeNavMenuItem,
} from '@treeui/vue';

const navItems: TreeNavMenuItem[] = [
  { label: 'Dashboard', value: 'dashboard', shortLabel: 'Db' },
  { label: 'Projects', value: 'projects', shortLabel: 'Pr', badge: 4 },
  { label: 'Team', value: 'team', shortLabel: 'Tm' },
  { label: 'Reports', value: 'reports', shortLabel: 'Rp' },
  { label: 'Settings', value: 'settings', shortLabel: 'St' },
];

const activeSection = ref('dashboard');
</script>

<template>
  <div class="sidebar-shell">
    <!-- TNavMenu omits the `collapsed` prop so it inherits the state from TSidebar. -->
    <TSidebar
      default-collapsed
      sticky
    >
      <template #header="{ collapsed }">
        <strong>{{ collapsed ? 'T' : 'TreeUI' }}</strong>
      </template>

      <TNavMenu
        v-model="activeSection"
        aria-label="Workspace navigation"
        :items="navItems"
      />
    </TSidebar>

    <div class="sidebar-shell__main">
      <TNavbar sticky>
        <template #start>
          <strong>Workspace</strong>
        </template>
        <template #end>
          <span>jeferson@simplificamais</span>
        </template>
      </TNavbar>

      <TContainer
        as="main"
        size="lg"
      >
        <p>
          This is the main work area of the application shell. Use the sidebar to
          switch sections — the navigation menu inherits its collapsed state from
          the surrounding sidebar.
        </p>
      </TContainer>
    </div>
  </div>
</template>

<style scoped>
.sidebar-shell {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
}

.sidebar-shell__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
</style>
