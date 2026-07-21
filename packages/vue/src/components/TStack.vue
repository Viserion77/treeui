<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const _treeStackDirections = ['vertical', 'horizontal'] as const;
const _treeStackFills = ['viewport', 'parent'] as const;

export type TStackDirection = (typeof _treeStackDirections)[number];
export type TStackFill = (typeof _treeStackFills)[number];

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
    /**
     * Give the stack a minimum block size so a centered child fills the screen
     * or its parent: `viewport` → `100dvh`, `parent` → `100%`. Compose with
     * `align`/`justify="center"` for a centered loading or empty state.
     */
    fill?: TStackFill;
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
    fill: undefined,
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-stack',
  `t-stack--${props.direction}`,
  props.fill ? `t-stack--fill-${props.fill}` : null,
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
