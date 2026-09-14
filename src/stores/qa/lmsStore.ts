import { create } from 'zustand';
import type { AgentNotification } from '~/models/qa/notifications';
import type {
	LmsAssignment,
	LmsAssignerRole,
	LmsAssignmentSource,
	LmsContent,
	LmsContentStatus,
	LmsLearningPath,
	LmsPathEnrollment,
	LmsRescheduleDecision,
} from '~/models/qa';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import {
	LMS_ASSIGNMENT_SEEDS,
	LMS_CONTENT,
	LMS_ENROLLMENT_SEEDS,
	LMS_PATHS,
	buildImpact,
	day,
	seeded,
} from '~/modules/qa/lms/mockData';
import { AGENT_LMS_PATH } from '~/modules/qa/lms/constants';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';

let counter = 900;
export const nextLmsId = (prefix: string) => `${prefix}-${++counter}`;

const TODAY = NOW_ISO.slice(0, 10);

export interface AssignInput {
	agentIds: string[];
	contentIds: string[];
	pathId?: string | null;
	/** YYYY-MM-DD */
	dueDate: string;
	mandatory: boolean;
	requireAcceptance: boolean;
	reason: string;
	source?: LmsAssignmentSource;
	ruleId?: string | null;
	assignedBy: string;
	assignedByRole: LmsAssignerRole;
}

interface LmsState {
	content: LmsContent[];
	paths: LmsLearningPath[];
	assignments: LmsAssignment[];
	enrollments: LmsPathEnrollment[];
	/** Manager side */
	assign: (input: AssignInput) => LmsAssignment[];
	enroll: (
		agentIds: string[],
		pathId: string,
		enrolledBy: string,
		source: LmsPathEnrollment['source'],
		dueDate: string | null
	) => void;
	setContentStatus: (contentId: string, status: LmsContentStatus) => void;
	decideReschedule: (
		assignmentId: string,
		decision: LmsRescheduleDecision,
		decidedBy: string
	) => void;
	/** Agent side */
	accept: (assignmentId: string) => void;
	requestReschedule: (
		assignmentId: string,
		proposedDueDate: string,
		reason: string
	) => void;
	updateProgress: (assignmentId: string, progress: number) => void;
	complete: (assignmentId: string, score?: number | null) => void;
	selfEnroll: (agentId: string, contentId: string) => LmsAssignment | undefined;
	selfEnrollPath: (agentId: string, pathId: string) => void;
}

/** Pushes an inbox notification to the agent. Reused by the manager drawers and the coaching queue. */
export const notifyAgent = (
	agentId: string,
	from: { name: string; role: LmsAssignerRole },
	partial: Pick<
		AgentNotification,
		'priority' | 'title' | 'message' | 'actions'
	> &
		Pick<Partial<AgentNotification>, 'payload'>
) =>
	useNotificationStore.getState().addNotification(
		buildNotification({
			agentId,
			category: 'DIRECT_MESSAGE',
			icon: 'book',
			sourceRole:
				from.role === 'QA_MANAGER'
					? 'QA_MANAGER'
					: from.role === 'SUPERVISOR'
						? 'SUPERVISOR'
						: 'SYSTEM',
			sourceId:
				from.role === 'QA_MANAGER'
					? QA_MANAGER_PERSONA.id
					: SUPERVISOR_PERSONA.id,
			payload: { kind: 'MESSAGE' },
			...partial,
		})
	);

export const useLmsStore = create<LmsState>((set, get) => ({
	content: LMS_CONTENT,
	paths: LMS_PATHS,
	assignments: LMS_ASSIGNMENT_SEEDS,
	enrollments: LMS_ENROLLMENT_SEEDS,

	assign: (input) => {
		const created: LmsAssignment[] = [];
		for (const agentId of input.agentIds) {
			for (const contentId of input.contentIds) {
				const alreadyOpen = get().assignments.some(
					(a) =>
						a.agentId === agentId &&
						a.contentId === contentId &&
						a.status !== 'COMPLETED'
				);
				if (alreadyOpen) continue;
				created.push({
					id: nextLmsId('lms-a'),
					agentId,
					contentId,
					pathId: input.pathId ?? null,
					source: input.source ?? 'MANUAL',
					ruleId: input.ruleId ?? null,
					reason: input.reason,
					assignedBy: input.assignedBy,
					assignedByRole: input.assignedByRole,
					assignedAt: TODAY,
					dueDate: input.dueDate,
					mandatory: input.mandatory,
					acceptance: {
						status: input.requireAcceptance ? 'PENDING' : 'NOT_REQUIRED',
						respondedAt: null,
						proposedDueDate: null,
						reason: null,
						decision: null,
						decidedBy: null,
						decidedAt: null,
					},
					status: 'NOT_STARTED',
					progress: 0,
					startedAt: null,
					completedAt: null,
					score: null,
					attempts: 0,
					impact: null,
				});
			}
		}

		if (created.length) {
			set((s) => ({ assignments: [...created, ...s.assignments] }));
		}

		for (const a of created) {
			if (a.source === 'SELF') continue;
			const c = get().content.find((x) => x.id === a.contentId);
			notifyAgent(
				a.agentId,
				{ name: a.assignedBy, role: a.assignedByRole },
				{
					priority: a.mandatory ? 'HIGH' : 'NORMAL',
					title: `New training assigned: ${c?.title ?? a.contentId}`,
					message: `${a.assignedBy} assigned "${c?.title ?? a.contentId}" · due ${a.dueDate}${
						a.acceptance.status === 'PENDING'
							? ' · please accept or propose a new date'
							: ''
					}. ${a.reason}`,
					actions: [
						{
							label: 'Open My Learning',
							url: `${AGENT_LMS_PATH}?tab=assignments`,
							icon: 'book',
						},
					],
				}
			);
		}

		return created;
	},

	enroll: (agentIds, pathId, enrolledBy, source, dueDate) =>
		set((s) => ({
			enrollments: [
				...agentIds
					.filter(
						(id) =>
							!s.enrollments.some(
								(e) => e.agentId === id && e.pathId === pathId
							)
					)
					.map((agentId) => ({
						id: nextLmsId('enr'),
						agentId,
						pathId,
						source,
						enrolledBy,
						enrolledAt: TODAY,
						dueDate,
						completedContentIds: [],
						completedAt: null,
					})),
				...s.enrollments,
			],
		})),

	setContentStatus: (contentId, status) =>
		set((s) => ({
			content: s.content.map((c) =>
				c.id === contentId ? { ...c, status, updatedAt: TODAY } : c
			),
		})),

	decideReschedule: (assignmentId, decision, decidedBy) =>
		set((s) => ({
			assignments: s.assignments.map((a) =>
				a.id !== assignmentId
					? a
					: {
							...a,
							dueDate:
								decision === 'APPROVED' && a.acceptance.proposedDueDate
									? a.acceptance.proposedDueDate
									: a.dueDate,
							acceptance: {
								...a.acceptance,
								status: 'ACCEPTED',
								decision,
								decidedBy,
								decidedAt: NOW_ISO,
							},
						}
			),
		})),

	accept: (assignmentId) =>
		set((s) => ({
			assignments: s.assignments.map((a) =>
				a.id === assignmentId
					? {
							...a,
							acceptance: {
								...a.acceptance,
								status: 'ACCEPTED',
								respondedAt: NOW_ISO,
							},
						}
					: a
			),
		})),

	requestReschedule: (assignmentId, proposedDueDate, reason) =>
		set((s) => ({
			assignments: s.assignments.map((a) =>
				a.id === assignmentId
					? {
							...a,
							acceptance: {
								...a.acceptance,
								status: 'RESCHEDULE_REQUESTED',
								respondedAt: NOW_ISO,
								proposedDueDate,
								reason,
							},
						}
					: a
			),
		})),

	updateProgress: (assignmentId, progress) =>
		set((s) => ({
			assignments: s.assignments.map((a) =>
				a.id === assignmentId && a.status !== 'COMPLETED'
					? {
							...a,
							progress: Math.max(
								a.progress,
								Math.min(99, Math.round(progress))
							),
							status: 'IN_PROGRESS',
							startedAt: a.startedAt ?? TODAY,
						}
					: a
			),
		})),

	complete: (assignmentId, score = null) => {
		const a = get().assignments.find((x) => x.id === assignmentId);
		if (!a) return;
		const c = get().content.find((x) => x.id === a.contentId);
		const rand = seeded(4441 + counter);
		const impact = c?.impactMetricId
			? buildImpact(c.impactMetricId, TODAY, rand, 'IMPROVED')
			: null;

		set((s) => ({
			assignments: s.assignments.map((x) =>
				x.id === assignmentId
					? {
							...x,
							status: 'COMPLETED',
							progress: 100,
							completedAt: TODAY,
							score,
							attempts: x.attempts + (score !== null ? 1 : 0),
							impact,
						}
					: x
			),
			enrollments: s.enrollments.map((e) => {
				if (e.agentId !== a.agentId) return e;
				const belongs = a.pathId
					? e.pathId === a.pathId
					: s.paths.some(
							(p) =>
								p.id === e.pathId &&
								p.modules.some((m) => m.contentId === a.contentId)
						);
				if (!belongs || e.completedContentIds.includes(a.contentId)) return e;
				return {
					...e,
					completedContentIds: [...e.completedContentIds, a.contentId],
				};
			}),
		}));
	},

	selfEnroll: (agentId, contentId) => {
		const [created] = get().assign({
			agentIds: [agentId],
			contentIds: [contentId],
			dueDate: day(TODAY, 14),
			mandatory: false,
			requireAcceptance: false,
			reason: 'Self-enrolled from the catalogue',
			source: 'SELF',
			assignedBy: 'You',
			assignedByRole: 'AGENT',
		});
		return created;
	},

	selfEnrollPath: (agentId, pathId) =>
		get().enroll([agentId], pathId, 'You', 'SELF', null),
}));

export const selectAssignments = (s: LmsState) => s.assignments;
export const selectContent = (s: LmsState) => s.content;
export const selectPaths = (s: LmsState) => s.paths;
export const selectEnrollments = (s: LmsState) => s.enrollments;
