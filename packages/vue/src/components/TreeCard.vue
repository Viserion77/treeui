<script setup lang="ts">
import { computed } from 'vue';
import type { TreeCardVariant, TreeSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TreeCardVariant;
    size?: TreeSize;
  }>(),
  {
    as: 'section',
    variant: 'outline',
    size: 'md',
  },
);

const classes = computed(() => [
  'tree-card',
  `tree-card--${props.variant}`,
  `tree-card--${props.size}`,
]);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <header
      v-if="$slots.header"
      class="tree-card__header"
    >
      <slot name="header" />
    </header>
    <div class="tree-card__body">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="tree-card__footer"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>
