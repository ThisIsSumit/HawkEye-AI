import {ReactNode, useMemo, useState} from 'react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Search, Filter, ShieldAlert} from 'lucide-react';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {AlertsTable} from '../components/tables/AlertsTable';
import {EmptyState} from '../components/ui/empty-state';
import {Skeleton} from '../components/ui/skeleton';
import {useAlerts, useAssignAlert, useResolveAlert} from '../hooks/use-security-data';
import {AlertStatus, Severity} from '../types/index';

export function Alerts() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created-desc' | 'created-asc' | 'severity-desc' | 'severity-asc'>('created-desc');

  const alertsQuery = useAlerts();
  const assignMutation = useAssignAlert();
  const resolveMutation = useResolveAlert();

  const filtered = useMemo(() => {
    const items = alertsQuery.data ?? [];
    const filteredItems = items.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.id.toLowerCase().includes(search.toLowerCase()) ||
        alert.sourceIp.includes(search);
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });

    const severityWeight: Record<Severity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return filteredItems.sort((a, b) => {
      if (sortBy === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'severity-desc') {
        return severityWeight[b.severity] - severityWeight[a.severity];
      }
      return severityWeight[a.severity] - severityWeight[b.severity];
    });
  }, [alertsQuery.data, search, severityFilter, sortBy, statusFilter]);

  let content: ReactNode;
  if (alertsQuery.isLoading) {
    content = <Skeleton className="h-80" />;
  } else if (alertsQuery.isError) {
    content = (
      <EmptyState
        title="Unable to load alerts"
        description="HawkEye AI could not retrieve alert records. Check backend availability."
      />
    );
  } else if (filtered.length === 0) {
    content = (
      <EmptyState
        title="No alerts found"
        description="No alerts match the current filters. Clear filters or broaden your search."
      />
    );
  } else {
    content = (
      <AlertsTable
        alerts={filtered}
        onAssign={(id) => assignMutation.mutate({id, analyst: 'Alex Rivera'})}
        onResolve={(id) => resolveMutation.mutate(id)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-1.5 focus-within:ring-1 ring-accent/20 transition-all">
           <div className="px-2 py-1 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-[10px] shadow-l1">
              SEC_OPS
           </div>
           <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.2em]">Incident_Management // Queue_Level_0</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Operational_Alert_Center
        </h1>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Tactical_Filters" subtitle="Coordinate incident response parameters" />
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Signal_Signature</p>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary group-focus-within:text-accent transition-colors" />
                  <Input
                    className="pl-10 bg-void/50 border-white/5 font-mono text-[10px] h-9"
                    placeholder="ID_DESC_IP..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Impact_Weight</p>
                <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as Severity | 'all')}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase h-9">
                    <SelectValue placeholder="SEVERITY" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="all">ALL_LVL</SelectItem>
                    <SelectItem value="low">LOW</SelectItem>
                    <SelectItem value="medium">MEDIUM</SelectItem>
                    <SelectItem value="high">HIGH</SelectItem>
                    <SelectItem value="critical">CRITICAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Lifecycle_State</p>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatus | 'all')}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase h-9">
                    <SelectValue placeholder="STATUS" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="all">ALL_ST</SelectItem>
                    <SelectItem value="open">OPEN</SelectItem>
                    <SelectItem value="assigned">ASSIGNED</SelectItem>
                    <SelectItem value="resolved">RESOLVED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Buffer_Sequence</p>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase h-9">
                    <SelectValue placeholder="ORDER" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="created-desc">NEWEST_TS</SelectItem>
                    <SelectItem value="created-asc">OLDEST_TS</SelectItem>
                    <SelectItem value="severity-desc">SEV_DESC</SelectItem>
                    <SelectItem value="severity-asc">SEV_ASC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end pb-0.5">
                <Button
                  variant="secondary"
                  className="w-full text-[10px] font-mono h-9 shadow-l1"
                  onClick={() => {
                    setSearch('');
                    setSeverityFilter('all');
                    setStatusFilter('all');
                    setSortBy('created-desc');
                  }}
                >
                  NULL_LOGS
                </Button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">Active_Records: {filtered.length}</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="float-entry" style={{ '--i': 3 } as any}>
        <Card>
          <CardHeader title="Incident Queue" subtitle="Operational stack for mission-critical alerts" />
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
