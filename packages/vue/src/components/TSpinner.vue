<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    size?: TSize;
    label?: string;
  }>(),
  {
    size: 'md',
    label: 'Loading',
  },
);

const classes = computed(() => ['t-spinner', `t-spinner--${props.size}`]);
</script>

<template>
  <span
    :class="classes"
    role="status"
    :aria-label="label"
  >
    <span
      class="t-spinner__ring"
      aria-hidden="true"
    />
    <span class="t-visually-hidden">{{ label }}</span>
  </span>
</template>
