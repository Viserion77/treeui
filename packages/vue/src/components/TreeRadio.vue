<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
    invalid?: boolean;
    size?: TreeSize;
  }>(),
  {
    disabled: false,
    invalid: false,
    size: undefined,
  },
);

const group = inject<{
  modelValue: () => string | undefined;
  name: () => string | undefined;
  disabled: () => boolean;
  invalid: () => boolean;
  size: () => TreeSize;
  onChange: (value: string) => void;
} | null>('tree-radio-group', null);

const attrs = useAttrs();

const isChecked = computed(() => {
  return group ? group.modelValue() === props.value : false;
});

const isDisabled = computed(() => props.disabled || (group?.disabled() ?? false));
const isInvalid = computed(() => props.invalid || (group?.invalid() ?? false));
const resolvedSize = computed(() => props.size ?? group?.size() ?? 'md');

const rootClasses = computed(() => [
  'tree-radio',
  `tree-radio--${resolvedSize.value}`,
  {
    'is-checked': isChecked.value,
    'is-disabled': isDisabled.value,
    'is-invalid': isInvalid.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const onChange = () => {
  if (group) {
    group.onChange(props.value);
  }
};
</script>

<template>
  <label
    :class="rootClasses"
    :style="rootStyle"
  >
    <input
      v-bind="inputAttrs"
      type="radio"
      class="tree-radio__input"
      :value="value"
      :checked="isChecked"
      :disabled="isDisabled"
      :name="group?.name()"
      :aria-checked="isChecked"
      :aria-invalid="isInvalid || undefined"
      @change="onChange"
    >
    <span
      class="tree-radio__control"
      aria-hidden="true"
    >
      <span
        v-if="isChecked"
        class="tree-radio__dot"
      />
    </span>
    <span
      v-if="$slots.default"
      class="tree-radio__label"
    >
      <slot />
    </span>
  </label>
</template>
