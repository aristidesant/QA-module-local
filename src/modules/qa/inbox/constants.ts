import type { TablerIcon } from '@tabler/icons-react';
import {
	IconMessage,
	IconAlertTriangle,
	IconTrendingDown,
	IconTrophy,
	IconCalendarStats,
} from '@tabler/icons-react';
import type {
	AgentNotification,
	NotificationRecipientRole,
} from '~/models/qa/notifications';
import {
	AGENT_PERSONA_ID,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';

/** The three roles that own an inbox in this demo. */
export type InboxRole = 'agent' | 'supervisor' | 'qa-manager';

export const INBOX_IDENTITY: Record<
	InboxRole,
	{ role: NotificationRecipientRole; id: string; name: string }
> = {
	agent: { role: 'AGENT', id: AGENT_PERSONA_ID, name: 'John Smith' },
	supervisor: {
		role: 'SUPERVISOR',
		id: SUPERVISOR_PERSONA.id,
		name: SUPERVISOR_PERSONA.name,
	},
	'qa-manager': {
		role: 'QA_MANAGER',
		id: QA_MANAGER_PERSONA.id,
		name: QA_MANAGER_PERSONA.name,
	},
};

/** Operation Manager previews the QA Manager inbox; everything else falls back to the agent. */
export const inboxRoleFromPath = (pathname: string): InboxRole =>
	pathname.startsWith('/qa/supervisor')
		? 'supervisor'
		: pathname.startsWith('/qa/qa-manager') ||
			  pathname.startsWith('/qa/operation-manager')
			? 'qa-manager'
			: 'agent';

export const disputesBasePath = (role: InboxRole) => `/qa/${role}/disputes`;
export const rankingsBasePath = (role: InboxRole) => `/qa/${role}/rankings`;
export const analyticsPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/analytics' : `/qa/${role}/analytics`;
export const coachingPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/lms?tab=coaching' : `/qa/${role}/coaching`;
export const lmsPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/lms' : `/qa/${role}/lms`;
export const customersPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/analytics' : `/qa/${role}/customers`;

export const CATEGORY_META: Record<
	AgentNotification['category'],
	{ color: string; icon: TablerIcon }
> = {
	DIRECT_MESSAGE: { color: 'blue', icon: IconMessage },
	METRIC_ALERT: { color: 'red', icon: IconAlertTriangle },
	TREND_WARNING: { color: 'orange', icon: IconTrendingDown },
	POSITIVE_RECOGNITION: { color: 'green', icon: IconTrophy },
	WEEKLY_SUMMARY: { color: 'grape', icon: IconCalendarStats },
};

export const PRIORITY_COLOR: Record<AgentNotification['priority'], string> = {
	CRITICAL: 'red',
	HIGH: 'orange',
	NORMAL: 'blue',
	LOW: 'gray',
};

export const CATEGORY_ORDER: AgentNotification['category'][] = [
	'DIRECT_MESSAGE',
	'METRIC_ALERT',
	'TREND_WARNING',
	'POSITIVE_RECOGNITION',
	'WEEKLY_SUMMARY',
];

/** Resolves a sender/recipient id to a display name across personas and the roster. */
export const personNameOf = (id: string | undefined): string | null => {
	if (!id) return null;
	if (id === SUPERVISOR_PERSONA.id) return SUPERVISOR_PERSONA.name;
	if (id === QA_MANAGER_PERSONA.id) return QA_MANAGER_PERSONA.name;
	return TEAM_AGENTS.find((agent) => agent.id === id)?.name ?? null;
};
