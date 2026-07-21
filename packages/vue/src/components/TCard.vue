<script setup lang="ts">
import { computed } from 'vue';
import type { TCardVariant, TSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TCardVariant;
    size?: TSize;
    title?: string;
    /**
     * Treat the card as an interactive surface — adds hover elevation and a
     * focus-visible ring. Use with `as="a"` / `as="router-link"` to make the
     * whole card a link without an inner `TLink` (which would underline the
     * card's text via decoration inheritance).
     */
    interactive?: boolean;
  }>(),
  {
    as: 'section',
    variant: 'outline',
    size: 'md',
    title: undefined,
    interactive: false,
  },
);

const classes = computed(() => [
  't-card',
  `t-card--${props.variant}`,
  `t-card--${props.size}`,
  { 't-card--interactive': props.interactive },
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
      class="t-card__header"
    >
      <slot name="header">
        <span
          v-if="title"
          class="t-card__title"
        >
          {{ title }}
        </span>
      </slot>
      <span
        v-if="$slots.actions"
        class="t-card__actions"
      >
        <slot name="actions" />
      </span>
    </header>
    <div class="t-card__body">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="t-card__footer"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>
