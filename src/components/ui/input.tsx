import {InputHTMLAttributes, forwardRef} from 'react';
import {cn} from '../../utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({className, ...props}, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-lg border border-white/5 bg-void/50 px-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-all',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
