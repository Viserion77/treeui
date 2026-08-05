<script setup lang="ts">
import { computed, getCurrentInstance, useAttrs, watchEffect, type Component } from 'vue';
import { tv } from '@treeui/utils';
import type { TActionTone, TSize, TVariant } from '../types/contracts';
import TSpinner from './TSpinner.vue';

const props = withDefaults(
  defineProps<{
    as?: string;
    /**
     * Shape of the button. `danger` is DEPRECATED — it is a colour trapped in
     * the shape scale, so it can only ever be a filled red button. Use
     * `variant="solid" tone="danger"`, which composes with `outline`, `ghost`
     * and `soft` too.
     */
    variant?: TVariant | 'brand';
    /**
     * Colour axis, orthogonal to `variant` — the same closed vocabulary TTag
     * uses. On `solid` it fills; on `outline` and `ghost` it only inks the
     * label and the border, which is how a destructive action sits in a row of
     * quiet ones without outweighing it.
     */
    tone?: TActionTone;
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
    /**
     * Route target. Renders a RouterLink (an `<a>` with a real `href`) wearing
     * the button's skin, so a CTA that NAVIGATES stays navigation:
     * ctrl/middle-click, "open in new tab" and the status-bar URL preview all
     * keep working, and the accessible role is `link`, not `button`.
     * Wrapping a TButton in a RouterLink produces `<a><button>` — invalid
     * markup and two tab stops — and `as="a" :href` leaves the SPA and reloads
     * the page. Takes precedence over `as`; ignored when `disabled`.
     */
    to?: string | Record<string, unknown>;
  }>(),
  {
    as: 'button',
    variant: 'solid',
    tone: undefined,
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
    to: undefined,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClass = tv({
  base: 't-button',
  variants: {
    tone: {
      neutral: 't-button--tone-neutral',
      brand: 't-button--tone-brand',
      accent: 't-button--tone-accent',
      success: 't-button--tone-success',
      warning: 't-button--tone-warning',
      danger: 't-button--tone-danger',
      info: 't-button--tone-info',
    },
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
const instance = getCurrentInstance();

// Resolved from the app context, exactly as TLink does it, so the component
// carries no vue-router dependency: with no router installed the prop simply
// does nothing and the button stays a button.
const routerLink = computed<Component | null>(() => {
  if (!props.to) return null;
  return (instance?.appContext.components.RouterLink as Component | undefined) ?? null;
});

const isDisabled = computed(() => props.disabled || props.loading);

// A disabled link is not a thing — there is no `disabled` on `<a>` — so a
// disabled `to` falls back to the native button, which CAN refuse activation.
const rendersAsLink = computed(() => Boolean(routerLink.value) && !isDisabled.value);

const tag = computed<string | Component>(() =>
  rendersAsLink.value ? routerLink.value! : props.as,
);

const isNativeButton = computed(() => !rendersAsLink.value && props.as === 'button');

const linkProps = computed(() => (rendersAsLink.value ? { to: props.to } : {}));

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

    if (props.variant === 'danger') {
      console.warn(
        '[TButton] `variant="danger"` is deprecated: it puts a colour in the shape scale, ' +
          'so it cannot be combined with outline/ghost/soft. Use `variant="solid" tone="danger"`.',
      );
    }
  });
}

// The spinner takes the icon's leading position, so rendering both would show
// two glyphs and widen the button mid-action.
const isIconHidden = computed(() => props.loading && props.hideIconWhileLoading);

const classes = computed(() =>
  buttonClass({
    tone: props.tone,
    variant: props.variant,
    size: props.size,
    class: {
      'has-tone': Boolean(props.tone),
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
    :is="tag"
    v-bind="linkProps"
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
