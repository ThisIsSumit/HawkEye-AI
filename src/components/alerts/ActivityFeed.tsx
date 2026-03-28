import {StreamThreatEvent} from '../../types/index';
import {Card, CardContent, CardHeader} from '../ui/card';
import {SeverityBadge} from '../ui/badge';

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

export function ActivityFeed({events}: Readonly<{events: StreamThreatEvent[]}>) {
  return (
    <Card className="h-full">
      <CardHeader title="Live Stream Feed" subtitle="Real-time telemetry buffer" />
      <CardContent className="max-h-[350px] space-y-4 overflow-y-auto scrollbar-thin">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mb-2" />
             <p className="text-[10px] font-mono font-bold tracking-widest uppercase italic">Buffer_Syncing...</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={`${event.id}-${event.timestamp}`} className="group p-4 rounded-xl bg-void/40 border border-white/5 hover:border-accent/40 transition-all duration-300 shadow-l1 relative overflow-hidden">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]" />
                   <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">{timeLabel(event.timestamp)}</p>
                </div>
                <SeverityBadge severity={event.severity} />
              </div>
              <p className="text-[11px] font-mono text-white/90 leading-relaxed uppercase">{event.message}</p>
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
