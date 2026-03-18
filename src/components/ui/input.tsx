import {InputHTMLAttributes, forwardRef} from 'react';
import {cn} from '../../utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({className, ...props}, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
