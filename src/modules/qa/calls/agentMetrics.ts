import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type { CallEmotion, TeamCallMetric } from '~/modules/qa/analytics/types';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import type { ComplianceCategory } from '~/modules/qa/dashboard/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { COMPLIANCE_TARGET, isNegativeEmotion } from './issues';

/** Window the agent dashboard cards summarise — agents see weekly data. My Calls' `7d` period matches it. */
export const AGENT_DASHBOARD_DAYS = 7;

export type QaCategoryKey = 'ecn' | 'enc' | 'ecc' | 'ecuf';
export type ComplianceAreaName = ComplianceCategory['name'];

export interface AgentDashboardMetrics {
	calls: number;
	/** Calls where the intended contact was actually reached and engaged. */
	effectiveContacts: number;
	/** Calls that didn't connect with the intended contact (no answer, voicemail, wrong number…). */
	nonEffectiveContacts: number;
	/** `total` = average qaScore; each category = % of calls WITHOUT that error type. */
	qa: { total: number; ecn: number; enc: number; ecc: number; ecuf: number };
	autoFails: number;
	/** Calls with ≥ 1 error of the type → what the drill-down lists. */
	qaIssueCounts: Record<QaCategoryKey, number>;
	/** `score` = % of calls whose area score ≥ COMPLIANCE_TARGET. */
	complianceCategories: ComplianceCategory[];
	complianceIssueCounts: Record<ComplianceAreaName, number>;
	sentiment: {
		agentAvg: number;
		customerAvg: number;
		agentEmotion: CallEmotion | null;
		customerEmotion: CallEmotion | null;
		agentNegativeCount: number;
		customerNegativeCount: number;
	};
}

const COMPLIANCE_AREAS: {
	name: ComplianceAreaName;
	key: keyof TeamCallMetric['complianceByArea'];
	items: string[];
}[] = [
	{
		name: 'Security',
		key: 'security',
		items: ['Protocol adherence', 'Data protection'],
	},
	{
		name: 'Regulatory',
		key: 'regulatory',
		items: ['Disclosure compliance', 'Record-keeping'],
	},
	{
		name: 'Legal',
		key: 'legal',
		items: ['Consent verification', 'Terms acknowledgment'],
	},
];

const pct = (part: number, total: number) =>
	total === 0 ? 100 : Math.round((part / total) * 100);
const avg1 = (values: number[]) =>
	values.length === 0
		? 0
		: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
const statusFor = (score: number): ComplianceCategory['status'] =>
	score >= 90 ? 'compliant' : score >= 80 ? 'warning' : 'violation';

/** Most frequent value; null when there are no calls. */
export const predominantEmotion = (
	emotions: CallEmotion[]
): CallEmotion | null => {
	if (emotions.length === 0) return null;
	const counts = new Map<CallEmotion, number>();
	for (const e of emotions) counts.set(e, (counts.get(e) ?? 0) + 1);
	return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

/** The agent's calls inside the last `days` days ending on TODAY (inclusive). */
export const agentCallsInWindow = (
	agentId: string,
	days: number
): TeamCallMetric[] => {
	const from = addDays(TODAY, -(days - 1));
	return TEAM_CALLS.filter(
		(c) =>
			c.agentId === agentId &&
			c.date.slice(0, 10) >= from &&
			c.date.slice(0, 10) <= TODAY
	);
};

/** Every call of the scoped role's roster inside the last `days` days ending on TODAY (inclusive). */
export const teamCallsInWindow = (
	role: TeamRole,
	days: number
): TeamCallMetric[] => {
	const agentIds = new Set(scopeAgents(role).map((a) => a.id));
	const from = addDays(TODAY, -(days - 1));
	return TEAM_CALLS.filter(
		(c) =>
			agentIds.has(c.agentId) &&
			c.date.slice(0, 10) >= from &&
			c.date.slice(0, 10) <= TODAY
	);
};

/**
 * QA / Compliance / Sentiment / Operational breakdown for any set of calls —
 * shared by the agent's own dashboard and the team-scoped supervisor/QA
 * manager dashboards, so both read the same category thresholds.
 */
export const aggregateDashboardMetrics = (
	calls: TeamCallMetric[]
): AgentDashboardMetrics => {
	const n = calls.length;
	const qaKeys: QaCategoryKey[] = ['ecn', 'enc', 'ecc', 'ecuf'];
	const qaIssueCounts = Object.fromEntries(
		qaKeys.map((k) => [k, calls.filter((c) => c.qaScores[k] > 0).length])
	) as Record<QaCategoryKey, number>;

	const complianceIssueCounts = Object.fromEntries(
		COMPLIANCE_AREAS.map((a) => [
			a.name,
			calls.filter((c) => c.complianceByArea[a.key].score < COMPLIANCE_TARGET)
				.length,
		])
	) as Record<ComplianceAreaName, number>;

	return {
		calls: n,
		effectiveContacts: calls.filter((c) => c.contactOutcome === 'EFFECTIVE')
			.length,
		nonEffectiveContacts: calls.filter(
			(c) => c.contactOutcome === 'NON_EFFECTIVE'
		).length,
		qa: {
			total: Math.round(avg1(calls.map((c) => c.qaScore))),
			ecn: pct(n - qaIssueCounts.ecn, n),
			enc: pct(n - qaIssueCounts.enc, n),
			ecc: pct(n - qaIssueCounts.ecc, n),
			ecuf: pct(n - qaIssueCounts.ecuf, n),
		},
		autoFails: calls.filter((c) => c.autoFail).length,
		qaIssueCounts,
		complianceCategories: COMPLIANCE_AREAS.map((a) => {
			const score = pct(n - complianceIssueCounts[a.name], n);
			return { name: a.name, items: a.items, status: statusFor(score), score };
		}),
		complianceIssueCounts,
		sentiment: {
			agentAvg: avg1(calls.map((c) => c.agentSentiment)),
			customerAvg: avg1(calls.map((c) => c.customerSentiment)),
			agentEmotion: predominantEmotion(calls.map((c) => c.agentEmotion)),
			customerEmotion: predominantEmotion(
				calls.map((c) => c.predominantEmotion)
			),
			agentNegativeCount: calls.filter((c) => isNegativeEmotion(c.agentEmotion))
				.length,
			customerNegativeCount: calls.filter((c) =>
				isNegativeEmotion(c.predominantEmotion)
			).length,
		},
	};
};

export const buildAgentDashboardMetrics = (
	agentId: string,
	days = AGENT_DASHBOARD_DAYS
): AgentDashboardMetrics =>
	aggregateDashboardMetrics(agentCallsInWindow(agentId, days));

/** Team-scoped version of `buildAgentDashboardMetrics`: Team 1 for a supervisor, every team for QA Manager. */
export const buildTeamDashboardMetrics = (
	role: TeamRole,
	days: number
): AgentDashboardMetrics =>
	aggregateDashboardMetrics(teamCallsInWindow(role, days));
