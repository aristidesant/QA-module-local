export interface CampaignPredefinedConversationConfig {
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
