<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  {
    modelValue: false,
    size: 'md',
    disabled: false,
    invalid: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const attrs = useAttrs();

const rootClasses = computed(() => [
  'tree-switch',
  `tree-switch--${props.size}`,
  {
    'is-checked': props.modelValue,
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const onChange = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label
    :class="rootClasses"
    :style="rootStyle"
  >
    <input
      v-bind="inputAttrs"
      type="checkbox"
      role="switch"
      class="tree-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="modelValue"
      :aria-invalid="invalid || undefined"
      @change="onChange"
    >
    <span
      class="tree-switch__track"
      aria-hidden="true"
    >
      <span class="tree-switch__thumb" />
    </span>
    <span
      v-if="$slots.default"
      class="tree-switch__label"
    >
      <slot />
    </span>
  </label>
</template>
