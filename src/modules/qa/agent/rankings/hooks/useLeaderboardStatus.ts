import { useMemo } from 'react';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';

interface UseLeaderboardStatusResult {
	/** The ranking the agent persona is competing in, or the last completed one. */
	program: RankingProgram | null;
	isCompleted: boolean;
	isWinnerSelected: boolean;
}

/**
 * Status of the agent's leaderboard, read from the rankings store.
 * Replaces the old `useLeaderboardMetadata` hook that read a frozen mock.
 */
export const useLeaderboardStatus = (): UseLeaderboardStatusResult => {
	const programs = useRankingsStore(selectPrograms);

	return useMemo(() => {
		const team =
			TEAM_AGENTS.find((agent) => agent.id === AGENT_PERSONA_ID)?.team ??
			'Team 1';
		const forTeam = programs.filter((program) => program.teams.includes(team));
		const program =
			forTeam.find((candidate) => candidate.status === 'active') ??
			forTeam
				.filter((candidate) => candidate.status === 'completed')
				.sort((a, b) => b.endDate.localeCompare(a.endDate))[0] ??
			null;

		return {
			program,
			isCompleted: program?.status === 'completed',
			isWinnerSelected: program?.winnerId !== null && program !== null,
		};
	}, [programs]);
};

export default useLeaderboardStatus;
