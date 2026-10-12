import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { RankingStatus } from '~/models/qa/rankingPrograms';
import {
	DEFAULT_RANKING_STATUSES,
	RANKING_PERIODS,
	RANKING_STATUS_ORDER,
	TEAMS,
	type RankingPeriod,
} from '../constants';
import type { RankingFilters } from '../helpers';
import { RANKING_METRIC_AREAS, type RankingMetricArea } from '../metrics';

export const DEFAULT_RANKING_FILTERS: RankingFilters = {
	q: '',
	status: DEFAULT_RANKING_STATUSES,
	team: null,
	area: null,
	period: null,
};

const sameStatuses = (a: RankingStatus[], b: RankingStatus[]) =>
	a.length === b.length && a.every((s) => b.includes(s));

export const isDefaultRankingFilters = (f: RankingFilters): boolean =>
	f.q === '' &&
	sameStatuses(f.status, DEFAULT_RANKING_STATUSES) &&
	f.team === null &&
	f.area === null &&
	f.period === null;

/** Filters live in the URL: `?q=&status=active,draft&team=&area=&period=`; absent means default. */
export function useRankingFilters() {
	const [params, setParams] = useSearchParams();

	const filters = useMemo<RankingFilters>(() => {
		const statusParam = params.get('status');
		const status =
			statusParam === null
				? DEFAULT_RANKING_STATUSES
				: statusParam
						.split(',')
						.filter((s): s is RankingStatus =>
							RANKING_STATUS_ORDER.includes(s as RankingStatus)
						);
		const team = params.get('team');
		const area = params.get('area');
		const period = params.get('period');
		return {
			q: params.get('q') ?? '',
			status,
			team: team && TEAMS.includes(team) ? team : null,
			area:
				area && RANKING_METRIC_AREAS.includes(area as RankingMetricArea)
					? (area as RankingMetricArea)
					: null,
			period:
				period && RANKING_PERIODS.includes(period as RankingPeriod)
					? (period as RankingPeriod)
					: null,
		};
	}, [params]);

	const setFilters = useCallback(
		(next: RankingFilters) => {
			setParams(
				(prev) => {
					const out = new URLSearchParams(prev);
					const put = (key: string, value: string | null) => {
						if (value) out.set(key, value);
						else out.delete(key);
					};
					put('q', next.q.trim() || null);
					// An empty selection is not written, so a refresh restores the default view.
					put(
						'status',
						sameStatuses(next.status, DEFAULT_RANKING_STATUSES)
							? null
							: next.status.join(',')
					);
					put('team', next.team);
					put('area', next.area);
					put('period', next.period);
					return out;
				},
				{ replace: true }
			);
		},
		[setParams]
	);

	return { filters, setFilters };
}
