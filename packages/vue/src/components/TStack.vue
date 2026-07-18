<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const _treeStackDirections = ['vertical', 'horizontal'] as const;

export type TStackDirection = (typeof _treeStackDirections)[number];

const props = withDefaults(
  defineProps<{
    as?: string;
    direction?: TStackDirection;
    gap?: string;
    align?: string;
    justify?: string;
    wrap?: boolean;
    reverse?: boolean;
    /** Expand to fill available space along the parent's main axis. */
    grow?: boolean;
  }>(),
  {
    as: 'div',
    direction: 'vertical',
    gap: 'var(--tree-space-4)',
    align: 'stretch',
    justify: 'flex-start',
    wrap: false,
    reverse: false,
    grow: false,
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-stack',
  `t-stack--${props.direction}`,
  {
    'is-wrapping': props.wrap,
    'is-reversed': props.reverse,
    'is-grow': props.grow,
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
