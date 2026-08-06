<script setup lang="ts" generic="T extends string | number = string">
import { computed, useAttrs } from 'vue';
import { useFormFieldIdentity, type TModelModifiers } from './form-field';
import type { TFieldWidth, TSize } from '../types/contracts';
import TSpinner from './TSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    /**
     * Generic over the bound type, so the value the field EMITS is the type the
     * ref holds (TREEUX-011, group 3). Accepting `string | number` while always
     * emitting `string` made every `ref<number>` a compile error under
     * `strictTemplates` — and, underneath the type, actually put a string into
     * that ref at runtime.
     */
    modelValue?: T;
    size?: TSize;
    /** Inline-size cap. Fluid (`full`) by default. */
    width?: TFieldWidth;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    type?: string;
    placeholder?: string;
    /** Native `readonly`: the value is shown and selectable but not editable. */
    readonly?: boolean;
    /**
     * Native constraint and behaviour attributes of the `<input>` this
     * component IS (TREEUX-011). `ComponentCustomProps` covers what ANY
     * component accepts; these are what THIS one accepts by being an input —
     * `min` on a number field is not a typo, it is the reason the field exists.
     * They are declared rather than left to `$attrs` so `strictTemplates` sees
     * them; the values still land on the native element.
     */
    min?: number | string;
    max?: number | string;
    step?: number | string;
    minlength?: number | string;
    maxlength?: number | string;
    pattern?: string;
    inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
    autocomplete?: string;
    name?: string;
    required?: boolean;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    // No default: with a generic model the empty string is not a valid default
    // for every T. The rendered value already falls back to '' below.
    modelValue: undefined,
    size: 'md',
    width: 'full',
    disabled: false,
    loading: false,
    invalid: false,
    type: 'text',
    placeholder: '',
    readonly: false,
    min: undefined,
    max: undefined,
    step: undefined,
    minlength: undefined,
    maxlength: undefined,
    pattern: undefined,
    inputmode: undefined,
    autocomplete: undefined,
    name: undefined,
    required: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

const attrs = useAttrs();

const rootClasses = computed(() => [
  't-input',
  `t-input--${props.size}`,
  props.width !== 'full' ? `t-field-width--${props.width}` : null,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
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

const stringValue = computed(() => `${props.modelValue ?? ''}`);

const onInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value;

  // A DOM input always yields a string, so emitting `T` has to be made true
  // rather than merely declared. When the bound value is a number, coerce —
  // mirroring Vue's own `.number`: an unparseable value stays as typed, so a
  // half-written "-" or "1e" is not destroyed mid-entry.
  if (typeof props.modelValue === 'number') {
    const parsed = Number.parseFloat(raw);
    emit('update:modelValue', (Number.isNaN(parsed) ? raw : parsed) as T);
    return;
  }

  emit('update:modelValue', raw as T);
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
      :id="controlId"
      v-bind="inputAttrs"
      class="t-input__field"
      :aria-describedby="describedBy"
      :type="type"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || undefined"
      :min="min"
      :max="max"
      :step="step"
      :minlength="minlength"
      :maxlength="maxlength"
      :pattern="pattern"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :name="name"
      :required="required || undefined"
      :aria-invalid="invalid || undefined"
      :aria-busy="loading || undefined"
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
