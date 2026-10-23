import type { TeamCallMetric } from '~/modules/qa/analytics/types';

/** What a click on any visual narrows every other visual to. The line of business lives in the header select. */
export interface CrossFilter {
	team: string | null;
	campaignId: string | null;
}

export const EMPTY_FILTER: CrossFilter = { team: null, campaignId: null };

export const isFiltered = (filter: CrossFilter): boolean =>
	filter.team !== null || filter.campaignId !== null;

export const applyCrossFilter = (
	calls: TeamCallMetric[],
	filter: CrossFilter
): TeamCallMetric[] =>
	calls.filter(
		(call) =>
			(!filter.team || call.team === filter.team) &&
			(!filter.campaignId || call.campaignId === filter.campaignId)
	);

/** Clicking the value that is already selected clears it, like Power BI. */
export const toggleFilter = (
	filter: CrossFilter,
	key: keyof CrossFilter,
	value: string
): CrossFilter => ({ ...filter, [key]: filter[key] === value ? null : value });
