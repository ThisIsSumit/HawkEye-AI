import {
	Alert,
	AnalyticsSummary,
	Investigation,
	ReportItem,
	Severity,
	Threat,
	ThreatFilter,
} from '../../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...init?.headers,
		},
		...init,
	});

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status} ${response.statusText}`);
	}

	return (await response.json()) as T;
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

export async function getAlerts(): Promise<Alert[]> {
	try {
		return await request<Alert[]>('/alerts');
	} catch {
		return mockAlerts;
	}
}

export async function getAlertById(id: string): Promise<Alert> {
	try {
		return await request<Alert>(`/alerts/${id}`);
	} catch {
		const match = mockAlerts.find((alert) => alert.id === id);
		if (!match) {
			throw new Error('Alert not found');
		}
		return match;
	}
}

export async function analyzeAlert(id: string): Promise<{summary: string}> {
	try {
		return await request<{summary: string}>(`/alerts/${id}/analyze`, {method: 'POST'});
	} catch {
		return {
			summary:
				'AI detected a pattern consistent with automated exploit scanning. Prioritize endpoint hardening and temporary source IP blocking.',
		};
	}
}

export async function blockIpForAlert(id: string): Promise<{blocked: boolean}> {
	try {
		return await request<{blocked: boolean}>(`/alerts/${id}/actions/block-ip`, {method: 'POST'});
	} catch {
		return {blocked: true};
	}
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
	try {
		return await request<AnalyticsSummary>('/analytics/summary');
	} catch {
		return analyticsFromThreats(mockThreats, mockAlerts);
	}
}

export async function getThreats(filter?: ThreatFilter): Promise<{items: Threat[]; total: number}> {
	try {
		const query = toQueryString({
			severity: filter?.severity,
			attackType: filter?.attackType,
			timeRange: filter?.timeRange,
			page: filter?.page,
			pageSize: filter?.pageSize,
			sortBy: filter?.sortBy,
			sortOrder: filter?.sortOrder,
		});
		return await request<{items: Threat[]; total: number}>(`/threats${query}`);
	} catch {
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
		return await request<Investigation>(`/threats/${id}`);
	} catch {
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
		return await request<ReportItem[]>('/reports');
	} catch {
		return mockReports;
	}
}

export async function assignAlert(id: string, analyst: string): Promise<{id: string; analyst: string}> {
	try {
		return await request<{id: string; analyst: string}>(`/alerts/${id}/assign`, {
			method: 'POST',
			body: JSON.stringify({analyst}),
		});
	} catch {
		return {id, analyst};
	}
}

export async function resolveAlert(id: string): Promise<{id: string; status: string}> {
	try {
		return await request<{id: string; status: string}>(`/alerts/${id}/resolve`, {
			method: 'POST',
		});
	} catch {
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
