<script setup lang="ts">
import { computed } from 'vue';
import type { TAccent } from '../types/contracts';
import TContainer, { type TContainerSize } from './TContainer.vue';

const props = withDefaults(
  defineProps<{
    /** Element to render. `section` by default; `header` for a page hero. */
    as?: string;
    /**
     * Radial halo behind the copy, derived from the accent in scope. It is the
     * only part of a hero backdrop that is 100% tokens; everything else belongs
     * in the `backdrop` slot.
     */
    glow?: boolean;
    /**
     * Reading column. A `TContainer` size, or `none` to place the children
     * directly in the band.
     */
    container?: TContainerSize | 'none';
    /** Horizontal padding of the inner container. */
    padded?: boolean;
    /** Declare the surface accent for this subtree. Closed axis. */
    accent?: TAccent;
  }>(),
  {
    as: 'section',
    glow: false,
    container: 'lg',
    padded: true,
    accent: undefined,
  },
);

defineSlots<{
  /** The hero copy. Rendered above the backdrop. */
  default?: () => unknown;
  /**
   * Decoration behind the copy — art, canvas, image. Clipped to the band and
   * never interactive: the layer is `pointer-events: none`, so a click on the
   * CTA cannot die in the ornament. Always decorative; mark it `aria-hidden`.
   */
  backdrop?: () => unknown;
}>();

const classes = computed(() => [
  't-hero',
  props.accent ? `t-accent--${props.accent}` : null,
]);

const contained = computed(() => props.container !== 'none');
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <div
      v-if="glow"
      class="t-hero__glow"
      aria-hidden="true"
    />
    <div
      v-if="$slots.backdrop"
      class="t-hero__backdrop"
      aria-hidden="true"
    >
      <slot name="backdrop" />
    </div>

    <TContainer
      v-if="contained"
      :size="(container as TContainerSize)"
      :padded="padded"
      class="t-hero__inner"
    >
      <slot />
    </TContainer>
    <div
      v-else
      class="t-hero__inner"
    >
      <slot />
    </div>
  </component>
</template>
