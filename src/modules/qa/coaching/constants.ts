import type { TablerIcon } from '@tabler/icons-react';
import {
	IconAlertTriangle,
	IconBell,
	IconCalendarEvent,
	IconChartBar,
	IconFlame,
	IconMailForward,
	IconRoute,
	IconSchool,
	IconTrendingDown,
	IconUsers,
	IconUsersGroup,
} from '@tabler/icons-react';
import type {
	CoachingPriority,
	CoachingQueueReasonKind,
	CoachingSessionStatus,
	CoachingSessionType,
	CoachingSuggestedAction,
} from '~/models/qa';
import type { TeamRole } from '~/modules/qa/team/types';

export type CoachingTab =
	| 'agents'
	| 'cohorts'
	| 'rules'
	| 'sessions'
	| 'impact';

export const COACHING_TABS: {
	value: CoachingTab;
	labelKey: string;
	icon: TablerIcon;
}[] = [
	{ value: 'agents', labelKey: 'tabs.agents', icon: IconUsers },
	{ value: 'cohorts', labelKey: 'tabs.cohorts', icon: IconUsersGroup },
	{ value: 'rules', labelKey: 'tabs.rules', icon: IconRoute },
	{ value: 'sessions', labelKey: 'tabs.sessions', icon: IconCalendarEvent },
	{ value: 'impact', labelKey: 'tabs.impact', icon: IconChartBar },
];

export const PRIORITY_COLOR: Record<CoachingPriority, string> = {
	HIGH: 'red',
	MEDIUM: 'orange',
	LOW: 'blue',
};

export const REASON_META: Record<
	CoachingQueueReasonKind,
	{ icon: TablerIcon; color: string }
> = {
	RULE_TRIGGERED: { icon: IconBell, color: 'orange' },
	LOW_SCORE: { icon: IconAlertTriangle, color: 'red' },
	DECLINING_TREND: { icon: IconTrendingDown, color: 'yellow' },
	OVERDUE_TRAINING: { icon: IconSchool, color: 'red' },
	PENDING_ACCEPTANCE: { icon: IconMailForward, color: 'yellow' },
	NO_RESPONSE: { icon: IconMailForward, color: 'red' },
	RESCHEDULE_REQUESTED: { icon: IconCalendarEvent, color: 'orange' },
	FOLLOW_UP_DUE: { icon: IconCalendarEvent, color: 'blue' },
	DECLINED_AFTER_TRAINING: { icon: IconTrendingDown, color: 'red' },
	BURNOUT_HIGH: { icon: IconFlame, color: 'red' },
};

export const SUGGESTED_ACTION_ORDER: CoachingSuggestedAction[] = [
	'REVIEW_REQUEST',
	'SEND_REMINDER',
	'ASSIGN_CONTENT',
	'SCHEDULE_SESSION',
	'CHECK_IN',
];

export const SESSION_TYPES: CoachingSessionType[] = [
	'ONE_ON_ONE',
	'SIDE_BY_SIDE',
	'GROUP',
	'MICRO',
];
export const SESSION_DURATIONS = [15, 30, 45, 60];
export const SESSION_STATUSES: CoachingSessionStatus[] = [
	'SCHEDULED',
	'COMPLETED',
	'MISSED',
	'CANCELLED',
];
export const SESSION_STATUS_COLOR: Record<CoachingSessionStatus, string> = {
	SCHEDULED: 'blue',
	COMPLETED: 'green',
	MISSED: 'red',
	CANCELLED: 'gray',
};

export const COACHING_TOPICS = [
	'Objection handling',
	'Empathy & tone',
	'Mandatory disclosures',
	'Call closing',
	'Needs assessment',
	'Competitor positioning',
	'Handling frustrated customers',
	'Auto-fail prevention',
	'Stress management',
];

/** Thresholds used by the queue builder (percent scale; sentiment converted to %). */
export const LOW_SCORE_THRESHOLD = 75;
export const DECLINE_DELTA = -4;
export const FOLLOW_UP_WINDOW_DAYS = 30;
export const DEFAULT_FOLLOW_UP = {
	windowDays: 30,
	checkpointDays: [15, 30],
	successThreshold: 3,
	reassignOnDecline: false,
};
export const MAX_RULE_CONDITIONS = 5;

export const coachingBasePath = (role: TeamRole) =>
	role === 'qa-manager' ? '/qa/qa-manager/coaching' : '/qa/supervisor/coaching';
