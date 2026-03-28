import {HTMLAttributes} from 'react';
import {cn} from '../../utils';

export function Card({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface/50 backdrop-blur-sm shadow-l1 hover-lift transition-all duration-300 ring-1 ring-white/5',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({className, title, subtitle, ...props}: Readonly<HTMLAttributes<HTMLDivElement> & {title: string; subtitle?: string}>) {
  return (
    <div className={cn('flex items-center justify-between gap-2 p-4 pb-1 sm:p-5 sm:pb-1.5 lg:p-6 lg:pb-2', className)} {...props}>
      <div>
        <h3 className="font-display font-medium text-white tracking-tight leading-none text-xs sm:text-sm">{title.toUpperCase()}</h3>
        {subtitle && <p className="text-[9px] sm:text-[10px] font-mono text-secondary mt-1 tracking-wider uppercase">{subtitle}</p>}
      </div>
      <div className="flex gap-1">
        <div className="w-1 h-1 rounded-full bg-accent/30" />
        <div className="w-1 h-1 rounded-full bg-accent/30" />
      </div>
    </div>
  );
}

export function CardContent({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('p-4 pt-1 sm:p-5 sm:pt-1.5 lg:p-6 lg:pt-2', className)} {...props} />;
}
