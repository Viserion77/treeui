<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    size?: TSize;
  }>(),
  {
    size: 'md',
  },
);

const classes = computed(() => ['t-description-list', `t-description-list--${props.size}`]);
</script>

<template>
  <dl :class="classes">
    <slot />
  </dl>
</template>
