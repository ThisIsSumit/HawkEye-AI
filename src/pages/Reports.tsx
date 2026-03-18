import {jsPDF} from 'jspdf';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
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
  const reportsQuery = useReports();
  const summaryQuery = useAnalyticsSummary();

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

  if (!reportsQuery.data || !summaryQuery.data) {
    return <Skeleton className="h-125" />;
  }

  const reports = reportsQuery.data;
  const trendData = summaryQuery.data.threatTrend;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Generate and download incident intelligence summaries.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {reports.map((report) => (
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
