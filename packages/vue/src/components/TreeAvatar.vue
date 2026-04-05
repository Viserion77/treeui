<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

export type TreeAvatarStatus = 'online' | 'offline' | 'busy' | 'away';

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    initials?: string;
    size?: TreeSize;
    status?: TreeAvatarStatus;
    square?: boolean;
  }>(),
  {
    src: undefined,
    alt: '',
    initials: undefined,
    size: 'md',
    status: undefined,
    square: false,
  },
);

const classes = computed(() => [
  'tree-avatar',
  `tree-avatar--${props.size}`,
  props.square ? 'tree-avatar--square' : '',
]);

const computedInitials = computed(() => {
  if (props.initials) return props.initials;
  if (props.alt) {
    return props.alt
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return '';
});

function onImgError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
}
</script>

<template>
  <span
    :class="classes"
    role="img"
    :aria-label="alt || undefined"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="tree-avatar__image"
      @error="onImgError"
    >
    <span
      v-else
      class="tree-avatar__initials"
      aria-hidden="true"
    >
      {{ computedInitials }}
    </span>
    <slot />
    <span
      v-if="status"
      class="tree-avatar__status"
      :class="`tree-avatar__status--${status}`"
      :aria-label="status"
    />
  </span>
</template>
