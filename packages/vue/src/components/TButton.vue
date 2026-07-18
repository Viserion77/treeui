<script setup lang="ts">
import { computed } from 'vue';
import { tv } from '@treeui/utils';
import type { TSize, TVariant } from '../types/contracts';
import TSpinner from './TSpinner.vue';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TVariant | 'brand';
    size?: TSize;
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

const buttonClass = tv({
  base: 't-button',
  variants: {
    variant: {
      solid: 't-button--solid',
      outline: 't-button--outline',
      ghost: 't-button--ghost',
      soft: 't-button--soft',
      danger: 't-button--danger',
      brand: 't-button--brand',
    },
    size: {
      sm: 't-button--sm',
      md: 't-button--md',
      lg: 't-button--lg',
    },
  },
});

const isNativeButton = computed(() => props.as === 'button');
const isDisabled = computed(() => props.disabled || props.loading);
const classes = computed(() =>
  buttonClass({
    variant: props.variant,
    size: props.size,
    class: {
      'is-loading': props.loading,
      'is-disabled': isDisabled.value,
    },
  }),
);

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
      class="t-button__spinner"
    >
      <TSpinner
        size="sm"
        label="Loading"
      />
    </span>
    <span
      v-if="$slots.icon"
      class="t-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="t-button__label">
      <slot />
    </span>
  </component>
</template>
