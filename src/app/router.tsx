import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {ReactElement} from 'react';
import {AppShell} from '../components/layout/AppShell.tsx';
import {Alerts} from '../pages/Alerts.tsx';
import {Account} from '../pages/Account.tsx';
import {Dashboard} from '../pages/Dashboard.tsx';
import {Investigation} from '../pages/Investigation';
import {Login} from '../pages/Login.tsx';
import {Notifications} from '../pages/Notifications.tsx';
import {Profile} from '../pages/Profile.tsx';
import {Reports} from '../pages/Reports.tsx';
import {Settings} from '../pages/Settings.tsx';
import {ThreatFeed} from '../pages/ThreatFeed.tsx';
import {useAuth} from '../hooks/use-auth';

function RequireAuth({children}: Readonly<{children: ReactElement}>) {
  const {isAuthenticated, isLoading} = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{from: location}} />;
  }

  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<ThreatFeed />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/investigation/:id" element={<Investigation />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
