<script setup lang="ts">
import { computed, provide, useAttrs, useId } from 'vue';
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

provide(formFieldInjectionKey, { id: controlId, describedBy });

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
      class="t-form-field__label"
      :for="controlId"
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
