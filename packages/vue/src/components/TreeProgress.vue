<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    /** Current progress value (0–100). Omit for indeterminate. */
    value?: number;
    /** Maximum value. Defaults to 100. */
    max?: number;
    /** Size variant */
    size?: TreeSize;
    /** Accessible label */
    label?: string;
  }>(),
  {
    value: undefined,
    max: 100,
    size: 'md',
    label: 'Progress',
  },
);

const isIndeterminate = computed(() => props.value === undefined || props.value === null);

const percentage = computed(() => {
  if (isIndeterminate.value) return 0;
  return Math.min(100, Math.max(0, (props.value! / props.max) * 100));
});

const classes = computed(() => [
  'tree-progress',
  `tree-progress--${props.size}`,
  { 'tree-progress--indeterminate': isIndeterminate.value },
]);
</script>

<template>
  <div
    :class="classes"
    role="progressbar"
    :aria-valuenow="isIndeterminate ? undefined : percentage"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="label"
  >
    <div class="tree-progress__track">
      <div
        class="tree-progress__fill"
        :style="isIndeterminate ? undefined : { width: `${percentage}%` }"
      />
    </div>

    <span class="tree-visually-hidden">{{ label }}</span>
  </div>
</template>
