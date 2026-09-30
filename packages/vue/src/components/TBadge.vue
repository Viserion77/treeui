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
    /**
     * Keep the label on one line and clip it with an ellipsis. Opt-in, because
     * the useful default for a badge is to wrap: a status pill that silently
     * loses the end of its text is worse than a two-line pill. Pass `label` as
     * well so the full text reaches the `title` tooltip.
     */
    truncate?: boolean;
    /**
     * The badge text. Only needed with `truncate`, which puts it in `title` so
     * the clipped text stays readable; otherwise use the default slot.
     */
    label?: string;
  }>(),
  {
    variant: 'soft',
    size: 'md',
    tone: 'neutral',
    truncate: false,
    label: undefined,
  },
);

const classes = computed(() => [
  't-badge',
  `t-badge--${props.variant}`,
  `t-badge--${props.size}`,
  `t-badge--tone-${props.tone}`,
  { 'is-truncated': props.truncate },
]);
</script>

<template>
  <span
    :class="classes"
    :title="truncate ? label : undefined"
  >
    <span
      v-if="$slots.icon"
      class="t-badge__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="t-badge__label">
      <slot>{{ label }}</slot>
    </span>
  </span>
</template>
