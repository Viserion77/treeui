<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize, TreeVariant } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TreeVariant;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    as: 'button',
    variant: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const isNativeButton = computed(() => props.as === 'button');
const isDisabled = computed(() => props.disabled || props.loading);
const classes = computed(() => [
  'tree-button',
  `tree-button--${props.variant}`,
  `tree-button--${props.size}`,
  {
    'is-loading': props.loading,
    'is-disabled': isDisabled.value,
  },
]);

const onClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit('click', event);
};
</script>

<template>
  <component
    :is="as"
    :type="isNativeButton ? type : undefined"
    :class="classes"
    :disabled="isNativeButton ? isDisabled : undefined"
    :aria-disabled="!isNativeButton && isDisabled ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :tabindex="!isNativeButton && isDisabled ? -1 : undefined"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="tree-button__spinner"
    >
      <TreeSpinner
        size="sm"
        label="Loading"
      />
    </span>
    <span
      v-if="$slots.icon"
      class="tree-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="tree-button__label">
      <slot />
    </span>
  </component>
</template>
