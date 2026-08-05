<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import type { TSize } from '../types/contracts';
import { useFormFieldIdentity } from './form-field';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    size?: TSize;
    disabled?: boolean;
    indeterminate?: boolean;
    invalid?: boolean;
    /**
     * Visible label, rendered beside the box and tied to the input by the
     * wrapping `<label>`. Every other control in the library names itself with
     * a `label` prop; the checkbox was the only one labelled by slot alone, and a
     * consumer reaching for the prop got a checkbox with no accessible name at
     * all. The `default` slot still wins when both are given.
     */
    label?: string;
  }>(),
  {
    modelValue: false,
    size: 'md',
    disabled: false,
    indeterminate: false,
    invalid: false,
    label: undefined,
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
  't-checkbox',
  `t-checkbox--${props.size}`,
  {
    'is-checked': props.modelValue,
    'is-indeterminate': props.indeterminate,
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const { controlId, describedBy } = useFormFieldIdentity(attrs);

const inputAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    id: _id,
    'aria-describedby': _describedBy,
    ...rest
  } = attrs;
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
      :id="controlId"
      ref="inputRef"
      v-bind="inputAttrs"
      type="checkbox"
      :aria-describedby="describedBy"
      class="t-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="indeterminate ? 'mixed' : modelValue"
      :aria-invalid="invalid || undefined"
      @change="onChange"
    >
    <span
      class="t-checkbox__control"
      aria-hidden="true"
    >
      <svg
        v-if="modelValue && !indeterminate"
        class="t-checkbox__icon"
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
        class="t-checkbox__icon"
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
      v-if="$slots.default || label"
      class="t-checkbox__label"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
