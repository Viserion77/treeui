import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '@treeui/utils';
import type { TBadgeTone, TSize, TVariant } from '../types';

const badgeClass = tv({
  base: 't-badge',
  variants: {
    variant: {
      solid: 't-badge--solid',
      outline: 't-badge--outline',
      ghost: 't-badge--ghost',
      soft: 't-badge--soft',
      danger: 't-badge--danger',
    },
    size: {
      sm: 't-badge--sm',
      md: 't-badge--md',
      lg: 't-badge--lg',
    },
    tone: {
      neutral: 't-badge--tone-neutral',
      success: 't-badge--tone-success',
      warning: 't-badge--tone-warning',
      danger: 't-badge--tone-danger',
      info: 't-badge--tone-info',
    },
  },
});

export interface TBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TVariant;
  size?: TSize;
  tone?: TBadgeTone;
  icon?: ReactNode;
  /**
   * Keep the label on one line and clip it with an ellipsis. Opt-in, because
   * the useful default for a badge is to wrap: a status pill that silently
   * loses the end of its text is worse than a two-line pill. Pass `label` as
   * well so the full text reaches the `title` tooltip.
   */
  truncate?: boolean;
  /** The badge text, used for `title` when `truncate` is on. */
  label?: string;
}

export const TBadge = forwardRef<HTMLSpanElement, TBadgeProps>(function TBadge(
  {
    variant = 'soft',
    size = 'md',
    tone = 'neutral',
    icon,
    truncate = false,
    label,
    className,
    children,
    title,
    ...rest
  },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      title={title ?? (truncate ? label : undefined)}
      className={badgeClass({
        variant,
        size,
        tone,
        class: [truncate ? 'is-truncated' : null, className].filter(Boolean).join(' ') || undefined,
      })}
    >
      {icon ? (
        <span className="t-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="t-badge__label">{children ?? label}</span>
    </span>
  );
});
