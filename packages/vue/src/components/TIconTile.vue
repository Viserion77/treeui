<script setup lang="ts">
import { computed } from 'vue';
import type { TIconName } from '@treeui/icons';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

/**
 * The tone vocabulary is TStat's, because this IS TStat's tile — the pill was
 * drawn there first and lived as `.t-stat__icon`, reachable only by using a
 * whole TStat. A feature card wanted the same affordance and the only public
 * route was a bare TIcon, which inherits the text colour, carries a flat 2px
 * stroke and has no ground behind it: at 26px on a phone it reads as a grey
 * scratch rather than a glyph.
 */
const _treeIconTileTones = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const;

export type TIconTileTone = (typeof _treeIconTileTones)[number];

const props = withDefaults(
  defineProps<{
    /** Registry name. Use the `#icon` slot for a glyph that is not registered. */
    name?: TIconName;
    tone?: TIconTileTone;
    size?: TSize;
    /**
     * Accessible name. Omit it when the tile sits beside a heading that already
     * says the same thing — the glyph is then decoration, and a screen reader
     * reading it twice is noise, not help.
     */
    label?: string;
  }>(),
  {
    name: undefined,
    tone: 'brand',
    size: 'md',
    label: undefined,
  },
);

/** The glyph steps with the tile, so the ink keeps its proportion of the pill. */
const GLYPH: Record<TSize, number> = { sm: 16, md: 20, lg: 24 };

const classes = computed(() => [
  't-icon-tile',
  `t-icon-tile--${props.tone}`,
  `t-icon-tile--${props.size}`,
]);
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <slot>
      <TIcon
        v-if="name"
        :name="name"
        :size="GLYPH[size]"
      />
    </slot>
  </span>
</template>
