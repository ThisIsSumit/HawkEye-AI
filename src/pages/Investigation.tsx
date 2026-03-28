import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AlertTriangle, Ban, CheckCircle2, ListFilter, Sparkles, Terminal, Activity, ShieldAlert, Fingerprint} from 'lucide-react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {SeverityBadge, StatusBadge} from '../components/ui/badge';
import {Skeleton} from '../components/ui/skeleton';
import {useAnalyzeAlert, useBlockIpAction, useThreatById, useThreats} from '../hooks/use-security-data';
import {Severity, ThreatStatus} from '../types';

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function Investigation() {
  const navigate = useNavigate();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [threatSearch, setThreatSearch] = useState('');
  const [threatSeverityFilter, setThreatSeverityFilter] = useState<Severity | 'all'>('all');
  const [threatStatusFilter, setThreatStatusFilter] = useState<ThreatStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const {id = ''} = useParams();
  const threatsQuery = useThreats({page: 1, pageSize: 100, sortBy: 'timestamp', sortOrder: 'desc'});

  const filteredThreats = useMemo(() => {
    const normalizedSearch = threatSearch.trim().toLowerCase();
    const threats = threatsQuery.data?.items ?? [];

    return threats.filter((threat) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [threat.id, threat.sourceIp, threat.attackType, threat.endpoint]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesSeverity = threatSeverityFilter === 'all' || threat.severity === threatSeverityFilter;
      const matchesStatus = threatStatusFilter === 'all' || threat.status === threatStatusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [threatSearch, threatSeverityFilter, threatStatusFilter, threatsQuery.data?.items]);

  const selectedThreatId = id || filteredThreats[0]?.id || '';
  const investigationQuery = useThreatById(selectedThreatId);
  const analyzeMutation = useAnalyzeAlert();
  const blockIpMutation = useBlockIpAction();
  const investigationData = investigationQuery.data;
  const isThreatSwitching = investigationQuery.isFetching && Boolean(investigationData);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredEvents = useMemo(
    () =>
      (investigationData?.events ?? []).filter((event) => {
        if (normalizedSearch.length === 0) {
          return true;
        }
        return [event.title, event.detail].join(' ').toLowerCase().includes(normalizedSearch);
      }),
    [investigationData?.events, normalizedSearch],
  );

  const filteredLogs = useMemo(
    () =>
      (investigationData?.relatedLogs ?? []).filter((log) => {
        const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
        const matchesSearch = normalizedSearch.length === 0 || log.message.toLowerCase().includes(normalizedSearch);
        return matchesLevel && matchesSearch;
      }),
    [investigationData?.relatedLogs, logLevelFilter, normalizedSearch],
  );

  useEffect(() => {
    if (!id && filteredThreats.length > 0) {
      navigate(`/investigation/${filteredThreats[0].id}`, {replace: true});
    }
  }, [filteredThreats, id, navigate]);

  if (threatsQuery.isLoading) {
    return <Skeleton className="h-170" />;
  }

  if (threatsQuery.isError) {
    return (
      <EmptyState
        title="Threat queue unavailable"
        description="The investigation queue could not be loaded. Verify backend connectivity and retry."
      />
    );
  }

  if (filteredThreats.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader title="Threat Queue Filters" subtitle="Refine the list of targets requiring forensic attention" />
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input
                placeholder="Search threat ID, source IP, attack type"
                value={threatSearch}
                onChange={(event) => setThreatSearch(event.target.value)}
              />
              <Select value={threatSeverityFilter} onValueChange={(value) => setThreatSeverityFilter(value as Severity | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={threatStatusFilter} onValueChange={(value) => setThreatStatusFilter(value as ThreatStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={() => {
                  setThreatSearch('');
                  setThreatSeverityFilter('all');
                  setThreatStatusFilter('all');
                }}
              >
                Reset Queue Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        <EmptyState
          title="No threats in queue"
          description="No threats match the current queue filters."
        />
      </div>
    );
  }

  if (investigationQuery.isLoading && !investigationData) {
    return <Skeleton className="h-170" />;
  }

  if (investigationQuery.isError || !investigationData) {
    return (
      <EmptyState
        title="Threat investigation unavailable"
        description="The selected threat could not be loaded. Verify the threat ID or try again."
      />
    );
  }

  const data = investigationData;
  const isCritical = data.threat.severity === 'critical' || data.threat.severity === 'high';

  return (
    <div className="space-y-6 pb-20 relative">
      <Button
        type="button"
        variant="secondary"
        className="fixed bottom-6 right-6 lg:bottom-auto lg:top-24 lg:right-10 z-40 float-entry shadow-l3 h-12 w-12 lg:h-10 lg:w-auto rounded-full lg:rounded-xl p-0 lg:px-4"
        style={{ '--i': 0 } as any}
        onClick={() => setIsQueueOpen((previous) => !previous)}
      >
        <ListFilter className="h-5 w-5 lg:h-4 lg:w-4" />
        <span className="hidden lg:inline ml-2">{isQueueOpen ? 'CLOSE_QUEUE' : 'THREAT_QUEUE'}</span>
      </Button>

      {isQueueOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-void/60 backdrop-blur-md"
            aria-label="Close threat queue"
            onClick={() => setIsQueueOpen(false)}
          />
          <aside className="absolute right-0 bottom-0 top-0 lg:right-6 lg:top-24 lg:h-[calc(100vh-8rem)] w-full sm:w-[420px] overflow-hidden lg:rounded-2xl border-l lg:border border-white/5 bg-surface-modal shadow-l3 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <p className="font-display font-black text-white text-sm uppercase tracking-tighter italic">Threat_Queue_Matrix</p>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>

            <div className="space-y-4 p-6 overflow-auto h-[calc(100%-4rem)]">
              <div className="space-y-3">
                <Input
                  placeholder="SEARCH_THREAT_SIGNATURE..."
                  className="bg-void/50 border-white/5 font-mono text-[10px]"
                  value={threatSearch}
                  onChange={(event) => setThreatSearch(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={threatSeverityFilter} onValueChange={(value) => setThreatSeverityFilter(value as Severity | 'all')}>
                    <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[9px] uppercase">
                      <SelectValue placeholder="SEVERITY" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-modal border-white/5">
                      <SelectItem value="all">ALL_LVL</SelectItem>
                      <SelectItem value="low">LOW</SelectItem>
                      <SelectItem value="medium">MED</SelectItem>
                      <SelectItem value="high">HIGH</SelectItem>
                      <SelectItem value="critical">CRIT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={threatStatusFilter} onValueChange={(value) => setThreatStatusFilter(value as ThreatStatus | 'all')}>
                    <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[9px] uppercase">
                      <SelectValue placeholder="STATUS" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-modal border-white/5">
                      <SelectItem value="all">ALL_ST</SelectItem>
                      <SelectItem value="open">OPEN</SelectItem>
                      <SelectItem value="investigating">ACTIVE</SelectItem>
                      <SelectItem value="resolved">FIXED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                {filteredThreats.slice(0, 15).map((threat) => (
                  <button
                    key={threat.id}
                    type="button"
                    onClick={() => {
                      navigate(`/investigation/${threat.id}`);
                      setIsQueueOpen(false);
                    }}
                    className={`w-full group rounded-xl p-4 text-left transition-all duration-300 border ${
                      threat.id === data.threat.id
                        ? 'border-accent/40 bg-accent/5 shadow-l2 glow-accent/10'
                        : 'border-white/5 bg-void/40 hover:border-white/20 hover:bg-void/60'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className={`font-mono font-bold text-[11px] ${threat.id === data.threat.id ? 'text-accent' : 'text-white'}`}>{threat.id}</p>
                      <SeverityBadge severity={threat.severity} />
                    </div>
                    <p className="text-[10px] font-mono text-secondary mb-1 uppercase tracking-widest">{threat.attackType} // {threat.sourceIp}</p>
                    <p className="text-[9px] font-mono text-text-tertiary">{new Date(threat.timestamp).toLocaleTimeString()}</p>
                  </button>
                ))}
                {filteredThreats.length === 0 && (
                  <EmptyState
                    title="No targets matching criteria"
                    description="Adjust telemetry filters to reveal obscured signals."
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className={`float-entry group p-6 rounded-3xl border border-white/5 bg-surface/30 shadow-l2 transition-all duration-500 overflow-hidden relative ${isCritical ? 'glow-danger/5' : ''} ${isThreatSwitching ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`} style={{ '--i': 1 } as any}>
        {isCritical && (
          <div className="absolute inset-0 bg-gradient-to-br from-danger/5 via-transparent to-transparent pointer-events-none" />
        )}
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`px-2 py-1 rounded-lg bg-void/50 border border-white/10 ${isCritical ? 'text-danger' : 'text-accent'}`}>
                <Fingerprint size={16} />
              </div>
              <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.2em] leading-none focus-within:ring-1 ring-accent/20 transition-all">Forensic_Workspace // Active_Session</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tighter uppercase italic leading-none">
              {data.threat.id}
            </h1>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-void/60 border border-white/10">
                  <Terminal size={10} className="text-secondary" />
                  <span className="text-[10px] font-mono text-white/80">{data.threat.endpoint}</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-void/60 border border-white/10">
                  <Activity size={10} className="text-secondary" />
                  <span className="text-[10px] font-mono text-white/80 uppercase">{data.threat.attackType}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={data.threat.severity} />
            <StatusBadge className="font-mono text-[9px] uppercase tracking-widest px-3 h-7">{data.threat.status}</StatusBadge>
          </div>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="p-3.5 rounded-xl bg-void/40 border border-white/5 group-hover:border-white/10 transition-colors">
            <p className="text-[8px] font-mono font-bold text-secondary uppercase tracking-widest mb-0.5">Source_Entity_IP</p>
            <p className="font-mono text-base text-accent font-bold tracking-tight">{data.threat.sourceIp}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-void/40 border border-white/5 group-hover:border-white/10 transition-colors">
            <p className="text-[8px] font-mono font-bold text-secondary uppercase tracking-widest mb-0.5">Temporal_Stamp</p>
            <p className="font-mono text-base text-white font-bold tracking-tight">{timeLabel(data.threat.timestamp)}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-void/40 border border-white/5 group-hover:border-white/10 transition-colors">
            <p className="text-[8px] font-mono font-bold text-secondary uppercase tracking-widest mb-0.5">Signal_Integrity</p>
            <div className="flex items-center gap-2">
               <p className="font-mono text-base text-white font-bold tracking-tight">STABLE</p>
               <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/20">
          <CardHeader title="Advanced Workspace Filters" subtitle="Contextual filtering across telemetry & logs" />
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div className="relative group">
                <Input
                  placeholder="SEARCH_LOGS_AND_EVENTS..."
                  className="bg-void/50 border-white/10 font-mono text-[10px] uppercase h-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Select value={logLevelFilter} onValueChange={(value) => setLogLevelFilter(value as typeof logLevelFilter)}>
                <SelectTrigger className="bg-void/50 border-white/10 font-mono text-[10px] uppercase h-9">
                  <SelectValue placeholder="TELEMETRY_LEVEL" />
                </SelectTrigger>
                <SelectContent className="bg-surface-modal border-white/10">
                  <SelectItem value="all">ALL_LVL</SelectItem>
                  <SelectItem value="info">INFO_STREAM</SelectItem>
                  <SelectItem value="warn">WARNING_SIG</SelectItem>
                  <SelectItem value="error">ERROR_EXCEPTION</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                className="w-full text-[10px] font-mono h-9"
                onClick={() => {
                  setSearch('');
                  setLogLevelFilter('all');
                }}
              >
                NULL_WORK_LOGS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="float-entry" style={{ '--i': 3 } as any}>
            <Card>
              <CardHeader title="Event Chronology" subtitle="Temporal map of defensive engagements" />
              <CardContent className="space-y-6 relative before:absolute before:left-8 before:top-8 before:bottom-8 before:w-px before:bg-white/5">
                {filteredEvents.map((event, idx) => (
                  <div key={event.id} className="relative pl-12 group/event">
                    <div className="absolute left-[30px] top-1.5 w-1.5 h-1.5 rounded-full bg-accent group-hover/event:scale-150 transition-transform duration-300 shadow-[0_0_8px_var(--accent)]" />
                    <div className="p-4 rounded-xl bg-void/40 border border-white/5 group-hover/event:border-accent/30 transition-all duration-300 shadow-l1">
                      <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-1">{timeLabel(event.time)}</p>
                      <p className="font-display font-bold text-white text-sm mb-1 group-hover/event:text-accent transition-colors uppercase italic">{event.title}</p>
                      <p className="text-xs text-text-secondary leading-relaxed">{event.detail}</p>
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="py-10">
                    <EmptyState
                      title="No chronological data"
                      description="Temporal telemetry buffer is currently empty."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="float-entry" style={{ '--i': 4 } as any}>
            <Card>
              <CardHeader title="Tactical Telemetry" subtitle="Raw system output & diagnostic streams" />
              <CardContent className="space-y-3 font-mono">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="group flex flex-col p-4 rounded-xl bg-void/50 border border-white/5 hover:bg-void/60 hover:border-white/20 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-accent">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{timeLabel(log.time)}</p>
                         <StatusBadge className="bg-void text-[8px] border-white/10 uppercase tracking-[0.2em] px-2">{log.level}</StatusBadge>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent transition-colors" />
                    </div>
                    <p className="text-[11px] text-white/90 leading-relaxed font-medium">{log.message.toUpperCase()}</p>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="py-10">
                    <EmptyState
                      title="No matching log clusters"
                      description="Diagnostic stream is clear of matching signifiers."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <div className="float-entry" style={{ '--i': 5 } as any}>
            <Card className="bg-surface/40 overflow-hidden relative border-accent/10 glow-accent/5">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert size={80} className="text-accent" />
              </div>
              <CardHeader title="AI Synthesis Engine" subtitle="Neural-assisted threat decomposition" />
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                     <Sparkles size={12} className="text-accent" />
                     <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-widest">Mechanism_Explanation</p>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed bg-void/40 p-4 rounded-xl border border-white/5">{data.aiSummary.explanation}</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                       <Activity size={12} className="text-danger" />
                       <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-widest">Risk_Logic</p>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed italic">{data.aiSummary.severityReasoning}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                       <Terminal size={12} className="text-accent" />
                       <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-widest">Proposed_Actions</p>
                    </div>
                    <ul className="space-y-2">
                      {data.aiSummary.mitigationSteps.map((step, idx) => (
                        <li key={step} className="flex gap-2 text-[11px] text-text-secondary">
                          <span className="text-accent font-mono font-bold">[{idx + 1}]</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                     <Terminal size={12} className="text-accent" />
                     <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-widest">Firewall_Payload_Suggestion</p>
                  </div>
                  <div className="group relative">
                    <pre className="overflow-auto rounded-xl bg-void p-6 text-[11px] font-mono text-emerald-400 border border-emerald-500/10 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                      {data.aiSummary.firewallRule}
                    </pre>
                    <div className="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Button
                    className="flex-1 bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-void shadow-l1"
                    onClick={() => analyzeMutation.mutate(data.threat.id)}
                    disabled={analyzeMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4" />
                    RUN_NEURAL_RESCAN
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 shadow-l1"
                    onClick={() => blockIpMutation.mutate(data.threat.id)}
                    disabled={blockIpMutation.isPending}
                  >
                    <Ban className="h-4 w-4" />
                    NEUTRALIZE_IP
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <CheckCircle2 className="h-4 w-4" />
                    MARK_AS_NEUTRALIZED
                  </Button>
                </div>
                {(analyzeMutation.isSuccess || blockIpMutation.isSuccess) && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] font-mono text-emerald-400 uppercase tracking-widest text-center shadow-l1">
                    AGENT_ACTION_CONFIRMED // SIGNAL_UPDATED
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="float-entry" style={{ '--i': 6 } as any}>
            <Card>
              <CardHeader title="Raw Signal Metadata" subtitle="Core signifiers & binary fragments" />
              <CardContent className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-void/40 border border-white/5">
                    <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-1">ENTITY_IP</p>
                    <p className="font-mono text-[11px] text-accent font-bold">{data.threat.sourceIp}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-void/40 border border-white/5">
                    <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-1">TARGET_NODE</p>
                    <p className="font-mono text-[11px] text-white font-bold">{data.threat.endpoint}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-void/40 border border-white/5">
                    <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-1">SESSION_ST</p>
                    <p className="font-mono text-[11px] text-white font-bold uppercase">{data.threat.status}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-void/40 border border-white/5">
                    <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-1">VECTOR_ID</p>
                    <p className="font-mono text-[11px] text-white font-bold uppercase">{data.threat.attackType}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-widest">Base64_Payload_Dump</p>
                     <p className="text-[9px] font-mono text-text-tertiary">SIZE: {data.requestPayload.length}B</p>
                  </div>
                  <pre className="overflow-auto rounded-xl bg-slate-950 p-6 text-[10px] font-mono text-text-secondary border border-white/5 max-h-[250px] scrollbar-thin">
                    {data.requestPayload}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {(analyzeMutation.isError || blockIpMutation.isError) && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-2xl border border-danger/30 bg-surface-modal p-6 text-[10px] font-mono text-danger font-bold uppercase tracking-widest shadow-l3 animate-in slide-in-from-bottom duration-300">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          SYSTEM_ERROR: CMD_EXECUTION_FAILED // RETRY_LINK_ESTABLISHED
        </div>
      )}
    </div>
  );
}
