<script setup lang="ts">
import { computed, useAttrs } from 'vue';

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
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  'tree-grid',
  {
    'is-dense': props.dense,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  {
    gap: props.gap,
    rowGap: props.rowGap ?? props.gap,
    alignItems: props.align,
    justifyItems: props.justify,
    gridTemplateColumns:
      typeof props.columns === 'number' && props.columns > 0
        ? `repeat(${props.columns}, minmax(0, 1fr))`
        : `repeat(auto-fit, minmax(min(${props.minItemWidth}, 100%), 1fr))`,
    gridAutoFlow: props.dense ? 'dense' : 'row',
  },
  attrs.style,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <slot />
  </component>
</template>
