<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TSize } from '../types/contracts';

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
    size?: TSize;
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
  't-form-field',
  `t-form-field--${props.size}`,
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
      class="t-form-field__label"
      :for="htmlFor"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        class="t-form-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="t-form-field__control">
      <slot />
    </div>

    <p
      v-if="hasError"
      class="t-form-field__error"
      role="alert"
    >
      <slot name="error">
        {{ error }}
      </slot>
    </p>

    <p
      v-else-if="hint || $slots.hint"
      class="t-form-field__hint"
    >
      <slot name="hint">
        {{ hint }}
      </slot>
    </p>
  </div>
</template>
