import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {KpiCard} from '../components/cards/KpiCard';
import {AttackDistributionChart} from '../components/charts/AttackDistributionChart';
import {ThreatTrendChart} from '../components/charts/ThreatTrendChart';
import {ActivityFeed} from '../components/alerts/ActivityFeed';
import {SeverityBadge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Skeleton} from '../components/ui/skeleton';
import {Table, TableContainer, Td, Th} from '../components/ui/table';
import {Search} from 'lucide-react';
import {useAlerts, useAnalyticsSummary, useThreats} from '../hooks/use-security-data';
import {useQueryClient} from '@tanstack/react-query';
import {Alert, AlertStatus, Severity, StreamThreatEvent, SummaryMetric, Threat} from '../types/index';

const skeletonKeys = ['a', 'b', 'c', 'd'] as const;

function aggregateTopIps(items: {sourceIp: string}[]): Array<{ip: string; count: number}> {
  const map = new Map<string, number>();
  items.forEach((item) => {
    map.set(item.sourceIp, (map.get(item.sourceIp) ?? 0) + 1);
  });

  return [...map.entries()]
    .map(([ip, count]) => ({ip, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function Dashboard() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [alertStatusFilter, setAlertStatusFilter] = useState<AlertStatus | 'all'>('all');

  const queryClient = useQueryClient();
  const summaryQuery = useAnalyticsSummary();
  const threatsQuery = useThreats({page: 1, pageSize: 50});
  const alertsQuery = useAlerts();

  const streamEvents = queryClient.getQueryData<StreamThreatEvent[]>(['stream-events']) ?? [];

  const topIps = useMemo(() => {
    if (!threatsQuery.data?.items) {
      return [];
    }
    return aggregateTopIps(threatsQuery.data.items);
  }, [threatsQuery.data?.items]);

  if (summaryQuery.isLoading || threatsQuery.isLoading || alertsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {skeletonKeys.map((key) => (
            <Skeleton key={key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (summaryQuery.isError || threatsQuery.isError || alertsQuery.isError) {
    return (
      <EmptyState
        title="Unable to load dashboard data"
        description="HawkEye AI could not fetch analytics. Verify API connectivity and retry."
      />
    );
  }

  if (!summaryQuery.data || !threatsQuery.data || !alertsQuery.data) {
    return <Skeleton className="h-72" />;
  }

  const summary = summaryQuery.data;
  const threats = threatsQuery.data.items;
  const alerts = alertsQuery.data;
  const normalizedSearch = search.trim().toLowerCase();

  const filteredThreats = threats.filter((threat) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      threat.id.toLowerCase().includes(normalizedSearch) ||
      threat.sourceIp.toLowerCase().includes(normalizedSearch) ||
      threat.attackType.toLowerCase().includes(normalizedSearch) ||
      threat.endpoint.toLowerCase().includes(normalizedSearch);
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      alert.id.toLowerCase().includes(normalizedSearch) ||
      alert.title.toLowerCase().includes(normalizedSearch) ||
      alert.sourceIp.toLowerCase().includes(normalizedSearch);
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = alertStatusFilter === 'all' || alert.status === alertStatusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const filteredTopIps = topIps.filter((item) => {
    if (normalizedSearch.length === 0) {
      return true;
    }
    return item.ip.toLowerCase().includes(normalizedSearch);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Security_Overview
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
           <p className="text-[9px] font-mono font-bold text-secondary tracking-widest uppercase">Operational Posture // Live Telemetry Feed</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric: SummaryMetric, idx: number) => (
          <div key={metric.id} className="float-entry" style={{ '--i': idx + 2 } as any}>
            <KpiCard
              label={metric.label}
              value={metric.value.toLocaleString()}
              delta={metric.delta}
            />
          </div>
        ))}
      </div>

      <div className="float-entry" style={{ '--i': 6 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Control_Filters" subtitle="Refine telemetry streams" />
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
                <Input
                  placeholder="SEARCH_BY_ID_OR_IP..."
                  className="pl-10 bg-void/50 border-white/10 font-mono text-xs uppercase"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as Severity | 'all')}>
                <SelectTrigger className="bg-void/50 border-white/10 font-mono text-[10px] uppercase h-9">
                  <SelectValue placeholder="SEVERITY_LEVEL" />
                </SelectTrigger>
                <SelectContent className="bg-surface-modal border-white/10">
                  <SelectItem value="all">ALL_SEV</SelectItem>
                  <SelectItem value="low">LOW</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                  <SelectItem value="critical">CRITICAL</SelectItem>
                </SelectContent>
              </Select>
              <Select value={alertStatusFilter} onValueChange={(value) => setAlertStatusFilter(value as AlertStatus | 'all')}>
                <SelectTrigger className="bg-void/50 border-white/10 font-mono text-[10px] uppercase h-9">
                  <SelectValue placeholder="ALERT_STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-surface-modal border-white/10">
                  <SelectItem value="all">ALL_STATUS</SelectItem>
                  <SelectItem value="open">OPEN</SelectItem>
                  <SelectItem value="assigned">ASSIGNED</SelectItem>
                  <SelectItem value="resolved">RESOLVED</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                className="w-full h-9 text-[10px] tracking-widest"
                onClick={() => {
                  setSearch('');
                  setSeverityFilter('all');
                  setAlertStatusFilter('all');
                }}
              >
                RESET_LOGS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 float-entry" style={{ '--i': 7 } as any}>
          <Card>
            <CardHeader title="Threat Analysis Grid" subtitle="Temporal progression of security breaches" />
            <CardContent className="h-[300px]">
              <ThreatTrendChart data={summary.threatTrend} />
            </CardContent>
          </Card>
        </div>

        <div className="float-entry" style={{ '--i': 8 } as any}>
          <Card>
            <CardHeader title="Attack Vector Distribution" subtitle="Distribution of detected exploit attempts" />
            <CardContent className="h-[300px]">
              <AttackDistributionChart data={summary.attackDistribution} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="float-entry" style={{ '--i': 9 } as any}>
          <Card className="h-full">
            <CardHeader title="Top Attacking Entities" subtitle="Source IP reputation & volume" />
            <CardContent className="p-0">
              {filteredTopIps.length === 0 ? (
                <div className="p-10">
                  <EmptyState
                    title="No matching IPs"
                    description="No source IP matches the current search filter."
                  />
                </div>
              ) : (
                <TableContainer className="max-h-[350px]">
                  <Table>
                    <thead>
                      <tr>
                        <Th>ENTITY_IP</Th>
                        <Th className="text-right">EVENT_COUNT</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTopIps.map((item) => (
                        <tr key={item.ip} className="group/row">
                          <Td className="font-mono text-[11px] text-accent">{item.ip}</Td>
                          <Td className="text-right font-mono text-[11px]">{item.count}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="float-entry" style={{ '--i': 10 } as any}>
          <Card className="h-full">
            <CardHeader title="Recent Security Alerts" subtitle="Prioritized incidents requiring action" />
            <CardContent className="space-y-4">
              {filteredAlerts.slice(0, 5).map((alert: Alert) => (
                <div key={alert.id} className="group p-4 rounded-xl bg-void/40 border border-white/5 hover:border-accent/40 transition-all duration-300 shadow-l1">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-display font-medium text-white text-xs tracking-tight group-hover:text-accent transition-colors">{alert.title.toUpperCase()}</p>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono text-secondary tracking-widest">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent transition-colors" />
                  </div>
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <EmptyState
                  title="No matching alerts"
                  description="No recent alerts match the applied filter set."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="float-entry" style={{ '--i': 11 } as any}>
          <ActivityFeed events={streamEvents} />
        </div>
      </div>

      <div className="float-entry" style={{ '--i': 12 } as any}>
        <Card>
          <CardHeader title="Live Threat Stream" subtitle="Full telemetry log of active engagements" />
          <CardContent className="p-0">
            <TableContainer className="max-h-[400px]">
              <Table>
                <thead>
                  <tr>
                    <Th>TIMESTAMP</Th>
                    <Th>SOURCE_IP</Th>
                    <Th>ATTACK_VECTOR</Th>
                    <Th>TARGET_ENDPOINT</Th>
                    <Th className="text-center">SEVERITY</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreats.slice(0, 10).map((threat: Threat) => (
                    <tr key={threat.id} className="group/row">
                      <Td className="font-mono text-[11px] text-secondary">{new Date(threat.timestamp).toLocaleTimeString()}</Td>
                      <Td className="font-mono text-[11px] text-accent">{threat.sourceIp}</Td>
                      <Td className="font-mono text-[11px] text-white/80">{threat.attackType.toUpperCase()}</Td>
                      <Td className="font-mono text-[10px] text-secondary italic">{threat.endpoint}</Td>
                      <Td className="text-center">
                        <SeverityBadge severity={threat.severity} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
