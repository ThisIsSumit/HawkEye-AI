import {useMemo, useState} from 'react';
import {jsPDF} from 'jspdf';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Skeleton} from '../components/ui/skeleton';
import {useAnalyticsSummary, useReports} from '../hooks/use-security-data';

function downloadMarkdownReport(content: string, reportId: string) {
  const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${reportId}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadPdfReport(title: string, incidents: number, criticalCount: number) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(11);
  doc.text(`Total incidents: ${incidents}`, 14, 34);
  doc.text(`Critical incidents: ${criticalCount}`, 14, 42);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
  doc.save(`${title.replaceAll(' ', '-').toLowerCase()}.pdf`);
}

export function Reports() {
  const [search, setSearch] = useState('');
  const [generatedRange, setGeneratedRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [minCritical, setMinCritical] = useState('0');
  const [sortBy, setSortBy] = useState<'generated-desc' | 'generated-asc' | 'incidents-desc' | 'critical-desc'>('generated-desc');

  const reportsQuery = useReports();
  const summaryQuery = useAnalyticsSummary();
  const reports = reportsQuery.data ?? [];
  const trendData = summaryQuery.data?.threatTrend ?? [];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredReports = useMemo(() => {
    const minCriticalCount = Number(minCritical) || 0;
    const now = Date.now();
    const thresholdByRange: Record<typeof generatedRange, number> = {
      all: 0,
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    };

    const filtered = reports.filter((report) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        report.id.toLowerCase().includes(normalizedSearch) ||
        report.title.toLowerCase().includes(normalizedSearch);
      const matchesCritical = report.criticalCount >= minCriticalCount;
      const matchesRange =
        generatedRange === 'all' || new Date(report.generatedAt).getTime() >= thresholdByRange[generatedRange];
      return matchesSearch && matchesCritical && matchesRange;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'generated-desc') {
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      }
      if (sortBy === 'generated-asc') {
        return new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
      }
      if (sortBy === 'incidents-desc') {
        return b.incidents - a.incidents;
      }
      return b.criticalCount - a.criticalCount;
    });
  }, [generatedRange, minCritical, normalizedSearch, reports, sortBy]);

  if (reportsQuery.isLoading || summaryQuery.isLoading) {
    return <Skeleton className="h-125" />;
  }

  if (reportsQuery.isError || summaryQuery.isError) {
    return (
      <EmptyState
        title="Unable to load reports"
        description="Incident and analytics report data is unavailable at the moment."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Generate and download incident intelligence summaries.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              placeholder="Search report title or ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={generatedRange} onValueChange={(value) => setGeneratedRange(value as typeof generatedRange)}>
              <SelectTrigger>
                <SelectValue placeholder="Generated range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              placeholder="Min critical"
              value={minCritical}
              onChange={(event) => setMinCritical(event.target.value)}
            />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generated-desc">Newest first</SelectItem>
                <SelectItem value="generated-asc">Oldest first</SelectItem>
                <SelectItem value="incidents-desc">Most incidents</SelectItem>
                <SelectItem value="critical-desc">Most critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setGeneratedRange('all');
                setMinCritical('0');
                setSortBy('generated-desc');
              }}
            >
              Reset Filters
            </Button>
          </div>
          <p className="mt-3 text-sm text-slate-500">Showing {filteredReports.length} reports.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Generated</p>
                <p className="text-sm text-slate-700">{new Date(report.generatedAt).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Incidents</p>
                  <p className="text-lg font-semibold text-slate-900">{report.incidents}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Critical</p>
                  <p className="text-lg font-semibold text-red-600">{report.criticalCount}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() =>
                    downloadMarkdownReport(
                      `# ${report.title}\n\n- Incidents: ${report.incidents}\n- Critical: ${report.criticalCount}\n- Generated: ${new Date(
                        report.generatedAt,
                      ).toLocaleString()}`,
                      report.id,
                    )
                  }
                >
                  Download Markdown
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => downloadPdfReport(report.title, report.incidents, report.criticalCount)}
                >
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && (
          <div className="xl:col-span-3">
            <EmptyState
              title="No matching reports"
              description="No reports match the current filter criteria."
            />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attack Timeline Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="threats" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#0F172A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
