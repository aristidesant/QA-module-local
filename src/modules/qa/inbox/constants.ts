import type { TablerIcon } from '@tabler/icons-react';
import {
	IconMessage,
	IconAlertTriangle,
	IconTrendingDown,
	IconTrophy,
	IconCalendarStats,
	IconFlame,
	IconAward,
	IconUsersGroup,
	IconSchool,
	IconPhoneCall,
	IconGavel,
	IconTarget,
} from '@tabler/icons-react';
import type {
	AgentNotification,
	NotificationPayload,
	NotificationRecipientRole,
} from '~/models/qa/notifications';
import {
	AGENT_PERSONA_ID,
	OPERATION_MANAGER_PERSONA,
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

/** Who can look at an inbox: the three roles plus the Operation Manager, which has its own mailbox but the QA Manager's routes. */
export type InboxViewer = InboxRole | 'operation-manager';

export const INBOX_VIEWER_IDENTITY: Record<
	InboxViewer,
	{ role: NotificationRecipientRole; id: string; name: string }
> = {
	...INBOX_IDENTITY,
	'operation-manager': {
		role: 'OPERATION_MANAGER',
		id: OPERATION_MANAGER_PERSONA.id,
		name: OPERATION_MANAGER_PERSONA.name,
	},
};

export const inboxViewerFromPath = (pathname: string): InboxViewer =>
	pathname.startsWith('/qa/operation-manager')
		? 'operation-manager'
		: inboxRoleFromPath(pathname);

/** The role whose routes serve this viewer (the Operation Manager reuses the QA Manager's pages). */
export const inboxRouteRole = (viewer: InboxViewer): InboxRole =>
	viewer === 'operation-manager' ? 'qa-manager' : viewer;

export const disputesBasePath = (role: InboxRole) => `/qa/${role}/disputes`;

/** Where the disputes LIST lives per role — the agent's is a tab of My Calls. Detail links keep disputesBasePath. */
export const disputesListPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/calls?tab=disputes' : `/qa/${role}/disputes`;

export const rankingsBasePath = (role: InboxRole) => `/qa/${role}/rankings`;
/** The agent has no dedicated analytics page — their metrics live on the dashboard. */
export const analyticsPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/dashboards/agent' : `/qa/${role}/analytics`;
export const coachingPath = (role: InboxRole) => `/qa/${role}/coaching`;
export const lmsPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/agent/lms' : `/qa/${role}/lms`;
export const customersPath = (role: InboxRole) =>
	role === 'agent' ? '/qa/dashboards/agent' : `/qa/${role}/customers`;

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

/** Exceptions only: High and Critical get a tone; Normal and Low stay plain text. */
export const PRIORITY_TONE: Record<
	AgentNotification['priority'],
	string | null
> = { CRITICAL: 'danger', HIGH: 'amber', NORMAL: null, LOW: null };

/** What an item really is, finer than the five categories: one entry per payload kind. */
export type InboxKind =
	| 'message'
	| 'metricAlert'
	| 'trendWarning'
	| 'burnout'
	| 'recognition'
	| 'badge'
	| 'weeklySummary'
	| 'coaching'
	| 'learning'
	| 'followUp'
	| 'dispute'
	| 'ranking';

export const INBOX_KIND_META: Record<InboxKind, { icon: TablerIcon }> = {
	message: { icon: IconMessage },
	metricAlert: { icon: IconAlertTriangle },
	trendWarning: { icon: IconTrendingDown },
	burnout: { icon: IconFlame },
	recognition: { icon: IconTrophy },
	badge: { icon: IconAward },
	weeklySummary: { icon: IconCalendarStats },
	coaching: { icon: IconUsersGroup },
	learning: { icon: IconSchool },
	followUp: { icon: IconPhoneCall },
	dispute: { icon: IconGavel },
	ranking: { icon: IconTarget },
};

const KIND_BY_PAYLOAD: Record<NotificationPayload['kind'], InboxKind> = {
	MESSAGE: 'message',
	METRIC_ALERT: 'metricAlert',
	TREND_WARNING: 'trendWarning',
	BURNOUT_RISK: 'burnout',
	RECOGNITION: 'recognition',
	BADGE_EARNED: 'badge',
	WEEKLY_SUMMARY: 'weeklySummary',
	COACHING_SESSION: 'coaching',
	LMS_ASSIGNMENT: 'learning',
	FOLLOW_UP: 'followUp',
	DISPUTE_UPDATE: 'dispute',
	RANKING_UPDATE: 'ranking',
};

const KIND_BY_CATEGORY: Record<AgentNotification['category'], InboxKind> = {
	DIRECT_MESSAGE: 'message',
	METRIC_ALERT: 'metricAlert',
	TREND_WARNING: 'trendWarning',
	POSITIVE_RECOGNITION: 'recognition',
	WEEKLY_SUMMARY: 'weeklySummary',
};

/** The display kind of a notification; rows without a payload fall back to their category. */
export const kindOf = (n: AgentNotification): InboxKind =>
	n.payload ? KIND_BY_PAYLOAD[n.payload.kind] : KIND_BY_CATEGORY[n.category];

export const CATEGORY_ORDER: AgentNotification['category'][] = [
	'DIRECT_MESSAGE',
	'METRIC_ALERT',
	'TREND_WARNING',
	'POSITIVE_RECOGNITION',
	'WEEKLY_SUMMARY',
];

/** Agents only, so a team-level item does not show a manager's own name as the agent it is about. */
export const agentNameOf = (id: string | undefined): string | null =>
	TEAM_AGENTS.find((agent) => agent.id === id)?.name ?? null;

/** Resolves a sender/recipient id to a display name across personas and the roster. */
export const personNameOf = (id: string | undefined): string | null => {
	if (!id) return null;
	if (id === SUPERVISOR_PERSONA.id) return SUPERVISOR_PERSONA.name;
	if (id === QA_MANAGER_PERSONA.id) return QA_MANAGER_PERSONA.name;
	if (id === OPERATION_MANAGER_PERSONA.id)
		return OPERATION_MANAGER_PERSONA.name;
	return TEAM_AGENTS.find((agent) => agent.id === id)?.name ?? null;
};
