import dayjs from 'dayjs';
import type { TriggerMetricId } from '~/models/qa/triggerRules';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { teamConversationsPath } from '~/modules/qa/calls/constants';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import type { TeamRole } from '~/modules/qa/team/types';
import { inboxRouteRole, type InboxViewer } from './constants';

/** Days covered by a window label such as "Last 14 days"; 7 when it has no number. */
export const windowDays = (label: string): number =>
	Number(label.match(/(\d+)/)?.[1] ?? 7);

export interface DatedPoint {
	label: string;
	value: number;
}

/** Spreads bare sparkline values over the window, ending today, so the chart has dates. */
export const datedSeries = (values: number[], days: number): DatedPoint[] => {
	const step = Math.max(
		1,
		Math.round((days - 1) / Math.max(values.length - 1, 1))
	);
	return values.map((value, index) => ({
		label: dayjs(addDays(TODAY, -(values.length - 1 - index) * step)).format(
			'D MMM'
		),
		value,
	}));
};

/** Y-axis domain: the metric's own scale, zoomed to the values (and the reference level) with a little air. */
export const chartDomain = (
	metricId: TriggerMetricId,
	values: number[]
): [number, number] => {
	const { unit, min, max } = METRIC_BY_ID[metricId];
	const pad = unit === 'SCORE_5' ? 0.5 : unit === 'PERCENT' ? 10 : 2;
	const lo = Math.max(min, Math.floor(Math.min(...values) - pad));
	const hi = Math.min(max, Math.ceil(Math.max(...values) + pad));
	return [lo, hi];
};

/** "4 pts", "0.5", "3": the distance between two readings in the metric's unit. */
export const gapText = (
	metricId: TriggerMetricId,
	a: number,
	b: number
): string => {
	const gap = Math.abs(a - b);
	const { unit } = METRIC_BY_ID[metricId];
	if (unit === 'PERCENT') return `${Math.round(gap)} pts`;
	if (unit === 'SCORE_5') return gap.toFixed(1);
	return String(Math.round(gap));
};

/** The My Calls / Conversations issue that best matches an alerting metric; undefined when none fits (e.g. the overall compliance score). */
export const METRIC_ISSUE: Partial<Record<TriggerMetricId, CallIssueKey>> = {
	QA_OVERALL_SCORE: 'low-qa-score',
	QA_ECN_COUNT: 'qa-ecn',
	QA_ENC_COUNT: 'qa-enc',
	QA_ECC_COUNT: 'qa-ecc',
	QA_ECUF_COUNT: 'qa-ecuf',
	QA_AUTO_FAIL_COUNT: 'auto-fail',
	COMPLIANCE_SECURITY_SCORE: 'compliance-security',
	COMPLIANCE_REGULATORY_SCORE: 'compliance-regulatory',
	COMPLIANCE_LEGAL_SCORE: 'compliance-legal',
	CUSTOMER_SENTIMENT_SCORE: 'low-customer-sentiment',
	AGENT_SENTIMENT_SCORE: 'low-agent-sentiment',
	NEGATIVE_EMOTION_CALL_SHARE: 'negative-customer-emotion',
};

/** Where "Review the calls" goes for this viewer: the agent's My Calls or the team's Conversations. */
export const callsPathFor = (
	viewer: InboxViewer,
	issue: CallIssueKey,
	days: number
): string =>
	viewer === 'agent'
		? `/qa/agent/calls?tab=calls&issue=${issue}&period=${days <= 7 ? '7d' : '30d'}`
		: teamConversationsPath(inboxRouteRole(viewer) as TeamRole, {
				issue,
				period: days <= 7 ? 'week' : 'month',
				lineOfBusiness: null,
			});
