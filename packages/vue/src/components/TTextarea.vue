<script setup lang="ts">
import { computed, useAttrs, onMounted, ref, watch, nextTick } from 'vue';
import type { TFieldWidth, TSize } from '../types/contracts';
import TSpinner from './TSpinner.vue';
import { useFormFieldIdentity, type TModelModifiers } from './form-field';

export type TTextareaFamily = 'sans' | 'mono';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    size?: TSize;
    /** Inline-size cap. Fluid (`full`) by default. */
    width?: TFieldWidth;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    rows?: number;
    autoGrow?: boolean;
    /**
     * Ceiling for `autoGrow`, in lines. Without it the field grows forever and
     * a composer eventually pushes the conversation off screen. At the cap the
     * field starts scrolling internally instead of growing, and the component's
     * border and focus ring stop moving. Ignored when `autoGrow` is off.
     */
    maxRows?: number;
    /**
     * Font family for the editable content, same vocabulary as TText. `mono`
     * is for machine text — JSON, a policy document, a Lambda payload — which
     * otherwise leaves a `.mono` class behind in the consumer's stylesheet.
     */
    family?: TTextareaFamily;
    /**
     * Native attributes of the `<textarea>` this component IS —
     * declared so `strictTemplates` sees them instead of rejecting the reason
     * the component exists.
     */
    readonly?: boolean;
    minlength?: number | string;
    maxlength?: number | string;
    name?: string;
    required?: boolean;
    autocomplete?: string;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    modelValue: '',
    size: 'md',
    width: 'full',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: '',
    rows: 3,
    autoGrow: false,
    maxRows: undefined,
    family: undefined,
    readonly: false,
    minlength: undefined,
    maxlength: undefined,
    name: undefined,
    required: false,
    autocomplete: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const rootClasses = computed(() => [
  't-textarea',
  `t-textarea--${props.size}`,
  props.width !== 'full' ? `t-field-width--${props.width}` : null,
  props.family ? `t-textarea--family-${props.family}` : null,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const { controlId, describedBy } = useFormFieldIdentity(attrs);

const textareaAttrs = computed(() => {
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
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
  // Also resize when the consumer does not write `modelValue` back, so an
  // uncontrolled field still grows (and still stops at `maxRows`).
  if (props.autoGrow) adjustHeight();
};

// The cap has to be measured, not assumed: `maxRows` is a line count, and a
// line's height depends on the resolved font size and line-height of this
// field. `line-height: normal` yields NaN, so fall back to the usual ~1.2em.
const maxHeightPx = (el: HTMLTextAreaElement): number | null => {
  if (!props.maxRows || props.maxRows <= 0) return null;

  const styles = getComputedStyle(el);
  const fontSize = Number.parseFloat(styles.fontSize) || 16;
  const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.2;
  // scrollHeight is a content-box + padding measure, so the padding counts
  // toward the cap whenever the field is border-box (it is, library-wide).
  const vertical =
    Number.parseFloat(styles.paddingTop) +
    Number.parseFloat(styles.paddingBottom) +
    (styles.boxSizing === 'border-box'
      ? Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth)
      : 0);

  return props.maxRows * lineHeight + (Number.isFinite(vertical) ? vertical : 0);
};

const adjustHeight = () => {
  const el = textareaRef.value;
  if (!el || !props.autoGrow) return;

  el.style.height = 'auto';
  const contentHeight = el.scrollHeight;
  const cap = maxHeightPx(el);

  if (cap !== null && contentHeight > cap) {
    el.style.height = `${cap}px`;
    el.style.overflowY = 'auto';
    return;
  }

  el.style.height = `${contentHeight}px`;
  el.style.overflowY = cap === null ? '' : 'hidden';
};

watch(
  () => [props.modelValue, props.maxRows, props.autoGrow],
  async () => {
    if (!props.autoGrow) return;
    await nextTick();
    adjustHeight();
  },
);

onMounted(() => {
  if (props.autoGrow) adjustHeight();
});
</script>

<template>
  <label
    :class="rootClasses"
    :style="rootStyle"
  >
    <textarea
      :id="controlId"
      ref="textareaRef"
      v-bind="textareaAttrs"
      class="t-textarea__field"
      :aria-describedby="describedBy"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :readonly="readonly || undefined"
      :minlength="minlength"
      :maxlength="maxlength"
      :name="name"
      :required="required || undefined"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      :aria-busy="loading || undefined"
      @input="onInput"
    />
    <TSpinner
      v-if="loading"
      size="sm"
      label="Loading"
    />
  </label>
</template>
