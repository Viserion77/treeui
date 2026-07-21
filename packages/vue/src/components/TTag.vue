<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

export type TTagVariant = 'solid' | 'outline' | 'soft';

const props = withDefaults(
  defineProps<{
    variant?: TTagVariant;
    size?: TSize;
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
  't-tag',
  `t-tag--${props.variant}`,
  `t-tag--${props.size}`,
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
      class="t-tag__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="t-tag__label">
      <slot />
    </span>
    <button
      v-if="removable"
      type="button"
      class="t-tag__remove"
      :disabled="disabled"
      aria-label="Remove"
      @click="handleRemove"
    >
      <TIcon
        name="x"
        :size="14"
      />
    </button>
  </span>
</template>
