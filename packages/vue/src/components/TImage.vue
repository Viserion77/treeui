<script setup lang="ts">
import { computed } from 'vue';

export type TImageFit = 'cover' | 'contain';
export type TImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'pill';

const props = withDefaults(
  defineProps<{
    /** Image URL. Agnostic — the component never fetches or transforms it. */
    src: string;
    /** Accessible name. Required — the library never invents one. */
    alt: string;
    /** `object-fit` when the box has a fixed size (e.g. via `ratio`). */
    fit?: TImageFit;
    /** Corner radius from the token scale. */
    radius?: TImageRadius;
    /** Optional aspect ratio (any CSS `aspect-ratio` value, e.g. `'16 / 9'`). */
    ratio?: string;
    /** Native loading strategy; `lazy` by default. */
    loading?: 'lazy' | 'eager';
  }>(),
  {
    fit: 'cover',
    radius: 'md',
    ratio: undefined,
    loading: 'lazy',
  },
);

const classes = computed(() => [
  't-image',
  `t-image--fit-${props.fit}`,
  `t-image--radius-${props.radius}`,
]);

const style = computed(() => (props.ratio ? { aspectRatio: props.ratio } : undefined));
</script>

<template>
  <img
    :class="classes"
    :src="src"
    :alt="alt"
    :loading="loading"
    :style="style"
  >
</template>
