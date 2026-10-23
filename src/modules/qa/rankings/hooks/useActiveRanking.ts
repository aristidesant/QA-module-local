import { useMemo } from 'react';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { computeStandings, liveDatedFor } from '../helpers';

interface UseActiveRankingResult {
	team: string;
	/** The dated ranking running now, if any. */
	dated: RankingProgram | null;
	/** The team's default ranking, if it is on. */
	defaultProgram: RankingProgram | null;
	/** What the agent can look at, dated ranking first. */
	current: RankingProgram[];
	/** The ranking shown first: the dated one, else the default. */
	program: RankingProgram | null;
	standings: RankingStanding[];
	pastPrograms: RankingProgram[];
	/** Standings of any of the team's rankings. */
	standingsOf: (program: RankingProgram) => RankingStanding[];
}

const buildResult = (
	programs: RankingProgram[],
	team: string
): UseActiveRankingResult => {
	const forTeam = programs.filter((program) => program.teams.includes(team));
	const dated = liveDatedFor(forTeam, team);
	const defaultProgram =
		forTeam.find(
			(candidate) => candidate.isDefault && candidate.status === 'active'
		) ?? null;
	const current = [dated, defaultProgram].filter(
		(p): p is RankingProgram => p !== null
	);
	const program = current[0] ?? null;

	const cache = new Map<string, RankingStanding[]>();
	const standingsOf = (target: RankingProgram) => {
		const hit = cache.get(target.id);
		if (hit) return hit;
		const computed = computeStandings(target, TEAM_CALLS);
		cache.set(target.id, computed);
		return computed;
	};

	return {
		team,
		dated,
		defaultProgram,
		current,
		program,
		standings: program ? standingsOf(program) : [],
		pastPrograms: forTeam
			.filter((candidate) => candidate.status === 'completed')
			.sort((a, b) =>
				(b.endDate ?? b.updatedAt).localeCompare(a.endDate ?? a.updatedAt)
			),
		standingsOf,
	};
};

/** The rankings the agent is taking part in right now (dated one first, then the team index), plus their team's history. */
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

/** The rankings currently running for a given team, by team name (no agent identity required). */
export const useActiveRankingByTeam = (
	team: string
): UseActiveRankingResult => {
	const programs = useRankingsStore(selectPrograms);
	return useMemo(() => buildResult(programs, team), [programs, team]);
};

export default useActiveRanking;
