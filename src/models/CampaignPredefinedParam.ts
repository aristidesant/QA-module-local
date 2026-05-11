export interface SuggestedAudioTag {
	tag: string;
	description: string;
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
	};
}
