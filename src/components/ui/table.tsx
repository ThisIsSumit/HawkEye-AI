import {HTMLAttributes, TableHTMLAttributes} from 'react';
import {cn} from '../../utils';

export function TableContainer({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('overflow-auto', className)} {...props} />;
}

export function Table({className, ...props}: Readonly<TableHTMLAttributes<HTMLTableElement>>) {
  return <table className={cn('w-full border-collapse text-sm', className)} {...props} />;
}

export function Th({className, ...props}: Readonly<HTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th
      className={cn('border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-600', className)}
      {...props}
    />
  );
}

export function Td({className, ...props}: Readonly<HTMLAttributes<HTMLTableCellElement>>) {
  return <td className={cn('border-b border-slate-100 px-3 py-2 text-sm text-slate-700', className)} {...props} />;
}
