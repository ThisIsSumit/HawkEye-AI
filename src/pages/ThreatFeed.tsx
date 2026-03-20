import {ReactNode, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Skeleton} from '../components/ui/skeleton';
import {ThreatsTable} from '../components/tables/ThreatsTable';
import {useThreats} from '../hooks/use-security-data';
import {Threat, ThreatFilter} from '../types/index';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Threat Feed</h1>
        <p className="text-sm text-slate-500">Detected threats with filterable and paginated event records.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Severity</p>
              <Select value={severity} onValueChange={(value) => setSeverity(value as ThreatFilter['severity'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Search</p>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Threat ID, source IP, endpoint"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Attack Type</p>
              <Input
                value={attackType}
                onChange={(event) => setAttackType(event.target.value)}
                placeholder="SQL Injection"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Time Range</p>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as ThreatFilter['timeRange'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Sort</p>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [nextSortBy, nextSortOrder] = value.split('-') as [ThreatFilter['sortBy'], ThreatFilter['sortOrder']];
                    setSortBy(nextSortBy);
                    setSortOrder(nextSortOrder);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp-desc">Newest first</SelectItem>
                    <SelectItem value="timestamp-asc">Oldest first</SelectItem>
                    <SelectItem value="severity-desc">Severity high to low</SelectItem>
                    <SelectItem value="severity-asc">Severity low to high</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full"
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
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threat Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content}

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · Showing {filteredThreats.length} events
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((previous) => previous - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((previous) => previous + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
