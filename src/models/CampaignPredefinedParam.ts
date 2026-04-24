export interface CampaignPredefinedConversationConfig {
	asr: {
		quality: string;
		keywords: string[];
		provider: string;
		userInputAudioFormat: string;
	};
	tts: {
		modelId: string;
		stability: number;
		speed: number;
		similarityBoost: number;
		optimizeStreamingLatency: number;
		agentOutputAudioFormat: string;
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
