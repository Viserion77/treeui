<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    size?: TreeSize;
    label?: string;
  }>(),
  {
    size: 'md',
    label: 'Loading',
  },
);

const classes = computed(() => ['tree-spinner', `tree-spinner--${props.size}`]);
</script>

<template>
  <span
    :class="classes"
    role="status"
    :aria-label="label"
  >
    <span
      class="tree-spinner__ring"
      aria-hidden="true"
    />
    <span class="tree-visually-hidden">{{ label }}</span>
  </span>
</template>
