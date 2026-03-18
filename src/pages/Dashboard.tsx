import {useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {KpiCard} from '../components/cards/KpiCard';
import {AttackDistributionChart} from '../components/charts/AttackDistributionChart';
import {ThreatTrendChart} from '../components/charts/ThreatTrendChart';
import {ActivityFeed} from '../components/alerts/ActivityFeed';
import {SeverityBadge} from '../components/ui/badge';
import {EmptyState} from '../components/ui/empty-state';
import {Skeleton} from '../components/ui/skeleton';
import {Table, TableContainer, Td, Th} from '../components/ui/table';
import {useAlerts, useAnalyticsSummary, useThreats} from '../hooks/use-security-data';
import {useQueryClient} from '@tanstack/react-query';
import {Alert, StreamThreatEvent, SummaryMetric, Threat} from '../types/index';

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
            {topIps.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No attackers found"
                  description="No source IPs were detected in the selected time window."
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
                    {topIps.map((item) => (
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
            {alerts.slice(0, 6).map((alert: Alert) => (
              <div key={alert.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            ))}
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
                {threats.slice(0, 8).map((threat: Threat) => (
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
              </tbody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
