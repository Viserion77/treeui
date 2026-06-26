<script setup lang="ts">
// RouterBackedTabs — implements recipe `router-backed-tabs`.
// Tabbed panel navigation whose active tab is meant to deep-link to route state.
// In a real app, bind v-model to a route/query param (e.g. router query `?tab=`);
// here it is bound to a local ref because Storybook has no router.
import { ref } from 'vue';
import { TTabs, TTabList, TTab, TTabPanel } from '@treeui/vue';

// In a real app this would be a computed bound to the router/query param, e.g.:
//   const activeTab = computed({
//     get: () => (route.query.tab as string) ?? 'overview',
//     set: (value) => router.replace({ query: { ...route.query, tab: value } }),
//   });
// Storybook has no router, so we sync against a local ref instead.
const activeTab = ref('overview');
</script>

<template>
  <TTabs v-model="activeTab">
    <TTabList>
      <TTab value="overview">
        Overview
      </TTab>
      <TTab value="activity">
        Activity
      </TTab>
      <TTab value="settings">
        Settings
      </TTab>
    </TTabList>

    <TTabPanel value="overview">
      Overview of your workspace, members, and recent highlights.
    </TTabPanel>
    <TTabPanel value="activity">
      A chronological feed of recent activity across the workspace.
    </TTabPanel>
    <TTabPanel value="settings">
      Workspace settings, preferences, and integrations.
    </TTabPanel>
  </TTabs>
</template>
