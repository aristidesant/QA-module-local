import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BurnoutRiskData } from '~/modules/qa/dashboard/types/burnoutRisk';

export type TeamRole = 'supervisor' | 'qa-manager';
export type ProfilePeriod = '30d' | '90d' | '12m' | 'all';
export type Trend = 'up' | 'down' | 'flat';
export type DimensionKey = 'qa' | 'sentiment' | 'compliance' | 'business';
export type AgentStatus = 'active' | 'on-leave' | 'training';
export type Shift = 'morning' | 'afternoon' | 'night';

export interface RosterSupervisor { id: string; name: string; team: string }
export interface RosterCampaign { id: string; name: string; lineOfBusiness: string; campaignType: 'INBOUND' | 'OUTBOUND' | 'BLENDED' }

export interface RosterAgent {
	id: string;
	name: string;
	email: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	campaignIds: string[];
	status: AgentStatus;
	shift: Shift;
	hireDate: string; // ISO date
	trackedSince: string; // ISO date — first evaluation on the platform
	skills: string[];
	avatarColor: string; // Mantine color name
}

export interface DimensionScore {
	key: DimensionKey;
	score: number; // qa/compliance 0-100, sentiment 1-5, business = conversion rate 0-100
	delta: number; // vs previous period, same unit
	trend: Trend;
	evaluations: number;
}

export interface OverallScore {
	score: number; // 0-100 weighted composite
	delta: number;
	trend: Trend;
	rankInTeam: number;
	teamSize: number;
	percentile: number; // 0-100
	weights: Record<DimensionKey, number>; // sums to 100
}

export interface PerformancePoint {
	date: string; // ISO first day of month
	label: string; // 'Jan 26'
	overall: number;
	qa: number;
	sentiment: number; // 0-100 (score/5*100) so all series share one axis
	compliance: number;
	business: number; // conversion rate
	callsEvaluated: number;
}

export type OperationalMetricKey =
	| 'callsHandled' | 'callsPerDay' | 'aht' | 'talkTime' | 'holdTime' | 'wrapUpTime'
	| 'fcr' | 'transferRate' | 'adherence' | 'occupancy';

export interface OperationalMetric {
	key: OperationalMetricKey;
	value: number;
	teamAverage: number;
	delta: number; // vs previous period
	unit: 'seconds' | 'percent' | 'count';
	betterWhen: 'higher' | 'lower';
}

export interface OperationalPoint { label: string; aht: number; talk: number; hold: number; wrapUp: number; calls: number }

export type QAErrorTypeCode = 'ECN' | 'ENC' | 'ECC' | 'ECUF';

export interface QAHistory {
	averageScore: number;
	passRate: number; // 0-100
	evaluations: number;
	autoFails: number;
	errorTypes: { code: QAErrorTypeCode; count: number; ratePerCall: number; delta: number }[];
	errorTrend: { label: string; ECN: number; ENC: number; ECC: number; ECUF: number }[];
	topFailedItems: { item: string; aspect: string; errorType: QAErrorTypeCode; count: number }[];
}

export interface SentimentHistory {
	agentAverage: number; // 1-5
	customerAverage: number;
	agentCategories: Record<SentimentCategory, number>; // % share, sum 100
	customerCategories: Record<SentimentCategory, number>;
	agentEmotions: { emotion: Emotion; share: number }[]; // top 5 desc
	customerEmotions: { emotion: Emotion; share: number }[];
	recoveryRate: number; // % of negative-start calls recovered
	empathyPhrasesPerCall: number;
	trend: { label: string; agent: number; customer: number }[];
}

export type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';

export interface ComplianceHistory {
	overall: number;
	areas: { key: ComplianceAreaKey; score: number; violations: number; warnings: number; delta: number }[];
	timeline: { label: string; violations: number; warnings: number }[];
	flaggedItems: { item: string; area: ComplianceAreaKey; count: number; lastSeen: string }[];
}

export type BusinessSignalType =
	| 'EARLY_OBJECTION' | 'UNHANDLED_OBJECTION' | 'COMPETITOR_PLUS_COST' | 'MISTARGETED_OFFER' | 'BEST_TIME_FRAME';
export type NonConversionReasonKey =
	| 'priceTooHigh' | 'noNeed' | 'distrustQuality' | 'thirdPartyDecision' | 'installationRequirements' | 'other';

export interface BusinessHistory {
	conversionRate: number;
	offersPresented: number;
	converted: number;
	followUpsScheduled: number;
	signals: { type: BusinessSignalType; count: number; ratePerCall: number; delta: number }[];
	nonConversionReasons: { key: NonConversionReasonKey; count: number }[];
	competitorMentions: { name: string; count: number }[];
	conversionTrend: { label: string; conversionRate: number; offers: number }[];
}

export interface TriggerAlert {
	id: string;
	ruleName: string;
	metric: string;
	severity: 'info' | 'warning' | 'critical';
	firedAt: string;
	acknowledged: boolean;
}

export interface DisputeSummary {
	id: string;
	callId: string;
	item: string;
	status: 'open' | 'won' | 'lost' | 'withdrawn';
	filedAt: string;
	resolvedAt?: string;
}

export interface RiskHistory {
	criticalErrorsTrend: { label: string; autoFails: number; criticalErrors: number }[];
	alerts: TriggerAlert[];
	disputes: DisputeSummary[];
	burnout: BurnoutRiskData;
	burnoutTrend: { label: string; percentage: number }[];
}

export interface CoachingSession {
	id: string;
	date: string; // ISO
	topic: string;
	coachName: string;
	coachRole: 'SUPERVISOR' | 'QA_MANAGER';
	status: 'scheduled' | 'completed' | 'missed';
	linkedDimension?: DimensionKey;
	outcome?: string;
	followUpDate?: string;
}

export type LmsMaterialType = 'Course' | 'Video' | 'PDF' | 'Article';
export type LmsStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';

export interface LmsMaterial { id: string; title: string; type: LmsMaterialType; durationMin: number; dimension: DimensionKey }

export interface LmsAssignment {
	id: string;
	materialId: string;
	title: string;
	type: LmsMaterialType;
	mandatory: boolean;
	assignedAt: string;
	assignedBy: string;
	dueDate: string;
	progress: number; // 0-100
	status: LmsStatus;
	completedAt?: string;
}

export interface EarnedBadge {
	id: string;
	type: string; // key of PREDEFINED_BADGE_CATALOGS
	name: string;
	icon: string;
	earnedAt: string;
	reason: string;
}

export interface MilestoneProgress { id: string; name: string; description: string; progress: number; achievedAt?: string }

export interface RankingPoint { label: string; position: number; teamSize: number; score: number }

export type ActivityType = 'evaluation' | 'badge' | 'milestone' | 'coaching' | 'lms' | 'alert' | 'dispute' | 'note' | 'rank';

export interface ActivityEvent {
	id: string;
	type: ActivityType;
	date: string; // ISO
	title: string;
	description: string;
	link?: string;
}

export interface SupervisorNote {
	id: string;
	agentId: string;
	authorName: string;
	authorRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	text: string;
	pinned: boolean;
}

export interface EvaluationHistoryRow {
	id: string;
	callId: string;
	campaignId: string;
	campaignName: string;
	date: string;
	durationSeconds: number;
	qaScore: number;
	customerSentiment: number;
	complianceScore: number;
	converted: boolean;
	autoFail: boolean;
	evaluatedBy: 'AI' | 'Manual';
}

export interface StrengthOrWeakness { label: string; evidence: string; suggestedAction?: string }

export interface AgentProfile {
	agent: RosterAgent;
	overall: OverallScore;
	dimensions: DimensionScore[];
	performance: PerformancePoint[]; // one per month from trackedSince to NOW
	operational: OperationalMetric[];
	operationalTrend: OperationalPoint[];
	qa: QAHistory;
	sentiment: SentimentHistory;
	compliance: ComplianceHistory;
	business: BusinessHistory;
	risk: RiskHistory;
	coaching: CoachingSession[];
	lms: LmsAssignment[];
	badges: EarnedBadge[];
	milestones: MilestoneProgress[];
	rankingHistory: RankingPoint[];
	activity: ActivityEvent[];
	notes: SupervisorNote[];
	evaluations: EvaluationHistoryRow[];
	peerComparison: { label: string; agentValue: number; teamAverage: number; unit?: string }[];
	strengths: StrengthOrWeakness[];
	weaknesses: StrengthOrWeakness[];
}

export interface TeamTableRow {
	id: string;
	name: string;
	team: string;
	supervisorName: string;
	status: AgentStatus;
	overall: number;
	overallTrend: Trend;
	qa: number;
	sentiment: number;
	compliance: number;
	conversionRate: number;
	ahtSeconds: number;
	burnoutLevel: BurnoutRiskData['level'];
	badges: number;
	openCoaching: number;
	overdueLms: number;
	lastEvaluationAt: string;
}

export interface TeamFilters {
	search: string;
	status: AgentStatus | 'all';
	campaignId: string | 'all';
	supervisorId: string | 'all'; // QA Manager only
	riskOnly: boolean;
}
