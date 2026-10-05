<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue';
import { STAT_GROUP_INJECTION_KEY } from './stat-group-context';
import TGrid from './TGrid.vue';

defineOptions({
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    /**
     * Accessible name for the band, so it is announced as one unit rather than
     * as a run of unrelated figures.
     */
    label?: string;
    /** Fixed track count. Leave unset to let `minItemWidth` decide. */
    columns?: number;
    /** Smallest a cell may get before the grid drops a track. */
    minItemWidth?: string;
    /**
     * Let the last row share itself out instead of leaving one cell alone
     * beside empty space. **Off by default, and deliberately** — it composes
     * badly with `TStat` specifically.
     *
     * A stat's value scales to its own cell (`container-type: inline-size`),
     * so a lone cell stretched across the last row renders its number far
     * larger than its siblings', and size on a dashboard reads as importance.
     * An orphan beside empty space is the lesser mistake. The real fix for a
     * band is a track count that divides the figures: set `columns`, or a
     * `minItemWidth` that lands on one.
     */
    balance?: boolean;
  }>(),
  {
    label: undefined,
    columns: undefined,
    minItemWidth: '12rem',
    balance: false,
  },
);

/* Children render plain while they are in here. The alternative is asking the
   consumer to put `variant="plain"` on all eight — which is the alignment
   busywork this library exists to absorb, and which goes wrong the day someone
   adds a ninth. An explicit `variant` on a child still wins. */
provide(STAT_GROUP_INJECTION_KEY, true);

const attrs = useAttrs();

const rootClasses = computed(() => ['t-stat-group', attrs.class]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="attrs.style"
    role="group"
    :aria-label="label"
  >
    <!-- The track is a TGrid with no gap: the cells have to meet for the
         hairline to be a shared edge, and the breathing room comes from each
         cell's own padding. Composing rather than re-implementing the track
         is what makes `balance` available here at all. -->
    <TGrid
      class="t-stat-group__track"
      gap="0"
      :columns="columns"
      :min-item-width="minItemWidth"
      :balance="balance"
    >
      <slot />
    </TGrid>
  </div>
</template>
