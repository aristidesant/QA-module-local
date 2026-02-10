import type { AgentTestExample } from '~/models/AgentTestModel';
import type {
	ConversationTurn,
	DynamicVariable,
	AgentTestStudioMetadata,
} from '../../types';
import type {
	AgentTestChatMessage,
	AgentTestChatMessageRole,
} from '~/models/AgentTestModel';
import { getErrorMessage } from '~/utils/httpClient';

export const trimNonEmpty = (items: string[]): string[] =>
	items.map((item) => item.trim()).filter(Boolean);

export const toExamples = (
	items: string[],
	type: AgentTestExample['type']
): AgentTestExample[] =>
	trimNonEmpty(items).map((response) => ({
		response,
		type,
	}));

export const serializeExamples = (examples?: AgentTestExample[]): string[] =>
	(examples ?? []).map((item) => item.response);

export const normalizeDynamicVariables = (
	value: Record<string, string | number | boolean> | undefined
): DynamicVariable[] => {
	if (!value) {
		return [];
	}

	return Object.entries(value).map(([key, rowValue]) => ({
		key,
		value: String(rowValue),
	}));
};

export const sanitizeDynamicVariables = (
	rows: DynamicVariable[]
): DynamicVariable[] =>
	rows
		.map((item) => ({ key: item.key.trim(), value: item.value.trim() }))
		.filter((item) => item.key.length > 0);

export const parseConversation = (text: string): ConversationTurn[] =>
	text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const separatorIndex = line.indexOf(':');
			if (separatorIndex === -1) {
				return {
					role: 'user' as const,
					message: line,
				};
			}

			const prefix = line.slice(0, separatorIndex).trim().toLowerCase();
			const message = line.slice(separatorIndex + 1).trim();

			return {
				role: prefix === 'agent' ? ('agent' as const) : ('user' as const),
				message,
			};
		})
		.filter((turn) => turn.message.length > 0);

export const createEmptyChatHistoryMessage = (
	role: AgentTestChatMessageRole,
	timeInCallSecs = 0
): AgentTestChatMessage => ({
	role,
	agentMetadata: null,
	message: '',
	multivoiceMessage: null,
	toolCalls: [],
	toolResults: [],
	feedback: null,
	llmOverride: null,
	timeInCallSecs,
	conversationTurnMetrics: null,
	ragRetrievalInfo: null,
	llmUsage: null,
	interrupted: false,
	originalMessage: null,
	sourceMedium: null,
});

export const normalizeChatHistoryForEditor = (
	history: AgentTestChatMessage[]
): AgentTestChatMessage[] =>
	(history ?? []).map((item, index) => ({
		...createEmptyChatHistoryMessage(item.role ?? 'user', index),
		...item,
		role: item.role === 'agent' ? 'agent' : 'user',
		message: String(item.message ?? ''),
		timeInCallSecs:
			typeof item.timeInCallSecs === 'number' ? item.timeInCallSecs : index,
	}));

export const toConversationTurnsFromChatHistory = (
	history: AgentTestChatMessage[]
): ConversationTurn[] =>
	history
		.map((item) => ({
			role: item.role === 'agent' ? ('agent' as const) : ('user' as const),
			message: String(item.message ?? '').trim(),
		}))
		.filter((item) => item.message.length > 0);

export const reindexChatHistoryTime = (
	history: AgentTestChatMessage[]
): AgentTestChatMessage[] =>
	history.map((item, index) => ({
		...item,
		timeInCallSecs: index,
	}));

export const serializeConversation = (
	conversation: ConversationTurn[]
): string =>
	conversation.map((turn) => `${turn.role}: ${turn.message}`).join('\n');

export const getAxiosFriendlyError = (error: unknown, fallback: string) => {
	const message = getErrorMessage(error);
	return message === 'An unexpected error occurred' ? fallback : message;
};

export const extractStudioMetadata = (
	notes?: string
): { metadata: AgentTestStudioMetadata | null; legacyNote: string } => {
	if (!notes) {
		return { metadata: null, legacyNote: '' };
	}

	try {
		const parsed = JSON.parse(notes) as Record<string, unknown>;
		if (parsed && parsed.__studio) {
			const testTypeRaw = parsed.test_type ?? parsed.testType;
			const successExamplesRaw =
				parsed.success_examples ?? parsed.successExamples;
			const failureExamplesRaw =
				parsed.failure_examples ?? parsed.failureExamples;
			const dynamicVariablesRaw =
				parsed.dynamic_variables ?? parsed.dynamicVariables;
			const conversationRaw = parsed.conversation;
			const internalNotesRaw = parsed.internal_notes ?? parsed.internalNotes;

			return {
				metadata: {
					__studio: true,
					testType:
						testTypeRaw === 'toolInvocation' ? 'toolInvocation' : 'nextReply',
					successExamples: Array.isArray(successExamplesRaw)
						? (successExamplesRaw as string[])
						: [],
					failureExamples: Array.isArray(failureExamplesRaw)
						? (failureExamplesRaw as string[])
						: [],
					dynamicVariables: Array.isArray(dynamicVariablesRaw)
						? (dynamicVariablesRaw as DynamicVariable[])
						: [],
					conversation: Array.isArray(conversationRaw)
						? (conversationRaw as ConversationTurn[])
						: [],
					internalNotes:
						typeof internalNotesRaw === 'string' ? internalNotesRaw : '',
				},
				legacyNote: '',
			};
		}
	} catch (_error) {
		return { metadata: null, legacyNote: notes };
	}

	return { metadata: null, legacyNote: notes };
};
