<script setup lang="ts">
import { computed, type Component } from 'vue';
import { getTreeIcon, treeIconDefaults, type TreeIconName } from '@treeui/icons';

const props = withDefaults(
  defineProps<{
    name: TreeIconName;
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    label?: string;
  }>(),
  {
    size: treeIconDefaults.size,
    strokeWidth: treeIconDefaults.strokeWidth,
    absoluteStrokeWidth: treeIconDefaults.absoluteStrokeWidth,
    label: undefined,
  },
);

const iconComponent = computed(() => getTreeIcon(props.name) as Component);
</script>

<template>
  <component
    :is="iconComponent"
    class="tree-icon"
    :size="size"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  />
</template>
