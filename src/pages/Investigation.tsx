import {useParams} from 'react-router-dom';
import {AlertTriangle, Ban, CheckCircle2, Sparkles} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {SeverityBadge, StatusBadge} from '../components/ui/badge';
import {Skeleton} from '../components/ui/skeleton';
import {useAnalyzeAlert, useBlockIpAction, useThreatById} from '../hooks/use-security-data';

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function Investigation() {
  const {id = ''} = useParams();
  const investigationQuery = useThreatById(id);
  const analyzeMutation = useAnalyzeAlert();
  const blockIpMutation = useBlockIpAction();

  if (investigationQuery.isLoading) {
    return <Skeleton className="h-170" />;
  }

  if (investigationQuery.isError || !investigationQuery.data) {
    return (
      <EmptyState
        title="Threat investigation unavailable"
        description="The selected threat could not be loaded. Verify the threat ID or try again."
      />
    );
  }

  const data = investigationQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Threat Investigation</p>
          <h1 className="text-xl font-semibold text-slate-900">{data.threat.id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={data.threat.severity} />
          <StatusBadge className="capitalize">{data.threat.status}</StatusBadge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline of Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.events.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{timeLabel(event.time)}</p>
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-600">{event.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.relatedLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">{timeLabel(log.time)}</p>
                    <StatusBadge className="uppercase">{log.level}</StatusBadge>
                  </div>
                  <p className="text-sm text-slate-700">{log.message}</p>
                </div>
              ))}
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
