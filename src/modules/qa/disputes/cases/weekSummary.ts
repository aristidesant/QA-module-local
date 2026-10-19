import dayjs from 'dayjs';
import type { DisputeCase } from '~/models/qa/disputeCases';
import { TODAY } from '~/modules/qa/analytics/constants';

/** Monday-to-Sunday week containing `day`, shifted by `offsetWeeks` (0 = this week, -1 = last week). Days are ISO `YYYY-MM-DD`. */
export const weekBounds = (
	day: string,
	offsetWeeks = 0
): { from: string; to: string } => {
	const d = dayjs(day);
	const monday = d.subtract((d.day() + 6) % 7, 'day').add(offsetWeeks, 'week');
	return {
		from: monday.format('YYYY-MM-DD'),
		to: monday.add(6, 'day').format('YYYY-MM-DD'),
	};
};

export interface DisputesWeekCounts {
	/** Accepted plus rejected: every dispute decided in the window. */
	managed: number;
	/** Accepted, including the partially accepted ones. */
	accepted: number;
	/** Partially accepted, already counted in `accepted`. */
	partial: number;
	rejected: number;
}

/** Disputes decided inside the window, by outcome. Partially accepted counts as accepted, as in the disputes KPI row. */
export const resolvedInWindow = (
	cases: DisputeCase[],
	from: string,
	to: string
): DisputesWeekCounts => {
	const decided = cases.filter((c) => {
		if (!c.resolvedAt) return false;
		const day = c.resolvedAt.slice(0, 10);
		return day >= from && day <= to;
	});
	const partial = decided.filter(
		(c) => c.status === 'partially-accepted'
	).length;
	const accepted =
		decided.filter((c) => c.status === 'accepted').length + partial;
	const rejected = decided.filter((c) => c.status === 'rejected').length;
	return { managed: accepted + rejected, accepted, partial, rejected };
};

export interface DisputesSummary {
	open: number;
	/** Days since the oldest open dispute was raised; null when nothing is open. */
	oldestOpenDays: number | null;
	thisWeek: DisputesWeekCounts;
	lastWeek: DisputesWeekCounts;
	/** Managed this week minus managed last week. */
	delta: number;
	/** Accepted over managed this week, rounded; null when nothing was managed. */
	acceptanceRate: number | null;
}

export const buildDisputesSummary = (
	cases: DisputeCase[],
	today: string = TODAY
): DisputesSummary => {
	const open = cases.filter((c) => c.status === 'open');
	const oldestOpenDays = open.length
		? Math.max(
				...open.map((c) =>
					dayjs(today).diff(dayjs(c.createdAt.slice(0, 10)), 'day')
				)
			)
		: null;
	const thisWeekBounds = weekBounds(today, 0);
	const lastWeekBounds = weekBounds(today, -1);
	const thisWeek = resolvedInWindow(
		cases,
		thisWeekBounds.from,
		thisWeekBounds.to
	);
	const lastWeek = resolvedInWindow(
		cases,
		lastWeekBounds.from,
		lastWeekBounds.to
	);
	return {
		open: open.length,
		oldestOpenDays,
		thisWeek,
		lastWeek,
		delta: thisWeek.managed - lastWeek.managed,
		acceptanceRate:
			thisWeek.managed === 0
				? null
				: Math.round((thisWeek.accepted / thisWeek.managed) * 100),
	};
};
