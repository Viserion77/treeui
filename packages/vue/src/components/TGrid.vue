<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { listRoleFor } from './list-semantics';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
    columns?: number;
    minItemWidth?: string;
    gap?: string;
    rowGap?: string;
    align?: string;
    justify?: string;
    dense?: boolean;
    /**
     * Let the last row divide itself among the items it has, instead of leaving
     * empty tracks to its right. Five cards over four tracks read as "one card
     * failed to load"; the alternative the consumer is left with is calibrating
     * `minItemWidth` until the track count divides the item count, which ties
     * the copy to the geometry — add a sixth feature and the grid needs
     * recalibrating.
     *
     * Full rows are unchanged: the items are equal there, exactly as with
     * tracks. Only the remainder row is shared out. Ignored when `columns` is
     * set, because a declared track count IS the answer to the same question.
     */
    balance?: boolean;
  }>(),
  {
    as: 'div',
    columns: undefined,
    minItemWidth: '16rem',
    gap: 'var(--tree-space-4)',
    rowGap: undefined,
    align: 'stretch',
    justify: 'stretch',
    dense: false,
    balance: false,
  },
);

const attrs = useAttrs();

const hasColumns = computed(() => typeof props.columns === 'number' && props.columns > 0);
const isBalanced = computed(() => props.balance && !hasColumns.value);

const rootClasses = computed(() => [
  't-grid',
  {
    'is-dense': props.dense,
    'is-balanced': isBalanced.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  isBalanced.value
    ? {
        // Flex, because only flex lets the items of a single line share that
        // line. The grid path keeps everything else identical.
        gap: props.gap,
        rowGap: props.rowGap ?? props.gap,
        alignItems: props.align,
        '--tree-grid-min-item-width': props.minItemWidth,
      }
    : {
        gap: props.gap,
        rowGap: props.rowGap ?? props.gap,
        alignItems: props.align,
        justifyItems: props.justify,
        gridTemplateColumns: hasColumns.value
          ? `repeat(${props.columns}, minmax(0, 1fr))`
          : `repeat(auto-fit, minmax(min(${props.minItemWidth}, 100%), 1fr))`,
        gridAutoFlow: props.dense ? 'dense' : 'row',
      },
  attrs.style,
]);

const listRole = computed(() => listRoleFor(props.as));

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <component
    :is="as"
    :role="listRole"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <slot />
  </component>
</template>
