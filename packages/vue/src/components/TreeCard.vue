<script setup lang="ts">
import { computed } from 'vue';
import type { TreeCardVariant, TreeSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TreeCardVariant;
    size?: TreeSize;
    title?: string;
  }>(),
  {
    as: 'section',
    variant: 'outline',
    size: 'md',
    title: undefined,
  },
);

const classes = computed(() => [
  'tree-card',
  `tree-card--${props.variant}`,
  `tree-card--${props.size}`,
]);

const hasHeader = computed(() => !!props.title);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <header
      v-if="$slots.header || hasHeader || $slots.actions"
      class="tree-card__header"
    >
      <slot name="header">
        <span
          v-if="title"
          class="tree-card__title"
        >
          {{ title }}
        </span>
        <span
          v-if="$slots.actions"
          class="tree-card__actions"
        >
          <slot name="actions" />
        </span>
      </slot>
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
