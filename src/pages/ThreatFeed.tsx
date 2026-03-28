import {ReactNode, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Skeleton} from '../components/ui/skeleton';
import {ThreatsTable} from '../components/tables/ThreatsTable';
import {useThreats} from '../hooks/use-security-data';
import {Threat, ThreatFilter} from '../types/index';
import {Search, Filter, Activity} from 'lucide-react';

const pageSize = 10;

export function ThreatFeed() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<ThreatFilter['severity']>('all');
  const [attackType, setAttackType] = useState('');
  const [timeRange, setTimeRange] = useState<ThreatFilter['timeRange']>('24h');
  const [sortBy, setSortBy] = useState<ThreatFilter['sortBy']>('timestamp');
  const [sortOrder, setSortOrder] = useState<ThreatFilter['sortOrder']>('desc');

  const filter: ThreatFilter = {
    page,
    pageSize,
    severity,
    attackType,
    timeRange,
    sortBy,
    sortOrder,
  };

  const {data, isLoading, isError} = useThreats(filter);

  const totalPages = useMemo(() => {
    if (!data) {
      return 1;
    }
    return Math.max(1, Math.ceil(data.total / pageSize));
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [severity, attackType, timeRange, sortBy, sortOrder]);

  const filteredThreats = useMemo(() => {
    const items = data?.items ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return items;
    }

    return items.filter((threat) =>
      [threat.id, threat.sourceIp, threat.attackType, threat.endpoint, threat.status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [data?.items, search]);

  const onSort = (field: keyof Threat) => {
    if (field === sortBy) {
      setSortOrder((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(field);
    setSortOrder('asc');
  };

  let content: ReactNode;
  if (isLoading) {
    content = <Skeleton className="h-80" />;
  } else if (isError || !data) {
    content = (
      <EmptyState
        title="Unable to load threat feed"
        description="The threat data source is unavailable. Retry after checking backend connectivity."
      />
    );
  } else if (filteredThreats.length === 0) {
    content = (
      <EmptyState
        title="No threats match the selected filters"
        description="Adjust severity, attack type, time range, or search query to broaden the results."
      />
    );
  } else {
    content = (
      <ThreatsTable
        threats={filteredThreats}
        onSort={onSort}
        onRowClick={(threat) => navigate(`/investigation/${threat.id}`)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-1.5 focus-within:ring-1 ring-accent/20 transition-all">
           <div className="px-2 py-1 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-[10px] shadow-l1">
              TR_FEED
           </div>
           <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.2em]">Telemetry_Stream // Global_Ingress</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Threat_Intelligence_Feed
        </h1>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Control_Console" subtitle="Parameters for multi-vector threat decomposition" />
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Signal_Priority</p>
                <Select value={severity} onValueChange={(value) => setSeverity(value as ThreatFilter['severity'])}>
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
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Pattern_Signature</p>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary group-focus-within:text-accent transition-colors" />
                  <Input
                    className="pl-10 bg-void/50 border-white/5 font-mono text-[10px] h-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ID_IP_ENDPOINT..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Vector_Type</p>
                <div className="relative group">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary group-focus-within:text-accent transition-colors" />
                  <Input
                    className="pl-10 bg-void/50 border-white/5 font-mono text-[10px] h-9"
                    value={attackType}
                    onChange={(event) => setAttackType(event.target.value)}
                    placeholder="VECTOR..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Temporal_Range</p>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as ThreatFilter['timeRange'])}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="1h">T-60 MIN</SelectItem>
                    <SelectItem value="24h">T-24 HRS</SelectItem>
                    <SelectItem value="7d">T-07 DAYS</SelectItem>
                    <SelectItem value="30d">T-30 DAYS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end pb-0.5">
                <Button
                  variant="secondary"
                  className="w-full text-[10px] font-mono h-9 shadow-l1"
                  onClick={() => {
                    setPage(1);
                    setSearch('');
                    setSeverity('all');
                    setAttackType('');
                    setTimeRange('24h');
                    setSortBy('timestamp');
                    setSortOrder('desc');
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
          <CardHeader title="Live Event Log" subtitle="Filtered telemetry buffer" />
          <CardContent className="space-y-6">
            {content}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">
                   Buffer_Page {page} // {totalPages} // Total_Signals: {filteredThreats.length}
                 </p>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  className="px-6 text-[10px] font-mono"
                  disabled={page <= 1} 
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  PREV_SEGMENT
                </Button>
                <Button
                  variant="secondary"
                  className="px-6 text-[10px] font-mono shadow-l1"
                  disabled={page >= totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  NEXT_SEGMENT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
