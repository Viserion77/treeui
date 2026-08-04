<script setup lang="ts">
import { computed } from 'vue';
import type { TBreakpoint } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    /** Element to render. Its own box is removed (`display: contents`). */
    as?: string;
    /** Hide from this breakpoint up (inclusive). */
    at?: TBreakpoint;
    /** Hide below this breakpoint. */
    below?: TBreakpoint;
  }>(),
  {
    as: 'div',
    at: undefined,
    below: undefined,
  },
);

// The inverse of TShow, and CSS-only for the same reason. See TShow.vue.
const classes = computed(() => [
  't-hide',
  props.at ? `t-hide--at-${props.at}` : null,
  props.below ? `t-hide--below-${props.below}` : null,
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
