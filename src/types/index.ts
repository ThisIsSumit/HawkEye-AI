export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ThreatStatus = 'open' | 'investigating' | 'resolved';
export type AlertStatus = 'open' | 'assigned' | 'resolved';
export type EnvironmentStatus = 'live' | 'degraded';

export interface SummaryMetric {
  id: 'total-events' | 'active-threats' | 'critical-alerts' | 'blocked-ips';
  label: string;
  value: number;
  delta: number;
}

export interface Threat {
  id: string;
  timestamp: string;
  sourceIp: string;
  attackType: string;
  endpoint: string;
  severity: Severity;
  status: ThreatStatus;
  blocked: boolean;
}

export interface ThreatLog {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface ThreatEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface Investigation {
  threat: Threat;
  events: ThreatEvent[];
  relatedLogs: ThreatLog[];
  requestPayload: string;
  aiSummary: {
    explanation: string;
    severityReasoning: string;
    mitigationSteps: string[];
    firewallRule: string;
  };
}

export interface Alert {
  id: string;
  createdAt: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  analyst?: string;
  sourceIp: string;
}

export interface TimePoint {
  time: string;
  threats: number;
  blocked: number;
}

export interface AttackDistributionPoint {
  name: string;
  value: number;
}

export interface AnalyticsSummary {
  environmentStatus: EnvironmentStatus;
  metrics: SummaryMetric[];
  threatTrend: TimePoint[];
  attackDistribution: AttackDistributionPoint[];
}

export interface ReportItem {
  id: string;
  generatedAt: string;
  title: string;
  incidents: number;
  criticalCount: number;
}

export interface StreamThreatEvent {
  type: 'threat-event' | 'alert-update';
  id: string;
  timestamp: string;
  message: string;
  severity: Severity;
}

export interface ThreatFilter {
  severity?: Severity | 'all';
  attackType?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  page?: number;
  pageSize?: number;
  sortBy?: keyof Threat;
  sortOrder?: 'asc' | 'desc';
}
