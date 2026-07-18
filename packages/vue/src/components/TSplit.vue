<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
    gap?: string;
    /** Main pane grows this many times faster than the aside pane. */
    ratio?: number;
    /** Min width each pane keeps before the layout stacks to one column. */
    minWidth?: string;
    /** Which side the aside pane sits on when side-by-side. */
    side?: 'start' | 'end';
    /** Cross-axis alignment (align-items). */
    align?: string;
  }>(),
  {
    as: 'div',
    gap: 'var(--tree-space-5)',
    ratio: 2,
    minWidth: '18rem',
    side: 'end',
    align: 'start',
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-split',
  `t-split--${props.side}`,
  attrs.class,
]);

const rootStyle = computed(() => [
  {
    '--tree-split-gap': props.gap,
    '--tree-split-ratio': String(props.ratio),
    '--tree-split-min': props.minWidth,
    '--tree-split-align': props.align,
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
    <div class="t-split__main">
      <slot />
    </div>
    <div
      v-if="$slots.aside"
      class="t-split__aside"
    >
      <slot name="aside" />
    </div>
  </component>
</template>
