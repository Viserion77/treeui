<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
    size?: TreeSize;
    sticky?: boolean;
    bordered?: boolean;
    elevated?: boolean;
  }>(),
  {
    as: 'header',
    size: 'md',
    sticky: false,
    bordered: true,
    elevated: false,
  },
);

const attrs = useAttrs();

const rootClasses = computed(() => [
  'tree-navbar',
  `tree-navbar--${props.size}`,
  {
    'is-sticky': props.sticky,
    'is-bordered': props.bordered,
    'is-elevated': props.elevated,
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
    <div class="tree-navbar__inner">
      <div
        v-if="$slots.start"
        class="tree-navbar__section tree-navbar__section--start"
      >
        <slot name="start" />
      </div>

      <div
        v-if="$slots.default || $slots.center"
        class="tree-navbar__section tree-navbar__section--center"
      >
        <slot name="center">
          <slot />
        </slot>
      </div>

      <div
        v-if="$slots.end"
        class="tree-navbar__section tree-navbar__section--end"
      >
        <slot name="end" />
      </div>
    </div>
  </component>
</template>
