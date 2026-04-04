<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    indeterminate?: boolean;
    invalid?: boolean;
  }>(),
  {
    modelValue: false,
    size: 'md',
    disabled: false,
    indeterminate: false,
    invalid: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const attrs = useAttrs();
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value) {
      inputRef.value.indeterminate = val;
    }
  },
);

watch(inputRef, (el) => {
  if (el) {
    el.indeterminate = props.indeterminate;
  }
});

const rootClasses = computed(() => [
  'tree-checkbox',
  `tree-checkbox--${props.size}`,
  {
    'is-checked': props.modelValue,
    'is-indeterminate': props.indeterminate,
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
      ref="inputRef"
      v-bind="inputAttrs"
      type="checkbox"
      class="tree-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="indeterminate ? 'mixed' : modelValue"
      :aria-invalid="invalid || undefined"
      @change="onChange"
    >
    <span
      class="tree-checkbox__control"
      aria-hidden="true"
    >
      <svg
        v-if="modelValue && !indeterminate"
        class="tree-checkbox__icon"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
      <svg
        v-else-if="indeterminate"
        class="tree-checkbox__icon"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <line
          x1="4"
          y1="8"
          x2="12"
          y2="8"
        />
      </svg>
    </span>
    <span
      v-if="$slots.default"
      class="tree-checkbox__label"
    >
      <slot />
    </span>
  </label>
</template>
