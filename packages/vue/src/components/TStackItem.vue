<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
    /** Expand to fill free space. `true` = flex-grow 1; a number sets the factor. */
    grow?: boolean | number;
    /** Allow shrinking. `false` prevents it; a number sets the factor. */
    shrink?: boolean | number;
    /** flex-basis (initial main-axis size). */
    basis?: string;
    /** Minimum main-axis size before it wraps/shrinks. */
    minWidth?: string;
    /** Per-item cross-axis alignment (align-self). */
    align?: string;
  }>(),
  {
    as: 'div',
    grow: false,
    shrink: undefined,
    basis: undefined,
    minWidth: undefined,
    align: undefined,
  },
);

const attrs = useAttrs();

const toFactor = (value: boolean | number | undefined, truthy: number, falsy: number) => {
  if (value === undefined) return undefined;
  if (value === true) return truthy;
  if (value === false) return falsy;
  return value;
};

const rootStyle = computed(() => [
  {
    flexGrow: toFactor(props.grow, 1, 0),
    flexShrink: toFactor(props.shrink, 1, 0),
    flexBasis: props.basis,
    minInlineSize: props.minWidth,
    alignSelf: props.align,
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
    class="t-stack-item"
    :class="attrs.class"
    :style="rootStyle"
  >
    <slot />
  </component>
</template>
