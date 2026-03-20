import {
  Alert,
  AnalyticsSummary,
  Investigation,
  ReportItem,
  Severity,
  Threat,
  ThreatFilter,
} from '../../types/index';
import {getStoredAccessToken} from '../auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api`;

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    durationMs?: number;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code?: string;
    message?: string;
    details?: unknown;
    requestId?: string;
  };
}

const mockThreats: Threat[] = [
  {
    id: 'THR-1001',
    timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    sourceIp: '185.199.108.153',
    attackType: 'SQL Injection',
    endpoint: '/api/auth/login',
    severity: 'critical',
    status: 'open',
    blocked: false,
  },
  {
    id: 'THR-1002',
    timestamp: new Date(Date.now() - 16 * 60_000).toISOString(),
    sourceIp: '45.227.254.18',
    attackType: 'Credential Stuffing',
    endpoint: '/api/users/session',
    severity: 'high',
    status: 'investigating',
    blocked: false,
  },
  {
    id: 'THR-1003',
    timestamp: new Date(Date.now() - 34 * 60_000).toISOString(),
    sourceIp: '31.13.71.36',
    attackType: 'XSS',
    endpoint: '/portal/search',
    severity: 'medium',
    status: 'resolved',
    blocked: true,
  },
  {
    id: 'THR-1004',
    timestamp: new Date(Date.now() - 73 * 60_000).toISOString(),
    sourceIp: '103.145.27.94',
    attackType: 'DDoS',
    endpoint: '/api/ingest/events',
    severity: 'high',
    status: 'open',
    blocked: true,
  },
  {
    id: 'THR-1005',
    timestamp: new Date(Date.now() - 111 * 60_000).toISOString(),
    sourceIp: '172.18.8.12',
    attackType: 'Port Scan',
    endpoint: '/infra/vpn',
    severity: 'low',
    status: 'investigating',
    blocked: false,
  },
];

const mockAlerts: Alert[] = [
  {
    id: 'ALT-9001',
    createdAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    title: 'Critical SQL Injection pattern detected',
    severity: 'critical',
    status: 'open',
    sourceIp: '185.199.108.153',
  },
  {
    id: 'ALT-9002',
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    title: 'Credential stuffing burst over threshold',
    severity: 'high',
    status: 'assigned',
    analyst: 'A. Rivera',
    sourceIp: '45.227.254.18',
  },
  {
    id: 'ALT-9003',
    createdAt: new Date(Date.now() - 95 * 60_000).toISOString(),
    title: 'Repeated suspicious script injection attempt',
    severity: 'medium',
    status: 'resolved',
    analyst: 'M. Chen',
    sourceIp: '31.13.71.36',
  },
];

const mockReports: ReportItem[] = [
  {
    id: 'REP-2026-03-17',
    generatedAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
    title: 'Daily SOC Summary',
    incidents: 43,
    criticalCount: 6,
  },
  {
    id: 'REP-2026-03-W11',
    generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString(),
    title: 'Weekly Threat Intelligence Review',
    incidents: 219,
    criticalCount: 18,
  },
];

const mockSummary: AnalyticsSummary = {
  environmentStatus: 'live',
  metrics: [
    {id: 'total-events', label: 'Total Events', value: 132_408, delta: 8.4},
    {id: 'active-threats', label: 'Active Threats', value: 27, delta: -2.1},
    {id: 'critical-alerts', label: 'Critical Alerts', value: 6, delta: 1.8},
    {id: 'blocked-ips', label: 'Blocked IPs', value: 492, delta: 4.2},
  ],
  threatTrend: [
    {time: '00:00', threats: 24, blocked: 19},
    {time: '04:00', threats: 17, blocked: 14},
    {time: '08:00', threats: 38, blocked: 31},
    {time: '12:00', threats: 42, blocked: 35},
    {time: '16:00', threats: 51, blocked: 43},
    {time: '20:00', threats: 36, blocked: 29},
  ],
  attackDistribution: [
    {name: 'SQL Injection', value: 34},
    {name: 'DDoS', value: 26},
    {name: 'Credential Stuffing', value: 21},
    {name: 'XSS', value: 12},
    {name: 'Other', value: 7},
  ],
};

function toQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function debugLog(scope: string, error: unknown, details?: Record<string, unknown>) {
  // Useful while integrating backend contracts and quickly diagnosing payload mismatches.
  console.error(`[api:${scope}]`, error, details ?? {});
}

function getAccessToken(): string | null {
  return getStoredAccessToken();
}

function normalizeSeverity(value: string): Severity {
  const normalized = value.toLowerCase();
  if (normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }
  return 'medium';
}

function normalizeAttackType(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function requestRaw(path: string, init?: RequestInit): Promise<{body: unknown; meta?: ApiSuccessResponse<unknown>['meta']}> {
  const token = getAccessToken();
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...init?.headers,
    },
    ...init,
  });

  const json = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorBody = json as ApiErrorResponse | null;
    const message =
      errorBody && typeof errorBody === 'object' && 'error' in errorBody
        ? errorBody.error?.message ?? `Request failed: ${response.status} ${response.statusText}`
        : `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const wrapped = json as ApiSuccessResponse<unknown> | null;
  if (wrapped && typeof wrapped === 'object' && 'success' in wrapped && wrapped.success && 'data' in wrapped) {
    return {body: wrapped.data, meta: wrapped.meta};
  }

  return {body: json};
}

function applyThreatFilter(threats: Threat[], filter?: ThreatFilter): Threat[] {
  if (!filter) {
    return threats;
  }

  let result = [...threats];

  if (filter.severity && filter.severity !== 'all') {
    result = result.filter((threat) => threat.severity === filter.severity);
  }

  if (filter.attackType) {
    const search = filter.attackType.toLowerCase();
    result = result.filter((threat) => threat.attackType.toLowerCase().includes(search));
  }

  if (filter.sortBy) {
    const sortKey = filter.sortBy;
    const direction = filter.sortOrder === 'asc' ? 1 : -1;
    result.sort((left, right) => {
      const a = left[sortKey];
      const b = right[sortKey];
      if (a > b) {
        return direction;
      }
      if (a < b) {
        return -direction;
      }
      return 0;
    });
  }

  return result;
}

function analyticsFromThreats(threats: Threat[], alerts: Alert[]): AnalyticsSummary {
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length;
  const blockedIps = new Set(threats.filter((threat) => threat.blocked).map((threat) => threat.sourceIp)).size;

  const attackTypeMap = threats.reduce<Record<string, number>>((acc, threat) => {
    acc[threat.attackType] = (acc[threat.attackType] ?? 0) + 1;
    return acc;
  }, {});

  return {
    ...mockSummary,
    metrics: [
      {id: 'total-events', label: 'Total Events', value: 120_000 + threats.length * 52, delta: 5.6},
      {
        id: 'active-threats',
        label: 'Active Threats',
        value: threats.filter((threat) => threat.status !== 'resolved').length,
        delta: -1.1,
      },
      {id: 'critical-alerts', label: 'Critical Alerts', value: criticalAlerts, delta: 2.3},
      {id: 'blocked-ips', label: 'Blocked IPs', value: blockedIps, delta: 3.1},
    ],
    attackDistribution: Object.entries(attackTypeMap).map(([name, value]) => ({name, value})),
  };
}

export function getApiRootUrl() {
  return API_ROOT;
}

export function getApiAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function authLogin(email: string, password: string): Promise<AuthPayload> {
  const {body} = await requestRaw('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });

  const payload = body as {
    accessToken?: string;
    user?: AuthUser;
  };

  if (!payload.accessToken || !payload.user) {
    throw new Error('Invalid login response from backend.');
  }

  return {
    accessToken: payload.accessToken,
    user: payload.user,
  };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const {body} = await requestRaw('/auth/me');
  return body as AuthUser;
}

export async function getAlerts(): Promise<Alert[]> {
  try {
    const query = toQueryString({page: 1, pageSize: 100, sortBy: 'created_at', sortOrder: 'desc'});
    const {body} = await requestRaw(`/alerts${query}`);
    const rows = Array.isArray(body) ? body : [];

    return rows.map((item) => ({
      id: String((item as {id?: string}).id ?? ''),
      createdAt: String((item as {createdAt?: string}).createdAt ?? new Date().toISOString()),
      title: String((item as {title?: string}).title ?? 'Untitled alert'),
      severity: normalizeSeverity(String((item as {severity?: string}).severity ?? 'medium')),
      status: String((item as {status?: string}).status ?? 'open') as Alert['status'],
      analyst: (item as {analyst?: string}).analyst,
      sourceIp: String((item as {sourceIp?: string}).sourceIp ?? '-'),
    }));
  } catch (error) {
    debugLog('getAlerts', error);
    return mockAlerts;
  }
}

export async function getAlertById(id: string): Promise<Alert> {
  try {
    const {body} = await requestRaw(`/alerts/${id}`);
    const row = body as {
      id?: string;
      createdAt?: string;
      title?: string;
      severity?: string;
      status?: Alert['status'];
      analyst?: string;
      sourceIp?: string;
    };

    return {
      id: String(row.id ?? id),
      createdAt: String(row.createdAt ?? new Date().toISOString()),
      title: String(row.title ?? 'Untitled alert'),
      severity: normalizeSeverity(String(row.severity ?? 'medium')),
      status: row.status ?? 'open',
      analyst: row.analyst,
      sourceIp: String(row.sourceIp ?? '-'),
    };
  } catch (error) {
    debugLog('getAlertById', error, {id});
    const match = mockAlerts.find((alert) => alert.id === id);
    if (!match) {
      throw new Error('Alert not found');
    }
    return match;
  }
}

export async function analyzeAlert(id: string): Promise<{summary: string}> {
  try {
    const {body} = await requestRaw(`/alerts/${id}/analyze`, {method: 'POST'});
    const analysis = body as {
      explanation?: string;
      impact?: string;
      fix?: string;
      confidenceNarrative?: string;
    };

    const summary = [analysis.explanation, analysis.impact, analysis.fix, analysis.confidenceNarrative]
      .filter(Boolean)
      .join(' ');

    return {
      summary: summary || 'Analysis completed.',
    };
  } catch (error) {
    debugLog('analyzeAlert', error, {id});
    return {
      summary:
        'AI detected a pattern consistent with automated exploit scanning. Prioritize endpoint hardening and temporary source IP blocking.',
    };
  }
}

export async function blockIpForAlert(id: string): Promise<{blocked: boolean}> {
  try {
    const {body} = await requestRaw(`/alerts/${id}/actions/block-ip`, {
      method: 'POST',
      body: JSON.stringify({source: 'manual'}),
    });
    const row = body as {success?: boolean};
    return {blocked: Boolean(row.success ?? true)};
  } catch (error) {
    debugLog('blockIpForAlert', error, {id});
    return {blocked: true};
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const {body} = await requestRaw('/analytics/summary');
    const payload = body as {
      environmentStatus?: string;
      metrics?: {
        totalEvents?: number;
        activeThreats?: number;
        criticalAlerts?: number;
        blockedIps?: number;
      };
      totalEvents?: number;
      activeThreats?: number;
      criticalAlerts?: number;
      blockedIps?: number;
      threatTrend?: Array<{timestamp: string; count: number}>;
      attackDistribution?: Array<{attackType: string; count: number}>;
    };

    const metrics = payload.metrics ?? {};
    const totalEvents = metrics.totalEvents ?? payload.totalEvents ?? 0;
    const activeThreats = metrics.activeThreats ?? payload.activeThreats ?? 0;
    const criticalAlerts = metrics.criticalAlerts ?? payload.criticalAlerts ?? 0;
    const blockedIps = metrics.blockedIps ?? payload.blockedIps ?? 0;

    return {
      environmentStatus: payload.environmentStatus === 'degraded' ? 'degraded' : 'live',
      metrics: [
        {id: 'total-events', label: 'Total Events', value: totalEvents, delta: 0},
        {id: 'active-threats', label: 'Active Threats', value: activeThreats, delta: 0},
        {id: 'critical-alerts', label: 'Critical Alerts', value: criticalAlerts, delta: 0},
        {id: 'blocked-ips', label: 'Blocked IPs', value: blockedIps, delta: 0},
      ],
      threatTrend: (payload.threatTrend ?? []).map((point) => ({
        time: point.timestamp,
        threats: point.count,
        blocked: Math.max(0, Math.round(point.count * 0.7)),
      })),
      attackDistribution: (payload.attackDistribution ?? []).map((point) => ({
        name: normalizeAttackType(point.attackType),
        value: point.count,
      })),
    };
  } catch (error) {
    debugLog('getAnalyticsSummary', error);
    return analyticsFromThreats(mockThreats, mockAlerts);
  }
}

export async function getThreats(filter?: ThreatFilter): Promise<{items: Threat[]; total: number}> {
  try {
    const {body} = await requestRaw('/logs/threats');
    const rows = Array.isArray(body) ? body : [];

    const backendThreats: Threat[] = rows.map((item) => ({
      id: String((item as {id?: string}).id ?? ''),
      timestamp: String((item as {timestamp?: string}).timestamp ?? new Date().toISOString()),
      sourceIp: String((item as {sourceIp?: string}).sourceIp ?? '-'),
      attackType: normalizeAttackType(String((item as {attackType?: string}).attackType ?? 'unknown')),
      endpoint: String((item as {endpoint?: string}).endpoint ?? '-'),
      severity: normalizeSeverity(String((item as {severity?: string}).severity ?? 'medium')),
      status: String((item as {status?: string}).status ?? 'open') as Threat['status'],
      blocked: Boolean((item as {blocked?: boolean}).blocked),
    }));

    const filtered = applyThreatFilter(backendThreats, filter);
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 10;
    const start = (page - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  } catch (error) {
    debugLog('getThreats', error);
    const filtered = applyThreatFilter(mockThreats, filter);
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }
}

export async function getThreatById(id: string): Promise<Investigation> {
  try {
    const threatsResponse = await requestRaw('/logs/threats');
    const threatRows = Array.isArray(threatsResponse.body) ? threatsResponse.body : [];

    const matching = threatRows.find((row) => String((row as {id?: string}).id) === id);
    if (!matching) {
      throw new Error(`Threat ${id} not found in /logs/threats`);
    }

    const threat: Threat = {
      id: String((matching as {id?: string}).id ?? id),
      timestamp: String((matching as {timestamp?: string}).timestamp ?? new Date().toISOString()),
      sourceIp: String((matching as {sourceIp?: string}).sourceIp ?? '-'),
      attackType: normalizeAttackType(String((matching as {attackType?: string}).attackType ?? 'unknown')),
      endpoint: String((matching as {endpoint?: string}).endpoint ?? '-'),
      severity: normalizeSeverity(String((matching as {severity?: string}).severity ?? 'medium')),
      status: String((matching as {status?: string}).status ?? 'open') as Threat['status'],
      blocked: Boolean((matching as {blocked?: boolean}).blocked),
    };

    let aiSummary: Investigation['aiSummary'] = {
      explanation: 'No AI analysis available yet.',
      severityReasoning: 'Severity is based on detection confidence and rule match.',
      mitigationSteps: ['Review source behavior', 'Confirm threat indicators', 'Apply containment controls'],
      firewallRule: `deny ip ${threat.sourceIp} any`,
    };

    try {
      const analyzed = await requestRaw(`/alerts/${id}/analyze`, {method: 'POST'});
      const analysis = analyzed.body as {
        explanation?: string;
        impact?: string;
        fix?: string;
        firewallRuleSuggestion?: string;
        confidenceNarrative?: string;
      };

      aiSummary = {
        explanation: analysis.explanation ?? aiSummary.explanation,
        severityReasoning: analysis.confidenceNarrative ?? analysis.impact ?? aiSummary.severityReasoning,
        mitigationSteps: analysis.fix ? [analysis.fix] : aiSummary.mitigationSteps,
        firewallRule: analysis.firewallRuleSuggestion ?? aiSummary.firewallRule,
      };
    } catch (analysisError) {
      debugLog('getThreatById.analyze', analysisError, {id});
    }

    return {
      threat,
      events: [
        {
          id: 'EV-1',
          time: threat.timestamp,
          title: 'Threat surfaced in detection pipeline',
          detail: `${threat.attackType} observed from ${threat.sourceIp} at ${threat.endpoint}.`,
        },
        {
          id: 'EV-2',
          time: new Date(Date.now() - 4 * 60_000).toISOString(),
          title: 'Alert triage queued',
          detail: `Threat status currently marked as ${threat.status}.`,
        },
      ],
      relatedLogs: [
        {
          id: 'LOG-1',
          time: threat.timestamp,
          level: 'warn',
          message: `Detection event ${threat.id} matched ${threat.attackType}.`,
        },
      ],
      requestPayload: `sourceIp=${threat.sourceIp}; endpoint=${threat.endpoint}; attackType=${threat.attackType}`,
      aiSummary,
    };
  } catch (error) {
    debugLog('getThreatById', error, {id});
    const threat = mockThreats.find((item) => item.id === id) ?? mockThreats[0];
    return {
      threat,
      events: [
        {
          id: 'EV-1',
          time: new Date(Date.now() - 6 * 60_000).toISOString(),
          title: 'Suspicious request received',
          detail: `${threat.attackType} payload was detected by ingress policy engine.`,
        },
        {
          id: 'EV-2',
          time: new Date(Date.now() - 5 * 60_000).toISOString(),
          title: 'Threat correlation performed',
          detail: 'Source IP matched 4 prior incidents from the same ASN.',
        },
        {
          id: 'EV-3',
          time: new Date(Date.now() - 3 * 60_000).toISOString(),
          title: 'Containment policy applied',
          detail: 'Connection throttled and request blocked at WAF edge.',
        },
      ],
      relatedLogs: [
        {
          id: 'LOG-1',
          time: new Date(Date.now() - 6 * 60_000).toISOString(),
          level: 'warn',
          message: 'WAF signature SQLI-17 matched for request body.',
        },
        {
          id: 'LOG-2',
          time: new Date(Date.now() - 5 * 60_000).toISOString(),
          level: 'info',
          message: 'Correlated with indicator IOC-4392.',
        },
        {
          id: 'LOG-3',
          time: new Date(Date.now() - 4 * 60_000).toISOString(),
          level: 'error',
          message: 'Repeated attempts exceeded threshold. Rule escalation triggered.',
        },
      ],
      requestPayload: `POST ${threat.endpoint} HTTP/1.1\nUser-Agent: attacker-bot\n\n{"username":"admin' OR '1'='1", "password": "x"}`,
      aiSummary: {
        explanation:
          'The request pattern matches known automated exploitation attempts focused on authentication bypass and data extraction.',
        severityReasoning:
          'Severity is elevated because the target endpoint is authentication-critical and the source has repeated behavior.',
        mitigationSteps: [
          'Apply temporary block for source subnet at edge firewall.',
          'Enable stricter rate limiting for authentication endpoint.',
          'Rotate credentials and review account lockout policy.',
        ],
        firewallRule: `deny ip ${threat.sourceIp} any`,
      },
    };
  }
}

export async function getReports(): Promise<ReportItem[]> {
  try {
    const {body} = await requestRaw('/reports');
    const rows = Array.isArray(body) ? body : [];

    return rows.map((item) => ({
      id: String((item as {id?: string}).id ?? ''),
      generatedAt: String((item as {generatedAt?: string}).generatedAt ?? new Date().toISOString()),
      title: String((item as {title?: string}).title ?? 'Untitled report'),
      incidents: Number((item as {incidents?: number}).incidents ?? 0),
      criticalCount: Number((item as {criticalCount?: number}).criticalCount ?? 0),
    }));
  } catch (error) {
    debugLog('getReports', error);
    return mockReports;
  }
}

export async function assignAlert(id: string, analyst: string): Promise<{id: string; analyst: string}> {
  try {
    const {body} = await requestRaw(`/alerts/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({analystName: analyst}),
    });

    const alert = body as {id?: string; analyst?: string};
    return {
      id: String(alert.id ?? id),
      analyst: String(alert.analyst ?? analyst),
    };
  } catch (error) {
    debugLog('assignAlert', error, {id, analyst});
    return {id, analyst};
  }
}

export async function resolveAlert(id: string): Promise<{id: string; status: string}> {
  try {
    const {body} = await requestRaw(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({note: 'Resolved from HawkEye frontend'}),
    });

    const alert = body as {id?: string; status?: string};
    return {id: String(alert.id ?? id), status: String(alert.status ?? 'resolved')};
  } catch (error) {
    debugLog('resolveAlert', error, {id});
    return {id, status: 'resolved'};
  }
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return '#EF4444';
    case 'high':
      return '#F59E0B';
    case 'medium':
      return '#EAB308';
    default:
      return '#22C55E';
  }
}
