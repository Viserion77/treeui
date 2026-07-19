<script setup lang="ts">
import { computed } from 'vue';
import { resolveTreeIcon, treeIconDefaults, type TIconName } from '@treeui/icons';

const props = withDefaults(
  defineProps<{
    name: TIconName;
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

// Resolved per render rather than once at setup, so an icon registered after
// this component mounted still appears.
const iconComponent = computed(() => resolveTreeIcon(props.name));
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    class="t-icon"
    :size="size"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  />
</template>
