<script setup lang="ts">
import { clamp } from '@treeui/utils';
import { computed, ref, useAttrs, watch } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    size?: TreeSize;
    disabled?: boolean;
    invalid?: boolean;
    placeholder?: string;
    controls?: boolean;
  }>(),
  {
    modelValue: null,
    min: undefined,
    max: undefined,
    step: 1,
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: '',
    controls: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const attrs = useAttrs();
const displayValue = ref(
  props.modelValue === null || props.modelValue === undefined ? '' : `${props.modelValue}`,
);

const precision = computed(() => {
  const normalizedStep = `${props.step}`;
  const fractionalPart = normalizedStep.split('.')[1];
  return fractionalPart ? fractionalPart.length : 0;
});

const rootClasses = computed(() => [
  'tree-number-input',
  `tree-number-input--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'has-controls': props.controls,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const formatValue = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : `${value}`;

const normalizeValue = (value: number) => {
  const clamped = clamp(
    value,
    props.min ?? Number.NEGATIVE_INFINITY,
    props.max ?? Number.POSITIVE_INFINITY,
  );

  return Number(clamped.toFixed(precision.value));
};

const parseValue = (value: string) => {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const currentNumericValue = computed(() => {
  const parsed = parseValue(displayValue.value);
  return parsed ?? props.modelValue ?? null;
});

const canDecrement = computed(() => {
  if (props.disabled) {
    return false;
  }

  if (props.min === undefined || currentNumericValue.value === null) {
    return true;
  }

  return normalizeValue(currentNumericValue.value) > props.min;
});

const canIncrement = computed(() => {
  if (props.disabled) {
    return false;
  }

  if (props.max === undefined || currentNumericValue.value === null) {
    return true;
  }

  return normalizeValue(currentNumericValue.value) < props.max;
});

const commitValue = (value: number | null) => {
  if (value === null) {
    displayValue.value = '';
    emit('update:modelValue', null);
    return;
  }

  const normalized = normalizeValue(value);
  displayValue.value = `${normalized}`;
  emit('update:modelValue', normalized);
};

const stepValue = (direction: 1 | -1) => {
  if (props.disabled) {
    return;
  }

  let baseValue = currentNumericValue.value ?? 0;

  if (currentNumericValue.value === null) {
    if (direction === 1 && props.min !== undefined) {
      baseValue = props.min - props.step;
    }

    if (direction === -1 && props.max !== undefined) {
      baseValue = props.max + props.step;
    }
  }

  commitValue(baseValue + direction * props.step);
};

const onInput = (event: Event) => {
  const nextValue = (event.target as HTMLInputElement).value;
  displayValue.value = nextValue;

  if (!nextValue.trim()) {
    emit('update:modelValue', null);
    return;
  }

  const parsedValue = parseValue(nextValue);

  if (parsedValue === null) {
    return;
  }

  emit('update:modelValue', normalizeValue(parsedValue));
};

const onBlur = () => {
  if (!displayValue.value.trim()) {
    displayValue.value = '';
    return;
  }

  const parsedValue = parseValue(displayValue.value);

  if (parsedValue === null) {
    displayValue.value = formatValue(props.modelValue);
    return;
  }

  displayValue.value = `${normalizeValue(parsedValue)}`;
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    stepValue(1);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    stepValue(-1);
    return;
  }

  if (event.key === 'Home' && props.min !== undefined) {
    event.preventDefault();
    commitValue(props.min);
    return;
  }

  if (event.key === 'End' && props.max !== undefined) {
    event.preventDefault();
    commitValue(props.max);
  }
};

watch(
  () => props.modelValue,
  (value) => {
    const nextDisplayValue = formatValue(value);

    if (nextDisplayValue !== displayValue.value) {
      displayValue.value = nextDisplayValue;
    }
  },
);
</script>

<template>
  <div
    :class="rootClasses"
    :style="rootStyle"
  >
    <button
      v-if="controls"
      type="button"
      class="tree-number-input__stepper tree-number-input__stepper--decrement"
      :disabled="!canDecrement"
      aria-label="Decrease value"
      @click="stepValue(-1)"
    >
      <span aria-hidden="true">-</span>
    </button>

    <input
      v-bind="inputAttrs"
      :value="displayValue"
      type="text"
      inputmode="decimal"
      class="tree-number-input__field"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
    >

    <button
      v-if="controls"
      type="button"
      class="tree-number-input__stepper tree-number-input__stepper--increment"
      :disabled="!canIncrement"
      aria-label="Increase value"
      @click="stepValue(1)"
    >
      <span aria-hidden="true">+</span>
    </button>
  </div>
</template>
