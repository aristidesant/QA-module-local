import type { ListQueryParams } from './shared';

export type PeerRecognitionType = 'LIKE' | 'HELPFUL' | 'INSPIRING' | 'AMAZING' | 'LEADER';

export interface ReactionListQueryParams extends ListQueryParams {
	rankingEntryId?: number;
	agentId?: number;
	giveByAgentId?: number;
	sortBy?: 'id' | 'rankingEntryId' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Reaction {
	id: number;
	rankingEntryId: number;
	targetAgentId: number;
	givenByAgentId: number;
	reactionType: ReactionType;
	createdAt?: string;
	updatedAt?: string;
}

export interface ReactionSummary {
	rankingEntryId: number;
	targetAgentId: number;
	like: number;
	helpful: number;
	inspiring: number;
	amazing: number;
	leader: number;
	totalReactions: number;
}

export interface CreateReactionPayload {
	rankingEntryId: number;
	targetAgentId: number;
	reactionType: ReactionType;
}

export interface ReactionConfig {
	type: ReactionType;
	label: string;
	emoji?: string;
	description?: string;
}

export const REACTION_TYPES: Record<ReactionType, ReactionConfig> = {
	LIKE: {
		type: 'LIKE',
		label: 'Like',
		emoji: '👍',
		description: 'Appreciation for good work',
	},
	HELPFUL: {
		type: 'HELPFUL',
		label: 'Helpful',
		emoji: '🙌',
		description: 'This was really helpful',
	},
	INSPIRING: {
		type: 'INSPIRING',
		label: 'Inspiring',
		emoji: '✨',
		description: 'This inspired me',
	},
	AMAZING: {
		type: 'AMAZING',
		label: 'Amazing',
		emoji: '🚀',
		description: 'This is amazing work',
	},
	LEADER: {
		type: 'LEADER',
		label: 'Leader',
		emoji: '👑',
		description: 'Leadership example',
	},
};
