import type { Voice } from './AgentVoiceModel';
import type { AgentWorkflow } from './AgentWorkflowModel';
import type { CampaignAgentWorkflowUi } from './CampaignAgentModel';
import type {
	BackupLlmConfig,
	SuggestedAudioTag,
} from './CampaignPredefinedParam';

export default interface AgentListObject {
	id: string;
	name: string;
	config: AgentConfigModel;
	versioningEnabled?: boolean;
	type: 'INBOUND' | 'OUTBOUND';
	status: 'ACTIVE' | 'INACTIVE';
	clientId: number;
	userId: number;
	language: string;
	workflowUi?: CampaignAgentWorkflowUi | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	voiceId: string | null;
	voice: Voice | null;
	outboundPhoneNumberId: number | null;
	inboundPhoneNumberId: number | null;
}

export type AgentUpdateModel = {
	useToolIds: boolean;
	conversationConfig: Record<string, any>;
	platformSettings: Record<string, any>;
	name: string;
	promptId: number;
	agentType: 'INBOUND' | 'OUTBOUND';
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
	workflow?: AgentWorkflow;
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
		voiceId?: string;
		stability: number;
		similarityBoost: number;
		supportedVoices?: Record<string, unknown>[];
		expressiveMode?: boolean;
		suggestedAudioTags?: SuggestedAudioTag[];
		agentOutputAudioFormat: string;
		optimizeStreamingLatency: number;
		pronunciationDictionaryLocators?: string[];
	};
	turn: {
		mode: string;
		turnTimeout: number;
		silenceEndCallTimeout: number;
	};
	agent: {
		prompt: {
			llm: string;
			reasoningEffort?: string;
			backupLlmConfig?: BackupLlmConfig;
			rag: {
				enabled: boolean;
				embeddingModel: string;
				maxVectorDistance: number;
				maxDocumentsLength: number;
				maxRetrievedRagChunksCount: number;
			};
			tools: SystemToolModel[];
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
		firstMessage: string;
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
	noiseCancellation?: boolean;
}

export interface SystemToolModel {
	type: string;
	name: string;
	description: string;
	responseTimeoutSecs: number;
	disableInterruptions: boolean;
	forcePreToolSpeech: boolean;
	assignments: any[];
	toolCallSound: string | null;
	toolCallSoundBehavior: string;
	params: Record<string, any>;
}

export type AgentWithCampaignListItem = Pick<
	AgentListObject,
	| 'id'
	| 'name'
	| 'status'
	| 'type'
	| 'createdAt'
	| 'updatedAt'
	| 'clientId'
	| 'voiceId'
> & {
	identifier: string;
	voiceName: string | null;
	voiceLanguage: string | null;
	voicePreviewUrl: string | null;
	campaignId: string | null;
	campaignName: string | null;
};

export type AgentWithCampaignsQueryParams = {
	name?: string;
	agentId?: string;
	agentType?: AgentWithCampaignListItem['type'];
	status?: AgentWithCampaignListItem['status'];
	page?: number;
	limit?: number;
};
