import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AlertTriangle, Ban, CheckCircle2, ListFilter, Sparkles} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
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
          <CardHeader>
            <CardTitle>Threat Queue Filters</CardTitle>
          </CardHeader>
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

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="secondary"
        className="fixed right-6 top-14 z-40 shadow-md"
        onClick={() => setIsQueueOpen((previous) => !previous)}
      >
        <ListFilter className="h-4 w-4" />
        {isQueueOpen ? 'Close' : 'Threats'}
      </Button>

      {isQueueOpen && (
        <div className="fixed inset-0 z-30">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/20"
            aria-label="Close threat queue"
            onClick={() => setIsQueueOpen(false)}
          />
          <aside className="absolute right-4 top-13 h-[calc(100vh-6rem)] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Threat Queue</p>
              
            </div>

            <div className="space-y-3 p-4">
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
                className="w-full"
                onClick={() => {
                  setThreatSearch('');
                  setThreatSeverityFilter('all');
                  setThreatStatusFilter('all');
                }}
              >
                Reset Queue Filters
              </Button>

              <div className="max-h-[calc(100vh-23rem)] space-y-2 overflow-auto pr-1">
                {filteredThreats.slice(0, 12).map((threat) => (
                  <button
                    key={threat.id}
                    type="button"
                    onClick={() => {
                      navigate(`/investigation/${threat.id}`);
                      setIsQueueOpen(false);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      threat.id === data.threat.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{threat.id}</p>
                      <SeverityBadge severity={threat.severity} />
                    </div>
                    <p className="text-sm text-slate-600">{threat.attackType} · {threat.sourceIp}</p>
                    <p className="text-xs text-slate-500">{new Date(threat.timestamp).toLocaleString()}</p>
                  </button>
                ))}
                {filteredThreats.length === 0 && (
                  <EmptyState
                    title="No threats found"
                    description="No threats match the current queue filters."
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity duration-200 ${isThreatSwitching ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Threat Investigation Workspace</p>
            <h1 className="text-2xl font-semibold text-slate-900">{data.threat.id}</h1>
            <p className="text-sm text-slate-600">
              {data.threat.attackType} on {data.threat.endpoint}
            </p>
            {isThreatSwitching && (
              <p className="text-xs text-slate-500">Loading selected threat...</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={data.threat.severity} />
            <StatusBadge className="capitalize">{data.threat.status}</StatusBadge>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Source IP</p>
            <p className="font-mono text-sm text-slate-900">{data.threat.sourceIp}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Detected At</p>
            <p className="text-sm text-slate-900">{timeLabel(data.threat.timestamp)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Queue Size</p>
            <p className="text-sm text-slate-900">{filteredThreats.length} filtered threats</p>
          </div>
        </div>
      </div>

      <Card className={isThreatSwitching ? 'animate-pulse' : ''}>
        <CardHeader>
          <CardTitle>Investigation Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search timeline events and logs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={logLevelFilter} onValueChange={(value) => setLogLevelFilter(value as typeof logLevelFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All log levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setLogLevelFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredEvents.length} timeline events and {filteredLogs.length} related logs.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline of Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{timeLabel(event.time)}</p>
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-600">{event.detail}</p>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <EmptyState
                  title="No matching events"
                  description="No timeline events match the current search query."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">{timeLabel(log.time)}</p>
                    <StatusBadge className="uppercase">{log.level}</StatusBadge>
                  </div>
                  <p className="text-sm text-slate-700">{log.message}</p>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <EmptyState
                  title="No matching logs"
                  description="No log entries match the selected level and search query."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Attack Explanation</p>
                <p className="text-sm text-slate-700">{data.aiSummary.explanation}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Severity Reasoning</p>
                <p className="text-sm text-slate-700">{data.aiSummary.severityReasoning}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested Mitigations</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {data.aiSummary.mitigationSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Firewall Rule Suggestion</p>
                <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">{data.aiSummary.firewallRule}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => analyzeMutation.mutate(data.threat.id)}
                  disabled={analyzeMutation.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI
                </Button>
                <Button
                  variant="danger"
                  onClick={() => blockIpMutation.mutate(data.threat.id)}
                  disabled={blockIpMutation.isPending}
                >
                  <Ban className="h-4 w-4" />
                  Block IP
                </Button>
                <Button variant="secondary">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </Button>
              </div>
              {(analyzeMutation.isSuccess || blockIpMutation.isSuccess) && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Action completed successfully.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata & Raw Payload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Source IP</p>
                  <p className="font-mono text-sm text-slate-800">{data.threat.sourceIp}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Endpoint</p>
                  <p className="text-sm text-slate-800">{data.threat.endpoint}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm capitalize text-slate-800">{data.threat.status}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Attack Type</p>
                  <p className="text-sm text-slate-800">{data.threat.attackType}</p>
                </div>
              </div>
              <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{data.requestPayload}</pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {(analyzeMutation.isError || blockIpMutation.isError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          Action failed. Please retry after checking API connectivity.
        </div>
      )}
    </div>
  );
}
