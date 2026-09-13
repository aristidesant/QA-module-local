import { create } from 'zustand';
import i18n from '~/locales/i18n';
import type {
	CoachingActionItem,
	CoachingActivityEntry,
	CoachingCohort,
	CoachingRule,
	CoachingSessionRecord,
	CoachRole,
	RuleStatus,
} from '~/models/qa';
import { useLmsStore } from '~/stores/qa/lmsStore';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import {
	COACHING_ACTIVITY_SEEDS,
	COACHING_COHORT_SEEDS,
	COACHING_RULE_SEEDS,
	COACHING_SESSION_SEEDS,
} from '~/modules/qa/coaching/mockData';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { NOW_ISO, QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { day } from '~/modules/qa/lms/mockData';
import { today } from '~/modules/qa/lms/helpers';
import { AGENT_LMS_PATH } from '~/modules/qa/lms/constants';

let counter = 300;
export const nextCoachingId = (prefix: string) => `${prefix}-${++counter}`;

export interface ScheduleSessionInput {
	agentId: string;
	agentName: string;
	date: string;
	durationMin: number;
	type: CoachingSessionRecord['type'];
	topic: string;
	area: CoachingSessionRecord['area'];
	subItem: string | null;
	evidenceCallIds: string[];
	talkingPoints: string[];
	notes: string;
	linkedAssignmentIds: string[];
	ruleId?: string | null;
	cohortId?: string | null;
}

interface CoachingState {
	rules: CoachingRule[];
	sessions: CoachingSessionRecord[];
	cohorts: CoachingCohort[];
	activity: CoachingActivityEntry[];
	/** agentId → ISO date the agent is hidden from the queue until. */
	snoozed: Record<string, string>;

	addRule: (rule: CoachingRule) => void;
	updateRule: (rule: CoachingRule) => void;
	deleteRule: (id: string) => void;
	setRuleStatus: (id: string, status: RuleStatus) => void;
	duplicateRule: (id: string) => CoachingRule | null;
	/** Demo: applies a rule to the given agents through the LMS store and logs the activity. */
	runRuleNow: (ruleId: string, agentIds: string[], by: { name: string; role: CoachRole }) => number;

	scheduleSession: (
		input: ScheduleSessionInput,
		by: { id: string; name: string; role: CoachRole }
	) => CoachingSessionRecord;
	updateSession: (session: CoachingSessionRecord) => void;
	completeSession: (
		id: string,
		outcome: string,
		actionItems: CoachingActionItem[],
		followUpDate: string | null
	) => void;
	setSessionStatus: (id: string, status: CoachingSessionRecord['status']) => void;
	acknowledgeActionItem: (sessionId: string, itemId: string) => void;
	acknowledgeCommitment: (sessionId: string, comment: string | null) => void;

	addCohort: (cohort: Omit<CoachingCohort, 'id' | 'createdAt'>) => CoachingCohort;
	updateCohort: (cohort: CoachingCohort) => void;
	deleteCohort: (id: string) => void;

	snoozeAgent: (agentId: string, days: number) => void;
	logActivity: (entry: Omit<CoachingActivityEntry, 'id' | 'date'>) => void;
}

const notifySession = (session: CoachingSessionRecord, title: string, message: string) =>
	useNotificationStore.getState().addNotification({
		id: nextCoachingId('ntf'),
		agentId: session.agentId,
		category: 'DIRECT_MESSAGE',
		priority: 'NORMAL',
		title,
		message,
		icon: 'school',
		sourceRole: session.coachRole,
		sourceId: session.coachRole === 'QA_MANAGER' ? QA_MANAGER_PERSONA.id : SUPERVISOR_PERSONA.id,
		read: false,
		archived: false,
		actioned: false,
		createdAt: NOW_ISO,
		actions: [{ label: 'View coaching', url: `${AGENT_LMS_PATH}?tab=coaching`, icon: 'school' }],
	});

export const useCoachingStore = create<CoachingState>((set, get) => ({
	rules: COACHING_RULE_SEEDS,
	sessions: COACHING_SESSION_SEEDS,
	cohorts: COACHING_COHORT_SEEDS,
	activity: COACHING_ACTIVITY_SEEDS,
	snoozed: {},

	addRule: (rule) => set((s) => ({ rules: [rule, ...s.rules] })),

	updateRule: (rule) =>
		set((s) => ({ rules: s.rules.map((r) => (r.id === rule.id ? { ...rule, updatedAt: NOW_ISO } : r)) })),

	deleteRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

	setRuleStatus: (id, status) =>
		set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, status, updatedAt: NOW_ISO } : r)) })),

	duplicateRule: (id) => {
		const original = get().rules.find((r) => r.id === id);
		if (!original) return null;
		const copy: CoachingRule = {
			...original,
			id: nextCoachingId('cr'),
			name: `${original.name} (copy)`,
			status: 'DRAFT',
			stats: { triggeredLast30Days: 0, agentsAffected: 0, improvedRate: null, lastTriggeredAt: null },
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({ rules: [copy, ...s.rules] }));
		return copy;
	},

	runRuleNow: (ruleId, agentIds, by) => {
		const rule = get().rules.find((r) => r.id === ruleId);
		if (!rule || agentIds.length === 0) return 0;

		const tTriggers = i18n.getFixedT(null, 'qa.triggers');
		const conditionText = rule.conditions.length ? describeCondition(tTriggers, rule.conditions[0]) : '';
		const reason = conditionText ? `${rule.name} — ${conditionText}` : rule.name;
		const dueDate = day(today(), rule.action.dueInDays);
		const lms = useLmsStore.getState();
		const paths = lms.paths;

		for (const agentId of agentIds) {
			let createdIds: string[] = [];

			if (rule.action.kind === 'ASSIGN_PATH' && rule.action.pathId) {
				lms.enroll([agentId], rule.action.pathId, by.name, 'COACHING_RULE', dueDate);
				const path = paths.find((p) => p.id === rule.action.pathId);
				const created = lms.assign({
					agentIds: [agentId],
					contentIds: path ? path.modules.filter((m) => m.required).map((m) => m.contentId) : [],
					pathId: rule.action.pathId,
					dueDate,
					mandatory: rule.action.mandatory,
					requireAcceptance: rule.action.requireAcceptance,
					reason,
					source: 'LEARNING_PATH',
					ruleId: rule.id,
					assignedBy: by.name,
					assignedByRole: by.role,
				});
				createdIds = created.map((c) => c.id);
			} else {
				const created = lms.assign({
					agentIds: [agentId],
					contentIds: rule.action.contentIds,
					pathId: null,
					dueDate,
					mandatory: rule.action.mandatory,
					requireAcceptance: rule.action.requireAcceptance,
					reason,
					source: 'COACHING_RULE',
					ruleId: rule.id,
					assignedBy: by.name,
					assignedByRole: by.role,
				});
				createdIds = created.map((c) => c.id);
			}

			if (rule.action.scheduleSession) {
				const agent = TEAM_AGENTS.find((a) => a.id === agentId);
				get().scheduleSession(
					{
						agentId,
						agentName: agent?.name ?? agentId,
						date: `${day(today(), 3)}T10:00:00Z`,
						durationMin: 30,
						type: 'ONE_ON_ONE',
						topic: rule.action.sessionTopic,
						area: rule.area,
						subItem: null,
						evidenceCallIds: [],
						talkingPoints: [],
						notes: '',
						linkedAssignmentIds: createdIds,
						ruleId: rule.id,
					},
					{
						id: rule.action.sessionCoach === 'QA_MANAGER' ? QA_MANAGER_PERSONA.id : SUPERVISOR_PERSONA.id,
						name: by.name,
						role: rule.action.sessionCoach,
					}
				);
			}
		}

		set((s) => ({
			rules: s.rules.map((r) =>
				r.id === ruleId
					? {
							...r,
							stats: {
								...r.stats,
								triggeredLast30Days: r.stats.triggeredLast30Days + agentIds.length,
								agentsAffected: r.stats.agentsAffected + agentIds.length,
								lastTriggeredAt: NOW_ISO,
							},
						}
					: r
			),
		}));

		get().logActivity({
			type: 'RULE_FIRED',
			agentId: null,
			agentName: null,
			title: rule.name,
			description: `${reason} · ${agentIds.length} agents`,
			area: rule.area,
			link: '?tab=rules',
		});

		return agentIds.length;
	},

	scheduleSession: (input, by) => {
		const session: CoachingSessionRecord = {
			id: nextCoachingId('coa'),
			agentId: input.agentId,
			agentName: input.agentName,
			coachId: by.id,
			coachName: by.name,
			coachRole: by.role,
			type: input.type,
			date: input.date,
			durationMin: input.durationMin,
			topic: input.topic,
			area: input.area,
			subItem: input.subItem,
			evidenceCallIds: input.evidenceCallIds,
			talkingPoints: input.talkingPoints,
			notes: input.notes,
			actionItems: [],
			agentCommitment: { acknowledged: false, acknowledgedAt: null, comment: null },
			status: 'SCHEDULED',
			outcome: null,
			followUpDate: null,
			linkedAssignmentIds: input.linkedAssignmentIds,
			ruleId: input.ruleId ?? null,
			cohortId: input.cohortId ?? null,
		};

		set((s) => ({ sessions: [session, ...s.sessions] }));

		get().logActivity({
			type: 'SESSION_SCHEDULED',
			agentId: session.agentId,
			agentName: session.agentName,
			title: `Coaching scheduled: ${session.topic}`,
			description: `${session.coachName} · ${new Date(session.date).toLocaleString()}`,
			area: session.area,
			link: '?tab=sessions',
		});

		notifySession(
			session,
			`Coaching session scheduled: ${session.topic}`,
			`${session.coachName} scheduled a coaching session for ${new Date(session.date).toLocaleString()}.`
		);

		return session;
	},

	updateSession: (session) =>
		set((s) => ({ sessions: s.sessions.map((x) => (x.id === session.id ? session : x)) })),

	completeSession: (id, outcome, actionItems, followUpDate) => {
		const session = get().sessions.find((s) => s.id === id);
		if (!session) return;

		set((s) => ({
			sessions: s.sessions.map((x) =>
				x.id === id ? { ...x, status: 'COMPLETED', outcome, actionItems, followUpDate } : x
			),
		}));

		get().logActivity({
			type: 'SESSION_COMPLETED',
			agentId: session.agentId,
			agentName: session.agentName,
			title: `Coaching completed: ${session.topic}`,
			description: outcome,
			area: session.area,
			link: '?tab=sessions',
		});

		notifySession(session, `Coaching summary: ${session.topic}`, outcome);
	},

	setSessionStatus: (id, status) =>
		set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, status } : x)) })),

	acknowledgeActionItem: (sessionId, itemId) =>
		set((s) => ({
			sessions: s.sessions.map((x) =>
				x.id === sessionId
					? {
							...x,
							actionItems: x.actionItems.map((item) =>
								item.id === itemId
									? { ...item, acknowledgedByAgent: true, acknowledgedAt: NOW_ISO }
									: item
							),
						}
					: x
			),
		})),

	acknowledgeCommitment: (sessionId, comment) =>
		set((s) => ({
			sessions: s.sessions.map((x) =>
				x.id === sessionId
					? { ...x, agentCommitment: { acknowledged: true, acknowledgedAt: NOW_ISO, comment } }
					: x
			),
		})),

	addCohort: (cohort) => {
		const created: CoachingCohort = { ...cohort, id: nextCoachingId('coh'), createdAt: NOW_ISO };
		set((s) => ({ cohorts: [created, ...s.cohorts] }));
		get().logActivity({
			type: 'COHORT_CREATED',
			agentId: null,
			agentName: null,
			title: `Cohort created: ${created.name}`,
			description: `${created.createdBy} · ${created.agentIds.length} members`,
			area: null,
			link: '?tab=cohorts',
		});
		return created;
	},

	updateCohort: (cohort) =>
		set((s) => ({ cohorts: s.cohorts.map((c) => (c.id === cohort.id ? cohort : c)) })),

	deleteCohort: (id) => set((s) => ({ cohorts: s.cohorts.filter((c) => c.id !== id) })),

	snoozeAgent: (agentId, days) =>
		set((s) => ({ snoozed: { ...s.snoozed, [agentId]: day(today(), days) } })),

	logActivity: (entry) =>
		set((s) => ({
			activity: [{ ...entry, id: nextCoachingId('cact'), date: NOW_ISO }, ...s.activity],
		})),
}));

export const selectRules = (s: CoachingState) => s.rules;
export const selectSessions = (s: CoachingState) => s.sessions;
export const selectCohorts = (s: CoachingState) => s.cohorts;
export const selectCoachingActivity = (s: CoachingState) => s.activity;
export const selectSnoozed = (s: CoachingState) => s.snoozed;
