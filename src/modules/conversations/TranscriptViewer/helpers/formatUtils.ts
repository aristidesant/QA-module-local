import type { TFunction } from 'i18next';
import type { ConversationTurnMetrics, LlmUsage } from './types';
import type { FooterMetricKind } from './types';

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
