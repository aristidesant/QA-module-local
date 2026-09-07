import type { PeerRecognitionType } from '~/models/qa';

export interface ReactionGiven {
	id: number;
	givenByAgentId: number;
	givenToAgentId: number;
	reactionType: PeerRecognitionType;
	rankingEntryId: number;
	createdAt: Date;
	updatedAt?: Date;
}

export interface ReactionReceived {
	reactionType: PeerRecognitionType;
	count: number;
	givenByAgents: Array<{ id: number; name: string }>;
}

export interface AgentReactionSummary {
	agentId: number;
	agentName: string;
	totalReactionsReceived: number;
	reactions: Record<PeerRecognitionType, ReactionReceived>;
	recentReactions: ReactionGiven[];
}

export class ReactionManager {
	private reactions: Map<number, ReactionGiven> = new Map();
	private nextId: number = 1;

	/**
	 * Record a reaction from one agent to another
	 */
	addReaction(
		givenByAgentId: number,
		givenToAgentId: number,
		reactionType: PeerRecognitionType,
		rankingEntryId: number,
	): ReactionGiven {
		const reaction: ReactionGiven = {
			id: this.nextId++,
			givenByAgentId,
			givenToAgentId,
			reactionType,
			rankingEntryId,
			createdAt: new Date(),
		};
		this.reactions.set(reaction.id, reaction);
		return reaction;
	}

	/**
	 * Remove a reaction
	 */
	removeReaction(reactionId: number): boolean {
		return this.reactions.delete(reactionId);
	}

	/**
	 * Get summary of reactions received by an agent
	 */
	getReactionSummary(agentId: number, agentName: string): AgentReactionSummary {
		const receivedReactions = Array.from(this.reactions.values()).filter(
			(r) => r.givenToAgentId === agentId,
		);

		const reactionCounts: Record<PeerRecognitionType, ReactionReceived> = {
			LIKE: { reactionType: 'LIKE', count: 0, givenByAgents: [] },
			HELPFUL: { reactionType: 'HELPFUL', count: 0, givenByAgents: [] },
			INSPIRING: { reactionType: 'INSPIRING', count: 0, givenByAgents: [] },
			AMAZING: { reactionType: 'AMAZING', count: 0, givenByAgents: [] },
			LEADER: { reactionType: 'LEADER', count: 0, givenByAgents: [] },
		};

		const giverMap = new Map<string, Set<number>>();

		receivedReactions.forEach((reaction) => {
			const type = reaction.reactionType;
			reactionCounts[type].count++;

			const key = `${type}-${reaction.givenByAgentId}`;
			if (!giverMap.has(key)) {
				giverMap.set(key, new Set([reaction.givenByAgentId]));
			}
		});

		// Populate givenByAgents (simplified - in real app would fetch agent names)
		Object.values(reactionCounts).forEach((reaction) => {
			const givers = new Set<number>();
			receivedReactions
				.filter((r) => r.reactionType === reaction.reactionType)
				.forEach((r) => givers.add(r.givenByAgentId));

			reaction.givenByAgents = Array.from(givers).map((id) => ({
				id,
				name: `Agent ${id}`,
			}));
		});

		return {
			agentId,
			agentName,
			totalReactionsReceived: receivedReactions.length,
			reactions: reactionCounts,
			recentReactions: receivedReactions.slice(-5),
		};
	}

	/**
	 * Get trending reactions (most popular reaction types)
	 */
	getTrendingReactions(limit: number = 5): Array<{ type: PeerRecognitionType; count: number }> {
		const counts: Record<PeerRecognitionType, number> = {
			LIKE: 0,
			HELPFUL: 0,
			INSPIRING: 0,
			AMAZING: 0,
			LEADER: 0,
		};

		this.reactions.forEach((reaction) => {
			counts[reaction.reactionType]++;
		});

		return Object.entries(counts)
			.map(([type, count]) => ({ type: type as PeerRecognitionType, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, limit);
	}

	/**
	 * Check if agent already reacted to target in same ranking entry
	 */
	hasReacted(
		givenByAgentId: number,
		givenToAgentId: number,
		rankingEntryId: number,
	): boolean {
		return Array.from(this.reactions.values()).some(
			(r) =>
				r.givenByAgentId === givenByAgentId &&
				r.givenToAgentId === givenToAgentId &&
				r.rankingEntryId === rankingEntryId,
		);
	}

	/**
	 * Get all reactions for a ranking entry
	 */
	getReactionsForRanking(rankingEntryId: number): ReactionGiven[] {
		return Array.from(this.reactions.values()).filter(
			(r) => r.rankingEntryId === rankingEntryId,
		);
	}
}
