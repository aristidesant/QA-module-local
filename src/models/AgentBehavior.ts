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
	isBackup: boolean;
	behaviorType?: 'PRIMARY' | 'BACKUP';
	backupBehaviorId?: string | null;
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
	isBackup: boolean;
	behaviorType?: 'PRIMARY' | 'BACKUP';
	backupBehaviorId?: string | null;
	createdAt: string;
}

export interface AgentBehaviorCampaign {
	id: number;
	name: string;
	isUsingBackupBehavior?: boolean;
	backupSourceConfigId?: string | null;
	currentConfigId?: string | null;
	referenceType?: 'CURRENT_CONFIG' | 'BACKUP_RESTORE_SOURCE';
}

export interface AgentBehaviorDeleteCheckRule {
	rule: string;
	passed: boolean;
	message: string;
	details?: {
		campaignCount?: number;
		campaignIds?: number[];
		campaigns?: AgentBehaviorCampaign[];
		taskCount?: number;
		primaryCount?: number;
		primaryIds?: string[];
		primaries?: { id: string; name: string }[];
	};
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
	operation?: 'REPLACE' | 'REPLACE_WITH_BACKUP' | 'RESTORE_FROM_BACKUP';
	sourceConfigId?: string | null;
	targetConfigId?: string;
	totalCount: number;
	succeededCount?: number;
	failedCount?: number;
	report?: AgentBehaviorReplaceJobReport;
	errorMessage?: string | null;
}

export interface AgentBehaviorProcessPendingResponse {
	processed: number;
	skippedCount: number;
	jobs: AgentBehaviorReplaceJob[];
}

export interface AgentBehaviorContinuityCleanupRequest {
	campaignId: number;
}

export interface AgentBehaviorParams {
	conversationConfig?: CampaignPredefinedConversationConfig;
	platformSettings?: AgentBehaviorPlatformSettings;
}

export interface AgentBehaviorSaveRequest {
	name: string;
	params: AgentBehaviorParams;
	isBackup?: boolean;
	backupBehaviorId?: string | null;
}

export interface AgentBehaviorUpdateRequest {
	name?: string;
	params?: AgentBehaviorParams;
	isBackup?: boolean;
	backupBehaviorId?: string | null;
}

export interface AgentBehaviorCloneRequest {
	name?: string;
}

export interface AgentBehaviorRestoreFromBackupCheckResponse {
	canRestore: boolean;
	primaryBehaviorId: string;
	campaignCount: number;
	campaignIds: number[];
	campaigns: AgentBehaviorCampaign[];
}
