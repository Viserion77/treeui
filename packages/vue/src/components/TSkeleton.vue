<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    animation?: 'pulse' | 'wave' | 'none';
  }>(),
  {
    width: '100%',
    height: undefined,
    animation: 'pulse',
  },
);

const classes = computed(() => [
  't-skeleton',
  props.animation !== 'none' ? `t-skeleton--${props.animation}` : '',
]);

const style = computed(() => ({
  width: props.width,
  height: props.height,
}));
</script>

<template>
  <span
    :class="classes"
    :style="style"
    aria-hidden="true"
  >
    <slot />
  </span>
</template>
