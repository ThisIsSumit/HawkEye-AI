import {HTMLAttributes} from 'react';
import {cn} from '../../utils';
import {Severity} from '../../types/index';

export function SeverityBadge({severity, className}: Readonly<{severity: Severity; className?: string}>) {
  const colors: Record<Severity, string> = {
    low: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    high: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
  };
  
  const accent: Record<Severity, string> = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider rounded border-none ring-1 relative overflow-hidden',
        colors[severity],
        className,
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-[2.5px]', accent[severity])} />
      {severity}
    </span>
  );
}

export function StatusBadge({className, children, ...props}: Readonly<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded bg-surface/80 border border-white/5 font-mono text-[9px] font-bold uppercase text-secondary tracking-widest',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
