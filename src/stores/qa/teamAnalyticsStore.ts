import { create } from 'zustand';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { BUILT_IN_PRESETS, DEFAULT_FILTERS, DEFAULT_FINDER_PRESETS, DEFAULT_FINDER_QUERY, DRILL_NEXT } from '~/modules/qa/analytics/constants';
import { BURNOUT_ACTIONS_SEED } from '~/modules/qa/analytics/mockData';
import { narrowFilters } from '~/modules/qa/analytics/helpers';
import type {
	AnalyticsPreset, BurnoutAction, BurnoutActionStatus, DrillCrumb, DrillState, FinderPreset, FinderQuery, GroupByDimension,
	TeamAnalyticsFilters, TeamAnalyticsView,
} from '~/modules/qa/analytics/types';

let counter = 700;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

/**
 * Selector warning (Zustand v5): selectors that RETURN A NEW ARRAY/OBJECT on every call
 * (e.g. `s => s.presets.filter(...)`) re-render on every store change and can throw
 * "Maximum update depth exceeded". Select the raw slice (`s => s.presets`) and derive with useMemo.
 */
interface TeamAnalyticsState {
	filters: TeamAnalyticsFilters;
	groupBy: GroupByDimension;
	drill: DrillState | null;
	presets: AnalyticsPreset[];
	finderQuery: FinderQuery;
	finderPresets: FinderPreset[];
	burnoutActions: BurnoutAction[];

	/** Partial patch, keeps any drill-down (used by the Compare switch). */
	setFilters: (patch: Partial<TeamAnalyticsFilters>) => void;
	/** Replaces the filters and clears the drill-down (Apply button, chip removal). */
	commitFilters: (filters: TeamAnalyticsFilters) => void;
	resetFilters: () => void;
	setGroupBy: (groupBy: GroupByDimension) => void;

	drillInto: (crumb: DrillCrumb, nextGroupBy: GroupByDimension) => void;
	drillTo: (index: number) => void;
	clearDrill: () => void;

	savePreset: (name: string, view: TeamAnalyticsView) => AnalyticsPreset;
	deletePreset: (id: string) => void;
	/** Applies filters + groupBy; returns the preset so the page can also switch `?view=`. */
	applyPreset: (id: string) => AnalyticsPreset | null;

	setFinderQuery: (patch: Partial<FinderQuery>) => void;
	saveFinderPreset: (name: string) => FinderPreset;
	deleteFinderPreset: (id: string) => void;

	addBurnoutAction: (input: Omit<BurnoutAction, 'id' | 'createdAt' | 'status'> & { status?: BurnoutActionStatus }) => BurnoutAction;
	setBurnoutActionStatus: (id: string, status: BurnoutActionStatus) => void;
}

export const useTeamAnalyticsStore = create<TeamAnalyticsState>()((set, get) => ({
	filters: DEFAULT_FILTERS,
	groupBy: 'none',
	drill: null,
	presets: BUILT_IN_PRESETS,
	finderQuery: DEFAULT_FINDER_QUERY,
	finderPresets: DEFAULT_FINDER_PRESETS,
	burnoutActions: BURNOUT_ACTIONS_SEED,

	setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
	commitFilters: (filters) => set({ filters, drill: null }),
	resetFilters: () => set({ filters: DEFAULT_FILTERS, groupBy: 'none', drill: null }),
	setGroupBy: (groupBy) => set({ groupBy, drill: null }),

	drillInto: (crumb, nextGroupBy) => set((s) => {
		const base = s.drill ?? { baseFilters: s.filters, baseGroupBy: s.groupBy, path: [] };
		return { drill: { ...base, path: [...base.path, crumb] }, filters: narrowFilters(s.filters, crumb.dimension, crumb.key), groupBy: nextGroupBy };
	}),
	drillTo: (index) => set((s) => {
		if (!s.drill) return {};
		const path = s.drill.path.slice(0, index + 1);
		const filters = path.reduce((f, c) => narrowFilters(f, c.dimension, c.key), s.drill.baseFilters);
		const last = path[path.length - 1];
		return { drill: { ...s.drill, path }, filters, groupBy: DRILL_NEXT[last.dimension] ?? s.groupBy };
	}),
	clearDrill: () => set((s) => (s.drill ? { drill: null, filters: s.drill.baseFilters, groupBy: s.drill.baseGroupBy } : {})),

	savePreset: (name, view) => {
		const preset: AnalyticsPreset = { id: nextId('preset'), name, builtIn: false, view, groupBy: get().groupBy, filters: { ...get().filters } };
		set((s) => ({ presets: [...s.presets, preset] }));
		return preset;
	},
	deletePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => (p.id === id ? p.builtIn : true)) })),
	applyPreset: (id) => {
		const preset = get().presets.find((p) => p.id === id) ?? null;
		if (preset) set({ filters: { ...preset.filters }, groupBy: preset.groupBy, drill: null });
		return preset;
	},

	setFinderQuery: (patch) => set((s) => ({ finderQuery: { ...s.finderQuery, ...patch } })),
	saveFinderPreset: (name) => {
		const preset: FinderPreset = { id: nextId('finder'), name, builtIn: false, query: { ...get().finderQuery } };
		set((s) => ({ finderPresets: [...s.finderPresets, preset] }));
		return preset;
	},
	deleteFinderPreset: (id) => set((s) => ({ finderPresets: s.finderPresets.filter((p) => (p.id === id ? p.builtIn : true)) })),

	addBurnoutAction: (input) => {
		const action: BurnoutAction = { ...input, id: nextId('bact'), createdAt: NOW_ISO, status: input.status ?? 'PLANNED' };
		set((s) => ({ burnoutActions: [action, ...s.burnoutActions] }));
		return action;
	},
	setBurnoutActionStatus: (id, status) =>
		set((s) => ({ burnoutActions: s.burnoutActions.map((a) => (a.id === id ? { ...a, status } : a)) })),
}));

export const selectFilters = (s: TeamAnalyticsState) => s.filters;
export const selectGroupBy = (s: TeamAnalyticsState) => s.groupBy;
export const selectDrill = (s: TeamAnalyticsState) => s.drill;
export const selectPresets = (s: TeamAnalyticsState) => s.presets;
export const selectFinderQuery = (s: TeamAnalyticsState) => s.finderQuery;
export const selectFinderPresets = (s: TeamAnalyticsState) => s.finderPresets;
export const selectBurnoutActions = (s: TeamAnalyticsState) => s.burnoutActions;
