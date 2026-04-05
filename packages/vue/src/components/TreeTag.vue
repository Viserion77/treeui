<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

export type TreeTagVariant = 'solid' | 'outline' | 'soft';

const props = withDefaults(
  defineProps<{
    variant?: TreeTagVariant;
    size?: TreeSize;
    removable?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'soft',
    size: 'md',
    removable: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'remove'): void;
}>();

const classes = computed(() => [
  'tree-tag',
  `tree-tag--${props.variant}`,
  `tree-tag--${props.size}`,
  props.disabled ? 'is-disabled' : '',
]);

function handleRemove() {
  if (props.disabled) return;
  emit('remove');
}
</script>

<template>
  <span :class="classes">
    <span
      v-if="$slots.icon"
      class="tree-tag__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="tree-tag__label">
      <slot />
    </span>
    <button
      v-if="removable"
      type="button"
      class="tree-tag__remove"
      :disabled="disabled"
      aria-label="Remove"
      @click="handleRemove"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  </span>
</template>
