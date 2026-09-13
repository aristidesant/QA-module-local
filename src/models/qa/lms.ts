/**
 * LMS domain model (content, learning paths, assignments). Mock-only, API-shaped.
 */
import type { EvaluationArea, TriggerMetricId } from './triggerRules';

export type LmsFormat = 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'SCENARIO';
export type LmsArea = EvaluationArea | 'GENERAL';
export type LmsLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LmsContentStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface LmsQuizQuestion {
	id: string;
	prompt: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export interface LmsVideoChapter {
	title: string;
	startSec: number;
}

export interface LmsScenarioStep {
	speaker: 'CUSTOMER' | 'COACH';
	text: string;
}

export interface LmsContentStats {
	assigned: number;
	completed: number;
	/** average quiz / self-check score, null for formats without score */
	avgScore: number | null;
	/** 1-5 */
	avgRating: number;
}

export interface LmsContent {
	id: string;
	title: string;
	summary: string;
	format: LmsFormat;
	area: LmsArea;
	/** Sub-criterion key resolved through SUB_ITEM_KEYS (compliance item, emotion, QA aspect, business signal, error type). */
	subItem: string | null;
	/** Metric used to measure impact after completion; null = not measured (onboarding material). */
	impactMetricId: TriggerMetricId | null;
	durationMin: number;
	level: LmsLevel;
	status: LmsContentStatus;
	tags: string[];
	author: string;
	publishedAt: string;
	updatedAt: string;
	/** VIDEO */
	chapters?: LmsVideoChapter[];
	/** DOCUMENT — markdown */
	body?: string;
	/** QUIZ */
	questions?: LmsQuizQuestion[];
	/** QUIZ — percent needed to pass */
	passScore?: number;
	/** SCENARIO */
	scenario?: {
		situation: string;
		steps: LmsScenarioStep[];
		selfCheck: LmsQuizQuestion[];
	};
	stats: LmsContentStats;
}

export interface LmsPathModule {
	contentId: string;
	required: boolean;
}

export interface LmsLearningPath {
	id: string;
	title: string;
	description: string;
	area: LmsArea;
	level: LmsLevel;
	modules: LmsPathModule[];
	estimatedMin: number;
	status: LmsContentStatus;
	badgeName: string | null;
	enrolledCount: number;
	/** 0-100 */
	completionRate: number;
}

export type LmsAssignmentSource = 'MANUAL' | 'COACHING_RULE' | 'LEARNING_PATH' | 'SELF';
export type LmsAssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type LmsAcceptanceStatus =
	| 'NOT_REQUIRED'
	| 'PENDING'
	| 'ACCEPTED'
	| 'RESCHEDULE_REQUESTED'
	| 'NO_RESPONSE';
export type LmsRescheduleDecision = 'APPROVED' | 'REJECTED';
export type LmsImpactVerdict = 'IMPROVED' | 'SAME' | 'DECLINED' | 'PENDING';
export type LmsAssignerRole = 'SUPERVISOR' | 'QA_MANAGER' | 'SYSTEM' | 'AGENT';

export interface LmsAcceptance {
	status: LmsAcceptanceStatus;
	respondedAt: string | null;
	proposedDueDate: string | null;
	reason: string | null;
	decision: LmsRescheduleDecision | null;
	decidedBy: string | null;
	decidedAt: string | null;
}

export interface LmsImpactPoint {
	label: string;
	value: number;
	phase: 'BEFORE' | 'COMPLETION' | 'AFTER';
}

export interface LmsImpact {
	metricId: TriggerMetricId;
	/** average of the 30 days before the assignment */
	baseline: number;
	checkpoint15: number | null;
	checkpoint30: number | null;
	verdict: LmsImpactVerdict;
	/** weekly points: 4 before, 1 completion, 4 after */
	series: LmsImpactPoint[];
}

export interface LmsAssignment {
	id: string;
	agentId: string;
	contentId: string;
	pathId: string | null;
	source: LmsAssignmentSource;
	/** CoachingRule id when source = COACHING_RULE */
	ruleId: string | null;
	/** Human explanation shown to the agent ("Compliance score 78% < 85% in the last 14 days") */
	reason: string;
	assignedBy: string;
	assignedByRole: LmsAssignerRole;
	assignedAt: string;
	dueDate: string;
	mandatory: boolean;
	acceptance: LmsAcceptance;
	status: LmsAssignmentStatus;
	/** 0-100 */
	progress: number;
	startedAt: string | null;
	completedAt: string | null;
	/** QUIZ / SCENARIO self-check percent */
	score: number | null;
	attempts: number;
	impact: LmsImpact | null;
}

export interface LmsPathEnrollment {
	id: string;
	agentId: string;
	pathId: string;
	source: 'MANUAL' | 'COACHING_RULE' | 'SELF';
	enrolledBy: string;
	enrolledAt: string;
	dueDate: string | null;
	completedContentIds: string[];
	completedAt: string | null;
}

export interface LmsQuizResult {
	assignmentId: string;
	score: number;
	passed: boolean;
	answers: number[];
	submittedAt: string;
}
