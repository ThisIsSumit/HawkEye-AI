import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {useAuth} from '../hooks/use-auth';
import {getAccessTokenStorageKey} from '../lib/auth';

const securityActivity = [
  {
    id: 'ACT-3001',
    action: 'Password changed',
    actor: 'alex.rivera@hawkeye.ai',
    time: '2026-03-20T09:15:00.000Z',
    status: 'success',
  },
  {
    id: 'ACT-3002',
    action: 'MFA reconfigured',
    actor: 'alex.rivera@hawkeye.ai',
    time: '2026-03-19T17:42:00.000Z',
    status: 'success',
  },
  {
    id: 'ACT-3003',
    action: 'Failed sign-in challenge',
    actor: 'unknown-device',
    time: '2026-03-18T22:11:00.000Z',
    status: 'failed',
  },
] as const;

export function Account() {
  const {user, token, logout} = useAuth();
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredActivity = useMemo(() => {
    const normalizedSearch = activitySearch.trim().toLowerCase();

    return securityActivity.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [item.id, item.action, item.actor]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = activityStatusFilter === 'all' || item.status === activityStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activitySearch, activityStatusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Account</h1>
        <p className="text-sm text-slate-500">Security settings for your HawkEye AI account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authenticated Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Name</p>
              <p className="text-sm text-slate-900">{user?.name ?? '-'}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm capitalize text-slate-900">{user?.role ?? '-'}</p>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Token Storage Key</p>
            <p className="font-mono text-xs text-slate-800">{getAccessTokenStorageKey()}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Token Preview</p>
            <p className="font-mono text-xs text-slate-800">
              {token ? `${token.slice(0, 18)}...${token.slice(-8)}` : 'No token found'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={logout}>Clear Session</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <div className="flex justify-end">
            <Button>Update Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">MFA status: Enabled via authenticator app.</p>
          <div className="flex gap-2">
            <Button variant="secondary">Reconfigure MFA</Button>
            <Button variant="danger">Disable MFA</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search by activity ID, action, or actor"
              value={activitySearch}
              onChange={(event) => setActivitySearch(event.target.value)}
            />
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              value={activityStatusFilter}
              onChange={(event) => setActivityStatusFilter(event.target.value as typeof activityStatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                setActivitySearch('');
                setActivityStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>

          {filteredActivity.map((activity) => (
            <div key={activity.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                <p className="text-xs text-slate-500">{new Date(activity.time).toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-600">{activity.id} · {activity.actor}</p>
            </div>
          ))}

          {filteredActivity.length === 0 && (
            <EmptyState
              title="No matching security activity"
              description="No account activity entries match the current filters."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
