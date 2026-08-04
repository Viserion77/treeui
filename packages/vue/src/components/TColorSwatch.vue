<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';

export interface TColorSwatchOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    /** Preset colors offered as swatches. */
    options?: TColorSwatchOption[];
    /** Append a native colour input for an arbitrary value. */
    allowCustom?: boolean;
    size?: TSize;
    /** Accessible label for the swatch group. */
    label?: string;
    /** Accessible label for the custom colour input. */
    customLabel?: string;
    disabled?: boolean;
    /**
     * Show the colours as evidence instead of as a choice — a brand manual, a
     * palette table, a legend. The chips become inert `role="img"` spans: not
     * focusable, not clickable, no selected state, no `modelValue`. The border
     * steps up to `--tree-color-border-strong` because half of these chips ARE
     * background colours, and in their own theme a weak border makes the chip
     * vanish into the page.
     */
    readonly?: boolean;
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    allowCustom: false,
    size: 'md',
    label: 'Color',
    customLabel: 'Custom color',
    disabled: false,
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const classes = computed(() => [
  't-color-swatch',
  `t-color-swatch--${props.size}`,
  { 'is-readonly': props.readonly },
]);

const isSelected = (value: string) =>
  Boolean(props.modelValue) && props.modelValue?.toLowerCase() === value.toLowerCase();

const select = (value: string) => {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', value);
};

const onCustomInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<template>
  <div
    :class="classes"
    role="group"
    :aria-label="label"
  >
    <template v-if="readonly">
      <span
        v-for="option in options"
        :key="option.value"
        class="t-color-swatch__chip"
        role="img"
        :style="{ background: option.value }"
        :aria-label="option.label"
      />
    </template>

    <template v-else>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="t-color-swatch__option"
        :class="{ 'is-selected': isSelected(option.value) }"
        :style="{ background: option.value }"
        :aria-label="option.label"
        :aria-pressed="isSelected(option.value)"
        :disabled="disabled"
        @click="select(option.value)"
      />
    </template>

    <input
      v-if="allowCustom && !readonly"
      class="t-color-swatch__custom"
      type="color"
      :value="modelValue"
      :aria-label="customLabel"
      :disabled="disabled"
      @input="onCustomInput"
    >
  </div>
</template>
