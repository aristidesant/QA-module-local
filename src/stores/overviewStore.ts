import { create } from 'zustand';

export interface OverviewStoreState {
	totalCalls: number;
	effectiveContact: number;
	noEffectiveContact: number;
	noContact: number;
	setCallStats: (stats: {
		totalCalls: number;
		effectiveContact: number;
		noEffectiveContact: number;
		noContact: number;
	}) => void;
}

export const useOverviewStore = create<OverviewStoreState>((set) => ({
	totalCalls: 424456,
	effectiveContact: 23.1,
	noEffectiveContact: 52.5,
	noContact: 24.4,
	setCallStats: (stats) => set(stats),
}));
