import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { tv } from '@treeui/utils';
import type { TSize } from '../types';

const inputClass = tv({
  base: 't-input',
  variants: {
    size: {
      sm: 't-input--sm',
      md: 't-input--md',
      lg: 't-input--lg',
    },
  },
});

export interface TInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: TSize;
  invalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const TInput = forwardRef<HTMLInputElement, TInputProps>(function TInput(
  { size = 'md', invalid = false, disabled = false, prefix, suffix, className, ...rest },
  ref,
) {
  return (
    <label
      className={inputClass({
        size,
        class: [className, { 'is-invalid': invalid, 'is-disabled': disabled }],
      })}
    >
      {prefix ? (
        <span className="t-input__slot t-input__slot--prefix">{prefix}</span>
      ) : null}
      <input
        {...rest}
        ref={ref}
        className="t-input__field"
        disabled={disabled}
        aria-invalid={invalid || undefined}
      />
      {suffix ? (
        <span className="t-input__slot t-input__slot--suffix">{suffix}</span>
      ) : null}
    </label>
  );
});
