<script setup lang="ts">
// HierarchyPicker — recipe: hierarchy-picker
// A form field wrapping a multi-select tree view so users can pick items
// across nested levels of a hierarchy (e.g. assigning a teammate to folders).
import { computed, ref } from 'vue';
import { TFormField, TStack, TTreeView } from '@treeui/vue';
import type { TTreeViewNode } from '@treeui/vue';

const nodes: TTreeViewNode[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Product and platform teams',
    children: [
      {
        id: 'eng-web',
        label: 'Web',
        children: [
          { id: 'eng-web-design-system', label: 'Design System' },
          { id: 'eng-web-dashboard', label: 'Dashboard' },
        ],
      },
      {
        id: 'eng-platform',
        label: 'Platform',
        children: [
          { id: 'eng-platform-api', label: 'API' },
          { id: 'eng-platform-infra', label: 'Infrastructure' },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Brand and growth',
    children: [
      { id: 'marketing-brand', label: 'Brand' },
      { id: 'marketing-growth', label: 'Growth' },
    ],
  },
];

const selected = ref<string[]>(['eng-web-dashboard', 'marketing-growth']);
const expanded = ref<string[]>(['engineering', 'eng-web', 'marketing']);

const hint = computed(() =>
  selected.value.length === 0
    ? 'Select one or more areas to grant access.'
    : `${selected.value.length} area(s) selected.`,
);
</script>

<template>
  <TStack gap="var(--tree-space-3)">
    <TFormField
      label="Workspace access"
      :hint="hint"
    >
      <TTreeView
        aria-label="Workspace areas"
        selection-mode="multiple"
        :nodes="nodes"
        :model-value="selected"
        :expanded="expanded"
        @update:model-value="selected = ($event as string[]) ?? []"
        @update:expanded="expanded = $event"
      />
    </TFormField>
  </TStack>
</template>
