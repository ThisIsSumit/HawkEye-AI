import {ReactNode, useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
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

  const alertsQuery = useAlerts();
  const assignMutation = useAssignAlert();
  const resolveMutation = useResolveAlert();

  const filtered = useMemo(() => {
    const items = alertsQuery.data ?? [];
    return items.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.id.toLowerCase().includes(search.toLowerCase()) ||
        alert.sourceIp.includes(search);
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alertsQuery.data, search, severityFilter, statusFilter]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
        <p className="text-sm text-slate-500">Review, assign, and resolve operational alerts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search alert title, ID, or source IP"
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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
