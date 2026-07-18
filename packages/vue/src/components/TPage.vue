<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import TContainer, { type TContainerSize } from './TContainer.vue';

defineOptions({
  inheritAttrs: false,
});

const _treePageGaps = ['sm', 'md', 'lg'] as const;

export type TPageGap = (typeof _treePageGaps)[number];

const props = withDefaults(
  defineProps<{
    as?: string;
    /** Max-width of the centered content column. Mirrors `TContainer`'s sizes. */
    width?: TContainerSize;
    /** Block + inline padding around the content column. */
    padded?: boolean;
    /** Vertical rhythm between direct children (e.g. header, sections). */
    gap?: TPageGap;
  }>(),
  {
    as: 'div',
    width: 'lg',
    padded: true,
    gap: 'lg',
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-page',
  {
    'is-padded': props.padded,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const innerClasses = computed(() => ['t-page__inner', `t-page__inner--gap-${props.gap}`]);
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <TContainer
      :size="width"
      :padded="padded"
      centered
      :class="innerClasses"
    >
      <slot />
    </TContainer>
  </component>
</template>
