<script setup lang="ts">
import { computed, useAttrs, ref, watch, nextTick } from 'vue';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    rows?: number;
    autoGrow?: boolean;
  }>(),
  {
    modelValue: '',
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: '',
    rows: 3,
    autoGrow: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const rootClasses = computed(() => [
  'tree-textarea',
  `tree-textarea--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const textareaAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const stringValue = computed(() => `${props.modelValue ?? ''}`);

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

const adjustHeight = () => {
  const el = textareaRef.value;
  if (!el || !props.autoGrow) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

watch(
  () => props.modelValue,
  async () => {
    if (!props.autoGrow) return;
    await nextTick();
    adjustHeight();
  },
);
</script>

<template>
  <label
    :class="rootClasses"
    :style="rootStyle"
  >
    <textarea
      ref="textareaRef"
      v-bind="textareaAttrs"
      class="tree-textarea__field"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :aria-invalid="invalid || undefined"
      @input="onInput"
    />
    <TreeSpinner
      v-if="loading"
      size="sm"
      label="Loading"
    />
  </label>
</template>
