import type { Voice } from "./AgentVoiceModel";

export default interface AgentListObject {
	id: string;
	name: string;
	config: AgentConfigModel;
	type: "INBOUND" | "OUTBOUND";
	status: "ACTIVE" | "INACTIVE";
	clientId: number;
	userId: number;
	language: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	voiceId: string | null;
	voice: Voice | null;
}

export type AgentUpdateModel = {
	useToolIds: boolean;
	conversationConfig: Record<string, any>;
	platformSettings: Record<string, any>;
	name: string;
	promptId: number;
	agentType: "INBOUND" | "OUTBOUND";
	voiceId?: string;
};

export interface AgentConfigModel {
	name: string;
	tags: string[];
	agentId: string;
	metadata: {
		createdAtUnixSecs: number;
	};
	phoneNumbers: string[];
	platformSettings: {
		ban: null;
		auth: {
			allowlist: any[];
			enableAuth: boolean;
		};
		safety: {
			isBlockedIvc: boolean;
			isBlockedNonIvc: boolean;
			ignoreSafetyEvaluation: boolean;
		};
		widget: {
			avatar: {
				type: string;
				color1: string;
				color2: string;
			};
			styles: Record<string, any>;
			bgColor: string;
			variant: string;
			btnColor: string;
			placement: string;
			termsHtml: string;
			termsText: string;
			textColor: string;
			expandable: string;
			focusColor: string;
			borderColor: string;
			btnTextColor: string;
			feedbackMode: string;
			textContents: Record<string, any>;
			disableBanner: boolean;
			languagePresets: Record<string, any>;
			languageSelector: boolean;
			micMutingEnabled: boolean;
			supportsTextOnly: boolean;
			textInputEnabled: boolean;
			transcriptEnabled: boolean;
			shareablePageShowTerms: boolean;
			showAvatarWhenCollapsed: boolean;
		};
	};
	privacy: {
		deleteAudio: boolean;
		recordVoice: boolean;
		retentionDays: number;
		zeroRetentionMode: boolean;
		deleteTranscriptAndPii: boolean;
		applyToExistingConversations: boolean;
	};
	overrides: Record<string, any>;
	callLimits: {
		dailyLimit: number;
		burstingEnabled: boolean;
		agentConcurrencyLimit: number;
	};
	evaluation: {
		criteria: any[];
	};
	dataCollection: Record<string, any>;
	workspaceOverrides: {
		webhooks: Record<string, any>;
	};
	conversationConfig: ConversationConfigModel;
}

export interface ConversationConfigModel {
	asr: {
		quality: string;
		keywords: string[];
		provider: string;
		userInputAudioFormat: string;
	};
	tts: {
		speed: number;
		modelId: string;
		voiceId: string;
		stability: number;
		similarityBoost: number;
		supportedVoices: any[];
		agentOutputAudioFormat: string;
		optimizeStreamingLatency: number;
		pronunciationDictionaryLocators: string[];
	};
	turn: {
		mode: string;
		turnTimeout: number;
		silenceEndCallTimeout: number;
	};
	agent: {
		prompt: {
			llm: string;
			rag: {
				enabled: boolean;
				embeddingModel: string;
				maxVectorDistance: number;
				maxDocumentsLength: number;
				maxRetrievedRagChunksCount: number;
			};
			tools: any[];
			prompt: string;
			toolIds: any[];
			maxTokens: number;
			temperature: number;
			builtInTools: Record<string, any>;
			mcpServerIds: any[];
			knowledgeBase: any[];
			nativeMcpServerIds: any[];
			ignoreDefaultPersonality: boolean;
		};
		language: string;
		first_message: string;
		dynamicVariables: {
			dynamicVariablePlaceholders: Record<string, any>;
		};
	};
	conversation: {
		textOnly: boolean;
		clientEvents: string[];
		maxDurationSeconds: number;
	};
	languagePresets: Record<string, any>;
}
