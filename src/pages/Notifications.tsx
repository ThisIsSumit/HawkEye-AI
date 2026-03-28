import {useMemo, useState} from 'react';
import {Bell, CheckCheck, Zap, Info, ShieldAlert} from 'lucide-react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
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
    <div className="space-y-10 pb-20">
      <div className="float-entry flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6" style={{ '--i': 1 } as any}>
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-xs shadow-l1">
                SIG_CH
             </div>
             <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em]">Communication_Channel // Ops_Log</p>
          </div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
            Signal_Central
          </h1>
        </div>
        <Button
          variant="secondary"
          className="text-[10px] font-mono h-12 px-6 shadow-l1"
          onClick={() =>
            setNotificationsState((previous) =>
              previous.map((notification) => ({...notification, read: true})),
            )
          }
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          CLEAR_ALL_BUFFERS
        </Button>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Signal Query" subtitle="Filter parameters for telemetry distribution" />
          <CardContent>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Pattern_ID</p>
                <Input
                  className="bg-void/50 border-white/5 font-mono text-[10px]"
                  placeholder="ID_DESC_TITLE..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Signal_Status</p>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase">
                    <SelectValue placeholder="STATUS" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="all">ALL_SIGNALS</SelectItem>
                    <SelectItem value="unread">UNREAD_ONLY</SelectItem>
                    <SelectItem value="read">READ_ARCHIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-0.5">
                <Button
                  variant="secondary"
                  className="w-full text-[10px] font-mono shadow-l1"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  HALT_FILTERS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="float-entry" style={{ '--i': 3 } as any}>
        <Card>
          <CardHeader title="Incident Log" subtitle="Real-time operational distribution buffer" />
          <CardContent className="space-y-4">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  item.read 
                    ? 'border-white/5 bg-void/20 opacity-60' 
                    : 'border-accent/20 bg-accent/5 shadow-[0_0_20px_rgba(var(--accent-rgb),0.05)]'
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.read ? 'bg-void/50 text-secondary' : 'bg-accent/10 text-accent'} border border-white/5`}>
                       {item.title.toLowerCase().includes('critical') ? <ShieldAlert className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-display font-medium tracking-tight ${item.read ? 'text-secondary' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mt-0.5">{item.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <StatusBadge className="bg-void/50 border-white/5 font-mono text-[9px] uppercase tracking-widest px-3">
                       {item.time}
                     </StatusBadge>
                     {!item.read && <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />}
                  </div>
                </div>
                <p className={`text-xs ml-11 ${item.read ? 'text-secondary' : 'text-white/70'} leading-relaxed`}>
                  {item.detail}
                </p>
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${item.read ? 'bg-white/5' : 'bg-accent shadow-[0_0_10px_var(--accent)]'}`} />
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <EmptyState
                title="Buffer_Empty"
                description="The signal log returned null for the current sequence."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
