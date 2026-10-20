import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import type { RosterAgent, TeamRole } from '~/modules/qa/team/types';
import {
	useTeamAnalyticsStore,
	selectFilters,
	selectGroupBy,
} from '~/stores/qa/teamAnalyticsStore';
import { ANALYTICS_CALLS, TEAM_CALLS } from '../mockData';
import {
	analyticsRoleFromPath,
	canCompare,
	computeKpis,
	disputesOf,
	filterCalls,
	previousPeriod,
	scopeAgents,
	scopeAnalyticsAgents,
	scopeRoleOf,
	shiftFilters,
	sliceByDay,
	type AnalyticsRole,
} from '../helpers';
import type {
	GroupByDimension,
	TeamAnalyticsFilters,
	TeamCallMetric,
	TeamDispute,
	TeamKpis,
} from '../types';

interface TeamAnalyticsContextValue {
	/** Data scope: the Operation Manager reads everything, like the QA Manager. */
	role: TeamRole;
	/** Who is looking, for headings and descriptions. */
	analyticsRole: AnalyticsRole;
	filters: TeamAnalyticsFilters;
	groupBy: GroupByDimension;
	/** Humans and AI agents visible to the current role (Team 1 for a supervisor, all teams for a manager). */
	scopedAgents: RosterAgent[];
	/** Calls (human and AI) matching the active filters. */
	calls: TeamCallMetric[];
	/** Same filters shifted onto the preceding period of equal length; empty while comparison is off. */
	previousCalls: TeamCallMetric[];
	/** Every in-scope human call, ignoring filters — burnout rules run on fixed trailing windows. */
	scopedCalls: TeamCallMetric[];
	/** Disputes raised on the filtered calls. */
	disputes: TeamDispute[];
	previousDisputes: TeamDispute[];
	/** The previous period fits inside the generated history. */
	compareAvailable: boolean;
	/** Comparison is switched on and possible: views show deltas and the previous series only then. */
	compare: boolean;
	kpis: TeamKpis;
	previousKpis: TeamKpis;
}

const TeamAnalyticsContext = createContext<TeamAnalyticsContextValue | null>(
	null
);

export function TeamAnalyticsProvider({ children }: { children: ReactNode }) {
	const location = useLocation();
	const analyticsRole = analyticsRoleFromPath(location.pathname);
	const filters = useTeamAnalyticsStore(selectFilters);
	const groupBy = useTeamAnalyticsStore(selectGroupBy);

	const value = useMemo<TeamAnalyticsContextValue>(() => {
		const role = scopeRoleOf(analyticsRole);
		const compareAvailable = canCompare(filters);
		const compare = filters.compareWithPrevious && compareAvailable;
		const humanIds = new Set(scopeAgents(role).map((a) => a.id));

		const calls = filterCalls(
			sliceByDay(ANALYTICS_CALLS, filters.from, filters.to),
			filters,
			role
		);
		const previous = previousPeriod(filters);
		const previousCalls = compare
			? filterCalls(
					sliceByDay(ANALYTICS_CALLS, previous.from, previous.to),
					shiftFilters(filters, previous),
					role
				)
			: [];

		return {
			role,
			analyticsRole,
			filters,
			groupBy,
			scopedAgents: scopeAnalyticsAgents(role),
			calls,
			previousCalls,
			scopedCalls: TEAM_CALLS.filter((c) => humanIds.has(c.agentId)),
			disputes: disputesOf(calls),
			previousDisputes: disputesOf(previousCalls),
			compareAvailable,
			compare,
			kpis: computeKpis(calls),
			previousKpis: computeKpis(previousCalls),
		};
	}, [analyticsRole, filters, groupBy]);

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
