import {ButtonHTMLAttributes, forwardRef} from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white hover:bg-slate-800',
        secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
        outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3',
        default: 'h-9 px-4',
        lg: 'h-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, ...props}, ref) => (
    <button ref={ref} className={cn(buttonVariants({variant, size}), className)} {...props} />
  ),
);

Button.displayName = 'Button';
