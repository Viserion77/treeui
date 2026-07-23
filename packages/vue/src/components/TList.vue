<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    as?: string;
    size?: TSize;
  }>(),
  {
    as: 'ul',
    size: 'md',
  },
);

const classes = computed(() => ['t-list', `t-list--${props.size}`]);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <slot />
  </component>
</template>
