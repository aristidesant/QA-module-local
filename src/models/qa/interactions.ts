import type { ListQueryParams } from './shared';

export type ReactionType = 'LIKE' | 'CLAP' | 'CELEBRATE' | 'LOVE' | 'AWESOME' | 'INSIGHTFUL';

export interface InteractionListQueryParams extends ListQueryParams {
	clientId?: number;
	recipientAgentId?: number;
	reactionType?: ReactionType;
	sortBy?: 'id' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Interaction {
	id: number;
	clientId: number;

	// Who reacts and to whom
	createdByUserId: number;
	recipientUserId?: number | null;
	recipientAgentId?: number | null;

	// Reaction details
	reactionType: ReactionType;
	comment?: string | null;

	// Context
	referenceType?: string | null;
	referenceId?: number | null;

	createdAt?: string;
	updatedAt?: string;
}

export interface InteractionSummary {
	agentId: number;
	reactions: Record<ReactionType, number>;
	totalReactions: number;
	lastReactionAt?: string | null;
}

export interface InteractionDetail extends Interaction {
	createdByUserName?: string | null;
	createdByUserEmail?: string | null;
}

export interface CreateInteractionPayload {
	recipientAgentId?: number;
	recipientUserId?: number;
	reactionType: ReactionType;
	comment?: string;
	referenceType?: string;
	referenceId?: number;
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
	LIKE: '👍',
	CLAP: '👏',
	CELEBRATE: '🎉',
	LOVE: '❤️',
	AWESOME: '⚡',
	INSIGHTFUL: '💡',
} as const;
