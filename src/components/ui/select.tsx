import * as SelectPrimitive from '@radix-ui/react-select';
import {ChevronDown} from 'lucide-react';
import {ComponentPropsWithoutRef} from 'react';
import {cn} from '../../utils';

export function Select(props: ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectTrigger({className, children, ...props}: Readonly<ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue(props: Readonly<ComponentPropsWithoutRef<typeof SelectPrimitive.Value>>) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectContent({className, ...props}: Readonly<ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn('z-50 min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg', className)}
        {...props}
      >
        <SelectPrimitive.Viewport>{props.children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({className, ...props}: Readonly<ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative cursor-pointer select-none rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-100 data-highlighted:bg-slate-100',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText />
    </SelectPrimitive.Item>
  );
}
