<script setup lang="ts">
import { computed, provide, ref, useAttrs, useId } from 'vue';
import type { TSize } from '../types/contracts';
import { formFieldInjectionKey } from './form-field';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    label?: string;
    /**
     * Id of the control this field labels. Optional: the field generates one
     * and provides it to a TreeUI control nested inside, so the `<label for>`
     * pair cannot drift. Pass it only to name a control the field cannot reach.
     */
    htmlFor?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    size?: TSize;
  }>(),
  {
    label: undefined,
    htmlFor: undefined,
    error: undefined,
    hint: undefined,
    required: false,
    disabled: false,
    size: 'md',
  },
);

const attrs = useAttrs();
const baseId = useId();
const generatedControlId = `${baseId}-control`;
const errorId = `${baseId}-error`;
const hintId = `${baseId}-hint`;
const generatedLabelId = `${baseId}-label`;

// `for` is emitted unless a child says it has no labellable element. A radio or
// toggle group is exactly that case (`<label for>` may only point at a button,
// input, select, textarea, meter, output or progress), and pointing `for` at an
// id nothing carries is worse than omitting it: the markup goes from incomplete
// to incoherent and an audit tool flags it. Those groups name themselves with
// `aria-labelledby` off this label's id instead.
const released = ref(false);

const hasError = computed(() => !!props.error || !!slots.error);

const slots = defineSlots<{
  /** Receives the field identity, for a control that cannot inject it. */
  default?: (props: { id: string; describedBy: string | undefined }) => unknown;
  label?: (props: Record<string, never>) => unknown;
  error?: (props: Record<string, never>) => unknown;
  hint?: (props: Record<string, never>) => unknown;
}>();

const hasHint = computed(() => !!props.hint || !!slots.hint);

// `htmlFor` still wins, so a field pointing at a control it does not own keeps
// working; otherwise the control adopts the generated id through the context.
const controlId = computed(() => props.htmlFor ?? generatedControlId);

const describedBy = computed(() => {
  if (hasError.value) return errorId;
  if (hasHint.value) return hintId;
  return undefined;
});

const labelId = computed(() => generatedLabelId);

provide(formFieldInjectionKey, {
  id: controlId,
  describedBy,
  labelId,
  releaseId: () => {
    released.value = true;
  },
});

// An explicit `htmlFor` is the consumer promising the id exists somewhere the
// field cannot see, so it always wins.
const labelFor = computed(() => props.htmlFor ?? (released.value ? undefined : controlId.value));

const rootClasses = computed(() => [
  't-form-field',
  `t-form-field--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': hasError.value,
    'is-required': props.required,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const fieldAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="fieldAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <label
      v-if="label || $slots.label"
      :id="labelId"
      class="t-form-field__label"
      :for="labelFor"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        class="t-form-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="t-form-field__control">
      <slot
        :id="controlId"
        :described-by="describedBy"
      />
    </div>

    <p
      v-if="hasError"
      :id="errorId"
      class="t-form-field__error"
      role="alert"
    >
      <slot name="error">
        {{ error }}
      </slot>
    </p>

    <p
      v-else-if="hasHint"
      :id="hintId"
      class="t-form-field__hint"
    >
      <slot name="hint">
        {{ hint }}
      </slot>
    </p>
  </div>
</template>
