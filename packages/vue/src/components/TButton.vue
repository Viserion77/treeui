<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue';
import { tv } from '@treeui/utils';
import type { TSize, TVariant } from '../types/contracts';
import TSpinner from './TSpinner.vue';

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TVariant | 'brand';
    size?: TSize;
    disabled?: boolean;
    loading?: boolean;
    /**
     * Accessible announcement while `loading`, forwarded to the spinner.
     * The default is English; pass the active locale's string to localize it.
     */
    loadingLabel?: string;
    /**
     * While `loading`, hide the `icon` slot so the spinner replaces the icon
     * instead of rendering beside it. Set to `false` to keep both visible.
     */
    hideIconWhileLoading?: boolean;
    /**
     * Square, icon-only button. The visible label is dropped, so an accessible
     * name is required — pass `label` (or `aria-label`).
     */
    iconOnly?: boolean;
    /** Accessible name, rendered as `aria-label`. Required when `iconOnly`. */
    label?: string;
    type?: 'button' | 'submit' | 'reset';
    /** Stretch to the full width of the container. */
    block?: boolean;
    /** Content alignment — only meaningful together with `block`. */
    align?: 'start' | 'center' | 'end';
  }>(),
  {
    as: 'button',
    variant: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
    loadingLabel: 'Loading',
    hideIconWhileLoading: true,
    iconOnly: false,
    label: undefined,
    type: 'button',
    block: false,
    align: 'center',
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClass = tv({
  base: 't-button',
  variants: {
    variant: {
      solid: 't-button--solid',
      outline: 't-button--outline',
      ghost: 't-button--ghost',
      soft: 't-button--soft',
      danger: 't-button--danger',
      brand: 't-button--brand',
    },
    size: {
      sm: 't-button--sm',
      md: 't-button--md',
      lg: 't-button--lg',
    },
  },
});

const attrs = useAttrs();
const isNativeButton = computed(() => props.as === 'button');
const isDisabled = computed(() => props.disabled || props.loading);

// An icon-only button has no visible text and an aria-hidden icon, so without a
// name it is unlabelled for assistive tech. This is a BARE `process.env.NODE_ENV`
// compare, inlined (no `typeof process` guard, no function wrapper): the
// consumer's bundler statically replaces it, so the whole block runs in their
// dev build and is dead-code-eliminated — string literals included — from their
// production build. A `typeof process` guard would be `false` in the browser
// (where `process` does not exist), silently disabling the warning; a function
// wrapper would be opaque to tree-shaking. TreeUI's own build keeps
// `process.env.NODE_ENV` as a runtime reference (vite.config `define`) so the
// decision belongs to the consumer's environment, not this build.
if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (
      props.iconOnly &&
      !props.label &&
      !attrs['aria-label'] &&
      !attrs['aria-labelledby']
    ) {
      console.warn(
        '[TButton] `iconOnly` needs an accessible name — pass the `label` prop (or `aria-label`).',
      );
    }
  });
}

// The spinner takes the icon's leading position, so rendering both would show
// two glyphs and widen the button mid-action.
const isIconHidden = computed(() => props.loading && props.hideIconWhileLoading);

const classes = computed(() =>
  buttonClass({
    variant: props.variant,
    size: props.size,
    class: {
      'is-loading': props.loading,
      'is-disabled': isDisabled.value,
      't-button--block': props.block,
      't-button--icon': props.iconOnly,
      't-button--align-start': props.align === 'start',
      't-button--align-end': props.align === 'end',
    },
  }),
);

const onClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit('click', event);
};
</script>

<template>
  <component
    :is="as"
    :type="isNativeButton ? type : undefined"
    :class="classes"
    :disabled="isNativeButton ? isDisabled : undefined"
    :aria-disabled="!isNativeButton && isDisabled ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :aria-label="label"
    :tabindex="!isNativeButton && isDisabled ? -1 : undefined"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="t-button__spinner"
    >
      <TSpinner
        size="sm"
        :label="loadingLabel"
      />
    </span>
    <span
      v-if="$slots.icon && !isIconHidden"
      class="t-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span
      v-if="!iconOnly"
      class="t-button__label"
    >
      <slot />
    </span>
  </component>
</template>
