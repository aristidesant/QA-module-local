import { useMemo } from 'react';
import type { CoachingActionItem, CoachingSessionRecord } from '~/models/qa';
import { TODAY } from '~/modules/qa/analytics/constants';
import { AGENT_PERSONA } from '~/modules/qa/lms/constants';
import { daysUntil } from '~/modules/qa/lms/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import {
	selectCohorts,
	selectSessions,
	useCoachingStore,
} from '~/stores/qa/coachingStore';
import { sessionImpacts, type SessionImpactRow } from '../postCoaching';

export interface OpenActionItem {
	session: CoachingSessionRecord;
	item: CoachingActionItem;
}

export type PendingKind = 'ACTION_ITEM' | 'COMMITMENT';

/** One thing the agent still owes: an action item to acknowledge or a session commitment. */
export interface PendingItem {
	/** The action item id, or `commit-<sessionId>` for a commitment. */
	id: string;
	kind: PendingKind;
	session: CoachingSessionRecord;
	/** ACTION_ITEM only. */
	item?: CoachingActionItem;
	/** null for a commitment, which has no deadline. */
	dueDate: string | null;
	/** Days until due; negative means overdue; null for a commitment. */
	daysLeft: number | null;
}

/** How many recent sessions the page lists with their action items. */
const RECENT_SESSIONS = 3;

export interface AgentSessions {
	/** Every session the agent is part of (own, group, cohort), newest first, PROPOSED excluded. */
	all: CoachingSessionRecord[];
	/** The soonest SCHEDULED session from today on, or null. */
	next: CoachingSessionRecord | null;
	/** Action items not yet acknowledged, with their session, oldest due first. */
	openItems: OpenActionItem[];
	/** Completed coach-led sessions whose commitment is not acknowledged yet. */
	openCommitments: CoachingSessionRecord[];
	/** Everything still owed, most urgent first: overdue, then commitments, then by due date. */
	pending: PendingItem[];
	/** How many entries of `pending` are past their due date. */
	overdueCount: number;
	/** The last completed coach-led sessions, newest first. */
	recent: CoachingSessionRecord[];
	/** Impact rows of the agent's completed coach-led sessions, newest first. */
	impacts: SessionImpactRow[];
	/** Coach-led sessions that happened or were missed, newest first (the table). */
	history: CoachingSessionRecord[];
}

const HISTORY_STATUSES: CoachingSessionRecord['status'][] = [
	'COMPLETED',
	'MISSED',
	'CANCELLED',
];

/** Overdue first (most overdue first), then commitments (newest session first), then the rest by due date. */
const byUrgency = (a: PendingItem, b: PendingItem): number => {
	const rank = (p: PendingItem) =>
		p.daysLeft !== null && p.daysLeft < 0 ? 0 : p.kind === 'COMMITMENT' ? 1 : 2;
	const diff = rank(a) - rank(b);
	if (diff !== 0) return diff;
	if (a.kind === 'COMMITMENT' && b.kind === 'COMMITMENT')
		return b.session.date.localeCompare(a.session.date);
	return (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
};

/** Everything the agent's Coaching page shows, derived from the coaching store. */
export const useAgentSessions = (agentId = AGENT_PERSONA.id): AgentSessions => {
	const sessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);

	return useMemo(() => {
		const myCohortIds = cohorts
			.filter((c) => c.agentIds.includes(agentId))
			.map((c) => c.id);
		const all = sessions
			.filter(
				(s) =>
					s.status !== 'PROPOSED' &&
					(s.agentId === agentId ||
						s.agentIds?.includes(agentId) ||
						(s.cohortId && myCohortIds.includes(s.cohortId)))
			)
			.sort((a, b) => b.date.localeCompare(a.date));

		const next =
			all
				.filter((s) => s.status === 'SCHEDULED' && s.date.slice(0, 10) >= TODAY)
				.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

		const completed = all.filter((s) => s.status === 'COMPLETED');
		const openItems = completed
			.flatMap((session) =>
				session.actionItems
					.filter((item) => !item.acknowledgedByAgent)
					.map((item) => ({ session, item }))
			)
			.sort((a, b) => a.item.dueDate.localeCompare(b.item.dueDate));
		const openCommitments = completed.filter(
			(s) => s.type !== 'AI_MESSAGE' && !s.agentCommitment.acknowledged
		);

		const pending: PendingItem[] = [
			...openItems.map(
				({ session, item }): PendingItem => ({
					id: item.id,
					kind: 'ACTION_ITEM',
					session,
					item,
					dueDate: item.dueDate,
					daysLeft: daysUntil(item.dueDate),
				})
			),
			...openCommitments.map(
				(session): PendingItem => ({
					id: `commit-${session.id}`,
					kind: 'COMMITMENT',
					session,
					dueDate: null,
					daysLeft: null,
				})
			),
		].sort(byUrgency);
		const overdueCount = pending.filter(
			(p) => p.daysLeft !== null && p.daysLeft < 0
		).length;

		const impacts = sessionImpacts(all, TEAM_AGENTS)
			.filter((r) => r.agentId === agentId && r.kind === 'COACH_LED')
			.sort((a, b) => b.day.localeCompare(a.day));
		const history = all.filter(
			(s) => s.type !== 'AI_MESSAGE' && HISTORY_STATUSES.includes(s.status)
		);
		const recent = history
			.filter((s) => s.status === 'COMPLETED')
			.slice(0, RECENT_SESSIONS);

		return {
			all,
			next,
			openItems,
			openCommitments,
			pending,
			overdueCount,
			recent,
			impacts,
			history,
		};
	}, [sessions, cohorts, agentId]);
};
