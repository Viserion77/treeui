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
}

export const TBadge = forwardRef<HTMLSpanElement, TBadgeProps>(function TBadge(
  { variant = 'soft', size = 'md', tone = 'neutral', icon, className, children, ...rest },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      className={badgeClass({ variant, size, tone, class: className })}
    >
      {icon ? (
        <span className="t-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
});
