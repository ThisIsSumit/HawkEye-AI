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
        'flex h-9 w-full items-center justify-between rounded-lg border border-white/5 bg-void/50 px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-text-secondary" />
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
          'hawk-select-content z-9999 min-w-40 overflow-hidden rounded-lg border border-white/10 bg-surface-modal text-text-primary shadow-l3 animate-in fade-in zoom-in-95 duration-200',
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
        'hawk-select-item relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-text-secondary outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-white/5 data-highlighted:text-text-primary',
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
