<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    name?: string;
    disabled?: boolean;
    invalid?: boolean;
    size?: TreeSize;
  }>(),
  {
    modelValue: undefined,
    name: undefined,
    disabled: false,
    invalid: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();

provide('tree-radio-group', {
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
  'tree-radio-group',
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const groupAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="groupAttrs"
    :class="rootClasses"
    :style="rootStyle"
    role="radiogroup"
  >
    <slot />
  </div>
</template>
