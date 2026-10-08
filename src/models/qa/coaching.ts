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
	/** Days to wait before the rule can trigger again for the same agent; 0 = no wait. */
	cooldownDays: number;
	/** Most times the rule may trigger for one agent in total; null or undefined = no limit. */
	maxTriggersPerAgent?: number | null;
	cadence: CoachingRuleCadence;
	stats: CoachingRuleStats;
	createdBy: string;
	createdByRole: CoachRole;
	createdAt: string;
	updatedAt: string;
}

/** PROPOSED = pre-loaded by the weekly batch, waiting for the supervisor to schedule it. */
export type CoachingSessionStatus =
	| 'PROPOSED'
	| 'SCHEDULED'
	| 'COMPLETED'
	| 'MISSED'
	| 'CANCELLED';
export type CoachingSessionModality = 'IN_PERSON' | 'REMOTE';

/** Why the weekly batch chose a 1:1 or an AI message for an agent. */
export type CoachingBatchReason =
	| 'TIER_CRITICAL'
	| 'TIER_NEEDS_IMPROVEMENT'
	| 'GOOD_DECLINED'
	| 'WEAKEST_OF_WEEK'
	| 'STABLE';

export type CoachingBatchDecision = 'ONE_ON_ONE' | 'AI_MESSAGE';

/** One weak aspect found in the agent's calls of the week. */
export interface CoachingBriefFinding {
	/** `CallIssueKey` from calls/issues.ts; label = qa.calls `issues.<key>`. */
	issue: string;
	aspect: 'qa' | 'compliance' | 'sentiment' | 'operational';
	/** Calls of the week with this issue. */
	calls: number;
	/** Share of the week's calls, 0-100. */
	share: number;
	/** Up to 3 call ids that show it, worst QA score first. */
	evidenceCallIds: string[];
}

/** How the aspect worked on in the previous coach-led session moved since then. */
export interface CoachingBriefPrevious {
	sessionId: string;
	topic: string;
	date: string;
	/** Scorecard aspect of that session's area; null means the composite score. */
	dimension: 'qa' | 'compliance' | 'operational' | 'business' | null;
	before: number;
	after: number;
	verdict: 'IMPROVED' | 'SAME' | 'DECLINED';
}

/** Everything the platform pre-loads into a weekly session. Mock copy is English-only. */
export interface CoachingBrief {
	/** Analysed week, 'YYYY-MM-DD' inclusive. */
	weekFrom: string;
	weekTo: string;
	calls: number;
	/** Weekly composite scorecard 0-100 and the previous week's. */
	score: number;
	previousScore: number | null;
	tier: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
	trend: 'IMPROVED' | 'SAME' | 'DECLINED' | null;
	reason: CoachingBatchReason;
	findings: CoachingBriefFinding[];
	/** How the supervisor should bring it up with the agent. */
	approach: string;
	/** Conceptual fix for the weak aspect. */
	solution: string;
	/** A concrete script or real example. */
	example: string;
	suggestedContentIds: string[];
	previous: CoachingBriefPrevious | null;
}

export interface CoachingBatchItem {
	agentId: string;
	agentName: string;
	decision: CoachingBatchDecision;
	reason: CoachingBatchReason;
	/** The proposed 1:1 or the AI message created (or reused) for the agent. */
	sessionId: string;
}

/** One weekly run for one supervisor's team, generated the day before the coaching day. */
export interface CoachingWeeklyBatch {
	id: string;
	supervisorId: string;
	generatedAt: string;
	/** 'YYYY-MM-DD' coaching day the batch was prepared for. */
	coachingDate: string;
	weekFrom: string;
	weekTo: string;
	items: CoachingBatchItem[];
}

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
	/** Every participant of a group session (agentId is the first one). */
	agentIds?: string[];
	/** Link of the call when the session is virtual. */
	meetingLink?: string | null;
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
	/** Pre-loaded content when the session comes from a weekly batch. */
	brief?: CoachingBrief | null;
	batchId?: string | null;
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
