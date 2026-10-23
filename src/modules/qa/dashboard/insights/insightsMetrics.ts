import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { periodKeyOf } from '~/modules/qa/analytics/helpers';
import { aggregateDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import type { ThresholdSettings } from '~/modules/qa/settings/types';
import { dashboardLineOfBusinessFor } from '../lineOfBusiness';
import {
	OPERATION_MANAGER_TEAMS,
	chartGranularity,
	periodLabel,
} from '../operationManagerMetrics';

export type KpiKey =
	| 'calls'
	| 'effective'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'conversion';

export const KPI_KEYS: KpiKey[] = [
	'calls',
	'effective',
	'qa',
	'compliance',
	'sentiment',
	'conversion',
];

export interface KpiPoint {
	label: string;
	value: number;
}

export interface Kpi {
	key: KpiKey;
	value: number;
	unit: '' | '%' | '/5';
	/** Change against the previous window of the same length: percent for calls, points for the rest. */
	delta: number | null;
	deltaUnit: '%' | 'pts' | '';
	spark: KpiPoint[];
}

type Snapshot = Record<KpiKey, number>;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The six headline numbers of a set of calls, from the same aggregator the classic cards use. */
const snapshotOf = (
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings
): Snapshot => {
	const metrics = aggregateDashboardMetrics(calls, thresholds);
	const categories = metrics.complianceCategories;
	return {
		calls: metrics.calls,
		effective: metrics.calls
			? Math.round((100 * metrics.effectiveContacts) / metrics.calls)
			: 0,
		qa: metrics.qa.total,
		compliance: categories.length
			? Math.round(
					categories.reduce((sum, category) => sum + category.score, 0) /
						categories.length
				)
			: 0,
		sentiment: metrics.sentiment.customerAvg,
		conversion: metrics.sales.offered
			? Math.round((100 * metrics.sales.sold) / metrics.sales.offered)
			: 0,
	};
};

/** One value per day (short windows) or per ISO week, for the sparklines. */
const sparksOf = (
	calls: TeamCallMetric[],
	days: number,
	thresholds: ThresholdSettings
): Record<KpiKey, KpiPoint[]> => {
	const granularity = chartGranularity(days);
	const buckets = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		const key = periodKeyOf(call.date, granularity);
		buckets.set(key, [...(buckets.get(key) ?? []), call]);
	}
	const sparks = Object.fromEntries(
		KPI_KEYS.map((key) => [key, []])
	) as unknown as Record<KpiKey, KpiPoint[]>;
	[...buckets.keys()].sort().forEach((period) => {
		const snapshot = snapshotOf(buckets.get(period) ?? [], thresholds);
		for (const key of KPI_KEYS) {
			sparks[key].push({ label: periodLabel(period), value: snapshot[key] });
		}
	});
	return sparks;
};

const UNIT: Record<KpiKey, Kpi['unit']> = {
	calls: '',
	effective: '%',
	qa: '',
	compliance: '%',
	sentiment: '/5',
	conversion: '%',
};

const DELTA_UNIT: Record<KpiKey, Kpi['deltaUnit']> = {
	calls: '%',
	effective: 'pts',
	qa: 'pts',
	compliance: 'pts',
	sentiment: '',
	conversion: 'pts',
};

/** The headline numbers with their change against the previous window and a sparkline each. */
export const buildKpis = (
	current: TeamCallMetric[],
	previous: TeamCallMetric[],
	days: number,
	thresholds: ThresholdSettings
): Kpi[] => {
	const now = snapshotOf(current, thresholds);
	const before = snapshotOf(previous, thresholds);
	const sparks = sparksOf(current, days, thresholds);
	return KPI_KEYS.map((key) => {
		let delta: number | null = null;
		if (previous.length > 0) {
			delta =
				key === 'calls'
					? before.calls === 0
						? null
						: Math.round(((now.calls - before.calls) / before.calls) * 100)
					: round1(now[key] - before[key]);
		}
		return {
			key,
			value: now[key],
			unit: UNIT[key],
			delta,
			deltaUnit: DELTA_UNIT[key],
			spark: sparks[key],
		};
	});
};

export interface TreemapNode {
	name: string;
	/** Campaign id on a leaf, the line of business name on a parent. */
	id: string;
	calls: number;
	qa: number;
	children?: TreemapNode[];
}

const meanQa = (calls: TeamCallMetric[]) =>
	calls.length
		? round1(calls.reduce((sum, call) => sum + call.qaScore, 0) / calls.length)
		: 0;

/** Line of business, then campaign: size is the number of calls, colour is the mean QA. */
export const campaignTreemap = (calls: TeamCallMetric[]): TreemapNode[] => {
	const byLine = new Map<string, Map<string, TeamCallMetric[]>>();
	for (const call of calls) {
		const line = dashboardLineOfBusinessFor(call.campaignId) ?? 'Other';
		const campaigns = byLine.get(line) ?? new Map<string, TeamCallMetric[]>();
		campaigns.set(call.campaignId, [
			...(campaigns.get(call.campaignId) ?? []),
			call,
		]);
		byLine.set(line, campaigns);
	}
	return [...byLine.entries()].map(([line, campaigns]) => {
		const lineCalls = [...campaigns.values()].flat();
		return {
			name: line,
			id: line,
			calls: lineCalls.length,
			qa: meanQa(lineCalls),
			children: [...campaigns.entries()].map(([id, group]) => ({
				name: group[0].campaignName,
				id,
				calls: group.length,
				qa: meanQa(group),
			})),
		};
	});
};

export type FlowNodeId =
	| 'EFFECTIVE'
	| 'NOT_EFFECTIVE'
	| 'SALE'
	| 'NO_SALE'
	| 'NO_OFFER';

export interface CallFlow {
	nodes: string[];
	links: { source: string; target: string; value: number }[];
}

/** Team, then whether the customer was reached, then what happened with the offer. */
export const callFlow = (calls: TeamCallMetric[]): CallFlow => {
	const teams = OPERATION_MANAGER_TEAMS.filter((team) =>
		calls.some((call) => call.team === team)
	);
	const links: CallFlow['links'] = [];
	for (const team of teams) {
		const teamCalls = calls.filter((call) => call.team === team);
		const effective = teamCalls.filter(
			(call) => call.contactOutcome === 'EFFECTIVE'
		).length;
		if (effective > 0)
			links.push({ source: team, target: 'EFFECTIVE', value: effective });
		if (teamCalls.length - effective > 0)
			links.push({
				source: team,
				target: 'NOT_EFFECTIVE',
				value: teamCalls.length - effective,
			});
	}
	const reached = calls.filter((call) => call.contactOutcome === 'EFFECTIVE');
	const sold = reached.filter(
		(call) => call.offeredProduct !== null && call.converted
	).length;
	const declined = reached.filter(
		(call) => call.offeredProduct !== null && !call.converted
	).length;
	const noOffer = reached.length - sold - declined;
	if (sold > 0)
		links.push({ source: 'EFFECTIVE', target: 'SALE', value: sold });
	if (declined > 0)
		links.push({ source: 'EFFECTIVE', target: 'NO_SALE', value: declined });
	if (noOffer > 0)
		links.push({ source: 'EFFECTIVE', target: 'NO_OFFER', value: noOffer });
	const used = new Set(links.flatMap((link) => [link.source, link.target]));
	return {
		nodes: [
			...teams,
			'EFFECTIVE',
			'NOT_EFFECTIVE',
			'SALE',
			'NO_SALE',
			'NO_OFFER',
		].filter((node) => used.has(node)),
		links,
	};
};

export type ActivityMode = 'volume' | 'qa';

export interface ActivityMatrix {
	/** Hours shown on the X axis, from the first to the last hour that has calls. */
	hours: number[];
	/** [hour index, weekday index (Monday first), value]. */
	cells: [number, number, number][];
	max: number;
}

/** Calls (or mean QA) by weekday and hour, Monday first. */
export const activityMatrix = (
	calls: TeamCallMetric[],
	mode: ActivityMode
): ActivityMatrix => {
	if (calls.length === 0) return { hours: [], cells: [], max: 0 };
	const first = Math.min(...calls.map((call) => call.hour));
	const last = Math.max(...calls.map((call) => call.hour));
	const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
	const groups = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		const weekday = (call.weekday + 6) % 7;
		const key = `${call.hour - first}:${weekday}`;
		groups.set(key, [...(groups.get(key) ?? []), call]);
	}
	const cells = [...groups.entries()].map(([key, group]) => {
		const [hour, weekday] = key.split(':').map(Number);
		return [
			hour,
			weekday,
			mode === 'volume' ? group.length : meanQa(group),
		] as [number, number, number];
	});
	return {
		hours,
		cells,
		max: mode === 'volume' ? Math.max(...cells.map((cell) => cell[2])) : 100,
	};
};
