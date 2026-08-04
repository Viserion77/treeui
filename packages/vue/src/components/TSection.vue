<script setup lang="ts">
import { computed } from 'vue';
import type { TAccent } from '../types/contracts';
import TContainer, { type TContainerSize } from './TContainer.vue';

const _treeSectionRhythms = ['tight', 'default', 'loose'] as const;

export type TSectionRhythm = (typeof _treeSectionRhythms)[number];

const props = withDefaults(
  defineProps<{
    /** Element to render. Use `section` (default), `header`, `footer`, `aside`. */
    as?: string;
    /** Vertical rhythm step. Responsive `padding-block`, not a fixed value. */
    rhythm?: TSectionRhythm;
    /**
     * Alternate band background (`--tree-color-bg-subtle`), used to separate
     * consecutive sections without a rule. Full-bleed because the section spans
     * its parent and carries the background itself — no `100vw`, no negative
     * margin, so a Windows scrollbar never produces horizontal overflow.
     */
    banded?: boolean;
    /**
     * Reading column. A `TContainer` size, or `none` to place the children
     * directly in the band (a section that manages its own column).
     */
    container?: TContainerSize | 'none';
    /** Horizontal padding of the inner container. */
    padded?: boolean;
    /**
     * Declare the surface accent for this subtree (`--tree-color-accent-*`).
     * Closed axis — descendants that read the accent follow, e.g.
     * `TTag tone="accent"`, `THero glow`, `--tree-shadow-accent`.
     */
    accent?: TAccent;
  }>(),
  {
    as: 'section',
    rhythm: 'default',
    banded: false,
    container: 'lg',
    padded: true,
    accent: undefined,
  },
);

const classes = computed(() => [
  't-section',
  `t-section--${props.rhythm}`,
  props.accent ? `t-accent--${props.accent}` : null,
  { 'is-banded': props.banded },
]);

const contained = computed(() => props.container !== 'none');
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <TContainer
      v-if="contained"
      :size="(container as TContainerSize)"
      :padded="padded"
      class="t-section__inner"
    >
      <slot />
    </TContainer>
    <slot v-else />
  </component>
</template>
