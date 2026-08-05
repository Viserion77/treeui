<script setup lang="ts">
import { computed } from 'vue';

/**
 * Docked pane (TREEUX-041): fill the parent's height, scroll only the middle,
 * keep header and footer anchored.
 *
 * The recipe is four lines, and one of them is the reason this is a component:
 * `min-block-size: 0` on the scrolling child. Without it a flex child refuses to
 * shrink below its content, the middle never scrolls, and the footer is pushed
 * off the bottom of the screen — and nobody gets it right the first time. Two
 * SPAs had copied the same four lines.
 */
const props = withDefaults(
  defineProps<{
    /** Element to render. `section` by default. */
    as?: string;
    /**
     * Padding inside the scrolling region. The header and footer keep their own
     * padding, so a sticky bar can sit flush while the body breathes.
     */
    padded?: boolean;
  }>(),
  {
    as: 'section',
    padded: true,
  },
);

defineSlots<{
  /** Pinned to the top; never scrolls. */
  header?: () => unknown;
  /** The scrolling region. */
  default?: () => unknown;
  /** Pinned to the bottom; never scrolls. A composer, an action bar. */
  footer?: () => unknown;
}>();

const classes = computed(() => ['t-pane', { 'is-padded': props.padded }]);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <div
      v-if="$slots.header"
      class="t-pane__header"
    >
      <slot name="header" />
    </div>

    <div class="t-pane__body">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="t-pane__footer"
    >
      <slot name="footer" />
    </div>
  </component>
</template>
