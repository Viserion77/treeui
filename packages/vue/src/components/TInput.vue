<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TSize } from '../types/contracts';
import TSpinner from './TSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    size?: TSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    type?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    type: 'text',
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-input',
  `t-input--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const stringValue = computed(() => `${props.modelValue ?? ''}`);

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<template>
  <label
    :class="rootClasses"
    :style="rootStyle"
  >
    <span
      v-if="$slots.prefix"
      class="t-input__slot t-input__slot--prefix"
    >
      <slot name="prefix" />
    </span>
    <input
      v-bind="inputAttrs"
      class="t-input__field"
      :type="type"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="onInput"
    >
    <TSpinner
      v-if="loading"
      size="sm"
      label="Loading"
    />
    <span
      v-if="$slots.suffix"
      class="t-input__slot t-input__slot--suffix"
    >
      <slot name="suffix" />
    </span>
  </label>
</template>
