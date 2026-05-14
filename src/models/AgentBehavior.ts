import { CampaignPredefinedConversationConfig } from './CampaignPredefinedParam';

export interface AgentBehaviorPlatformSettings {
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

export interface AgentBehavior {
	id: string;
	name: string;
	params: {
		conversationConfig?: CampaignPredefinedConversationConfig;
		platformSettings?: AgentBehaviorPlatformSettings;
	};
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
}

export interface AgentBehaviorVersion {
	id: number;
	agentBehaviorId: string;
	version: number;
	name: string;
	params: {
		conversationConfig?: CampaignPredefinedConversationConfig;
		platformSettings?: AgentBehaviorPlatformSettings;
	};
	createdAt: string;
}

export interface AgentBehaviorCampaign {
	id: number;
	name: string;
}

export interface AgentBehaviorDeleteCheckRule {
	rule: string;
	passed: boolean;
	message: string;
	details?: any;
}

export interface AgentBehaviorDeleteCheckResponse {
	canDelete: boolean;
	rules: AgentBehaviorDeleteCheckRule[];
	blockingCampaigns: AgentBehaviorCampaign[];
}

export interface AgentBehaviorReplaceRequest {
	targetConfigId: string;
	campaignIds: number[];
}

export interface AgentBehaviorReplaceJobFailedItem {
	campaignId: number;
	error: string;
	cleanupRequired?: boolean;
	temporaryCampaignId?: number;
	temporaryAgentIds?: string[];
}

export interface AgentBehaviorReplaceJobReport {
	succeeded: { campaignId: number }[];
	failed: AgentBehaviorReplaceJobFailedItem[];
}

export interface AgentBehaviorReplaceJob {
	jobId: string;
	status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
	targetConfigId: string;
	totalCount: number;
	succeededCount?: number;
	failedCount?: number;
	report?: AgentBehaviorReplaceJobReport;
}

export interface AgentBehaviorProcessPendingResponse {
	processed: number;
	skippedCount: number;
	jobs: AgentBehaviorReplaceJob[];
}

export interface AgentBehaviorContinuityCleanupRequest {
	campaignId: number;
}
