import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { tv } from '@treeui/utils';
import type { TActionTone, TSize, TVariant } from '../types';

// `tone` is declared BEFORE `variant` because tv() emits variant keys in
// declaration order, and this package shares one stylesheet with @treeui/vue:
// the Vue component emits `t-button t-button--tone-danger t-button--ghost
// t-button--md has-tone`, so this one has to emit exactly that. A divergence
// here is not a cosmetic difference — it is a silently unstyled button.
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
    },
    size: {
      sm: 't-button--sm',
      md: 't-button--md',
      lg: 't-button--lg',
    },
  },
});

export interface TButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Shape of the button. `danger` is DEPRECATED — it is a colour trapped in
   * the shape scale, so it can only ever be a filled red button. Use
   * `variant="solid" tone="danger"`, which composes with `outline`, `ghost`
   * and `soft` too.
   */
  variant?: TVariant;
  /**
   * Colour axis, orthogonal to `variant` — the same closed vocabulary TBadge
   * uses, widened by `brand` and `accent`. On `solid` it fills; on `outline`
   * and `ghost` it only inks the label and the border, which is how a
   * destructive action sits in a row of quiet ones without outweighing it.
   */
  tone?: TActionTone;
  size?: TSize;
  loading?: boolean;
  /**
   * Accessible announcement while `loading`, forwarded to the spinner.
   * The default is English; pass the active locale's string to localize it.
   */
  loadingLabel?: string;
  icon?: ReactNode;
  /**
   * Square, icon-only button. The visible label is dropped, so an accessible
   * name is required — pass `aria-label`.
   */
  iconOnly?: boolean;
  /** Stretch to the full width of the container. */
  block?: boolean;
  /**
   * Content alignment — only meaningful together with `block`, since the base
   * rule is `min-width: max-content` and an unstretched button is exactly as
   * wide as its content. `center` is the default and emits no class.
   */
  align?: 'start' | 'center' | 'end';
}

export const TButton = forwardRef<HTMLButtonElement, TButtonProps>(function TButton(
  {
    variant = 'solid',
    tone,
    size = 'md',
    loading = false,
    loadingLabel = 'Loading',
    disabled = false,
    icon,
    iconOnly = false,
    block = false,
    align = 'center',
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  // Dev-only guidance, mirroring the Vue component. This is a BARE
  // `process.env.NODE_ENV` compare, inlined (no `typeof process` guard, no
  // function wrapper): the consumer's bundler statically replaces it, so the
  // whole block runs in their dev build and is dead-code-eliminated — string
  // literals included — from their production build. A `typeof process` guard
  // would be `false` in the browser (where `process` does not exist), silently
  // disabling the warning; a function wrapper would be opaque to tree-shaking.
  // This package's tsup build does not `define` the expression, so the decision
  // belongs to the consumer's environment rather than to this build.
  if (process.env.NODE_ENV !== 'production') {
    // An icon-only button has no visible text and an aria-hidden icon, so
    // without a name it is unlabelled for assistive tech.
    if (iconOnly && !rest['aria-label'] && !rest['aria-labelledby']) {
      console.warn('[TButton] `iconOnly` needs an accessible name — pass `aria-label`.');
    }

    if (variant === 'danger') {
      console.warn(
        '[TButton] `variant="danger"` is deprecated: it puts a colour in the shape scale, ' +
          'so it cannot be combined with outline/ghost/soft. Use `variant="solid" tone="danger"`.',
      );
    }
  }

  // The spinner takes the icon's leading position, so rendering both would show
  // two glyphs and widen the button mid-action.
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClass({
        tone,
        variant,
        size,
        class: [
          {
            'has-tone': Boolean(tone),
            'is-loading': loading,
            'is-disabled': isDisabled,
            't-button--block': block,
            't-button--icon': iconOnly,
            't-button--align-start': align === 'start',
            't-button--align-end': align === 'end',
          },
          // Last, the way Vue merges a fallthrough `class` after the component's
          // own, so the same props produce the same string in both packages.
          className,
        ],
      })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="t-button__spinner">
          <span className="t-spinner t-spinner--sm" role="status" aria-label={loadingLabel}>
            <span className="t-spinner__ring" aria-hidden="true" />
            <span className="t-visually-hidden">{loadingLabel}</span>
          </span>
        </span>
      ) : null}
      {icon && !loading ? (
        <span className="t-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {iconOnly ? null : <span className="t-button__label">{children}</span>}
    </button>
  );
});
