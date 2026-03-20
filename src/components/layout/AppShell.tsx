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
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenuToggle={() => setIsSidebarOpen((previous) => !previous)} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
