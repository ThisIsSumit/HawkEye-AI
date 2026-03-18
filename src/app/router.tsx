import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AppShell} from '../components/layout/AppShell.tsx';
import {Alerts} from '../pages/Alerts.tsx';
import {Account} from '../pages/Account.tsx';
import {Dashboard} from '../pages/Dashboard.tsx';
import {Investigation} from '../pages/Investigation';
import {Notifications} from '../pages/Notifications.tsx';
import {Profile} from '../pages/Profile.tsx';
import {Reports} from '../pages/Reports.tsx';
import {Settings} from '../pages/Settings.tsx';
import {ThreatFeed} from '../pages/ThreatFeed.tsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<ThreatFeed />} />
          <Route path="/threats/:id" element={<Investigation />} />
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
