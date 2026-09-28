<script setup lang="ts">
import { computed } from 'vue';
import type { TBadgeTone, TSize, TVariant } from '../types/contracts';

// The set itself lives in `@treeui/tokens` so `@treeui/react` and the Compose
// and egui ports read the same one. Re-exported here because `TBadgeTone` has
// always been part of this component's public surface.
export type { TBadgeTone };

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
