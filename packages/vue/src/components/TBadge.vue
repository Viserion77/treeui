<script setup lang="ts">
import { computed } from 'vue';
import type { TSize, TVariant } from '../types/contracts';

const _treeBadgeTones = ['neutral', 'success', 'warning', 'danger', 'info'] as const;

export type TBadgeTone = (typeof _treeBadgeTones)[number];

const props = withDefaults(
  defineProps<{
    variant?: TVariant;
    size?: TSize;
    tone?: TBadgeTone;
  }>(),
  {
    variant: 'soft',
    size: 'md',
    tone: 'neutral',
  },
);

const classes = computed(() => [
  't-badge',
  `t-badge--${props.variant}`,
  `t-badge--${props.size}`,
  `t-badge--tone-${props.tone}`,
]);
</script>

<template>
  <span :class="classes">
    <span
      v-if="$slots.icon"
      class="t-badge__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <slot />
  </span>
</template>
