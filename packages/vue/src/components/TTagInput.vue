<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import type { TFieldWidth, TSize } from '../types/contracts';
import TTag from './TTag.vue';
import { useFormFieldIdentity, type TModelModifiers } from './form-field';

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
    /** Accessible name for each chip's remove button. Localizable copy. */
    removeLabel?: string;
    /**
     * Keep repeated values instead of dropping them. Dedupe is the right policy
     * for a set of names; it is the wrong one for an ordered argument list,
     * where `--param a --param b` is meaningful and losing the second
     * `--param` silently corrupts the command.
     */
    allowDuplicates?: boolean;
    /**
     * Character(s) that confirm the current tag alongside Enter. `null` makes
     * Enter the only way to confirm — needed when the values legitimately
     * contain the separator (`--param=tags=a,b` must stay one argument).
     */
    separator?: string | string[] | null;
    /**
     * Confirm the pending draft when the field loses focus. On by default:
     * typing the last value and clicking Save otherwise drops it with no
     * warning. Use `commit()` on the exposed instance for an explicit flush.
     */
    commitOnBlur?: boolean;
    /**
     * Trim each value and drop empty ones. On by default; turn it off where a
     * leading or trailing space is meaningful.
     */
    trim?: boolean;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    modelValue: () => [],
    size: 'md',
    width: 'full',
    disabled: false,
    invalid: false,
    placeholder: '',
    removeLabel: 'Remove',
    allowDuplicates: false,
    separator: ',',
    commitOnBlur: true,
    trim: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  /**
   * The pending, unconfirmed text — `v-model:draft`. A form that enables Save
   * from a dirty count cannot see the draft otherwise, and `commitOnBlur` does
   * not help there: clicking a DISABLED Save fires no mousedown, so the field
   * never blurs and the user stares at a greyed-out button with the value in
   * front of them.
   */
  'update:draft': [value: string];
}>();

const attrs = useAttrs();
const draft = ref('');

watch(draft, (value) => emit('update:draft', value));
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

/** Configured separators, normalized. Empty when `separator` is `null`. */
const separators = computed(() => {
  if (props.separator === null || props.separator === undefined) return [];
  const list = Array.isArray(props.separator) ? props.separator : [props.separator];
  return list.filter((value) => typeof value === 'string' && value.length > 0);
});

function splitRaw(raw: string): string[] {
  return separators.value.reduce<string[]>(
    (parts, separator) => parts.flatMap((part) => part.split(separator)),
    [raw],
  );
}

/** Add already-split candidates: trim, drop empties, apply the dedupe policy. */
function addParts(candidates: string[]) {
  if (props.disabled) return;
  const parts = (props.trim ? candidates.map((part) => part.trim()) : candidates).filter(
    (part) => part.length > 0,
  );
  if (!parts.length) return;

  const next = [...props.modelValue];
  let changed = false;
  for (const part of parts) {
    // Dedupe is a policy, not a law — see `allowDuplicates`. Note the check is
    // against `next`, so a single paste cannot introduce a duplicate either.
    if (!props.allowDuplicates && next.includes(part)) continue;
    next.push(part);
    changed = true;
  }
  // Emit on `changed`, never on a length comparison: with duplicates allowed a
  // repeated value grows the array, and with them dropped nothing should be
  // emitted at all.
  if (changed) emit('update:modelValue', next);
}

function addTags(raw: string) {
  addParts(splitRaw(raw));
}

/**
 * The field is bound to `draft`, so when a keystroke leaves `draft` unchanged
 * (pasting only a separator, for example) Vue patches nothing and the DOM keeps
 * text the component no longer knows about. Push the truth back into the input.
 */
function syncField() {
  const el = inputRef.value;
  if (el && el.value !== draft.value) el.value = draft.value;
}

function commitDraft() {
  addTags(draft.value);
  draft.value = '';
  syncField();
}

function removeAt(index: number) {
  if (props.disabled) return;
  const next = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', next);
}

function onInput(event: Event) {
  // A pasted "a, b, c" arrives through input, not keydown. Split on EVERY
  // configured separator in one pass: the last fragment is what the user is
  // still typing, everything before it is complete. With no separators
  // configured this is a single fragment, so the field just tracks the draft.
  const parts = splitRaw((event.target as HTMLInputElement).value);
  const remainder = parts.pop() ?? '';

  if (parts.length) addParts(parts);
  // Drop the space after a separator ("a, b"), but only when trimming is on —
  // with `trim: false` a leading space is a value the user meant to type.
  draft.value = props.trim ? remainder.replace(/^\s+/, '') : remainder;
  syncField();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || separators.value.includes(event.key)) {
    // Enter always confirms; a configured separator key does too.
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

function onBlur() {
  if (props.commitOnBlur) commitDraft();
}

function focusInput() {
  inputRef.value?.focus();
}

defineExpose({ focus: focusInput, commit: commitDraft, hasDraft: computed(() => draft.value.length > 0) });
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
      :remove-label="removeLabel"
      @remove="removeAt(index)"
    >
      {{ tag }}
    </TTag>
    <input
      :id="controlId"
      ref="inputRef"
      v-bind="inputAttrs"
      class="t-tag-input__field"
      :aria-describedby="describedBy"
      type="text"
      :value="draft"
      :placeholder="modelValue.length ? '' : placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
    >
  </div>
</template>
