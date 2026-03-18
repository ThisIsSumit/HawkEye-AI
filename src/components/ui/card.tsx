import {HTMLAttributes} from 'react';
import {cn} from '../../utils';

export function Card({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('card', className)} {...props} />;
}

export function CardHeader({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('border-b border-slate-200 px-5 py-4', className)} {...props} />;
}

export function CardTitle({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('text-sm font-semibold text-slate-900', className)} {...props} />;
}

export function CardContent({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('p-5', className)} {...props} />;
}
