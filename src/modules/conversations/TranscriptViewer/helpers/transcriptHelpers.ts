import type { TFunction } from 'i18next';
import type {
	AgentMetadata,
	TranscriptEntry,
} from '~/models/ConversationsModels';
import type { FooterMetricItem, VisibleTranscriptEntry } from './types';
import {
	formatCurrency,
	getMetricLatency,
	getTotalLlmCost,
	calculateModelCost,
	formatWorkflowNodeName,
} from './formatUtils';

export function isAgentRole(role: string): boolean {
	return role.toLowerCase() === 'agent';
}

export function isUserRole(role: string): boolean {
	const normalized = role.toLowerCase();
	return normalized === 'user' || normalized === 'human';
}

export function findPreviousAgentMetadata(
	entries: TranscriptEntry[],
	currentIndex: number
): AgentMetadata | null {
	for (let index = currentIndex - 1; index >= 0; index -= 1) {
		const metadata = sanitizeAgentMetadata(entries[index].agent_metadata);
		if (metadata) {
			return metadata;
		}
	}

	return null;
}

export function sanitizeAgentMetadata(
	metadata?: AgentMetadata
): AgentMetadata | null {
	if (!metadata) {
		return null;
	}

	const normalized: AgentMetadata = {
		agent_id: metadata.agent_id ?? '',
		branch_id: metadata.branch_id ?? null,
		workflow_node_id: metadata.workflow_node_id ?? null,
	};

	return normalized.agent_id ||
		normalized.branch_id ||
		normalized.workflow_node_id
		? normalized
		: null;
}

export function buildTranscriptClipboardText(
	entries: TranscriptEntry[],
	nodeLabels?: Record<string, string>
): string {
	const lines: string[] = [];

	for (const entry of entries) {
		const message = entry.message?.trim();
		if (!message) continue;

		if (isAgentRole(entry.role)) {
			const metadata = sanitizeAgentMetadata(entry.agent_metadata);
			const nodeId = metadata?.workflow_node_id ?? null;
			const nodeName =
				(nodeId && nodeLabels?.[nodeId]) ?? formatWorkflowNodeName(nodeId);
			const agentId = metadata?.agent_id ?? '—';

			lines.push(`agent>${nodeName}>${agentId}:`);
			lines.push(message);
			lines.push('');
			continue;
		}

		if (isUserRole(entry.role)) {
			lines.push('Customer:');
			lines.push(message);
			lines.push('');
			continue;
		}
	}

	return lines.join('\n').trimEnd();
}

export function hasAgentContextChanged(
	previous: AgentMetadata,
	current: AgentMetadata
): boolean {
	return (
		previous.agent_id !== current.agent_id ||
		(previous.branch_id ?? null) !== (current.branch_id ?? null) ||
		(previous.workflow_node_id ?? null) !== (current.workflow_node_id ?? null)
	);
}

export function findActiveEntryIndex(
	visibleEntries: VisibleTranscriptEntry[],
	audioCurrentTime: number
): number {
	if (audioCurrentTime < 0) return -1;

	let lo = 0;
	let hi = visibleEntries.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >>> 1;
		if (visibleEntries[mid].entry.time_in_call_secs <= audioCurrentTime) {
			lo = mid + 1;
		} else {
			hi = mid - 1;
		}
	}
	return hi >= 0 ? hi : -1;
}

export function buildFooterMetrics(
	entry: TranscriptEntry,
	isAgent: boolean,
	t: TFunction
): FooterMetricItem[] {
	const items: FooterMetricItem[] = [];

	if (isAgent) {
		const llmMetric = buildLlmFooterMetric(entry, t);
		if (llmMetric) {
			items.push(llmMetric);
		}

		const ttsMetric = buildSpeechFooterMetric(
			'tts',
			entry.conversation_turn_metrics,
			t
		);
		if (ttsMetric) {
			items.push(ttsMetric);
		}

		return items;
	}

	const asrMetric = buildSpeechFooterMetric(
		'asr',
		entry.conversation_turn_metrics,
		t
	);
	if (asrMetric) {
		items.push(asrMetric);
	}

	return items;
}

function buildLlmFooterMetric(
	entry: TranscriptEntry,
	t: TFunction
): FooterMetricItem | null {
	const llmUsage = entry.llm_usage;
	const latencySeconds = getMetricLatency(
		entry.conversation_turn_metrics,
		'convai_llm_service_ttfb',
		'convai_llm_'
	);

	if (!llmUsage || latencySeconds === null) {
		return null;
	}

	const modelEntries = Object.entries(llmUsage.model_usage || {});
	const primaryModelName =
		entry.llm_override ??
		entry.conversation_turn_metrics?.convai_llm_model ??
		modelEntries[0]?.[0] ??
		t('transcript.footer.unknownModel');

	return {
		kind: 'llm',
		label: entry.llm_override
			? t('transcript.footer.override')
			: t('transcript.footer.llm'),
		latencySeconds,
		modelLabel: primaryModelName,
		costLabel: formatCurrency(getTotalLlmCost(llmUsage), t),
		details: modelEntries.map(([name, usage]) => ({
			name,
			cost: formatCurrency(calculateModelCost(usage), t),
		})),
	};
}

function buildSpeechFooterMetric(
	kind: 'tts' | 'asr',
	metrics: TranscriptEntry['conversation_turn_metrics'],
	t: TFunction
): FooterMetricItem | null {
	const config =
		kind === 'tts'
			? {
					metricKey: 'convai_tts_service_ttfb',
					prefix: 'convai_tts_',
					label: t('transcript.footer.tts'),
					modelLabel:
						metrics?.convai_tts_model ?? t('transcript.footer.unknownModel'),
				}
			: {
					metricKey: 'convai_asr_trailing_service_latency',
					prefix: 'convai_asr_',
					label: t('transcript.footer.asr'),
					modelLabel:
						metrics?.convai_asr_provider ??
						t('transcript.footer.unknownProvider'),
				};

	const latencySeconds = getMetricLatency(
		metrics,
		config.metricKey,
		config.prefix
	);

	if (latencySeconds === null) {
		return null;
	}

	return {
		kind,
		label: config.label,
		latencySeconds,
		modelLabel: config.modelLabel,
		costLabel: t('transcript.footer.notAvailable'),
	};
}
