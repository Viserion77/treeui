<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

export type TreeAlertVariant = 'info' | 'success' | 'warning' | 'danger';

const props = withDefaults(
  defineProps<{
    variant?: TreeAlertVariant;
    size?: TreeSize;
    dismissible?: boolean;
  }>(),
  {
    variant: 'info',
    size: 'md',
    dismissible: false,
  },
);

const emit = defineEmits<{
  (e: 'dismiss'): void;
}>();

const classes = computed(() => [
  'tree-alert',
  `tree-alert--${props.variant}`,
  `tree-alert--${props.size}`,
]);

function handleDismiss() {
  emit('dismiss');
}
</script>

<template>
  <div
    :class="classes"
    role="alert"
  >
    <span
      v-if="$slots.icon"
      class="tree-alert__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <div class="tree-alert__content">
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="tree-alert__dismiss"
      aria-label="Dismiss"
      @click="handleDismiss"
    >
      <slot name="dismiss-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
      </slot>
    </button>
  </div>
</template>
