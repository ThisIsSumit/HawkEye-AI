import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {useThreatStream} from '../../hooks/use-security-data';
import {useAuth} from '../../hooks/use-auth';
import {SidebarNav} from './SidebarNav';
import {TopHeader} from './TopHeader';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {isAuthenticated} = useAuth();

  useThreatStream(isAuthenticated);

  return (
    <div className="flex h-screen bg-void relative overflow-hidden">
      <div className="radial-glow-layer" />
      <SidebarNav isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative z-10">
        <TopHeader onMenuToggle={() => setIsSidebarOpen((previous) => !previous)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
