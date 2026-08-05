<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue';
import type { TSize } from '../types/contracts';
import { useFormFieldGroup, type TModelModifiers } from './form-field';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    name?: string;
    disabled?: boolean;
    invalid?: boolean;
    size?: TSize;
  } & TModelModifiers>(),
  {
    modelValue: undefined,
    name: undefined,
    disabled: false,
    invalid: false,
    size: 'md',
    modelModifiers: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();

provide('t-radio-group', {
  modelValue: () => props.modelValue,
  name: () => props.name,
  disabled: () => props.disabled,
  invalid: () => props.invalid,
  size: () => props.size,
  onChange: (value: string) => {
    emit('update:modelValue', value);
  },
});

const rootClasses = computed(() => [
  't-radio-group',
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

// A radio group has no single labellable element, so it deliberately does NOT
// claim the TFormField id: the field then leaves `for` off and the group names
// itself with the label's id, which is what `role="radiogroup"` expects.
const { labelledBy, describedBy } = useFormFieldGroup(attrs);

const groupAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    'aria-labelledby': _labelledBy,
    'aria-describedby': _describedBy,
    ...rest
  } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="groupAttrs"
    :class="rootClasses"
    :style="rootStyle"
    role="radiogroup"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
  >
    <slot />
  </div>
</template>
