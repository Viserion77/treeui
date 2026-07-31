<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import type { TFieldWidth, TSize } from '../types/contracts';
import TTag from './TTag.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    /** The list of tags. Free strings — not a fixed option set (use TMultiSelect for that). */
    modelValue?: string[];
    size?: TSize;
    /** Inline-size cap. Fluid (`full`) by default. */
    width?: TFieldWidth;
    disabled?: boolean;
    invalid?: boolean;
    placeholder?: string;
  }>(),
  {
    modelValue: () => [],
    size: 'md',
    width: 'full',
    disabled: false,
    invalid: false,
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const attrs = useAttrs();
const draft = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const rootClasses = computed(() => [
  't-tag-input',
  `t-tag-input--${props.size}`,
  props.width !== 'full' ? `t-field-width--${props.width}` : null,
  {
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

/** Add one or more comma-separated tags: trim, drop empties, dedupe silently. */
function addTags(raw: string) {
  if (props.disabled) return;
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return;

  const next = [...props.modelValue];
  for (const part of parts) {
    if (!next.includes(part)) next.push(part);
  }
  if (next.length !== props.modelValue.length) emit('update:modelValue', next);
}

function commitDraft() {
  addTags(draft.value);
  draft.value = '';
}

function removeAt(index: number) {
  if (props.disabled) return;
  const next = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', next);
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  // A pasted "a, b, c" enters through input, not keydown: commit the complete
  // segments and keep the trailing fragment in the field.
  if (value.includes(',')) {
    const segments = value.split(',');
    const remainder = segments.pop() ?? '';
    addTags(segments.join(','));
    draft.value = remainder.replace(/^\s+/, '');
  } else {
    draft.value = value;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    // Enter and comma both confirm the current tag.
    event.preventDefault();
    commitDraft();
    return;
  }
  if (event.key === 'Backspace' && !draft.value && props.modelValue.length > 0) {
    // Backspace on an empty field removes the last tag (tag-input convention).
    event.preventDefault();
    removeAt(props.modelValue.length - 1);
  }
}

function focusInput() {
  inputRef.value?.focus();
}

defineExpose({ focus: focusInput });
</script>

<template>
  <div
    :class="rootClasses"
    :style="rootStyle"
    @click="focusInput"
  >
    <TTag
      v-for="(tag, index) in modelValue"
      :key="`${tag}-${index}`"
      class="t-tag-input__tag"
      :size="size === 'lg' ? 'md' : 'sm'"
      :removable="!disabled"
      :disabled="disabled"
      @remove="removeAt(index)"
    >
      {{ tag }}
    </TTag>
    <input
      ref="inputRef"
      v-bind="inputAttrs"
      class="t-tag-input__field"
      type="text"
      :value="draft"
      :placeholder="modelValue.length ? '' : placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @keydown="onKeydown"
    >
  </div>
</template>
