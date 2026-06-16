import type {
	AgentMetadata,
	ConversationTurnMetrics,
	LlmUsage,
	TranscriptEntry,
} from '~/models/ConversationsModels';

export type WorkflowNodeLabels = Record<string, string>;
export type WorkflowNodeLabelsByAgent = Record<string, WorkflowNodeLabels>;

export interface VisibleTranscriptEntry {
	entry: TranscriptEntry;
	workflowTransition: WorkflowTransition | null;
	sourceIndex: number;
}

export interface WorkflowTransition {
	from: AgentMetadata;
	to: AgentMetadata;
}

export type FooterMetricKind = 'llm' | 'tts' | 'asr';

export interface FooterMetricItem {
	kind: FooterMetricKind;
	label: string;
	latencySeconds: number;
	modelLabel: string;
	costLabel: string;
	details?: {
		name: string;
		cost: string;
	}[];
}

export interface MessageRowComputations {
	isAgent: boolean;
	isUser: boolean;
	isSystem: boolean;
	hasMessage: boolean;
	visibleToolCalls: TranscriptEntry['tool_calls'];
	footerMetrics: FooterMetricItem[];
	hasVisibleToolCalls: boolean;
	shouldRenderMessageBubble: boolean;
}

export {
	type AgentMetadata,
	type ConversationTurnMetrics,
	type LlmUsage,
	type TranscriptEntry,
};
