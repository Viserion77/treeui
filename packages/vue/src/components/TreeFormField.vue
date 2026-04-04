<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    label?: string;
    htmlFor?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    size?: TreeSize;
  }>(),
  {
    label: undefined,
    htmlFor: undefined,
    error: undefined,
    hint: undefined,
    required: false,
    disabled: false,
    size: 'md',
  },
);

const attrs = useAttrs();

const hasError = computed(() => !!props.error || !!slots.error);

const slots = defineSlots<{
  default?: (props: Record<string, never>) => unknown;
  label?: (props: Record<string, never>) => unknown;
  error?: (props: Record<string, never>) => unknown;
  hint?: (props: Record<string, never>) => unknown;
}>();

const rootClasses = computed(() => [
  'tree-form-field',
  `tree-form-field--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': hasError.value,
    'is-required': props.required,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const fieldAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="fieldAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <label
      v-if="label || $slots.label"
      class="tree-form-field__label"
      :for="htmlFor"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        class="tree-form-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="tree-form-field__control">
      <slot />
    </div>

    <p
      v-if="hasError"
      class="tree-form-field__error"
      role="alert"
    >
      <slot name="error">{{ error }}</slot>
    </p>

    <p
      v-else-if="hint || $slots.hint"
      class="tree-form-field__hint"
    >
      <slot name="hint">{{ hint }}</slot>
    </p>
  </div>
</template>
