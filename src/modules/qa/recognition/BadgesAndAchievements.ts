export type BadgeType =
	| 'PERFECT_QA'
	| 'CONSISTENT_PERFORMER'
	| 'RISING_STAR'
	| 'TEAM_PLAYER'
	| 'CUSTOMER_ADVOCATE'
	| 'COMPLIANCE_CHAMPION'
	| 'SENTIMENT_LEADER'
	| 'RECOGNITION_STAR';

export interface Badge {
	id: number;
	type: BadgeType;
	name: string;
	description: string;
	icon?: string;
	color?: string;
	earnedAt: Date;
	criteria?: string;
}

export interface Achievement {
	id: number;
	agentId: number;
	badge: Badge;
	earnedAt: Date;
	progress?: number; // 0-100
	milestoneDescription?: string;
}

export interface AgentAchievementsSummary {
	agentId: number;
	totalBadges: number;
	badges: Badge[];
	achievements: Achievement[];
	nextMilestone?: {
		badge: Badge;
		progress: number;
		description: string;
	};
}

export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'id' | 'earnedAt'>> = {
	PERFECT_QA: {
		type: 'PERFECT_QA',
		name: 'Perfect QA',
		description: '100% QA score for 30 consecutive days',
		icon: '⭐',
		color: '#FFD700',
		criteria: 'Maintain 100% QA score for 30 consecutive days',
	},
	CONSISTENT_PERFORMER: {
		type: 'CONSISTENT_PERFORMER',
		name: 'Consistent Performer',
		description: 'Average QA score above 90% for 60 days',
		icon: '📈',
		color: '#4ECDC4',
		criteria: 'Average QA score above 90% for 60 consecutive days',
	},
	RISING_STAR: {
		type: 'RISING_STAR',
		name: 'Rising Star',
		description: 'Improved QA score by 20+ points in 30 days',
		icon: '🚀',
		color: '#FF8C42',
		criteria: 'Improved QA score by 20+ points within 30 days',
	},
	TEAM_PLAYER: {
		type: 'TEAM_PLAYER',
		name: 'Team Player',
		description: 'Received 50+ recognition reactions',
		icon: '🤝',
		color: '#95E1D3',
		criteria: 'Received 50 peer recognition reactions',
	},
	CUSTOMER_ADVOCATE: {
		type: 'CUSTOMER_ADVOCATE',
		name: 'Customer Advocate',
		description: 'Average customer sentiment score 4.5+ for 30 days',
		icon: '💬',
		color: '#F38181',
		criteria: 'Average customer sentiment score 4.5+ (out of 5) for 30 days',
	},
	COMPLIANCE_CHAMPION: {
		type: 'COMPLIANCE_CHAMPION',
		name: 'Compliance Champion',
		description: 'Zero compliance violations for 60 days',
		icon: '✅',
		color: '#55A630',
		criteria: 'Zero compliance violations for 60 consecutive days',
	},
	SENTIMENT_LEADER: {
		type: 'SENTIMENT_LEADER',
		name: 'Sentiment Leader',
		description: 'Top 10% in team sentiment score',
		icon: '😊',
		color: '#FFE66D',
		criteria: 'Ranked in top 10% of team by average sentiment score',
	},
	RECOGNITION_STAR: {
		type: 'RECOGNITION_STAR',
		name: 'Recognition Star',
		description: 'Received "Amazing" or "Leader" reaction 25+ times',
		icon: '👑',
		color: '#FFD700',
		criteria: 'Received "Amazing" or "Leader" peer reactions 25+ times',
	},
};

export class AchievementManager {
	private achievements: Map<number, Achievement> = new Map();
	private nextId: number = 1;

	/**
	 * Award a badge to an agent
	 */
	awardBadge(agentId: number, badgeType: BadgeType): Achievement {
		const badgeDef = BADGE_DEFINITIONS[badgeType];
		const badge: Badge = {
			id: this.nextId,
			...badgeDef,
			earnedAt: new Date(),
		};

		const achievement: Achievement = {
			id: this.nextId++,
			agentId,
			badge,
			earnedAt: new Date(),
		};

		this.achievements.set(achievement.id, achievement);
		return achievement;
	}

	/**
	 * Get agent's achievement summary
	 */
	getAchievementsSummary(agentId: number): AgentAchievementsSummary {
		const agentAchievements = Array.from(this.achievements.values()).filter(
			(a) => a.agentId === agentId,
		);

		const uniqueBadges = Array.from(
			new Map(agentAchievements.map((a) => [a.badge.type, a.badge])).values(),
		);

		return {
			agentId,
			totalBadges: uniqueBadges.length,
			badges: uniqueBadges,
			achievements: agentAchievements.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime()),
			nextMilestone: undefined, // Would be populated based on criteria checks
		};
	}

	/**
	 * Check if agent has a specific badge
	 */
	hasBadge(agentId: number, badgeType: BadgeType): boolean {
		return Array.from(this.achievements.values()).some(
			(a) => a.agentId === agentId && a.badge.type === badgeType,
		);
	}

	/**
	 * Get badges earned in last N days
	 */
	getRecentAchievements(agentId: number, daysBack: number = 30): Achievement[] {
		const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
		return Array.from(this.achievements.values())
			.filter((a) => a.agentId === agentId && a.earnedAt >= cutoffDate)
			.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
	}

	/**
	 * Get platform-wide badge statistics
	 */
	getBadgeStatistics(): Record<BadgeType, number> {
		const stats: Record<BadgeType, number> = {
			PERFECT_QA: 0,
			CONSISTENT_PERFORMER: 0,
			RISING_STAR: 0,
			TEAM_PLAYER: 0,
			CUSTOMER_ADVOCATE: 0,
			COMPLIANCE_CHAMPION: 0,
			SENTIMENT_LEADER: 0,
			RECOGNITION_STAR: 0,
		};

		// Count unique agents with each badge
		this.achievements.forEach((achievement) => {
			const badgeType = achievement.badge.type;
			// Only count once per agent per badge type
			if (
				!Array.from(this.achievements.values()).some(
					(a) =>
						a.agentId === achievement.agentId &&
						a.badge.type === badgeType &&
						a.earnedAt < achievement.earnedAt,
				)
			) {
				stats[badgeType]++;
			}
		});

		return stats;
	}

	/**
	 * Get top badge earners
	 */
	getTopBadgeEarners(limit: number = 10): Array<{ agentId: number; badgeCount: number }> {
		const agentBadgeCounts = new Map<number, Set<BadgeType>>();

		Array.from(this.achievements.values()).forEach((achievement) => {
			if (!agentBadgeCounts.has(achievement.agentId)) {
				agentBadgeCounts.set(achievement.agentId, new Set());
			}
			agentBadgeCounts.get(achievement.agentId)!.add(achievement.badge.type);
		});

		return Array.from(agentBadgeCounts.entries())
			.map(([agentId, badgeTypes]) => ({
				agentId,
				badgeCount: badgeTypes.size,
			}))
			.sort((a, b) => b.badgeCount - a.badgeCount)
			.slice(0, limit);
	}
}
