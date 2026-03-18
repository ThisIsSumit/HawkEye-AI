import {Bell, CheckCheck} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {StatusBadge} from '../components/ui/badge';

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Operational updates, alert changes, and system events.</p>
        </div>
        <Button variant="secondary">
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((item) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
