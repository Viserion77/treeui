<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize, TreeVariant } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    variant?: TreeVariant;
    size?: TreeSize;
  }>(),
  {
    variant: 'soft',
    size: 'md',
  },
);

const classes = computed(() => [
  'tree-badge',
  `tree-badge--${props.variant}`,
  `tree-badge--${props.size}`,
]);
</script>

<template>
  <span :class="classes">
    <span
      v-if="$slots.icon"
      class="tree-badge__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <slot />
  </span>
</template>
