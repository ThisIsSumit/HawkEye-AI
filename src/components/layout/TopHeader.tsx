import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {Bell, ChevronDown, Menu, Search} from 'lucide-react';
import {useState} from 'react';
import {Input} from '../ui/input';
import {StatusBadge} from '../ui/badge';

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export function TopHeader({onMenuToggle}: Readonly<TopHeaderProps>) {
  const [status] = useState<'Live' | 'Degraded'>('Live');

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="mr-2 lg:hidden">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search threats, IPs, endpoints" />
          </div>
        </div>

        <div className="ml-4 flex items-center gap-3">
          <StatusBadge className={status === 'Live' ? 'text-emerald-700' : 'text-amber-700'}>
            <span className={`status-dot mr-2 ${status === 'Live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {status}
          </StatusBadge>
          <button className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-700">AR</div>
              <span className="hidden sm:inline">Alex Rivera</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" sideOffset={6}>
                <DropdownMenu.Item className="cursor-pointer rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Profile</DropdownMenu.Item>
                <DropdownMenu.Item className="cursor-pointer rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Account</DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                <DropdownMenu.Item className="cursor-pointer rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Sign out</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
