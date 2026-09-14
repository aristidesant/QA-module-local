import { useMemo } from 'react';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { computeStandings } from '../helpers';

interface UseActiveRankingResult {
	team: string;
	/** The ranking currently running for the agent's team, if any. */
	program: RankingProgram | null;
	standings: ReturnType<typeof computeStandings>;
	pastPrograms: RankingProgram[];
}

/** The ranking the agent is taking part in right now, plus their team's history. */
export const useActiveRanking = (
	agentId: string = AGENT_PERSONA_ID
): UseActiveRankingResult => {
	const programs = useRankingsStore(selectPrograms);

	return useMemo(() => {
		const team =
			TEAM_AGENTS.find((agent) => agent.id === agentId)?.team ?? 'Team 1';
		const forTeam = programs.filter((program) => program.teams.includes(team));
		const program =
			forTeam.find((candidate) => candidate.status === 'active') ?? null;

		return {
			team,
			program,
			standings: program ? computeStandings(program, TEAM_CALLS) : [],
			pastPrograms: forTeam
				.filter((candidate) => candidate.status === 'completed')
				.sort((a, b) => b.endDate.localeCompare(a.endDate)),
		};
	}, [programs, agentId]);
};

export default useActiveRanking;
