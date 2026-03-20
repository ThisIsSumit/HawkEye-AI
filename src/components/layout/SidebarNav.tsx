import {Shield, LayoutDashboard, Radar, SearchCheck, FileBarChart, Settings, X, AlertCircle} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {cn} from '../../utils';

const navItems = [
  {to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {to: '/threats', label: 'Threat Feed', icon: Radar},
  {to: '/investigation', label: 'Investigations', icon: SearchCheck},
  {to: '/alerts', label: 'Alerts', icon: AlertCircle},
  {to: '/reports', label: 'Reports', icon: FileBarChart},
  {to: '/settings', label: 'Settings', icon: Settings},
];

interface SidebarNavProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function SidebarNav({isMobileOpen, onMobileClose}: Readonly<SidebarNavProps>) {
  const navContent = (
    <>
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-slate-900">HawkEye AI</p>
          <p className="text-xs text-slate-500">Cybersecurity Platform</p>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="ml-auto rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onMobileClose}
                className={({isActive}) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100',
                    isActive && 'bg-slate-100 font-medium text-slate-900',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{navContent}</aside>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute inset-0 bg-slate-900/35"
            aria-label="Close sidebar"
          />
          <aside className="relative h-full w-72 border-r border-slate-200 bg-white shadow-xl">{navContent}</aside>
        </div>
      ) : null}
    </>
  );
}
