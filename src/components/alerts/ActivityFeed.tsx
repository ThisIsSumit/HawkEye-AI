import {StreamThreatEvent} from '../../types/index';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {SeverityBadge} from '../ui/badge';

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

export function ActivityFeed({events}: Readonly<{events: StreamThreatEvent[]}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-80 space-y-3 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No live events yet. Stream updates will appear here.</p>
        ) : (
          events.map((event) => (
            <div key={`${event.id}-${event.timestamp}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">{timeLabel(event.timestamp)}</p>
                <SeverityBadge severity={event.severity} />
              </div>
              <p className="text-sm text-slate-700">{event.message}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
