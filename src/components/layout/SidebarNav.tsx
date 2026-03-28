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
  const content = (
    <div className="flex flex-col h-full bg-void border-r border-white/5 shadow-l3 relative z-50 overflow-hidden">
      {/* LOGO AREA */}
      <div className="flex h-16 items-center px-4 mb-2 shrink-0">
        <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
          <Shield className="h-5 w-5 text-accent" />
        </div>
        <span className="ml-3 font-display font-black text-sm text-white tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
          HK // HAWKEYE
        </span>
        {isMobileOpen && (
          <button onClick={onMobileClose} className="ml-auto p-1.5 text-secondary hover:text-white transition-colors lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto scrollbar-none">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            style={{ '--i': idx } as any}
            className={({isActive}) =>
              cn(
                'flex items-center h-10 rounded-xl transition-all duration-300 group/nav relative overflow-hidden float-entry',
                isActive 
                  ? 'bg-accent/10 text-white shadow-[0_0_15px_rgba(37,99,235,0.1)] border border-accent/20' 
                  : 'text-secondary hover:text-white hover:bg-white/5 border border-transparent'
              )
            }
          >
            {({isActive}) => (
              <>
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300",
                  isActive ? "text-accent scale-110" : "text-secondary group-hover/nav:text-white"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="ml-2 font-mono text-[10px] font-bold tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap lg:inline-block">
                  {item.label.toUpperCase()}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full shadow-[0_0_10px_var(--accent)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 mt-auto border-t border-white/5 flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-800 shadow-l1 flex items-center justify-center ring-1 ring-white/10 shrink-0">
          <span className="text-[10px] font-black text-white">AR</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <p className="text-[10px] font-bold text-white leading-none">ALEX_RIVERA</p>
           <p className="text-[8px] font-mono text-secondary mt-1">L2_ANALYST</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-50 group hover:w-60 w-16 transition-[width] duration-300 ease-in-out">
        {content}
      </aside>
      
      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="absolute inset-0 bg-void/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={onMobileClose}
          />
          <aside className="relative h-full w-64 group animate-in slide-in-from-left duration-500 ease-out fill-mode-both">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
