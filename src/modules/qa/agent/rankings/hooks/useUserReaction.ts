import { useCallback, useMemo } from 'react';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import {
	useRankingsStore,
	selectPrograms,
	selectReactions,
} from '~/stores/qa/rankingsStore';
import type { UserReactionType } from '../types/leaderboard';

export type ReactionTotals = Partial<Record<UserReactionType, number>>;

interface UseUserReactionResult {
	/** The persona's own reaction to this agent, if any. */
	currentReaction: UserReactionType | null;
	/** How many teammates picked each emoji, including the persona. */
	totals: ReactionTotals;
	/** Agents cannot react to their own standing. */
	disabled: boolean;
	setReaction: (reaction: UserReactionType | null) => void;
}

/** The persona's own reaction to one agent, stored per ranking program. */
export const useUserReaction = (agentId: string): UseUserReactionResult => {
	const programs = useRankingsStore(selectPrograms);
	const reactions = useRankingsStore(selectReactions);
	const persist = useRankingsStore((state) => state.setReaction);

	const programId = useMemo(() => {
		const team =
			TEAM_AGENTS.find((agent) => agent.id === AGENT_PERSONA_ID)?.team ??
			'Team 1';
		return (
			programs.find(
				(program) => program.status === 'active' && program.teams.includes(team)
			)?.id ?? null
		);
	}, [programs]);

	const given = programId ? (reactions[programId]?.[agentId] ?? {}) : {};
	const currentReaction = given[AGENT_PERSONA_ID] ?? null;

	const totals = useMemo(
		() =>
			Object.values(given).reduce<ReactionTotals>((acc, reaction) => {
				acc[reaction] = (acc[reaction] ?? 0) + 1;
				return acc;
			}, {}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(given)]
	);

	const setReaction = useCallback(
		(reaction: UserReactionType | null) => {
			if (programId) persist(programId, agentId, AGENT_PERSONA_ID, reaction);
		},
		[programId, agentId, persist]
	);

	return {
		currentReaction,
		totals,
		disabled: agentId === AGENT_PERSONA_ID,
		setReaction,
	};
};

export default useUserReaction;
