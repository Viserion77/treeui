<script setup lang="ts">
import { computed } from 'vue';
import type { TAccent } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    /** Element to render. `div` by default; `main` when the surface IS the page. */
    as?: string;
    /**
     * Take the viewport and become the scroll host
     * (`position: fixed; inset: 0; overflow-y: auto`) instead of letting the
     * document scroll. This is the mode for a screen rendered *over* a mounted
     * app — an anonymous landing, an SSO hand-off, a locked screen — where the
     * page underneath would otherwise scroll along. Scroll chaining is
     * contained, so reaching the end does not move the screen behind.
     */
    overlay?: boolean;
    /** Declare the surface accent for this subtree. Closed axis. */
    accent?: TAccent;
  }>(),
  {
    as: 'div',
    overlay: false,
    accent: undefined,
  },
);

const classes = computed(() => [
  't-page-surface',
  props.accent ? `t-accent--${props.accent}` : null,
  { 'is-overlay': props.overlay },
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
