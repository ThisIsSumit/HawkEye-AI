import {ButtonHTMLAttributes, forwardRef} from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-white/20',
        secondary: 'bg-surface-elevated text-secondary border border-white/10 hover:border-accent/50 hover:text-white shadow-l1',
        outline: 'bg-transparent text-secondary border border-white/10 hover:border-accent/50 hover:text-white',
        ghost: 'bg-transparent text-secondary hover:text-white hover:bg-white/5',
        danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
      },
      size: {
        sm: 'h-8 px-3 text-[10px]',
        default: 'h-10 px-5',
        lg: 'h-12 px-8 text-sm',
        icon: 'h-10 w-10',
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
