import * as SelectPrimitive from '@radix-ui/react-select';
import {Check, ChevronDown} from 'lucide-react';
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
        position="popper"
        sideOffset={4}
        className={cn(
          'hawk-select-content z-9999 min-w-40 overflow-hidden rounded-lg border border-slate-200 bg-white text-black shadow-lg',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{props.children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({className, children, ...props}: Readonly<ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'hawk-select-item relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-black outline-none hover:bg-slate-100 data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-slate-100 data-highlighted:text-black',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="hawk-select-item-text">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
