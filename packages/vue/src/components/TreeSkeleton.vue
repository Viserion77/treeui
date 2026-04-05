<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string;
    height?: string;
    animation?: 'pulse' | 'wave' | 'none';
  }>(),
  {
    variant: 'text',
    width: '100%',
    height: undefined,
    animation: 'pulse',
  },
);

const classes = computed(() => [
  'tree-skeleton',
  `tree-skeleton--${props.variant}`,
  props.animation !== 'none' ? `tree-skeleton--${props.animation}` : '',
]);

const style = computed(() => ({
  width: props.variant === 'circular' ? props.width : props.width,
  height:
    props.height ??
    (props.variant === 'circular' ? props.width : undefined),
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
