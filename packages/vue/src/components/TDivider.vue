<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    label?: string;
  }>(),
  {
    orientation: 'horizontal',
    decorative: true,
    label: undefined,
  },
);

const classes = computed(() => [
  't-divider',
  `t-divider--${props.orientation}`,
]);
</script>

<template>
  <hr
    :class="classes"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative ? orientation : undefined"
    :aria-label="!decorative ? label : undefined"
  >
</template>
