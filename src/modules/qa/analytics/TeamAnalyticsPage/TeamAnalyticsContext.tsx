import { createContext, useContext, ReactNode } from 'react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import type { TeamAnalyticsFilters } from '../types';

interface TeamAnalyticsContextValue {
	filters: TeamAnalyticsFilters;
	isLoading: boolean;
}

const TeamAnalyticsContext = createContext<
	TeamAnalyticsContextValue | undefined
>(undefined);

export function TeamAnalyticsProvider({ children }: { children: ReactNode }) {
	const { filters } = useTeamAnalyticsStore();

	const contextValue: TeamAnalyticsContextValue = {
		filters,
		isLoading: false,
	};

	return (
		<TeamAnalyticsContext.Provider value={contextValue}>
			{children}
		</TeamAnalyticsContext.Provider>
	);
}

export function useTeamAnalyticsContext() {
	const context = useContext(TeamAnalyticsContext);
	if (!context) {
		throw new Error(
			'useTeamAnalyticsContext must be used within TeamAnalyticsProvider'
		);
	}
	return context;
}
