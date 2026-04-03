<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    size?: TreeSize;
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
  'tree-input',
  `tree-input--${props.size}`,
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
      class="tree-input__slot tree-input__slot--prefix"
    >
      <slot name="prefix" />
    </span>
    <input
      v-bind="inputAttrs"
      class="tree-input__field"
      :type="type"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="onInput"
    >
    <TreeSpinner
      v-if="loading"
      size="sm"
      label="Loading"
    />
    <span
      v-if="$slots.suffix"
      class="tree-input__slot tree-input__slot--suffix"
    >
      <slot name="suffix" />
    </span>
  </label>
</template>
