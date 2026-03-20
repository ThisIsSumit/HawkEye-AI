import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Security Overview</h1>
        <p className="text-sm text-slate-500">Operational posture and live threat telemetry.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric: SummaryMetric) => (
          <KpiCard
            key={metric.id}
            label={metric.label}
            value={metric.value.toLocaleString()}
            delta={metric.delta}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Search by ID, title, attack type, endpoint, or IP"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as Severity | 'all')}>
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
            <Select value={alertStatusFilter} onValueChange={(value) => setAlertStatusFilter(value as AlertStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Alert status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All alert statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setSeverityFilter('all');
                setAlertStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Threat Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreatTrendChart data={summary.threatTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AttackDistributionChart data={summary.attackDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Attacking IPs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTopIps.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No matching IPs"
                  description="No source IP matches the current search filter."
                />
              </div>
            ) : (
              <TableContainer className="max-h-72">
                <Table className="table-sticky-header">
                  <thead>
                    <tr>
                      <Th>IP</Th>
                      <Th className="text-right">Events</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopIps.map((item) => (
                      <tr key={item.ip} className="bg-white">
                        <Td className="font-mono text-xs">{item.ip}</Td>
                        <Td className="text-right">{item.count}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAlerts.slice(0, 6).map((alert: Alert) => (
              <div key={alert.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
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

        <ActivityFeed events={streamEvents} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Threats</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TableContainer className="max-h-80">
            <Table className="table-sticky-header">
              <thead>
                <tr>
                  <Th>Timestamp</Th>
                  <Th>Source IP</Th>
                  <Th>Attack Type</Th>
                  <Th>Endpoint</Th>
                  <Th>Severity</Th>
                </tr>
              </thead>
              <tbody>
                {filteredThreats.slice(0, 8).map((threat: Threat) => (
                  <tr key={threat.id} className="bg-white">
                    <Td>{new Date(threat.timestamp).toLocaleString()}</Td>
                    <Td className="font-mono text-xs">{threat.sourceIp}</Td>
                    <Td>{threat.attackType}</Td>
                    <Td>{threat.endpoint}</Td>
                    <Td>
                      <SeverityBadge severity={threat.severity} />
                    </Td>
                  </tr>
                ))}
                {filteredThreats.length === 0 && (
                  <tr>
                    <Td colSpan={5} className="bg-white">
                      <EmptyState
                        title="No matching threats"
                        description="No threats match the current search and severity filters."
                      />
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
