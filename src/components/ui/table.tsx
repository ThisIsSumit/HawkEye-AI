import {HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes} from 'react';
import {cn} from '../../utils';

export function TableContainer({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('overflow-auto rounded-xl ring-1 ring-white/5 bg-surface/30 shadow-l1 scrollbar-thin', className)} {...props} />;
}

export function Table({className, ...props}: Readonly<TableHTMLAttributes<HTMLTableElement>>) {
  return <table className={cn('w-full border-collapse font-body text-sm text-left', className)} {...props} />;
}

export function Th({className, ...props}: Readonly<ThHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th
      className={cn(
        'px-4 py-3 bg-surface-elevated/80 backdrop-blur-sm border-b border-white/5 text-[10px] font-mono font-bold text-secondary uppercase tracking-widest sticky top-0 z-10',
        className
      )}
      {...props}
    />
  );
}

export function Td({className, ...props}: Readonly<TdHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <td 
      className={cn(
        'px-4 py-3 border-b border-white/5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5', 
        className
      )} 
      {...props} 
    />
  );
}
