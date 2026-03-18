import {HTMLAttributes} from 'react';
import {cn} from '../../utils';

export function Skeleton({className, ...props}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} {...props} />;
}
