import type { RankingProgram } from '~/models/qa/rankingPrograms';
import type { UserReactionType } from '~/modules/qa/agent/rankings/types/leaderboard';
import { UserReactionType as Reaction } from '~/modules/qa/agent/rankings/types/leaderboard';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';

/**
 * Seeded ranking programs. Only one program per team is active at a time: Team 1
 * has RP-001 running while RP-004 and the permanent default RP-006 wait, so
 * ending RP-001 (or switching programs) shows the fallback in action.
 */
export const RANKING_PROGRAMS_SEED: RankingProgram[] = [
	{
		id: 'RP-001',
		name: 'September QA Sprint',
		description:
			'Highest QA score of the month wins. Minimum ten evaluated calls to qualify.',
		teams: ['Team 1'],
		metrics: [{ metricId: 'QA_OVERALL_SCORE', weight: 100 }],
		targetScore: 90,
		minCalls: 10,
		startDate: '2026-09-01',
		endDate: '2026-09-30',
		isDefault: false,
		prize: {
			kind: 'GIFT_CARD',
			title: '$100 gift card',
			description: 'Redeemable at any of the partner stores.',
			icon: '🎁',
		},
		milestones: [
			{ id: 'RPM-001', label: 'Solid', threshold: 85, badgeId: 'BDG-006' },
			{ id: 'RPM-002', label: 'Excellent', threshold: 90, badgeId: 'BDG-009' },
		],
		winnerBadgeId: 'BDG-001',
		allowReactions: true,
		status: 'active',
		winnerId: null,
		winnerName: null,
		createdBy: SUPERVISOR_PERSONA.name,
		createdByRole: 'SUPERVISOR',
		createdAt: '2026-08-28T10:00:00Z',
		updatedAt: '2026-08-28T10:00:00Z',
	},
	{
		id: 'RP-002',
		name: 'Compliance Champions Q3',
		description:
			'Cross-team compliance push for the quarter. Fifteen calls minimum.',
		teams: ['Team 2', 'Team 3'],
		metrics: [{ metricId: 'COMPLIANCE_OVERALL_SCORE', weight: 100 }],
		targetScore: 95,
		minCalls: 15,
		startDate: '2026-07-01',
		endDate: '2026-09-30',
		isDefault: false,
		prize: {
			kind: 'RECOGNITION',
			title: 'Wall of fame + lunch with leadership',
			description: 'Featured on the quarterly all-hands.',
			icon: '🏆',
		},
		milestones: [
			{ id: 'RPM-003', label: 'Guardian', threshold: 92, badgeId: 'BDG-010' },
		],
		winnerBadgeId: 'BDG-002',
		allowReactions: true,
		status: 'active',
		winnerId: null,
		winnerName: null,
		createdBy: QA_MANAGER_PERSONA.name,
		createdByRole: 'QA_MANAGER',
		createdAt: '2026-06-25T09:00:00Z',
		updatedAt: '2026-06-25T09:00:00Z',
	},
	{
		id: 'RP-003',
		name: 'August Sentiment Cup',
		description: 'Best customer sentiment across the month.',
		teams: ['Team 1'],
		metrics: [{ metricId: 'CUSTOMER_SENTIMENT_SCORE', weight: 100 }],
		targetScore: 4.2,
		minCalls: 10,
		startDate: '2026-08-01',
		endDate: '2026-08-31',
		isDefault: false,
		prize: {
			kind: 'TIME_OFF',
			title: 'One extra day off',
			description: 'To be taken within the following quarter.',
			icon: '🌴',
		},
		milestones: [
			{
				id: 'RPM-004',
				label: 'Mood booster',
				threshold: 4.0,
				badgeId: 'BDG-004',
			},
		],
		winnerBadgeId: 'BDG-003',
		allowReactions: true,
		status: 'completed',
		// Filled by the store on load so the winner always matches the real data.
		winnerId: null,
		winnerName: null,
		createdBy: SUPERVISOR_PERSONA.name,
		createdByRole: 'SUPERVISOR',
		createdAt: '2026-07-28T10:00:00Z',
		updatedAt: '2026-09-01T08:00:00Z',
	},
	{
		id: 'RP-004',
		name: 'October Sales Push',
		description: 'Lowest non-conversion rate of the month takes the bonus.',
		teams: ['Team 1'],
		metrics: [{ metricId: 'BI_NON_CONVERSION_RATE', weight: 100 }],
		targetScore: 70,
		minCalls: 10,
		startDate: '2026-10-01',
		endDate: '2026-10-31',
		isDefault: false,
		prize: {
			kind: 'BONUS',
			title: '$250 bonus',
			description: 'Paid with the November payroll.',
			icon: '💰',
		},
		milestones: [
			{ id: 'RPM-005', label: 'Closer', threshold: 75, badgeId: 'BDG-005' },
		],
		winnerBadgeId: null,
		allowReactions: true,
		status: 'inactive',
		winnerId: null,
		winnerName: null,
		createdBy: SUPERVISOR_PERSONA.name,
		createdByRole: 'SUPERVISOR',
		createdAt: NOW_ISO,
		updatedAt: NOW_ISO,
	},
	{
		id: 'RP-005',
		name: 'Q4 Compliance Marathon',
		description:
			'Draft for a quarter-long ranking across all teams that mixes compliance with AHT and call volume.',
		teams: ['Team 1', 'Team 2', 'Team 3'],
		metrics: [
			{ metricId: 'COMPLIANCE_OVERALL_SCORE', weight: 50 },
			{ metricId: 'OPS_AHT_SECONDS', weight: 25 },
			{ metricId: 'OPS_CALLS_HANDLED', weight: 25 },
		],
		targetScore: 80,
		minCalls: 20,
		startDate: '2026-10-01',
		endDate: '2026-12-31',
		isDefault: false,
		prize: {
			kind: 'GIFT_CARD',
			title: 'Team dinner',
			description: 'For the winning agent and their team.',
			icon: '🎉',
		},
		milestones: [],
		winnerBadgeId: null,
		allowReactions: true,
		status: 'draft',
		winnerId: null,
		winnerName: null,
		createdBy: QA_MANAGER_PERSONA.name,
		createdByRole: 'QA_MANAGER',
		createdAt: NOW_ISO,
		updatedAt: NOW_ISO,
	},
	{
		id: 'RP-006',
		name: 'Team 1 Performance Index',
		description:
			'Always-on ranking that blends quality, compliance, customer sentiment and positive outcomes. It takes over whenever a dated ranking ends.',
		teams: ['Team 1'],
		metrics: [
			{ metricId: 'QA_OVERALL_SCORE', weight: 40 },
			{ metricId: 'COMPLIANCE_OVERALL_SCORE', weight: 25 },
			{ metricId: 'CUSTOMER_SENTIMENT_SCORE', weight: 20 },
			{ metricId: 'OPS_POSITIVE_OUTCOME_RATE', weight: 15 },
		],
		targetScore: 75,
		minCalls: 10,
		startDate: '2026-06-01',
		endDate: null,
		isDefault: true,
		prize: {
			kind: 'RECOGNITION',
			title: 'Monthly shout-out',
			description: 'The leader of each month is featured in the team meeting.',
			icon: '🌟',
		},
		milestones: [
			{ id: 'RPM-006', label: 'Rising', threshold: 65, badgeId: 'BDG-006' },
			{
				id: 'RPM-007',
				label: 'Top performer',
				threshold: 75,
				badgeId: 'BDG-009',
			},
		],
		winnerBadgeId: null,
		allowReactions: true,
		status: 'inactive',
		winnerId: null,
		winnerName: null,
		createdBy: SUPERVISOR_PERSONA.name,
		createdByRole: 'SUPERVISOR',
		createdAt: '2026-05-28T10:00:00Z',
		updatedAt: '2026-05-28T10:00:00Z',
	},
];

/** Peer reactions the agent leaderboard starts with, per program. */
/**
 * Peer reactions per ranking: target agent → the teammate who reacted → emoji.
 * Seeded so the leaderboard shows social proof before anyone clicks.
 */
export const REACTIONS_SEED: Record<
	string,
	Record<string, Record<string, UserReactionType>>
> = {
	'RP-001': {
		'AGT-001': {
			'AGT-002': Reaction.FIRE,
			'AGT-003': Reaction.CLAPPING_HANDS,
			'AGT-005': Reaction.THUMBS_UP,
			'AGT-007': Reaction.HEART,
		},
		'AGT-002': {
			'AGT-001': Reaction.THUMBS_UP,
			'AGT-003': Reaction.THUMBS_UP,
			'AGT-006': Reaction.FIRE,
		},
		'AGT-003': {
			'AGT-004': Reaction.CLAPPING_HANDS,
			'AGT-005': Reaction.CLAPPING_HANDS,
		},
		'AGT-007': {
			'AGT-001': Reaction.HEART,
		},
		'AGT-004': {
			'AGT-002': Reaction.THUMBS_UP,
			'AGT-007': Reaction.FIRE,
		},
	},
};
