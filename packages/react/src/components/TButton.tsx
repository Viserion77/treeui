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
      {icon ? (
        <span className="t-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {iconOnly ? null : <span className="t-button__label">{children}</span>}
    </button>
  );
});
