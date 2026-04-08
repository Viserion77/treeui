<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const treeContainerSizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

export type TreeContainerSize = (typeof treeContainerSizes)[number];

const props = withDefaults(
  defineProps<{
    as?: string;
    size?: TreeContainerSize;
    padded?: boolean;
    centered?: boolean;
  }>(),
  {
    as: 'div',
    size: 'lg',
    padded: true,
    centered: true,
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  'tree-container',
  `tree-container--${props.size}`,
  {
    'is-padded': props.padded,
    'is-centered': props.centered,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

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
