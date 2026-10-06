/**
 * Coaching domain model: rules that turn low scores into learning, sessions,
 * cohorts and the queue that prioritises who needs attention. Mock-only.
 */
import type {
	ConditionLogic,
	EvaluationArea,
	RuleCondition,
	RuleScope,
	RuleStatus,
} from './triggerRules';

export type CoachingActionKind = 'ASSIGN_CONTENT' | 'ASSIGN_PATH';
export type CoachRole = 'SUPERVISOR' | 'QA_MANAGER';
/** ON_MATCH fires when the conditions match ("Run now" today); WEEKLY reviews every agent each Monday over the last 7 days. */
export type CoachingRuleCadence = 'ON_MATCH' | 'WEEKLY';
export type CoachingSessionType =
	| 'ONE_ON_ONE'
	| 'SIDE_BY_SIDE'
	| 'GROUP'
	| 'MICRO'
	| 'AI_MESSAGE';

export interface CoachingRuleAction {
	kind: CoachingActionKind;
	contentIds: string[];
	pathId: string | null;
	mandatory: boolean;
	dueInDays: number;
	requireAcceptance: boolean;
	scheduleSession: boolean;
	/** What `scheduleSession` creates: a coach-led session or an AI-written message. */
	sessionType: CoachingSessionType;
	sessionTopic: string;
	sessionCoach: CoachRole;
	notifySupervisor: boolean;
}

export interface CoachingFollowUp {
	/** Days compared before vs after completion. */
	windowDays: number;
	checkpointDays: number[];
	/** Points of change that count as improved / declined. */
	successThreshold: number;
	reassignOnDecline: boolean;
}

export interface CoachingRuleStats {
	triggeredLast30Days: number;
	agentsAffected: number;
	improvedRate: number | null;
	lastTriggeredAt: string | null;
}

export interface CoachingRule {
	id: string;
	name: string;
	description: string;
	status: RuleStatus;
	area: EvaluationArea;
	conditions: RuleCondition[];
	conditionLogic: ConditionLogic;
	scope: RuleScope;
	action: CoachingRuleAction;
	followUp: CoachingFollowUp;
	/** Days before the same rule can fire again for the same agent. */
	cooldownDays: number;
	cadence: CoachingRuleCadence;
	stats: CoachingRuleStats;
	createdBy: string;
	createdByRole: CoachRole;
	createdAt: string;
	updatedAt: string;
}

export type CoachingSessionStatus =
	| 'SCHEDULED'
	| 'COMPLETED'
	| 'MISSED'
	| 'CANCELLED';
export type CoachingSessionModality = 'IN_PERSON' | 'REMOTE';

export interface CoachingActionItem {
	id: string;
	text: string;
	dueDate: string;
	done: boolean;
	acknowledgedByAgent: boolean;
	acknowledgedAt: string | null;
}

export interface CoachingSessionRecord {
	id: string;
	agentId: string;
	agentName: string;
	coachId: string;
	coachName: string;
	coachRole: CoachRole;
	type: CoachingSessionType;
	/** null for AI_MESSAGE and MICRO. */
	modality: CoachingSessionModality | null;
	/** ISO datetime */
	date: string;
	durationMin: number;
	topic: string;
	area: EvaluationArea | null;
	subItem: string | null;
	/** Call ids pinned as evidence (link `/qa/campaigns/1/calls/<id>`) */
	evidenceCallIds: string[];
	talkingPoints: string[];
	notes: string;
	/** Generated text of an AI_MESSAGE session; null otherwise. */
	aiMessage: string | null;
	actionItems: CoachingActionItem[];
	agentCommitment: {
		acknowledged: boolean;
		acknowledgedAt: string | null;
		comment: string | null;
	};
	status: CoachingSessionStatus;
	outcome: string | null;
	followUpDate: string | null;
	linkedAssignmentIds: string[];
	ruleId: string | null;
	cohortId: string | null;
}

export interface CoachingCohort {
	id: string;
	name: string;
	description: string;
	agentIds: string[];
	pathId: string | null;
	ruleIds: string[];
	tags: string[];
	createdBy: string;
	createdByRole: CoachRole;
	createdAt: string;
}

export type CoachingQueueReasonKind =
	| 'RULE_TRIGGERED'
	| 'LOW_SCORE'
	| 'DECLINING_TREND'
	| 'OVERDUE_TRAINING'
	| 'PENDING_ACCEPTANCE'
	| 'NO_RESPONSE'
	| 'RESCHEDULE_REQUESTED'
	| 'FOLLOW_UP_DUE'
	| 'DECLINED_AFTER_TRAINING'
	| 'BURNOUT_HIGH';

export type CoachingPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CoachingSuggestedAction =
	| 'ASSIGN_CONTENT'
	| 'SCHEDULE_SESSION'
	| 'REVIEW_REQUEST'
	| 'SEND_REMINDER'
	| 'CHECK_IN';

export interface CoachingQueueReason {
	kind: CoachingQueueReasonKind;
	area: EvaluationArea | null;
	detail: string;
	link?: string;
}

export interface CoachingQueueItem {
	agentId: string;
	agentName: string;
	team: string;
	supervisorId: string;
	priority: CoachingPriority;
	/** Sort key: the higher, the more urgent. */
	score: number;
	reasons: CoachingQueueReason[];
	suggestedAction: CoachingSuggestedAction;
	suggestedContentIds: string[];
	weakestArea: EvaluationArea;
	weakestValue: number;
	snoozedUntil: string | null;
}

export type CoachingActivityType =
	| 'RULE_FIRED'
	| 'ASSIGNED'
	| 'ACCEPTED'
	| 'RESCHEDULE_REQUESTED'
	| 'RESCHEDULE_DECIDED'
	| 'COMPLETED'
	| 'SESSION_SCHEDULED'
	| 'SESSION_COMPLETED'
	| 'SESSION_MISSED'
	| 'IMPACT_MEASURED'
	| 'COHORT_CREATED'
	| 'REMINDER_SENT';

export interface CoachingActivityEntry {
	id: string;
	type: CoachingActivityType;
	agentId: string | null;
	agentName: string | null;
	title: string;
	description: string;
	date: string;
	area: EvaluationArea | null;
	link?: string;
}
