import type { TFunction } from 'i18next';
import type { ConversationTurnMetrics, LlmUsage } from './types';
import type { FooterMetricItem, FooterMetricKind } from './types';
import type { ToolCall, ToolResult } from '~/models/ConversationsModels';

// Internal routing/plumbing tools that add no value to the reader - never
// surfaced as their own row, whether they appear at the top level or nested
// inside a workflow tool's result.
const HIDDEN_TOOL_NAMES = new Set(['transfer_to_agent']);

export function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFooterLatency(seconds: number): string {
	if (seconds < 1) {
		return `${Math.round(seconds * 1000)}ms`;
	}

	const rounded = Number(seconds.toFixed(1));
	return `${rounded}s`;
}

export function formatCurrency(value: number, t: TFunction): string {
	return `${t('currency', { ns: 'common' })}${value.toFixed(6)}`;
}

export function formatJsonDisplay(value: unknown): string | null {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return value;
		}
	}

	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

export function formatWorkflowNodeName(nodeId: string | null): string {
	if (!nodeId) return '—';
	const cleaned =
		nodeId.replace(/^node_[0-9a-f]+/i, '').replace(/^_/, '') || nodeId;
	const display = cleaned.length > 24 ? `${cleaned.slice(0, 22)}…` : cleaned;
	return display || nodeId.slice(0, 24);
}

export function getFooterMetricColor(kind: FooterMetricKind): string {
	switch (kind) {
		case 'llm':
			return 'cyan';
		case 'tts':
			return 'grape';
		case 'asr':
			return 'teal';
		case 'tool':
			return 'violet';
	}
}

export function getMetricLatency(
	metrics: ConversationTurnMetrics | null,
	preferredKey: string,
	fallbackPrefix: string
): number | null {
	const metricMap = metrics?.metrics;

	if (!metricMap) {
		return null;
	}

	const preferredMetric = metricMap[preferredKey];
	if (typeof preferredMetric?.elapsed_time === 'number') {
		return preferredMetric.elapsed_time;
	}

	for (const [key, value] of Object.entries(metricMap)) {
		if (
			key.startsWith(fallbackPrefix) &&
			typeof value?.elapsed_time === 'number'
		) {
			return value.elapsed_time;
		}
	}

	return null;
}

export function calculateModelCost(usage: {
	input: { price: number };
	output_total: { price: number };
	input_cache_read: { price: number };
	input_cache_write: { price: number };
}): number {
	return (
		usage.input.price +
		usage.output_total.price +
		usage.input_cache_read.price +
		usage.input_cache_write.price
	);
}

export function getTotalLlmCost(llmUsage: LlmUsage): number {
	return Object.values(llmUsage.model_usage || {}).reduce(
		(sum, usage) => sum + calculateModelCost(usage),
		0
	);
}

function parseResultPayload(
	result: ToolResult
): Record<string, unknown> | null {
	try {
		if (typeof result.result_value === 'string') {
			const parsed = JSON.parse(result.result_value);
			return parsed && typeof parsed === 'object' ? parsed : null;
		}
		if (result.result_value && typeof result.result_value === 'object') {
			return result.result_value as Record<string, unknown>;
		}
		if (result.result && typeof result.result === 'object') {
			return result.result as Record<string, unknown>;
		}
	} catch {
		return null;
	}
	return null;
}

export interface NestedToolResult {
	requestId?: string;
	toolName: string;
	isError: boolean;
	isBlocked: boolean;
	toolDetails: string | null;
	latencySeconds: number | null;
	raw: string | null;
}

// Workflow tool calls (e.g. "notify_condition_1_met", "progress_workflow") are
// routing wrappers - the real tool the agent invoked (e.g. "update_state",
// "transfer_to_agent") lives inside `result.steps[].results[]`, paired with its
// request config (url/method/params, etc.) in the sibling `requests[]` array.
// Surface those instead of the wrapper name when present.
export function extractNestedToolResults(
	result: ToolResult
): NestedToolResult[] {
	const payload = parseResultPayload(result);
	const steps = payload && Array.isArray(payload.steps) ? payload.steps : null;
	if (!steps) return [];

	const rows: NestedToolResult[] = [];
	for (const step of steps) {
		if (
			!step ||
			typeof step !== 'object' ||
			(step as Record<string, unknown>).type !== 'nested_tools' ||
			!Array.isArray((step as Record<string, unknown>).results)
		) {
			continue;
		}

		const requestsByRequestId = new Map<string, ToolCall>();
		const requests = (step as Record<string, unknown>).requests;
		if (Array.isArray(requests)) {
			for (const request of requests) {
				if (
					request &&
					typeof request === 'object' &&
					typeof (request as ToolCall).request_id === 'string'
				) {
					requestsByRequestId.set(
						(request as ToolCall).request_id as string,
						request as ToolCall
					);
				}
			}
		}

		for (const nested of (step as Record<string, unknown>)
			.results as unknown[]) {
			if (!nested || typeof nested !== 'object') continue;
			const nestedResult = nested as ToolResult;
			const toolName =
				typeof nestedResult.tool_name === 'string'
					? nestedResult.tool_name
					: 'unknown';
			const matchingRequest = nestedResult.request_id
				? requestsByRequestId.get(nestedResult.request_id)
				: undefined;

			rows.push({
				requestId: nestedResult.request_id,
				toolName,
				isError: Boolean(
					nestedResult.is_error || nestedResult.raw_error_message
				),
				isBlocked: Boolean(nestedResult.is_blocked),
				toolDetails: formatJsonDisplay(matchingRequest?.tool_details),
				latencySeconds:
					typeof nestedResult.tool_latency_secs === 'number'
						? nestedResult.tool_latency_secs
						: null,
				raw:
					formatJsonDisplay(nestedResult.result_value) ??
					formatJsonDisplay(nestedResult.result),
			});
		}
	}
	return rows;
}

export interface ToolDisplayRow {
	key: string;
	toolName: string;
	isError: boolean;
	isBlocked: boolean;
	hasResult: boolean;
	called: boolean;
	toolDetails: string | null;
	latencySeconds: number | null;
	raw: string | null;
}

export function buildToolDisplayRows(
	toolCalls: ToolCall[],
	toolResultsMap: Map<string, ToolResult[]>
): ToolDisplayRow[] {
	const rows: ToolDisplayRow[] = [];

	for (const tool of toolCalls) {
		const results = tool.request_id
			? (toolResultsMap.get(tool.request_id) ?? [])
			: [];

		// A workflow tool call (e.g. "notify_condition_1_met") is a routing
		// wrapper whenever its result contains a nested-tools step - detect that
		// regardless of whether every nested tool ends up hidden, so we never
		// fall back to displaying the meaningless wrapper name/result instead.
		let sawNestedStructure = false;
		const nestedRows: ToolDisplayRow[] = [];
		for (const result of results) {
			const nested = extractNestedToolResults(result);
			if (nested.length > 0) sawNestedStructure = true;
			for (const nestedResult of nested) {
				if (HIDDEN_TOOL_NAMES.has(nestedResult.toolName)) continue;
				nestedRows.push({
					key:
						nestedResult.requestId ??
						`${nestedResult.toolName}-${nestedRows.length}`,
					toolName: nestedResult.toolName,
					isError: nestedResult.isError,
					isBlocked: nestedResult.isBlocked,
					hasResult: true,
					called: true,
					toolDetails: nestedResult.toolDetails,
					latencySeconds: nestedResult.latencySeconds,
					raw: nestedResult.raw,
				});
			}
		}

		if (sawNestedStructure) {
			rows.push(...nestedRows);
			continue;
		}

		if (HIDDEN_TOOL_NAMES.has(tool.tool_name)) continue;

		const lastResult = results[results.length - 1];
		rows.push({
			key:
				tool.request_id ??
				`${tool.type}-${tool.tool_name}-${tool.params_as_json ?? ''}`,
			toolName: tool.tool_name,
			isError: results.some((r) => r.is_error || r.raw_error_message),
			isBlocked: results.some((r) => r.is_blocked),
			hasResult: results.length > 0,
			called: results.length > 0 || Boolean(tool.tool_has_been_called),
			toolDetails: formatJsonDisplay(tool.tool_details),
			latencySeconds:
				typeof lastResult?.tool_latency_secs === 'number'
					? lastResult.tool_latency_secs
					: null,
			raw: lastResult
				? (formatJsonDisplay(lastResult.result_value) ??
					formatJsonDisplay(lastResult.result))
				: null,
		});
	}

	return rows;
}

// Tool execution latency lives on the matching ToolResult (`tool_latency_secs`),
// not on the calling entry itself - build it from the already-resolved display
// rows so it can sit alongside the LLM/TTS/ASR footer chips.
export function buildToolFooterMetric(
	rows: ToolDisplayRow[],
	t: TFunction
): FooterMetricItem | null {
	const latencies = rows
		.map((row) => row.latencySeconds)
		.filter((value): value is number => typeof value === 'number');

	if (latencies.length === 0) return null;

	const totalLatencySeconds = latencies.reduce((sum, value) => sum + value, 0);

	return {
		kind: 'tool',
		label: t('transcript.footer.tool'),
		latencySeconds: totalLatencySeconds,
		modelLabel: rows.map((row) => row.toolName).join(', '),
		costLabel: t('transcript.footer.notAvailable'),
	};
}

export function extractMissionSummary(
	prompt: string | null | undefined
): string | null {
	if (!prompt?.trim()) return null;

	const validLines = prompt
		.split('\n')
		.map((line) => line.trim())
		.filter(
			(line) =>
				line.length > 0 &&
				!line.startsWith('#') &&
				!line.startsWith('---') &&
				!line.startsWith('<')
		);

	if (validLines.length === 0) return null;

	let cleanStr = validLines.join(' ');

	const dashMatch = cleanStr.match(/ — | - /);
	if (dashMatch && dashMatch.index !== undefined && dashMatch.index < 50) {
		cleanStr = cleanStr.substring(dashMatch.index + dashMatch[0].length).trim();
	}

	const sectionHeaderMatch = cleanStr.match(
		/^(Misi[oó]n|Contexto de entrada|Comportamiento base|Restricciones?)\s*/i
	);
	if (sectionHeaderMatch) {
		cleanStr = cleanStr.substring(sectionHeaderMatch[0].length).trim();
	}

	const firstDotMatch = cleanStr.match(/\.(?=\s|$)/);
	const result = firstDotMatch
		? cleanStr.substring(0, firstDotMatch.index! + 1)
		: cleanStr;

	if (result.length < 5) return null;
	if (result.length > 200) return result.slice(0, 197) + '...';

	return result;
}
