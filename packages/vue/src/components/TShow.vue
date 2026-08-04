<script setup lang="ts">
import { computed } from 'vue';
import type { TBreakpoint } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    /** Element to render. Its own box is removed (`display: contents`). */
    as?: string;
    /** Render visibly from this breakpoint up (inclusive). */
    at?: TBreakpoint;
    /** Render visibly below this breakpoint. */
    below?: TBreakpoint;
  }>(),
  {
    as: 'div',
    at: undefined,
    below: undefined,
  },
);

// Both branches always render; only CSS decides which one is visible. That is
// the point: `matchMedia` has no `window` during pre-rendering, so a JS answer
// would force the server to guess a viewport and a crawler would read one
// navigation instead of both. It is also something a consumer cannot write —
// a media query cannot resolve `var(--tree-breakpoint-lg)`, so the pixel would
// have to be hardcoded and kept in sync with the library by hand.
const classes = computed(() => [
  't-show',
  props.at ? `t-show--at-${props.at}` : null,
  props.below ? `t-show--below-${props.below}` : null,
]);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <slot />
  </component>
</template>
