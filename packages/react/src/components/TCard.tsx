import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '@treeui/utils';
import type { TCardVariant, TSize } from '../types';

const cardClass = tv({
  base: 't-card',
  variants: {
    variant: {
      outline: 't-card--outline',
      soft: 't-card--soft',
      solid: 't-card--solid',
      inset: 't-card--inset',
    },
    size: {
      sm: 't-card--sm',
      md: 't-card--md',
      lg: 't-card--lg',
    },
  },
});

export interface TCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: TCardVariant;
  size?: TSize;
  header?: ReactNode;
  footer?: ReactNode;
}

export const TCard = forwardRef<HTMLDivElement, TCardProps>(function TCard(
  { variant = 'outline', size = 'md', header, footer, className, children, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cardClass({ variant, size, class: className })}>
      {header ? <div className="t-card__header">{header}</div> : null}
      <div className="t-card__body">{children}</div>
      {footer ? <div className="t-card__footer">{footer}</div> : null}
    </div>
  );
});
