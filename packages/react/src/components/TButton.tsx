import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { tv } from '@treeui/utils';
import type { TSize, TVariant } from '../types';

const buttonClass = tv({
  base: 't-button',
  variants: {
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
  variant?: TVariant;
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
}

export const TButton = forwardRef<HTMLButtonElement, TButtonProps>(function TButton(
  {
    variant = 'solid',
    size = 'md',
    loading = false,
    loadingLabel = 'Loading',
    disabled = false,
    icon,
    iconOnly = false,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  // The spinner takes the icon's leading position, so rendering both would show
  // two glyphs and widen the button mid-action.
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClass({
        variant,
        size,
        class: [
          className,
          { 'is-loading': loading, 'is-disabled': isDisabled, 't-button--icon': iconOnly },
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
