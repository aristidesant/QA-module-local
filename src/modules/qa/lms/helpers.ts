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
import { NOW_ISO, QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type { RosterAgent, TeamRole } from '~/modules/qa/team/types';
import { IMPACT_THRESHOLD } from './constants';
import { day } from './mockData';

export const today = () => NOW_ISO.slice(0, 10);

export const daysUntil = (isoDate: string) =>
	Math.ceil((new Date(isoDate).getTime() - new Date(NOW_ISO).getTime()) / 86_400_000);

export const isOverdue = (a: LmsAssignment) => a.status !== 'COMPLETED' && a.dueDate < today();

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

export const verdictFromDelta = (delta: number, higherIsBetter: boolean): LmsImpactVerdict => {
	const signed = higherIsBetter ? delta : -delta;
	return signed >= IMPACT_THRESHOLD ? 'IMPROVED' : signed <= -IMPACT_THRESHOLD ? 'DECLINED' : 'SAME';
};

export const pathProgress = (path: LmsLearningPath, enrollment: LmsPathEnrollment | undefined) => {
	const required = path.modules.filter((m) => m.required).length || path.modules.length;
	const done = enrollment
		? path.modules.filter((m) => enrollment.completedContentIds.includes(m.contentId)).length
		: 0;
	return { done, total: path.modules.length, percent: Math.min(100, Math.round((done / Math.max(1, required)) * 100)) };
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
	optional: rows.filter((a) => !a.mandatory && a.status !== 'COMPLETED' && !needsResponse(a)),
	completed: rows
		.filter((a) => a.status === 'COMPLETED')
		.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
});

// ── Manager side ──────────────────────────────────────────────────────────────

/** Agents the role may see and assign to: the supervisor only sees Team 1. */
export const managerScopeAgents = (role: TeamRole): RosterAgent[] =>
	TEAM_AGENTS.filter((a) => role === 'qa-manager' || a.supervisorId === SUPERVISOR_PERSONA.id);

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
			(r) => r.acceptance.status === 'PENDING' || r.acceptance.status === 'NO_RESPONSE'
		).length,
		rescheduleRequests: rows.filter((r) => r.acceptance.status === 'RESCHEDULE_REQUESTED').length,
		overdue: open.filter(isOverdue).length,
		completionRate: last30.length
			? Math.round((last30.filter((r) => r.status === 'COMPLETED').length / last30.length) * 100)
			: 0,
	};
};

export const contentImpactSummary = (rows: AssignmentRow[], contentId: string) => {
	const done = rows.filter((r) => r.contentId === contentId && r.impact && r.impact.verdict !== 'PENDING');
	const count = (v: LmsImpactVerdict) => done.filter((r) => r.impact?.verdict === v).length;
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
		completedThisMonth: rows.filter((a) => a.completedAt && a.completedAt >= `${today().slice(0, 7)}-01`).length,
		quizAverage: scored.length
			? Math.round(scored.reduce((x, a) => x + (a.score ?? 0), 0) / scored.length)
			: null,
	};
};
