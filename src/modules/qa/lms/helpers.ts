import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import type {
	LmsArea,
	LmsAssignment,
	LmsAssignmentStatus,
	LmsContent,
	LmsFormat,
	LmsImpactVerdict,
	LmsLearningPath,
	LmsPathEnrollment,
} from '~/models/qa';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { dimensionPercent } from '~/modules/qa/team/helpers';
import type {
	AgentProfile,
	RosterAgent,
	TeamRole,
} from '~/modules/qa/team/types';
import { AREA_TO_DIMENSION, IMPACT_THRESHOLD, LMS_AREAS } from './constants';
import { day } from './mockData';

export const today = () => NOW_ISO.slice(0, 10);

export const daysUntil = (isoDate: string) =>
	Math.ceil(
		(new Date(isoDate).getTime() - new Date(NOW_ISO).getTime()) / 86_400_000
	);

export const isOverdue = (a: LmsAssignment) =>
	a.status !== 'COMPLETED' && a.dueDate < today();

/** Status the UI should show (recomputes OVERDUE from the clock). */
export const effectiveStatus = (a: LmsAssignment): LmsAssignmentStatus =>
	a.status === 'COMPLETED' ? 'COMPLETED' : isOverdue(a) ? 'OVERDUE' : a.status;

export const needsResponse = (a: LmsAssignment) =>
	a.acceptance.status === 'PENDING' || a.acceptance.status === 'NO_RESPONSE';

export const dueLabel = (t: TFunction, a: LmsAssignment) => {
	const d = daysUntil(a.dueDate);
	if (a.status === 'COMPLETED') return t('due.completed');
	if (d < 0) return t('due.overdueBy', { count: -d });
	if (d === 0) return t('due.today');
	return t('due.inDays', { count: d });
};

export const verdictFromDelta = (
	delta: number,
	higherIsBetter: boolean
): LmsImpactVerdict => {
	const signed = higherIsBetter ? delta : -delta;
	return signed >= IMPACT_THRESHOLD
		? 'IMPROVED'
		: signed <= -IMPACT_THRESHOLD
			? 'DECLINED'
			: 'SAME';
};

export const pathProgress = (
	path: LmsLearningPath,
	enrollment: LmsPathEnrollment | undefined
) => {
	const required =
		path.modules.filter((m) => m.required).length || path.modules.length;
	const done = enrollment
		? path.modules.filter((m) =>
				enrollment.completedContentIds.includes(m.contentId)
			).length
		: 0;
	return {
		done,
		total: path.modules.length,
		percent: Math.min(100, Math.round((done / Math.max(1, required)) * 100)),
	};
};

export const nextModule = (
	path: LmsLearningPath,
	enrollment: LmsPathEnrollment | undefined,
	content: Record<string, LmsContent>
) =>
	path.modules
		.map((m) => content[m.contentId])
		.find((c) => c && !(enrollment?.completedContentIds ?? []).includes(c.id));

export const groupAssignments = (rows: LmsAssignment[]) => ({
	needsResponse: rows.filter(needsResponse),
	mandatory: rows
		.filter((a) => a.mandatory && !needsResponse(a) && a.status !== 'COMPLETED')
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
	optional: rows.filter(
		(a) => !a.mandatory && a.status !== 'COMPLETED' && !needsResponse(a)
	),
	completed: rows
		.filter((a) => a.status === 'COMPLETED')
		.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
});

// ── Manager side ──────────────────────────────────────────────────────────────

/** Agents the role may see and assign to: the supervisor only sees Team 1. */
export const managerScopeAgents = (role: TeamRole): RosterAgent[] =>
	TEAM_AGENTS.filter(
		(a) => role === 'qa-manager' || a.supervisorId === SUPERVISOR_PERSONA.id
	);

export interface ManagerPersona {
	id: string;
	name: string;
	role: 'SUPERVISOR' | 'QA_MANAGER';
}

export const managerPersona = (role: TeamRole): ManagerPersona =>
	role === 'qa-manager'
		? { ...QA_MANAGER_PERSONA, role: 'QA_MANAGER' }
		: { ...SUPERVISOR_PERSONA, role: 'SUPERVISOR' };

export interface AssignmentRow extends LmsAssignment {
	agentName: string;
	team: string;
	supervisorId: string;
	contentTitle: string;
	format: LmsFormat;
	area: LmsArea;
}

export const toAssignmentRows = (
	assignments: LmsAssignment[],
	contentById: Record<string, LmsContent>,
	agents: RosterAgent[]
): AssignmentRow[] => {
	const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));
	return assignments.flatMap((a) => {
		const agent = agentById[a.agentId];
		const content = contentById[a.contentId];
		return agent && content
			? [
					{
						...a,
						agentName: agent.name,
						team: agent.team,
						supervisorId: agent.supervisorId,
						contentTitle: content.title,
						format: content.format,
						area: content.area,
					},
				]
			: [];
	});
};

export const managerKpis = (rows: AssignmentRow[], content: LmsContent[]) => {
	const open = rows.filter((r) => r.status !== 'COMPLETED');
	const last30 = rows.filter((r) => r.assignedAt >= day(today(), -30));
	return {
		published: content.filter((c) => c.status === 'PUBLISHED').length,
		activeAssignments: open.length,
		pendingAcceptance: rows.filter(
			(r) =>
				r.acceptance.status === 'PENDING' ||
				r.acceptance.status === 'NO_RESPONSE'
		).length,
		rescheduleRequests: rows.filter(
			(r) => r.acceptance.status === 'RESCHEDULE_REQUESTED'
		).length,
		overdue: open.filter(isOverdue).length,
		completionRate: last30.length
			? Math.round(
					(last30.filter((r) => r.status === 'COMPLETED').length /
						last30.length) *
						100
				)
			: 0,
	};
};

export const contentImpactSummary = (
	rows: AssignmentRow[],
	contentId: string
) => {
	const done = rows.filter(
		(r) =>
			r.contentId === contentId && r.impact && r.impact.verdict !== 'PENDING'
	);
	const count = (v: LmsImpactVerdict) =>
		done.filter((r) => r.impact?.verdict === v).length;
	return {
		measured: done.length,
		improved: count('IMPROVED'),
		same: count('SAME'),
		declined: count('DECLINED'),
	};
};

export const agentLmsKpis = (rows: LmsAssignment[]) => {
	const open = rows.filter((a) => a.status !== 'COMPLETED');
	const scored = rows.filter((a) => a.score !== null);
	return {
		needsResponse: rows.filter(needsResponse).length,
		dueThisWeek: open.filter((a) => {
			const d = daysUntil(a.dueDate);
			return d >= 0 && d <= 7;
		}).length,
		overdue: open.filter(isOverdue).length,
		completedThisMonth: rows.filter(
			(a) => a.completedAt && a.completedAt >= `${today().slice(0, 7)}-01`
		).length,
		quizAverage: scored.length
			? Math.round(
					scored.reduce((x, a) => x + (a.score ?? 0), 0) / scored.length
				)
			: null,
	};
};

// ── Agent side ────────────────────────────────────────────────────────────────

/** Agent-facing date such as "12 Sep 2026". Never show a raw ISO string to the agent. */
export const formatDay = (iso: string) => dayjs(iso).format('D MMM YYYY');

/** The one item to start with: mandatory and open, earliest due date first (so overdue comes first). */
export const pickNextUp = (rows: LmsAssignment[]): LmsAssignment | undefined =>
	groupAssignments(rows).mandatory[0];

/** The agent's dimension score for an area, or undefined for GENERAL / no profile. */
export const areaDimension = (
	area: LmsArea,
	profile: AgentProfile | undefined
) => {
	if (!profile || area === 'GENERAL') return undefined;
	const key = AREA_TO_DIMENSION[area];
	return profile.dimensions.find((d) => d.key === key);
};

/** Last 12 monthly points of the area's dimension, for a sparkline. */
export const areaSeries = (
	area: LmsArea,
	profile: AgentProfile | undefined
): number[] => {
	if (!profile || area === 'GENERAL') return [];
	const key = AREA_TO_DIMENSION[area];
	return profile.performance.slice(-12).map((p) => p[key]);
};

/** Areas ordered weakest score first; GENERAL always last. */
export const areaOrder = (profile: AgentProfile | undefined): LmsArea[] => {
	const scored = LMS_AREAS.filter((a) => a !== 'GENERAL').sort((a, b) => {
		const da = areaDimension(a, profile);
		const db = areaDimension(b, profile);
		return (
			(da ? dimensionPercent(da) : 100) - (db ? dimensionPercent(db) : 100)
		);
	});
	return [...scored, 'GENERAL'];
};

/** How many completed items in this area were measured, and how many of those improved. */
export const areaEvidence = (
	area: LmsArea,
	completed: LmsAssignment[],
	contentById: Record<string, LmsContent>
) => {
	const rows = completed.filter((a) => contentById[a.contentId]?.area === area);
	const measured = rows.filter(
		(a) => a.impact && a.impact.verdict !== 'PENDING'
	);
	return {
		finished: rows.length,
		measured: measured.length,
		improved: measured.filter((a) => a.impact?.verdict === 'IMPROVED').length,
	};
};
