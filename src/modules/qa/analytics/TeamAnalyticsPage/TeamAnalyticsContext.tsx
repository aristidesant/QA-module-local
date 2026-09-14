import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { roleFromPath } from '~/modules/qa/team/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	useTeamAnalyticsStore,
	selectFilters,
	selectGroupBy,
} from '~/stores/qa/teamAnalyticsStore';
import { TEAM_CALLS } from '../mockData';
import {
	computeKpis,
	filterCalls,
	previousPeriod,
	scopeAgents,
	shiftFilters,
} from '../helpers';
import type {
	GroupByDimension,
	TeamAnalyticsFilters,
	TeamCallMetric,
	TeamKpis,
} from '../types';
import type { RosterAgent } from '~/modules/qa/team/types';

interface TeamAnalyticsContextValue {
	role: TeamRole;
	filters: TeamAnalyticsFilters;
	groupBy: GroupByDimension;
	/** Agents visible to the current role (Team 1 for a supervisor, all teams for a manager). */
	scopedAgents: RosterAgent[];
	/** Calls matching the active filters. */
	calls: TeamCallMetric[];
	/** Same filters shifted onto the preceding period of equal length. */
	previousCalls: TeamCallMetric[];
	/** Every in-scope call, ignoring filters — burnout rules run on fixed trailing windows. */
	scopedCalls: TeamCallMetric[];
	kpis: TeamKpis;
	previousKpis: TeamKpis;
}

const TeamAnalyticsContext = createContext<TeamAnalyticsContextValue | null>(
	null
);

export function TeamAnalyticsProvider({ children }: { children: ReactNode }) {
	const location = useLocation();
	const role = roleFromPath(location.pathname);
	const filters = useTeamAnalyticsStore(selectFilters);
	const groupBy = useTeamAnalyticsStore(selectGroupBy);

	const value = useMemo<TeamAnalyticsContextValue>(() => {
		const scopedAgents = scopeAgents(role);
		const agentIds = new Set(scopedAgents.map((a) => a.id));
		const calls = filterCalls(TEAM_CALLS, filters, role);
		const previousCalls = filterCalls(
			TEAM_CALLS,
			shiftFilters(filters, previousPeriod(filters)),
			role
		);

		return {
			role,
			filters,
			groupBy,
			scopedAgents,
			calls,
			previousCalls,
			scopedCalls: TEAM_CALLS.filter((c) => agentIds.has(c.agentId)),
			kpis: computeKpis(calls),
			previousKpis: computeKpis(previousCalls),
		};
	}, [role, filters, groupBy]);

	return (
		<TeamAnalyticsContext.Provider value={value}>
			{children}
		</TeamAnalyticsContext.Provider>
	);
}

export function useTeamAnalyticsData() {
	const context = useContext(TeamAnalyticsContext);
	if (!context) {
		throw new Error(
			'useTeamAnalyticsData must be used within TeamAnalyticsProvider'
		);
	}
	return context;
}
