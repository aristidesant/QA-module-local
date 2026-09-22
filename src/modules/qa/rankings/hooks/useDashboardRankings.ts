import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import type {
	RankingEntry,
	RankingGoal,
	ReactionCounts,
} from '~/modules/qa/dashboard/components/RankingsTable';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import {
	useRankingsStore,
	selectPrograms,
	selectReactions,
} from '~/stores/qa/rankingsStore';
import { UserReactionType } from '~/modules/qa/agent/rankings/types/leaderboard';
import { computeStandings, formatTarget } from '../helpers';

/** Which program the widget should follow. */
export type DashboardRankingScope = 'Team 1' | 'all';

interface UseDashboardRankingsResult {
	program: RankingProgram | null;
	entries: RankingEntry[];
	goal: RankingGoal | undefined;
	/** The highlighted agent's own rank, when they have one — regardless of maxEntries. */
	myPosition: { rank: number; total: number } | null;
}

/** The leaderboard's emoji reactions mapped onto the widget's own taxonomy. */
const REACTION_BUCKET: Record<UserReactionType, keyof ReactionCounts> = {
	[UserReactionType.THUMBS_UP]: 'LIKE',
	[UserReactionType.CLAPPING_HANDS]: 'HELPFUL',
	[UserReactionType.HEART]: 'INSPIRING',
	[UserReactionType.FIRE]: 'AMAZING',
};

const emptyReactions = (): ReactionCounts => ({
	LIKE: 0,
	HELPFUL: 0,
	INSPIRING: 0,
	AMAZING: 0,
	LEADER: 0,
});

/**
 * Top of the active ranking, shaped for the dashboard `RankingsTable` widget so
 * every dashboard shows the same standings as the Team Rankings pages.
 */
export const useDashboardRankings = (
	scope: DashboardRankingScope,
	maxEntries = 5,
	/** When given, myPosition reports this agent's own rank even if it falls outside maxEntries. */
	highlightAgentId?: string
): UseDashboardRankingsResult => {
	const { t } = useTranslation('qa.rankings');
	const programs = useRankingsStore(selectPrograms);
	const reactions = useRankingsStore(selectReactions);

	return useMemo(() => {
		const program =
			programs.find(
				(candidate) =>
					candidate.status === 'active' &&
					(scope === 'all' || candidate.teams.includes(scope))
			) ?? null;

		if (!program) {
			return { program: null, entries: [], goal: undefined, myPosition: null };
		}

		const standings = computeStandings(program, TEAM_CALLS);
		const ranked = standings.filter((standing) => standing.rank !== null);
		const entries: RankingEntry[] = ranked
			.slice(0, maxEntries)
			.map((standing) => ({
				position: standing.rank ?? 0,
				name: standing.agentName,
				agentId: standing.agentId,
				score: standing.score ?? 0,
				reactions: Object.values(
					reactions[program.id]?.[standing.agentId] ?? {}
				).reduce((acc, reaction) => {
					acc[REACTION_BUCKET[reaction]] += 1;
					return acc;
				}, emptyReactions()),
				trend:
					standing.delta === null || standing.delta === 0
						? ('stable' as const)
						: standing.delta > 0
							? ('up' as const)
							: ('down' as const),
				trendValue: Math.abs(standing.delta ?? 0),
			}));

		const mine = highlightAgentId
			? standings.find((standing) => standing.agentId === highlightAgentId)
			: undefined;
		const myPosition =
			mine && mine.rank !== null
				? { rank: mine.rank, total: ranked.length }
				: null;

		const goal: RankingGoal = {
			metric: t(`types.${program.evaluationType}`),
			criteria: t(`metrics.${program.metricId}`, {
				ns: 'qa.teamAnalytics',
				defaultValue: program.metricId,
			}),
			target: formatTarget(program),
			startDate: program.startDate,
			dueDate: program.endDate,
			setBy: `${program.createdBy} · ${t(
				`page.eyebrow.${program.createdByRole === 'SUPERVISOR' ? 'supervisor' : 'qa-manager'}`
			)}`,
		};

		return { program, entries, goal, myPosition };
	}, [programs, reactions, scope, maxEntries, highlightAgentId, t]);
};

export default useDashboardRankings;
