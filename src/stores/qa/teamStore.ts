import { create } from 'zustand';
import type { AgentNotification } from '~/models/qa/notifications';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { useLmsStore } from '~/stores/qa/lmsStore';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { DIMENSION_TO_AREA } from '~/modules/qa/lms/constants';
import type {
	ActivityEvent,
	AgentProfile,
	CoachingSession,
	LmsAssignment,
	SupervisorNote,
	TeamRole,
} from '~/modules/qa/team/types';
import { TEAM_PROFILES } from '~/modules/qa/team/mockData';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';

let counter = 500;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export interface ScheduleCoachingInput {
	agentId: string;
	date: string;
	topic: string;
	linkedDimension?: CoachingSession['linkedDimension'];
	notes?: string;
}
export interface AssignLmsInput {
	agentId: string;
	materialId: string;
	title: string;
	type: LmsAssignment['type'];
	dueDate: string;
	mandatory: boolean;
}
export interface SendMessageInput {
	agentId: string;
	title: string;
	message: string;
	priority: AgentNotification['priority'];
}

interface TeamState {
	profiles: Record<string, AgentProfile>;
	scheduleCoaching: (
		input: ScheduleCoachingInput,
		role: TeamRole
	) => CoachingSession;
	assignLms: (input: AssignLmsInput, role: TeamRole) => LmsAssignment;
	sendMessage: (input: SendMessageInput, role: TeamRole) => void;
	addNote: (agentId: string, text: string, role: TeamRole) => SupervisorNote;
	togglePinNote: (agentId: string, noteId: string) => void;
	acknowledgeAlert: (agentId: string, alertId: string) => void;
}

const author = (role: TeamRole) =>
	role === 'qa-manager'
		? { ...QA_MANAGER_PERSONA, sourceRole: 'QA_MANAGER' as const }
		: { ...SUPERVISOR_PERSONA, sourceRole: 'SUPERVISOR' as const };

const notify = (
	role: TeamRole,
	agentId: string,
	partial: Pick<
		AgentNotification,
		'category' | 'priority' | 'title' | 'message' | 'icon' | 'actions'
	> &
		Pick<Partial<AgentNotification>, 'payload'>
) => {
	const a = author(role);
	useNotificationStore
		.getState()
		.addNotification(
			buildNotification({
				agentId,
				sourceRole: a.sourceRole,
				sourceId: a.id,
				payload: { kind: 'MESSAGE' },
				...partial,
			})
		);
};

const prepend = (
	profile: AgentProfile,
	event: ActivityEvent
): AgentProfile => ({ ...profile, activity: [event, ...profile.activity] });

export const useTeamStore = create<TeamState>((set, get) => ({
	profiles: TEAM_PROFILES,

	/**
	 * Creates the real session in the coaching store (which notifies the agent) and
	 * mirrors a legacy row on the profile so the Your Team counters keep working.
	 */
	scheduleCoaching: (input, role) => {
		const a = author(role);
		const session: CoachingSession = {
			id: nextId('coa'),
			date: input.date,
			topic: input.topic,
			coachName: a.name,
			coachRole: a.sourceRole,
			status: 'scheduled',
			linkedDimension: input.linkedDimension,
			outcome: input.notes,
		};
		useCoachingStore.getState().scheduleSession(
			{
				agentId: input.agentId,
				agentName: get().profiles[input.agentId].agent.name,
				date: input.date,
				durationMin: 30,
				type: 'ONE_ON_ONE',
				topic: input.topic,
				area: input.linkedDimension
					? DIMENSION_TO_AREA[input.linkedDimension]
					: null,
				subItem: null,
				evidenceCallIds: [],
				talkingPoints: [],
				notes: input.notes ?? '',
				linkedAssignmentIds: [],
			},
			{ id: a.id, name: a.name, role: a.sourceRole }
		);
		set((s) => {
			const p = s.profiles[input.agentId];
			const updated = prepend(
				{ ...p, coaching: [session, ...p.coaching] },
				{
					id: nextId('act'),
					type: 'coaching',
					date: NOW_ISO,
					title: `Coaching scheduled: ${session.topic}`,
					description: `${a.name} · ${new Date(input.date).toLocaleDateString()}`,
				}
			);
			return { profiles: { ...s.profiles, [input.agentId]: updated } };
		});
		return session;
	},

	/**
	 * Creates the real assignment in the LMS store (which notifies the agent) and
	 * mirrors a legacy row on the profile so the Your Team counters keep working.
	 */
	assignLms: (input, role) => {
		const a = author(role);
		useLmsStore.getState().assign({
			agentIds: [input.agentId],
			contentIds: [input.materialId],
			dueDate: input.dueDate,
			mandatory: input.mandatory,
			requireAcceptance: input.mandatory,
			reason: 'Assigned from the agent profile',
			assignedBy: a.name,
			assignedByRole: a.sourceRole,
		});
		const assignment: LmsAssignment = {
			id: nextId('lms'),
			materialId: input.materialId,
			title: input.title,
			type: input.type,
			mandatory: input.mandatory,
			assignedAt: NOW_ISO.slice(0, 10),
			assignedBy: a.name,
			dueDate: input.dueDate,
			progress: 0,
			status: 'not-started',
		};
		set((s) => {
			const p = s.profiles[input.agentId];
			const updated = prepend(
				{ ...p, lms: [assignment, ...p.lms] },
				{
					id: nextId('act'),
					type: 'lms',
					date: NOW_ISO,
					title: `Assigned: ${assignment.title}`,
					description: `${assignment.type} · due ${assignment.dueDate}${assignment.mandatory ? ' · mandatory' : ''}`,
				}
			);
			return { profiles: { ...s.profiles, [input.agentId]: updated } };
		});
		return assignment;
	},

	sendMessage: (input, role) => {
		const a = author(role);
		set((s) => {
			const p = s.profiles[input.agentId];
			return {
				profiles: {
					...s.profiles,
					[input.agentId]: prepend(p, {
						id: nextId('act'),
						type: 'note',
						date: NOW_ISO,
						title: `Message sent: ${input.title}`,
						description: `${a.name} · ${input.priority}`,
					}),
				},
			};
		});
		notify(role, input.agentId, {
			category: 'DIRECT_MESSAGE',
			priority: input.priority,
			title: input.title,
			message: input.message,
			icon: 'message',
			payload: { kind: 'MESSAGE' },
		});
	},

	addNote: (agentId, text, role) => {
		const a = author(role);
		const note: SupervisorNote = {
			id: nextId('note'),
			agentId,
			authorName: a.name,
			authorRole: a.sourceRole,
			createdAt: NOW_ISO,
			text,
			pinned: false,
		};
		set((s) => ({
			profiles: {
				...s.profiles,
				[agentId]: {
					...s.profiles[agentId],
					notes: [note, ...s.profiles[agentId].notes],
				},
			},
		}));
		return note;
	},

	togglePinNote: (agentId, noteId) =>
		set((s) => ({
			profiles: {
				...s.profiles,
				[agentId]: {
					...s.profiles[agentId],
					notes: s.profiles[agentId].notes.map((n) =>
						n.id === noteId ? { ...n, pinned: !n.pinned } : n
					),
				},
			},
		})),

	acknowledgeAlert: (agentId, alertId) =>
		set((s) => {
			const p = s.profiles[agentId];
			return {
				profiles: {
					...s.profiles,
					[agentId]: {
						...p,
						risk: {
							...p.risk,
							alerts: p.risk.alerts.map((al) =>
								al.id === alertId ? { ...al, acknowledged: true } : al
							),
						},
					},
				},
			};
		}),
}));

export const selectProfile = (agentId: string | undefined) => (s: TeamState) =>
	agentId ? s.profiles[agentId] : undefined;
export const selectVisibleProfiles = (role: TeamRole) => (s: TeamState) =>
	Object.values(s.profiles).filter(
		(p) =>
			role === 'qa-manager' || p.agent.supervisorId === SUPERVISOR_PERSONA.id
	);
