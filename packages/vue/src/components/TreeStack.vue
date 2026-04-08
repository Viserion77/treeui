<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const _treeStackDirections = ['vertical', 'horizontal'] as const;

export type TreeStackDirection = (typeof _treeStackDirections)[number];

const props = withDefaults(
  defineProps<{
    as?: string;
    direction?: TreeStackDirection;
    gap?: string;
    align?: string;
    justify?: string;
    wrap?: boolean;
    reverse?: boolean;
  }>(),
  {
    as: 'div',
    direction: 'vertical',
    gap: 'var(--tree-space-4)',
    align: 'stretch',
    justify: 'flex-start',
    wrap: false,
    reverse: false,
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  'tree-stack',
  `tree-stack--${props.direction}`,
  {
    'is-wrapping': props.wrap,
    'is-reversed': props.reverse,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  {
    gap: props.gap,
    alignItems: props.align,
    justifyContent: props.justify,
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
