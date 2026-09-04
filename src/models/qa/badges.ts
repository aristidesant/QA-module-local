import type { Agent } from './agents';
import type { ListQueryParams } from './shared';

export interface BadgeListQueryParams extends ListQueryParams {
	clientId?: number;
	agentId?: number;
	badgeType?: string;
	sortBy?: 'id' | 'agentId' | 'badgeType' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Badge {
	id: number;
	clientId: number;
	agentId: number;
	agent?: Pick<Agent, 'id' | 'firstName' | 'lastName' | 'email'> | null;

	badgeType: string;
	badgeName: string;
	badgeDescription?: string | null;
	badgeIcon?: string | null;

	reason: string;
	earnedFromTrigger?: number | null;

	createdAt?: string;
	updatedAt?: string;
}

export interface BadgeCatalog {
	type: string;
	name: string;
	description: string;
	icon: string;
	criteria: string;
}

export interface CreateBadgePayload {
	agentId: number;
	badgeType: string;
	badgeName: string;
	badgeDescription?: string;
	badgeIcon?: string;
	reason: string;
	earnedFromTrigger?: number;
}

// Predefined badge catalogs
export const PREDEFINED_BADGE_CATALOGS: Record<string, BadgeCatalog> = {
	QA_EXCELLENCE: {
		type: 'QA_EXCELLENCE',
		name: 'QA Excellence',
		description: 'Outstanding QA performance',
		icon: '⭐',
		criteria: 'QA score > 95% for 5 consecutive evaluations',
	},
	SENTIMENT_CHAMPION: {
		type: 'SENTIMENT_CHAMPION',
		name: 'Sentiment Champion',
		description: 'Consistently positive customer sentiment',
		icon: '😊',
		criteria: 'Sentiment score > 4.5 for 3+ consecutive calls',
	},
	COMPLIANCE_GUARDIAN: {
		type: 'COMPLIANCE_GUARDIAN',
		name: 'Compliance Guardian',
		description: 'Perfect compliance record',
		icon: '🛡️',
		criteria: '0 compliance violations for 10+ calls',
	},
	STREAKER: {
		type: 'STREAKER',
		name: 'Streaker',
		description: 'Multiple high scores in a row',
		icon: '🔥',
		criteria: '5+ consecutive high-performing evaluations',
	},
	IMPROVEMENT_CHAMPION: {
		type: 'IMPROVEMENT_CHAMPION',
		name: 'Improvement Champion',
		description: 'Significant performance improvement',
		icon: '📈',
		criteria: '10% improvement in any metric within a month',
	},
	BUSINESS_DRIVER: {
		type: 'BUSINESS_DRIVER',
		name: 'Business Driver',
		description: 'Identifying business opportunities',
		icon: '💼',
		criteria: '5+ business insights identified in a month',
	},
} as const;
