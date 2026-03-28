import {useMemo, useState} from 'react';
import {jsPDF} from 'jspdf';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader} from '../components/ui/card';
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
    <div className="space-y-10 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-xs shadow-l1">
              REP_GEN
           </div>
           <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em]">Intelligence_Archive // Global_Audit</p>
        </div>
        <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Intelligence_Reports
        </h1>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Archive Query" subtitle="Filter parameters for tactical intelligence retrieval" />
          <CardContent>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Signal_Search</p>
                <Input
                  className="bg-void/50 border-white/5 font-mono text-[10px]"
                  placeholder="TITLE_ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Temporal_Arc</p>
                <Select value={generatedRange} onValueChange={(value) => setGeneratedRange(value as typeof generatedRange)}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase">
                    <SelectValue placeholder="GENERATED" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="all">ALL_TIME</SelectItem>
                    <SelectItem value="24h">T-24 HRS</SelectItem>
                    <SelectItem value="7d">T-07 DAYS</SelectItem>
                    <SelectItem value="30d">T-30 DAYS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Critical_Floor</p>
                <Input
                  className="bg-void/50 border-white/5 font-mono text-[10px]"
                  type="number"
                  min={0}
                  placeholder="MIN_CRIT..."
                  value={minCritical}
                  onChange={(event) => setMinCritical(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Sort_Order</p>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase">
                    <SelectValue placeholder="ORDER" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="generated-desc">NEWEST_GEN</SelectItem>
                    <SelectItem value="generated-asc">OLDEST_GEN</SelectItem>
                    <SelectItem value="incidents-desc">MAX_INC</SelectItem>
                    <SelectItem value="critical-desc">MAX_CRIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end pb-0.5">
                <Button
                  variant="secondary"
                  className="w-full text-[10px] font-mono shadow-l1"
                  onClick={() => {
                    setSearch('');
                    setGeneratedRange('all');
                    setMinCritical('0');
                    setSortBy('generated-desc');
                  }}
                >
                  HALT_FILTERS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 float-entry" style={{ '--i': 3 } as any}>
        {filteredReports.map((report, idx) => (
          <Card key={report.id} className="group hover:bg-surface/40 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 font-mono text-[40px] font-black -mr-2 -mt-2 group-hover:opacity-30 transition-opacity italic">
              0{idx + 1}
            </div>
            <CardHeader title={report.title} subtitle={`ID: ${report.id.slice(0, 8)}...`} />
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">TS_Generated</p>
                  <p className="text-[11px] font-mono text-white/80">{new Date(report.generatedAt).toLocaleString()}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-void/50 border border-white/5 p-4 shadow-l1 relative">
                  <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest mb-1">Incidents</p>
                  <p className="text-2xl font-display font-black text-white italic">{report.incidents}</p>
                  <div className="absolute bottom-1 right-2 w-1 h-3 bg-white/5" />
                </div>
                <div className="rounded-xl bg-void/50 border border-white/5 p-4 shadow-l1 relative overflow-hidden group-hover:border-danger/30 transition-colors">
                  <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest mb-1 text-danger/70">Critical</p>
                  <p className="text-2xl font-display font-black text-danger italic">{report.criticalCount}</p>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-danger/5 blur-xl group-hover:bg-danger/10 transition-colors" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-[10px] font-mono h-10"
                  onClick={() =>
                    downloadMarkdownReport(
                      `# ${report.title}\n\n- Incidents: ${report.incidents}\n- Critical: ${report.criticalCount}\n- Generated: ${new Date(
                        report.generatedAt,
                      ).toLocaleString()}`,
                      report.id,
                    )
                  }
                >
                  EXP_MD
                </Button>
                <Button
                  className="flex-1 text-[10px] font-mono h-10 shadow-l2"
                  onClick={() => downloadPdfReport(report.title, report.incidents, report.criticalCount)}
                >
                  EXP_PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && (
          <div className="xl:col-span-3">
            <EmptyState
              title="No matching records"
              description="The intelligence archive returned null for the current query."
            />
          </div>
        )}
      </div>

      <div className="float-entry" style={{ '--i': 4 } as any}>
        <Card>
          <CardHeader title="Attack Timeline Analytics" subtitle="Decomposed temporal distribution of security events" />
          <CardContent>
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(13, 20, 32, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="threats" fill="url(#barGradientPrimary)" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="blocked" fill="url(#barGradientSecondary)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute top-4 right-6 flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-accent/60" />
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">Threats</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-white/10" />
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">Blocked</p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
