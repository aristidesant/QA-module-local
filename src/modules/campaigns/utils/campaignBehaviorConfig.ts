import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { deepMergeConfig } from '~/utils/objectUtils';

type BehaviorConversationConfig =
	| CampaignPredefinedConversationConfig
	| Partial<ConversationConfigModel>
	| null
	| undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const hasReasoningEffortSupport = (
	conversationConfig?: BehaviorConversationConfig
): boolean => {
	const prompt = conversationConfig?.agent?.prompt;

	return Boolean(
		prompt && Object.prototype.hasOwnProperty.call(prompt, 'reasoningEffort')
	);
};

const clearReasoningEffort = (
	conversationConfig: Record<string, unknown>
): Record<string, unknown> => {
	const nextConversationConfig = { ...conversationConfig };
	const agent = nextConversationConfig.agent;

	if (!isRecord(agent)) {
		return nextConversationConfig;
	}

	const nextAgent = { ...agent };
	if (!isRecord(nextAgent.prompt)) {
		return nextConversationConfig;
	}

	const nextPrompt = { ...nextAgent.prompt };
	nextPrompt.reasoningEffort = null;

	nextAgent.prompt = nextPrompt;
	nextConversationConfig.agent = nextAgent;

	return nextConversationConfig;
};

export const applyCampaignBehaviorConversationConfig = (
	currentConversationConfig: Record<string, unknown>,
	selectedConversationConfig?: BehaviorConversationConfig
): Record<string, unknown> => {
	if (!selectedConversationConfig) {
		return currentConversationConfig;
	}

	const currentAgent = isRecord(currentConversationConfig.agent)
		? currentConversationConfig.agent
		: {};
	const currentPrompt = isRecord(currentAgent.prompt)
		? currentAgent.prompt
		: {};
	const selectedPrompt = isRecord(selectedConversationConfig.agent?.prompt)
		? selectedConversationConfig.agent.prompt
		: null;

	const mergedConfig = deepMergeConfig(currentConversationConfig, {
		...(selectedConversationConfig.asr
			? {
					asr: {
						...selectedConversationConfig.asr,
					},
				}
			: {}),
		...(selectedConversationConfig.tts
			? {
					tts: {
						...selectedConversationConfig.tts,
					},
				}
			: {}),
		...(selectedConversationConfig.agent
			? {
					agent: {
						...currentAgent,
						prompt: selectedPrompt
							? {
									...currentPrompt,
									...selectedPrompt,
								}
							: currentPrompt,
					},
				}
			: {}),
	});

	return hasReasoningEffortSupport(selectedConversationConfig)
		? mergedConfig
		: clearReasoningEffort(mergedConfig);
};

export const sanitizeCampaignBehaviorConversationConfig = (
	conversationConfig: Record<string, unknown>,
	selectedConversationConfig?: BehaviorConversationConfig
): Record<string, unknown> => {
	if (!selectedConversationConfig) {
		return conversationConfig;
	}

	if (hasReasoningEffortSupport(selectedConversationConfig)) {
		return conversationConfig;
	}

	return clearReasoningEffort(conversationConfig);
};
