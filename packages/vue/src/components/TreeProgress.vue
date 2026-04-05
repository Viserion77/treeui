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
    /** Visual variant: bar (linear) or ring (circular) */
    variant?: 'bar' | 'ring';
  }>(),
  {
    value: undefined,
    max: 100,
    size: 'md',
    label: 'Progress',
    variant: 'bar',
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
  `tree-progress--${props.variant}`,
  { 'tree-progress--indeterminate': isIndeterminate.value },
]);

const ringSize = computed(() => {
  const sizes = { sm: 24, md: 36, lg: 48 };
  return sizes[props.size];
});

const ringStroke = computed(() => {
  const strokes = { sm: 3, md: 4, lg: 5 };
  return strokes[props.size];
});

const ringRadius = computed(() => (ringSize.value - ringStroke.value) / 2);
const ringCircumference = computed(() => 2 * Math.PI * ringRadius.value);

const ringOffset = computed(() => {
  if (isIndeterminate.value) return ringCircumference.value * 0.75;
  return ringCircumference.value * (1 - percentage.value / 100);
});
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
    <!-- Bar variant -->
    <template v-if="variant === 'bar'">
      <div class="tree-progress__track">
        <div
          class="tree-progress__fill"
          :style="isIndeterminate ? undefined : { width: `${percentage}%` }"
        />
      </div>
    </template>

    <!-- Ring variant -->
    <template v-else>
      <svg
        class="tree-progress__ring"
        :width="ringSize"
        :height="ringSize"
        :viewBox="`0 0 ${ringSize} ${ringSize}`"
        aria-hidden="true"
      >
        <circle
          class="tree-progress__ring-track"
          :cx="ringSize / 2"
          :cy="ringSize / 2"
          :r="ringRadius"
          fill="none"
          :stroke-width="ringStroke"
        />
        <circle
          class="tree-progress__ring-fill"
          :cx="ringSize / 2"
          :cy="ringSize / 2"
          :r="ringRadius"
          fill="none"
          :stroke-width="ringStroke"
          stroke-linecap="round"
          :stroke-dasharray="ringCircumference"
          :stroke-dashoffset="ringOffset"
        />
      </svg>
    </template>

    <span class="tree-visually-hidden">{{ label }}</span>
  </div>
</template>
