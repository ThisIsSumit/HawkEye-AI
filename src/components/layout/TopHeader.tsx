import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {Bell, ChevronDown, Menu, Search, User} from 'lucide-react';
import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../hooks/use-auth';

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export function TopHeader({onMenuToggle}: Readonly<TopHeaderProps>) {
  const navigate = useNavigate();
  const {user, logout} = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="z-40 h-16 flex items-center px-4 sm:px-6 lg:px-8 border-b border-white/[0.02]">
      <div className="flex-1 flex items-center justify-between bg-surface/40 backdrop-blur-md rounded-xl px-3 sm:px-4 h-11 shadow-l1 ring-1 ring-white/5">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 text-secondary hover:text-white transition-all hover:bg-white/5 rounded-lg active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="relative w-full max-w-[180px] sm:max-w-[240px] group hidden xs:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent" />
            <input 
              className="w-full bg-void/30 border-none rounded-lg focus:ring-1 focus:ring-accent/30 pl-9 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-text-tertiary transition-all"
              placeholder="COMMAND_SEARCH..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 h-7 bg-void/40 rounded-lg ring-1 ring-white/5 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[9px] font-mono text-success uppercase tracking-wider">LIVE_BUFFER</span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-mono text-text-secondary tracking-widest">{time}</span>
          </div>

          <button className="relative p-1.5 text-text-secondary hover:text-white transition-all rounded-lg hover:bg-white/5">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_6px_rgba(37,99,235,0.6)]" />
          </button>

          <div className="w-px h-6 bg-white/5 mx-0.5 sm:mx-1" />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-1.5 sm:gap-2 focus:outline-none group p-1 -mr-1 rounded-xl hover:bg-white/5 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-medium text-white leading-none uppercase">{user?.name || 'ANALYST'}</p>
                <p className="text-[8px] font-mono text-text-secondary leading-tight mt-0.5">AUTH_LEVEL_01</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center ring-1 ring-accent/20 group-hover:ring-accent/40 transition-all overflow-hidden">
                <User className="w-3.5 h-3.5 text-accent" />
              </div>
              <ChevronDown className="h-3 w-3 text-text-secondary group-hover:text-white transition-colors" />
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-50 mt-2 w-48 bg-surface-modal backdrop-blur-xl rounded-xl border border-white/10 p-1 shadow-l3 animate-in fade-in zoom-in duration-200" sideOffset={8}>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] text-text-secondary hover:text-white hover:bg-white/5 rounded-lg cursor-pointer outline-none transition-colors" onSelect={() => navigate('/profile')}>
                  ANALYSIS_DOSSIER
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] text-text-secondary hover:text-white hover:bg-white/5 rounded-lg cursor-pointer outline-none transition-colors" onSelect={() => navigate('/settings')}>
                  SYSTEM_CONFIG
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] text-danger hover:bg-danger/10 rounded-lg cursor-pointer outline-none transition-colors" onSelect={() => { logout(); navigate('/login'); }}>
                  TERMINATE_SESSION
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
