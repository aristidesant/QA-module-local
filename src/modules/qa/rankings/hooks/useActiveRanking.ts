import { useMemo } from 'react';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { computeStandings } from '../helpers';

interface UseActiveRankingResult {
	team: string;
	/** The ranking currently running for the team, if any. */
	program: RankingProgram | null;
	standings: ReturnType<typeof computeStandings>;
	pastPrograms: RankingProgram[];
}

const buildResult = (
	programs: RankingProgram[],
	team: string
): UseActiveRankingResult => {
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
};

/** The ranking the agent is taking part in right now, plus their team's history. */
export const useActiveRanking = (
	agentId: string = AGENT_PERSONA_ID
): UseActiveRankingResult => {
	const programs = useRankingsStore(selectPrograms);

	return useMemo(() => {
		const team =
			TEAM_AGENTS.find((agent) => agent.id === agentId)?.team ?? 'Team 1';
		return buildResult(programs, team);
	}, [programs, agentId]);
};

/** The ranking currently running for a given team, by team name (no agent identity required). */
export const useActiveRankingByTeam = (
	team: string
): UseActiveRankingResult => {
	const programs = useRankingsStore(selectPrograms);
	return useMemo(() => buildResult(programs, team), [programs, team]);
};

export default useActiveRanking;
