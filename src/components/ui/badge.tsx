import {HTMLAttributes} from 'react';
import {cn} from '../../utils';
import {Severity} from '../../types/index';

const severityStyles: Record<Severity, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

export function SeverityBadge({severity, className}: Readonly<{severity: Severity; className?: string}>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        severityStyles[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({className, ...props}: Readonly<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700',
        className,
      )}
      {...props}
    />
  );
}
