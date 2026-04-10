<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize, TreeVariant } from '../types/contracts';

const _treeBadgeTones = ['neutral', 'success', 'warning', 'danger', 'info'] as const;

export type TreeBadgeTone = (typeof _treeBadgeTones)[number];

const props = withDefaults(
  defineProps<{
    variant?: TreeVariant;
    size?: TreeSize;
    tone?: TreeBadgeTone;
  }>(),
  {
    variant: 'soft',
    size: 'md',
    tone: 'neutral',
  },
);

const classes = computed(() => [
  'tree-badge',
  `tree-badge--${props.variant}`,
  `tree-badge--${props.size}`,
  `tree-badge--tone-${props.tone}`,
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
