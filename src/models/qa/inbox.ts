import type { ListQueryParams } from './shared';

export type InboxItemType = 'PERFORMANCE_ALERT' | 'COMPLIANCE_ALERT' | 'AUTO_FAIL_ALERT' | 'RANKING_NOTIFICATION' | 'REACTION' | 'ACHIEVEMENT' | 'TEAM_UPDATE';
export type InboxItemSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InboxItemListQueryParams extends ListQueryParams {
	agentId?: number;
	type?: InboxItemType;
	severity?: InboxItemSeverity;
	isRead?: boolean;
	sortBy?: 'id' | 'createdAt' | 'severity';
	orderBy?: 'ASC' | 'DESC';
}

export interface InboxItem {
	id: number;
	agentId: number;
	type: InboxItemType;
	severity: InboxItemSeverity;
	title: string;
	description: string;
	relatedEntityId?: number;
	relatedEntityType?: string;
	metadata?: Record<string, unknown>;
	isRead: boolean;
	readAt?: string | null;
	actionUrl?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface InboxSummary {
	agentId: number;
	totalUnread: number;
	unreadByType: Record<InboxItemType, number>;
	unreadBySeverity: Record<InboxItemSeverity, number>;
}

export interface PerformanceAlertPayload {
	agentId: number;
	metric: 'QA' | 'SENTIMENT' | 'COMPLIANCE';
	currentValue: number;
	threshold: number;
	comparison: 'BELOW' | 'ABOVE';
}

export interface ComplianceAlertPayload {
	agentId: number;
	violatedRules: string[];
	evaluationId: number;
}

export interface AutoFailAlertPayload {
	agentId: number;
	autoFailCount: number;
	campaignId: number;
	severity: 'SECTION_INVALIDATION' | 'EVALUATION_INVALIDATION';
}

export interface RankingNotificationPayload {
	agentId: number;
	rankingConfigurationId: number;
	newPosition: number;
	previousPosition?: number;
	score: number;
}

export interface ReactionNotificationPayload {
	targetAgentId: number;
	givenByAgentId: number;
	reactionType: string;
	rankingConfigurationName: string;
}

export interface AchievementNotificationPayload {
	agentId: number;
	achievementType: 'BADGE' | 'MILESTONE';
	achievementId: number;
	achievementName: string;
}

export interface TeamUpdateNotificationPayload {
	agentId: number;
	updateType: 'RANKING_CHANGE' | 'NEW_TEAM_MEMBER' | 'TEAM_MILESTONE';
	details: Record<string, unknown>;
}

export interface CreateInboxItemPayload {
	agentId: number;
	type: InboxItemType;
	severity: InboxItemSeverity;
	title: string;
	description: string;
	relatedEntityId?: number;
	relatedEntityType?: string;
	metadata?: Record<string, unknown>;
	actionUrl?: string;
}

export interface MarkInboxItemAsReadPayload {
	itemId: number;
	isRead: boolean;
}

export interface MarkAllInboxAsReadPayload {
	agentId: number;
	type?: InboxItemType;
}
