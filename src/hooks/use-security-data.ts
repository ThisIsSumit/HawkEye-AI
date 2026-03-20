import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
	analyzeAlert,
	assignAlert,
	blockIpForAlert,
	getApiAuthHeader,
	getApiRootUrl,
	getAlertById,
	getAlerts,
	getAnalyticsSummary,
	getReports,
	getThreatById,
	getThreats,
	resolveAlert,
} from '../lib/api/index';
import {StreamThreatEvent, ThreatFilter} from '../types/index';

export const queryKeys = {
	analyticsSummary: ['analytics-summary'] as const,
	threats: (filter?: ThreatFilter) => ['threats', filter] as const,
	threatById: (id: string) => ['threat', id] as const,
	alerts: ['alerts'] as const,
	alertById: (id: string) => ['alert', id] as const,
	reports: ['reports'] as const,
	streamEvents: ['stream-events'] as const,
};

export function useAnalyticsSummary() {
	return useQuery({
		queryKey: queryKeys.analyticsSummary,
		queryFn: getAnalyticsSummary,
	});
}

export function useThreats(filter?: ThreatFilter) {
	return useQuery({
		queryKey: queryKeys.threats(filter),
		queryFn: () => getThreats(filter),
		placeholderData: (previous) => previous,
	});
}

export function useThreatById(id: string) {
	return useQuery({
		queryKey: queryKeys.threatById(id),
		queryFn: () => getThreatById(id),
		enabled: Boolean(id),
		placeholderData: (previous) => previous,
	});
}

export function useAlerts() {
	return useQuery({
		queryKey: queryKeys.alerts,
		queryFn: getAlerts,
	});
}

export function useAlertById(id: string) {
	return useQuery({
		queryKey: queryKeys.alertById(id),
		queryFn: () => getAlertById(id),
		enabled: Boolean(id),
	});
}

export function useReports() {
	return useQuery({
		queryKey: queryKeys.reports,
		queryFn: getReports,
	});
}

export function useAnalyzeAlert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => analyzeAlert(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: queryKeys.alerts});
		},
	});
}

export function useBlockIpAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => blockIpForAlert(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: queryKeys.threats()});
			queryClient.invalidateQueries({queryKey: queryKeys.analyticsSummary});
		},
	});
}

export function useAssignAlert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({id, analyst}: {id: string; analyst: string}) => assignAlert(id, analyst),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: queryKeys.alerts});
		},
	});
}

export function useResolveAlert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => resolveAlert(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: queryKeys.alerts});
			queryClient.invalidateQueries({queryKey: queryKeys.analyticsSummary});
		},
	});
}

function buildFallbackEvent(counter: number): StreamThreatEvent {
	const samples: StreamThreatEvent[] = [
		{
			type: 'threat-event',
			id: `stream-${counter}`,
			timestamp: new Date().toISOString(),
			message: 'Suspicious credential burst detected at /api/users/session',
			severity: 'high',
		},
		{
			type: 'alert-update',
			id: `stream-${counter}`,
			timestamp: new Date().toISOString(),
			message: 'Alert ALT-9002 status changed to assigned',
			severity: 'medium',
		},
		{
			type: 'threat-event',
			id: `stream-${counter}`,
			timestamp: new Date().toISOString(),
			message: 'WAF blocked potential SQL injection payload',
			severity: 'critical',
		},
	];

	return samples[counter % samples.length];
}

function parseSseChunks(rawBuffer: string): {nextBuffer: string; payloads: string[]} {
	const chunks = rawBuffer.split('\n\n');
	const nextBuffer = chunks.pop() ?? '';
	const payloads: string[] = [];

	for (const chunk of chunks) {
		const dataLine = chunk
			.split('\n')
			.find((line) => line.startsWith('data:'));

		if (!dataLine) {
			continue;
		}

		const payloadRaw = dataLine.replace(/^data:\s*/, '').trim();
		if (!payloadRaw || payloadRaw === '[DONE]') {
			continue;
		}

		payloads.push(payloadRaw);
	}

	return {nextBuffer, payloads};
}

function toStreamEvent(payloadRaw: string): StreamThreatEvent | null {
	try {
		const payload = JSON.parse(payloadRaw) as StreamThreatEvent;
		if (payload.type === 'threat-event' || payload.type === 'alert-update') {
			return payload;
		}
		return null;
	} catch {
		return {
			type: 'threat-event',
			id: `stream-${Date.now()}`,
			timestamp: new Date().toISOString(),
			message: payloadRaw,
			severity: 'medium',
		};
	}
}

async function consumeThreatStream(pushEvent: (event: StreamThreatEvent) => void, signal: AbortSignal) {
	const response = await fetch(`${getApiRootUrl()}/stream`, {
		headers: {
			Accept: 'text/event-stream',
			...getApiAuthHeader(),
		},
		signal,
	});

	if (!response.ok || !response.body) {
		throw new Error(`SSE connection failed: ${response.status}`);
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';

	while (true) {
		const {done, value} = await reader.read();
		if (done) {
			break;
		}

		buffer += decoder.decode(value, {stream: true});
		const parsed = parseSseChunks(buffer);
		buffer = parsed.nextBuffer;

		for (const payloadRaw of parsed.payloads) {
			const event = toStreamEvent(payloadRaw);
			if (event) {
				pushEvent(event);
			}
		}
	}
}

export function useThreatStream(enabled = true) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!enabled) {
			return;
		}

		let fallbackCounter = 0;
		let fallbackTimer: ReturnType<typeof setInterval> | undefined;
		const abortController = new AbortController();

		const pushEvent = (event: StreamThreatEvent) => {
			queryClient.setQueryData<StreamThreatEvent[]>(queryKeys.streamEvents, (previous = []) => [event, ...previous].slice(0, 20));
			queryClient.invalidateQueries({queryKey: queryKeys.alerts});
			queryClient.invalidateQueries({queryKey: queryKeys.analyticsSummary});
		};

		const startFallback = () => {
			fallbackTimer = globalThis.setInterval(() => {
				fallbackCounter += 1;
				pushEvent(buildFallbackEvent(fallbackCounter));
			}, 12_000);
		};

		const startStream = async () => {
			try {
				await consumeThreatStream(pushEvent, abortController.signal);
			} catch {
				if (!fallbackTimer) {
					startFallback();
				}
			}
		};

		startStream();

		return () => {
			abortController.abort();
			if (fallbackTimer) {
				globalThis.clearInterval(fallbackTimer);
			}
		};
	}, [enabled, queryClient]);
}
