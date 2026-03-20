import {useMemo, useState} from 'react';
import {Bell, CheckCheck} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {StatusBadge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {EmptyState} from '../components/ui/empty-state';

const notifications = [
  {
    id: 'NTF-1001',
    title: 'Critical SQL injection alert raised',
    detail: 'Alert ALT-9001 requires immediate review.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'NTF-1002',
    title: 'Threat THR-1002 assigned to Alex Rivera',
    detail: 'Investigation status changed to investigating.',
    time: '14 min ago',
    read: false,
  },
  {
    id: 'NTF-1003',
    title: 'Daily report generated',
    detail: 'Report REP-2026-03-17 is available for download.',
    time: '1 hour ago',
    read: true,
  },
];

export function Notifications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [notificationsState, setNotificationsState] = useState(notifications);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notificationsState.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [item.id, item.title, item.detail]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'read' ? item.read : !item.read);

      return matchesSearch && matchesStatus;
    });
  }, [notificationsState, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Operational updates, alert changes, and system events.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            setNotificationsState((previous) =>
              previous.map((notification) => ({...notification, read: true})),
            )
          }
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search by ID, title, or details"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
                <SelectItem value="read">Read only</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
          <p className="mt-3 text-sm text-slate-500">Showing {filteredNotifications.length} notifications.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-3 ${item.read ? 'border-slate-100 bg-white' : 'border-blue-200 bg-blue-50/40'}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className={`h-4 w-4 ${item.read ? 'text-slate-400' : 'text-blue-600'}`} />
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                </div>
                <StatusBadge>{item.time}</StatusBadge>
              </div>
              <p className="text-sm text-slate-600">{item.detail}</p>
            </div>
          ))}
          {filteredNotifications.length === 0 && (
            <EmptyState
              title="No matching notifications"
              description="No notifications match the selected status and search query."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
