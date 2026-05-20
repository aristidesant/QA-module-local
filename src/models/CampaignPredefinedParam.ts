export interface SuggestedAudioTag {
	tag: string;
	description: string;
}

export interface CampaignPredefinedPlatformSettings {
	overrides: {
		customLlmExtraBody: boolean;
		conversationConfigOverride: {
			tts: {
				speed: boolean;
				voiceId: boolean;
				stability: boolean;
				similarityBoost: boolean;
			};
			turn: {
				softTimeoutConfig: {
					message: boolean;
				};
			};
			agent: {
				prompt: {
					llm: boolean;
					prompt: boolean;
					toolIds: boolean;
					knowledgeBase: boolean;
					nativeMcpServerIds: boolean;
				};
				language: boolean;
				firstMessage: boolean;
				maxConversationDurationMessage: boolean;
			};
			conversation: {
				textOnly: boolean;
			};
		};
		enableStartingWorkflowNodeIdFromClient: boolean;
		enableConversationInitiationClientDataFromWebhook: boolean;
	};
}

export interface CampaignPredefinedConversationConfig {
	asr: {
		quality: string;
		keywords: string[];
		provider: string;
		userInputAudioFormat: string;
	};
	tts: {
		modelId: string;
		voiceId?: string;
		supportedVoices?: Record<string, unknown>[];
		expressiveMode?: boolean;
		suggestedAudioTags?: SuggestedAudioTag[];
		stability: number;
		speed: number;
		similarityBoost: number;
		optimizeStreamingLatency: number;
		agentOutputAudioFormat: string;
		pronunciationDictionaryLocators?: string[];
	};
	agent: {
		prompt: {
			llm: string;
			reasoningEffort?: string;
			temperature: number;
		};
	};
}

export interface CampaignPredefinedParam {
	id: string;
	name: string;
	params: {
		conversationConfig?: CampaignPredefinedConversationConfig;
		platformSettings?: CampaignPredefinedPlatformSettings;
	};
	isBackup?: boolean;
	behaviorType?: 'PRIMARY' | 'BACKUP';
	backupBehaviorId?: string | null;
}
