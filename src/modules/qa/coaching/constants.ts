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
	CoachingRuleCadence,
	CoachingSessionModality,
	CoachingSessionStatus,
	CoachingSessionType,
	CoachingSuggestedAction,
} from '~/models/qa';
import type { TeamRole } from '~/modules/qa/team/types';
import type { PerformanceTier } from './scorecard';

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
/** Types a rule can produce; the manual editor never creates AI messages. */
export const RULE_SESSION_TYPES: CoachingSessionType[] = [
	'ONE_ON_ONE',
	'AI_MESSAGE',
];
export const SESSION_MODALITIES: CoachingSessionModality[] = [
	'IN_PERSON',
	'REMOTE',
];
export const RULE_CADENCES: CoachingRuleCadence[] = ['ON_MATCH', 'WEEKLY'];
/** Types that have no physical/remote modality. */
export const MODALITY_FREE_TYPES: CoachingSessionType[] = [
	'MICRO',
	'AI_MESSAGE',
];
export const SESSION_DURATIONS = [15, 30, 45, 60];
export const SESSION_STATUSES: CoachingSessionStatus[] = [
	'PROPOSED',
	'SCHEDULED',
	'COMPLETED',
	'MISSED',
	'CANCELLED',
];
export const SESSION_STATUS_COLOR: Record<CoachingSessionStatus, string> = {
	PROPOSED: 'violet',
	SCHEDULED: 'blue',
	COMPLETED: 'green',
	MISSED: 'red',
	CANCELLED: 'gray',
};

/**
 * Quiet status badges for the Sessions tab: a dot for everything routine,
 * an outline for a proposal waiting on the supervisor, and color only for
 * the one status that needs attention (a missed session).
 */
export const sessionStatusBadge = (
	status: CoachingSessionStatus
): { variant: 'light' | 'outline' | 'dot'; color: string } =>
	status === 'MISSED'
		? { variant: 'light', color: 'red' }
		: status === 'PROPOSED'
			? { variant: 'outline', color: 'gray' }
			: { variant: 'dot', color: 'gray' };

/** JS weekday (0 = Sunday) the supervisor holds coaching; the batch generates the day before at 08:00. */
export const DEFAULT_COACHING_DAY = 2;
export const BATCH_GENERATION_HOUR = '08:00:00Z';
export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

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

/** Presets travel as query params: `agent`, `cohort`, `type`, `topic`. */
export const coachingSessionNewPath = (
	role: TeamRole,
	preset: { agent?: string; cohort?: string; type?: string } = {}
) => {
	const params = new URLSearchParams(
		Object.entries(preset).filter(([, v]) => v) as [string, string][]
	).toString();
	return `${coachingBasePath(role)}/sessions/new${params ? `?${params}` : ''}`;
};

/** The isolated page of one session (route `sessions/:sessionId`). */
export const coachingSessionPath = (role: TeamRole, sessionId: string) =>
	`${coachingBasePath(role)}/sessions/${sessionId}`;

export const coachingRuleNewPath = (role: TeamRole) =>
	`${coachingBasePath(role)}/rules/new`;

export const coachingRulePath = (role: TeamRole, ruleId: string) =>
	`${coachingBasePath(role)}/rules/${ruleId}`;

export const coachingRuleEditPath = (role: TeamRole, ruleId: string) =>
	`${coachingBasePath(role)}/rules/${ruleId}/edit`;

export const coachingGroupNewPath = (role: TeamRole) =>
	`${coachingBasePath(role)}/groups/new`;

export const coachingAgentPath = (role: TeamRole, agentId: string) =>
	`${coachingBasePath(role)}/agents/${agentId}`;

/** A performance group on the Agents tab, or the agents with no scorecard this week. */
export type CoachingTierKey = PerformanceTier | 'NO_DATA';

const TIER_KEYS: CoachingTierKey[] = [
	'EXCELLENT',
	'GOOD',
	'NEEDS_IMPROVEMENT',
	'CRITICAL',
	'NO_DATA',
];

/** The isolated page with the full table of one performance group. */
export const coachingTierPath = (role: TeamRole, tier: CoachingTierKey) =>
	`${coachingBasePath(role)}/tiers/${tier.toLowerCase().replace(/_/g, '-')}`;

export const tierFromParam = (
	param: string | undefined
): CoachingTierKey | null => {
	const key = (param ?? '').toUpperCase().replace(/-/g, '_');
	return TIER_KEYS.find((k) => k === key) ?? null;
};
